# Next.js + FastAPI with Docker Compose

```
.
├── compose.yaml        # dev stack (hot reload via Compose Watch)
├── compose.prod.yaml   # prod overrides (optimized images, restart policy)
├── .env.example
├── backend/            # FastAPI  → http://localhost:8000  (docs at /docs)
└── frontend/           # Next.js  → http://localhost:3000
```

## Development

```bash
cp .env.example .env      # optional
docker compose up --watch --build
```

Compose Watch syncs edits into the containers, so Next.js and uvicorn reload on save.
Changing `package.json`, `package-lock.json` or `requirements.txt` rebuilds that image automatically.

## Production

```bash
docker compose -f compose.yaml -f compose.prod.yaml up -d --build
```

- Frontend runs the Next.js standalone server as a non-root user.
- Backend runs uvicorn with 2 workers as a non-root user.

## How the frontend reaches the backend

| From | Variable | Value |
|------|----------|-------|
| Server components / route handlers (inside Docker) | `API_URL` | `http://backend:8000` |
| Browser code | `NEXT_PUBLIC_API_URL` | `http://localhost:8000` |

`NEXT_PUBLIC_API_URL` is baked into the JS bundle at build time in production, so rebuild the frontend
after changing it. The backend's allowed browser origins are set by `CORS_ORIGINS` (comma-separated).

## Useful commands

```bash
docker compose logs -f backend
docker compose exec backend pip list
docker compose exec frontend npm ls
docker compose down
```
