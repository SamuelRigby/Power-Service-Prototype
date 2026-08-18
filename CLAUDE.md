# CLAUDE.md

Ongoing project memory: conventions and decisions made during the build, and gotchas discovered along the way. See PLAN.md for the feature spec and build order.

## Backend (Step 1 — FastAPI skeleton + MongoDB)

- **Structure**: application code lives under `backend/app/`, not directly in `backend/`, so the package (`app`) is importable and `uvicorn app.main:app` works from `backend/` as the working directory.
  - `app/core/` — settings (`config.py`) and the Mongo connection (`database.py`). No `routers/models/schemas` code should read environment variables directly; they import `settings` from `app.core.config`.
  - `app/routers/` — one module per resource, each exposing an `APIRouter`; mounted in `main.py` under `/api/v1`.
  - `app/models/` and `app/schemas/` — currently empty placeholders. Convention going forward: `models/` holds Mongo document shapes (plain dict-oriented helpers, since we're using Motor directly rather than an ODM), `schemas/` holds Pydantic request/response models for the API layer. Keep them separate so API contracts can evolve independently of stored document shape.
- **Settings**: `app/core/config.py` uses `pydantic-settings` (`BaseSettings`), reading from environment variables and an optional `.env` file (`backend/.env`, gitignored — see `.env.example` for the template). Nothing is hardcoded; every setting has a sensible local/docker-compose-friendly default so the app boots without a `.env` file present.
  - `MONGO_URI` defaults to `mongodb://mongo:27017` (the docker-compose service name). Override to `mongodb://localhost:27017` (or similar) for running the backend outside Docker against a local/mapped Mongo.
  - `CORS_ORIGINS` is a comma-separated string (parsed via `settings.cors_origin_list`), defaulting to `http://localhost:3000` for the Next.js dev server.
- **Mongo connection**: uses `motor` (async driver). The client is created/closed in `main.py`'s FastAPI `lifespan` handler (not at import time), so tests/tooling can import `app.main` without opening a socket. `serverSelectionTimeoutMS=5000` is set explicitly — Motor's default is 30s, which made the health check hang for 30 seconds before failing when Mongo was unreachable during local testing. Keep this timeout in place (or tune it) rather than relying on the driver default.
- **Health check**: `GET /api/v1/health` pings Mongo via `admin.command("ping")` and returns `200 {"status": "ok", "mongo": "connected"}` or `503 {"status": "error", "mongo": "unreachable"}`. Verified locally: 503 path against no Mongo, and 200 path against a throwaway `docker run mongo:7` container.
- **requirements.txt** pins exact versions (fastapi, uvicorn[standard], motor, pydantic, pydantic-settings, python-dotenv) rather than ranges, for reproducibility during early development.

## Conventions carried forward from PLAN.md

- REST endpoints: `/api/v1/<resource>`, JSON bodies.
- "Client" = logged-in site user; "Customer" = a utility customer managed by a client. Don't conflate these in code (e.g. don't name a client-related collection/model `customers`).
