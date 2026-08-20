# Power Service Prototype

A demo application for a fictional power utility — not a real service. FastAPI + MongoDB backend, Next.js frontend, containerized with Docker Compose for local development and deployable to a Docker Swarm cluster behind an nginx reverse proxy.

## Running the whole stack with Docker Compose

This is the easiest way to run the project — one command brings up MongoDB, the backend, and the frontend together, networked and configured correctly for each other.

```bash
docker compose up --build
```

Then visit:

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs
- MongoDB (if you want to connect a client like `mongosh` or Compass directly): `mongodb://localhost:27017`

Stop everything with `docker compose down` (add `-v` to also delete the MongoDB volume and start with a clean database next time). Data otherwise persists across restarts in a named Docker volume.

To rebuild after changing backend or frontend code, run `docker compose up --build` again — Compose only rebuilds the images whose Dockerfile or build context actually changed.

### How this differs from running each piece locally

Earlier steps of this build (see `CLAUDE.md`) were developed by running MongoDB, the backend, and the frontend as three separate local processes — a throwaway `docker run mongo` container, `uvicorn` in a Python virtual environment, and `npm run dev`. That workflow still works and is still the faster loop for active development (hot reload on both the backend and frontend, no image rebuild needed for every code change). `docker compose up` is instead for running the project the way it will actually be deployed: as three built, networked containers, with no host-level Python/Node setup required at all — useful for verifying the containerized build works, or for someone who just wants to run the app without installing anything but Docker.

A few concrete differences worth knowing about if you switch between the two:

- **No hot reload.** The Compose containers run production builds (`uvicorn` without `--reload`, `next start` via the compiled standalone server) — a code change requires `docker compose up --build`, not just saving a file.
- **`MONGO_URI` differs.** Outside Docker, the backend talks to Mongo at `mongodb://localhost:27017` (or wherever your local/mapped Mongo is). Inside Compose, it's `mongodb://mongo:27017` — the container talks to Mongo by its Compose service name, not `localhost`, since each container has its own network namespace. See `backend/README.md` and `CLAUDE.md` for the full explanation.
- **`NEXT_PUBLIC_API_URL` is baked in at build time, not read at runtime.** The Compose frontend image is built with `NEXT_PUBLIC_API_URL=http://localhost:8000` — the browser's own address for the backend, not the backend container's internal Compose name — because that value gets compiled directly into the JavaScript the browser downloads, before any container is even running. See `CLAUDE.md` for why this is the address that has to be used here.

## Deploying to Docker Swarm

`docker-stack.yml` deploys the same four pieces (mongo, backend, frontend, plus nginx as a reverse proxy in front of everything) to a Docker Swarm cluster instead of plain Compose - the production-style deployment target this project is meant to demonstrate. The two files differ in some real, meaningful ways beyond just "add nginx" - see `CLAUDE.md` for the full reasoning behind each. The short version:

- **Swarm doesn't build images.** `docker stack deploy` only ever pulls or reuses already-built images - `build:` in a stack file is silently ignored. The backend and frontend images have to be built first (with `docker build` directly, or `docker compose build`, either works).
- **The frontend needs a separate build for this topology.** nginx is now the only address a browser ever talks to, so the frontend has to be built with a *different* `NEXT_PUBLIC_API_URL` than the Compose build uses - a relative path through nginx, not `http://localhost:8000` directly. That's why it gets a different image tag (`:swarm`) below, not the same `power-service-frontend:latest` Compose already built.
- **Secrets are real Swarm secrets, not environment variables.** `JWT_SECRET_KEY` is mounted into the backend container as a file (`docker secret`), created out-of-band before deploying - it never appears in `docker-stack.yml` or anywhere in this repo.

### 1. Initialize Swarm (skip if you've already done this)

```bash
docker swarm init
```

If this node is already part of a swarm, this command will just say so - that's fine, move on.

### 2. Build the images

```bash
docker build -t power-service-backend:latest ./backend
docker build --build-arg NEXT_PUBLIC_API_URL="" -t power-service-frontend:swarm ./frontend
```

The backend image is topology-agnostic (no build args), so if you already ran `docker compose build`, you can reuse that same `power-service-backend:latest` image as-is - no need to rebuild it here too. `mongo` and `nginx` use their official public images directly; nothing to build for either.

### 3. Create the JWT secret

```bash
openssl rand -hex 32 | docker secret create jwt_secret_key -
```

Piping into `docker secret create <name> -` (reading from stdin) keeps the actual secret value out of your shell history and off disk as a plain file. If you ever need to rotate it, create a new secret under a new name, update `docker-stack.yml` to reference it, and redeploy - Swarm secrets can't be edited or overwritten in place once created.

### 4. Deploy the stack

```bash
docker stack deploy -c docker-stack.yml power-service
```

Then visit **http://localhost/** - nginx is the only published port (80); everything else communicates over Swarm's internal overlay network only.

### 5. Check on it

```bash
docker stack services power-service      # one line per service: name, replica count, image, ports
docker service logs power-service_backend   # -f to follow
docker service ps power-service_backend     # which node(s) it's running on, current/desired state
```

### 6. Scale something, just to see it work

```bash
docker service scale power-service_backend=3
```

No other configuration changes needed - nginx keeps routing correctly without touching `docker-stack.yml` or reloading anything, since Swarm resolves the `backend` service name to a stable virtual IP that it load-balances across however many replicas exist behind it. (Don't scale `mongo` past 1 replica this way - that would need a real MongoDB replica set, which this prototype doesn't set up.)

### 7. Tear down

```bash
docker stack rm power-service
```

This removes the services, network, and the nginx config object, but **not** the `jwt_secret_key` secret or the `mongo_data` volume - remove those separately if you want a completely clean slate:

```bash
docker secret rm jwt_secret_key
docker volume rm power-service_mongo_data
```

## Running each piece locally instead

See `backend/README.md` and `frontend/README.md` for running the FastAPI backend and Next.js frontend directly on your machine (Python virtualenv / `npm run dev`), which is faster for active development.

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
