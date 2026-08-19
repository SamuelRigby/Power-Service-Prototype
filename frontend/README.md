# Frontend (Next.js)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and adjust if the backend isn't running at the default address:

   ```bash
   cp .env.local.example .env.local
   ```

## Running locally

```bash
npm run dev
```

The site will be available at http://localhost:3000. It expects the FastAPI backend (see `../backend`) to be reachable at the URL in `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`) - not required yet for the home page, but used starting with the login/signup and service pages.

## Structure

- `app/` - routes (App Router)
- `components/` - reusable UI, one component per file with a co-located CSS Module
- `lib/api.ts` - fetch wrapper for the backend REST API

## Build

```bash
npm run build
npm start
```
