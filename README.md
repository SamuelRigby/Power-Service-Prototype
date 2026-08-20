# Power Service Prototype

A demo application for a fictional power utility — not a real service. FastAPI + MongoDB backend, Next.js frontend, containerized with Docker Compose for local development.

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

## Running each piece locally instead

See `backend/README.md` and `frontend/README.md` for running the FastAPI backend and Next.js frontend directly on your machine (Python virtualenv / `npm run dev`), which is faster for active development.

## Project structure

```
Power-Service-Prototype/
├── backend/          FastAPI backend
├── frontend/          Next.js frontend
├── docker-compose.yml Local development stack (this file)
├── docker-stack.yml   Production-style Swarm stack (later build step)
├── PLAN.md            Feature spec and build order
└── CLAUDE.md          Ongoing project memory: conventions and decisions made during the build
```
