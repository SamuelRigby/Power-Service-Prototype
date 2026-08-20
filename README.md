# Power Service Prototype

A demo application for a fictional power utility — not a real service. It models the core of a utility back office: managing customer accounts, power sources, and a weekly power-scheduling grid, behind a login.

This is a portfolio project, built specifically to demonstrate the technology stack listed in a real job posting — UAMPS's Associate Software Engineer role (Python/FastAPI, React/Next.js, MongoDB, Docker Swarm, nginx, REST-to-SOAP integration). It isn't a commissioned project and isn't affiliated with UAMPS; the stack choice is simply a direct response to that posting, stated here rather than left unexplained.

## Tech stack

- **Backend**: Python, [FastAPI](https://fastapi.tiangolo.com/), [Motor](https://motor.readthedocs.io/) (async MongoDB driver), [Pydantic](https://docs.pydantic.dev/)/pydantic-settings, [PyJWT](https://pyjwt.readthedocs.io/), `bcrypt`
- **Frontend**: TypeScript, [Next.js](https://nextjs.org/) (App Router) on React, CSS Modules — no UI framework
- **Database**: [MongoDB](https://www.mongodb.com/)
- **SOAP integration**: [spyne](https://spyne.io/) (mock SOAP server, mounted inside the FastAPI app) + [zeep](https://docs.python-zeep.org/) (SOAP client, called from a REST endpoint) — see [Architecture](#architecture) below for why this exists and is mocked
- **Containerization**: Docker, Docker Compose (local development), Docker Swarm (production-style deployment)
- **Reverse proxy**: nginx, in front of the Swarm deployment only
- **Auth**: JWT (HS256), bcrypt-hashed passwords

## Running it

There are three ways to run this project, in increasing order of how close they are to a real deployment. All three run the exact same application code.

### Option A: Local development (fastest loop, for active development)

Each piece runs directly on your machine: a Python virtualenv for the backend, `npm run dev` for the frontend, and any MongoDB instance. This is how the project was actually built and is the fastest loop for making changes — both the backend and frontend hot-reload.

You'll need a MongoDB instance reachable from the backend. The simplest option, if you don't already have one, is a throwaway container:

```bash
docker run -d --name mongo -p 27017:27017 mongo:7
```

**Backend:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cp .env.example .env       # adjust values if needed - defaults assume a local Mongo on 27017
uvicorn app.main:app --reload --app-dir . --host 0.0.0.0 --port 8000
```

API available at http://localhost:8000, interactive docs at http://localhost:8000/docs.

**Frontend** (in a second terminal):

```bash
cd frontend
npm install
cp .env.local.example .env.local   # defaults assume the backend above, on localhost:8000
npm run dev
```

Site available at http://localhost:3000.

See `backend/README.md` and `frontend/README.md` for more detail on each piece individually (project structure, health check, build commands).

### Option B: Docker Compose (one command, no local Python/Node setup)

Brings up MongoDB, the backend, and the frontend together as three built, networked containers - no host-level Python or Node installation needed at all.

```bash
docker compose up --build
```

Then visit:

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs
- MongoDB (if you want to connect a client like `mongosh` or Compass directly): `mongodb://localhost:27017`

Stop everything with `docker compose down` (add `-v` to also delete the MongoDB volume and start with a clean database next time). Data otherwise persists across restarts in a named Docker volume. To rebuild after changing backend or frontend code, run `docker compose up --build` again — Compose only rebuilds the images whose Dockerfile or build context actually changed.

A few concrete differences from Option A worth knowing about:

- **No hot reload.** The Compose containers run production builds (`uvicorn` without `--reload`, `next start` via the compiled standalone server) — a code change requires `docker compose up --build`, not just saving a file.
- **`MONGO_URI` differs.** Outside Docker, the backend talks to Mongo at `mongodb://localhost:27017` (or wherever your local/mapped Mongo is). Inside Compose, it's `mongodb://mongo:27017` — the container talks to Mongo by its Compose service name, not `localhost`, since each container has its own network namespace. See `CLAUDE.md` for the full explanation.
- **`NEXT_PUBLIC_API_URL` is baked in at build time, not read at runtime.** The Compose frontend image is built with `NEXT_PUBLIC_API_URL=http://localhost:8000` — the browser's own address for the backend, not the backend container's internal Compose name — because that value gets compiled directly into the JavaScript the browser downloads, before any container is even running. See `CLAUDE.md` for why this is the address that has to be used here.

### Option C: Docker Swarm (production-style deployment, behind nginx)

`docker-stack.yml` deploys the same pieces plus nginx as a reverse proxy in front of everything, to a Docker Swarm cluster instead of plain Compose - the production-style deployment target this project is meant to demonstrate. The two files differ in some real, meaningful ways beyond just "add nginx" - see `CLAUDE.md` for the full reasoning behind each. The short version:

- **Swarm doesn't build images.** `docker stack deploy` only ever pulls or reuses already-built images - `build:` in a stack file is silently ignored. The backend and frontend images have to be built first (with `docker build` directly, or `docker compose build`, either works).
- **The frontend needs a separate build for this topology.** nginx is now the only address a browser ever talks to, so the frontend has to be built with a *different* `NEXT_PUBLIC_API_URL` than the Compose build uses - a relative path through nginx, not `http://localhost:8000` directly. That's why it gets a different image tag (`:swarm`) below, not the same `power-service-frontend:latest` Compose already built.
- **Secrets are real Swarm secrets, not environment variables.** `JWT_SECRET_KEY` is mounted into the backend container as a file (`docker secret`), created out-of-band before deploying - it never appears in `docker-stack.yml` or anywhere in this repo.

**1. Initialize Swarm** (skip if you've already done this):

```bash
docker swarm init
```

If this node is already part of a swarm, this command will just say so - that's fine, move on.

**2. Build the images:**

```bash
docker build -t power-service-backend:latest ./backend
docker build --build-arg NEXT_PUBLIC_API_URL="" -t power-service-frontend:swarm ./frontend
```

The backend image is topology-agnostic (no build args), so if you already ran `docker compose build`, you can reuse that same `power-service-backend:latest` image as-is - no need to rebuild it here too. `mongo` and `nginx` use their official public images directly; nothing to build for either.

**3. Create the JWT secret:**

```bash
openssl rand -hex 32 | docker secret create jwt_secret_key -
```

Piping into `docker secret create <name> -` (reading from stdin) keeps the actual secret value out of your shell history and off disk as a plain file. If you ever need to rotate it, create a new secret under a new name, update `docker-stack.yml` to reference it, and redeploy - Swarm secrets can't be edited or overwritten in place once created.

**4. Deploy the stack:**

```bash
docker stack deploy -c docker-stack.yml power-service
```

Then visit **http://localhost/** - nginx is the only published port (80); everything else communicates over Swarm's internal overlay network only.

**5. Check on it:**

```bash
docker stack services power-service        # one line per service: name, replica count, image, ports
docker service logs power-service_backend  # -f to follow
docker service ps power-service_backend    # which node(s) it's running on, current/desired state
```

**6. Redeploying after a code change:**

```bash
docker build -t power-service-backend:latest ./backend
docker build --build-arg NEXT_PUBLIC_API_URL="" -t power-service-frontend:swarm ./frontend
docker service update --force power-service_backend
docker service update --force power-service_frontend
```

Rebuilding the images alone is **not enough** once the stack is already deployed - re-running `docker stack deploy` won't pick up the new image content. Swarm only compares the service spec (`power-service-backend:latest` as a plain tag string) against what's already running; with no registry involved, it has no way to know the tag now points at different content locally, so an unchanged spec means it skips redeploying that service entirely. The `docker service update --force` on each service is what actually makes it re-resolve the tag and start fresh containers from the image you just built. This is specific to updating an *already-running* Swarm stack - a first-time `docker stack deploy` (step 4 above) and `docker compose up --build` (Option B) don't have this problem.

**7. Scale something, just to see it work:**

```bash
docker service scale power-service_backend=3
```

No other configuration changes needed - nginx keeps routing correctly without touching `docker-stack.yml` or reloading anything, since Swarm resolves the `backend` service name to a stable virtual IP that it load-balances across however many replicas exist behind it. (Don't scale `mongo` past 1 replica this way - that would need a real MongoDB replica set, which this prototype doesn't set up.)

**8. Tear down:**

```bash
docker stack rm power-service
```

This removes the services, network, and the nginx config object, but **not** the `jwt_secret_key` secret or the `mongo_data` volume - remove those separately if you want a completely clean slate:

```bash
docker secret rm jwt_secret_key
docker volume rm power-service_mongo_data
```

## Architecture

**Docker Swarm deployment (the full picture, with nginx):**

```
Browser
  │
  ▼
nginx  (only published port - 80)
  │
  ├── /api/*  ──────▶ backend  (FastAPI, internal only)
  ├── /soap/* ──────▶ backend  (mock SOAP endpoint, same service)
  └── everything else ▶ frontend  (Next.js, internal only)
                              │
                              ▼ (browser-side fetch calls back to nginx, not shown)

backend ──────▶ mongo  (internal only)
```

Without nginx (local development and Docker Compose), the browser talks to the frontend and backend directly on their own published ports (3000 and 8000) instead of through a shared reverse proxy - see the Compose section above for why `NEXT_PUBLIC_API_URL` has to change between these two topologies.

**The REST-to-SOAP integration path:**

```
Browser
  │  GET /api/v1/customers/{id}/meter-reading
  ▼
backend (FastAPI, REST)
  │  acts as a SOAP client (zeep)
  ▼
backend (spyne, mounted at /soap/meter-reading - same process)
  │  simulates a meter reading
  ▼
backend ──▶ translates the SOAP response to JSON ──▶ Browser
```

A REST API calling out to a SOAP service is a common integration shape at utilities and other organizations with older backend systems still in production. Since a real legacy SOAP meter-reading system obviously isn't available for a prototype like this, the backend mounts its own mock SOAP service (`spyne`) alongside the REST API and calls it as a genuine SOAP client (`zeep`) over HTTP from a normal REST endpoint - demonstrating the actual integration pattern (WSDL, a SOAP client library, translating the response into a REST/JSON contract, handling a slow-or-down SOAP dependency gracefully) rather than faking the shape of it with something simpler. See `CLAUDE.md`'s step 5 notes for the implementation details.

## Project structure

```
Power-Service-Prototype/
├── backend/           FastAPI backend
├── frontend/          Next.js frontend
├── nginx/             Reverse proxy config, used only by the Swarm stack
├── docker-compose.yml Local development stack
├── docker-stack.yml   Docker Swarm production-style stack
├── PLAN.md            Feature spec and build order
└── CLAUDE.md          Ongoing project memory: conventions and decisions made during the build
```
