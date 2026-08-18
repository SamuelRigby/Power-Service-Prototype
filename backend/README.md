# Backend (FastAPI)

## Setup

1. Create a virtual environment and activate it:

   ```bash
   python -m venv venv
   venv\Scripts\activate      # Windows
   source venv/bin/activate   # macOS/Linux
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Copy `.env.example` to `.env` and adjust values as needed (a local MongoDB running outside Docker would typically use `mongodb://localhost:27017`):

   ```bash
   cp .env.example .env
   ```

## Running locally

```bash
uvicorn app.main:app --reload --app-dir . --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000, with interactive docs at http://localhost:8000/docs.

## Health check

`GET /api/v1/health` pings the MongoDB connection and returns:

- `200 {"status": "ok", "mongo": "connected"}` when Mongo is reachable
- `503 {"status": "error", "mongo": "unreachable"}` when it isn't
