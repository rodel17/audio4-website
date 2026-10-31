# Audio 4 Design N Technology Corp. — website + CMS

A product catalog for an electronics shop (sound systems, CCTV, electronics) with an admin CMS.
There is **no cart and no prices**: visitors browse items and specs, then contact sales for a quotation.
Every piece of public text, the catalog, and the company details are editable in the admin.

```
.
├── compose.yaml            # services shared by dev and prod: db, redis, backend, frontend
├── compose.override.yaml   # dev settings (hot reload), loaded automatically
├── compose.prod.yaml       # prod settings: Caddy HTTPS, restart policy, log limits
├── caddy/Caddyfile         # HTTPS reverse proxy config (production)
├── scripts/backup.sh       # database + uploads backup (production)
├── DEPLOY.md               # step-by-step server deployment
├── .env.example
├── backend/                # FastAPI + SQLAlchemy  → http://localhost:8000 (API docs at /docs)
└── frontend/               # Next.js public site + /admin  → http://localhost:3000
```

| Service | Image | Used for |
|---------|-------|----------|
| `db` | postgres:18-alpine | Catalog, page content, settings, inquiries, admin accounts |
| `redis` | redis:8-alpine | Admin sessions, login/inquiry rate limits, cache of public API responses |
| `backend` | FastAPI | Public API, admin API, image uploads (stored in the `uploads` volume) |
| `frontend` | Next.js | Public site and admin UI; proxies `/api` and `/uploads` to the backend |

## Getting started

```bash
cp .env.example .env      # optional: set ADMIN_EMAIL / ADMIN_PASSWORD, DB password, SMTP
docker compose up --build
```

On first start the database is created and filled with the sample catalog, and an admin account is
created. If `ADMIN_PASSWORD` is empty, a random password is printed once in the backend log:

```bash
docker compose logs backend | grep "generated password"
```

Sign in at **http://localhost:3000/admin**. Lost the password? Set a new one:

```bash
docker compose exec backend python -m app.manage reset-password admin@example.com --password 'new-password'
docker compose exec backend python -m app.manage create-admin you@company.com "Your Name"   # another admin
```

## Admin

| Screen | Controls |
|--------|----------|
| Dashboard | New/open inquiry counts, recent inquiries, setup checklist |
| Inquiries | Contact Sales messages: status (New → Contacted → Quoted → Closed won/lost), assignee, internal notes, activity log |
| Products | Name, web address, category, summary, overview, photos, highlights, specs, published/draft, featured |
| Categories | Name, web address, description, icon, order, visibility |
| Page content | All text on Home (plus section order/visibility), Products, Product detail, Services and Contact pages |
| Services | Service cards, "What's included", icon, order, "How we work" steps |
| Site settings | Company name, tagline, logo, brand color, phone, email, address, hours, social links, menu, footer, SEO, inquiry emails |

Saving in the admin clears the Redis cache, so changes show on the next page load.

**Inquiry emails** are sent only when `SMTP_HOST` (and related settings) are set in `.env`; recipients and
the customer confirmation message are set in Site settings.

## Development

Hot reload is on by default: `frontend/` and `backend/` are mounted into the containers, so every
save is live (Next.js and uvicorn reload within a second or two).

- **Polling:** file-change events from Windows/macOS don't reach containers, so both dev servers
  poll for changes (`WATCH_POLL_INTERVAL_MS` for Next.js, `WATCHFILES_FORCE_POLLING` for uvicorn).
- **New dependencies:** after adding an npm or pip package, run `docker compose restart frontend`
  (or `backend`). Each container installs missing packages when it starts.
- **Database schema:** tables are created on start (`python -m app.init_db`), but existing tables are
  not altered. After changing a model, add a migration tool (Alembic) or recreate the dev database
  with `docker compose down -v` (this deletes all data).

## Production

Step-by-step server setup (domain, Oracle Cloud, firewall, `.env`, backups): see **[DEPLOY.md](DEPLOY.md)**.

```bash
docker compose -f compose.yaml -f compose.prod.yaml up -d --build
```

- **Caddy** is the only service reachable from outside (ports 80/443). It gets the HTTPS certificate for
  `SITE_ADDRESS` automatically, redirects HTTP to HTTPS, and adds security headers ([caddy/Caddyfile](caddy/Caddyfile)).
- Backend, frontend, Postgres and Redis publish **no** ports in production; in development
  `compose.override.yaml` publishes 3000, 8000 and 5433 (localhost) for local access.
- Production refuses to start without `SITE_ADDRESS` and `POSTGRES_PASSWORD`; the admin cookie is
  HTTPS-only (`COOKIE_SECURE` defaults to `true`).
- Container logs are capped (3 × 10 MB per service). `scripts/backup.sh` backs up the database and uploads.
- Frontend and backend run as non-root users; the backend runs uvicorn with 2 workers.
- The `/api` and `/uploads` proxy target (`API_URL`) is fixed when the frontend image is built.

## How the pieces talk

- The **browser** only talks to the frontend. `/api/*` and `/uploads/*` are proxied to the backend,
  so the admin session cookie is first-party.
- **Server-rendered pages** call the backend directly at `API_URL` (`http://backend:8000` in Docker).
- `/admin/*` pages redirect to the sign-in page when there's no session cookie; the backend checks the
  session on every admin API call.

## Useful commands

```bash
docker compose logs -f backend
docker compose exec db psql -U audio4 -d audio4
docker compose exec redis redis-cli
docker compose down          # stop (keeps data)
docker compose down -v       # stop and delete all data volumes
```
