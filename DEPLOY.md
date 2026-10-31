# Deploying to a server (Oracle Cloud Always Free)

This runs the same Docker setup as development, with Caddy in front for HTTPS. Only ports 80 and 443
are reachable from the internet; the database, Redis, backend and frontend stay inside Docker.

```
Internet ──► Caddy (HTTPS, :80/:443) ──► frontend (Next.js) ──► backend (FastAPI) ──► Postgres / Redis
```

## 1. Domain

HTTPS needs a domain pointing at the server.

- **Free:** create a subdomain at [duckdns.org](https://www.duckdns.org) (e.g. `audio4design.duckdns.org`)
  and set its IP to the server's public IP (step 2).
- **Your own domain:** add an `A` record for the domain (or `www`) with the server's public IP.

## 2. Create the server

In the Oracle Cloud console: **Compute → Instances → Create instance**

- **Image:** Ubuntu 24.04
- **Shape:** Ampere **VM.Standard.A1.Flex** (ARM), e.g. 2 OCPUs and 12 GB RAM. All within Always Free.
  The 1 GB AMD shape is too small to build the site.
- **SSH key:** upload your public key or download the generated one. You need it to log in.

Then open the web ports in Oracle's network firewall:
**Instance → Subnet → Security List → Add Ingress Rules**, source `0.0.0.0/0`:

| Protocol | Destination port |
|----------|------------------|
| TCP | 80 |
| TCP | 443 |
| UDP | 443 (optional, for HTTP/3) |

## 3. Prepare the server

```bash
ssh ubuntu@<server-ip>

# Oracle's Ubuntu images also block ports in the server's own firewall. Insert the web ports just
# above its final REJECT rule (its position differs between images, so look it up):
REJECT_AT=$(sudo iptables -L INPUT --line-numbers | awk '$2 == "REJECT" {print $1; exit}')
sudo iptables -I INPUT "$REJECT_AT" -m state --state NEW -p udp --dport 443 -j ACCEPT
sudo iptables -I INPUT "$REJECT_AT" -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT "$REJECT_AT" -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo netfilter-persistent save
sudo iptables -L INPUT --line-numbers   # 80 and 443 must appear ABOVE the REJECT line

# Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
exit   # log out and back in so the docker group applies
```

## 4. Get the code and configure it

```bash
ssh ubuntu@<server-ip>
git clone https://github.com/rodel17/audio4-website.git audio4
cd audio4
cp .env.example .env
openssl rand -hex 24          # copy this for POSTGRES_PASSWORD
nano .env
chmod 600 .env
```

Set at least these in `.env` **before the first start** (the database password and the first admin
account are only applied when they're first created):

```env
SITE_ADDRESS=audio4design.duckdns.org
COMPOSE_FILE=compose.yaml:compose.prod.yaml

POSTGRES_PASSWORD=<the openssl output: letters and numbers only>

ADMIN_EMAIL=you@yourcompany.com
ADMIN_PASSWORD=<a strong password>

# Optional email (Resend example)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD="re_..."
SMTP_FROM="Audio4Design <onboarding@resend.dev>"
```

`COMPOSE_FILE` makes plain `docker compose` use the production setup on this server.
Don't set `COOKIE_SECURE` (production defaults it to `true`, which HTTPS requires).

## 5. Start

```bash
docker compose up -d --build     # first build takes a few minutes
docker compose ps                # all services "Up", backend "healthy"
docker compose logs -f caddy     # watch the HTTPS certificate being issued; Ctrl+C to stop
```

Open `https://<your domain>` and sign in at `https://<your domain>/admin`.
Then follow the Dashboard's setup checklist: real contact details, real products and photos
(delete the 22 sample products), and inquiry email recipients.

## 6. Backups

`scripts/backup.sh` saves the database and uploaded images to `backups/<date-time>/` and keeps the
14 newest. Schedule it daily:

```bash
crontab -e
# add:
0 3 * * * /home/ubuntu/audio4/scripts/backup.sh >> /home/ubuntu/audio4/backups/backup.log 2>&1
```

Copy backups off the server now and then (e.g. `scp -r ubuntu@<server-ip>:audio4/backups .`).

**Restore** a backup:

```bash
B=backups/<date-time>
docker compose exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' < $B/db.dump
docker compose exec -T backend tar -C /data -xzf - < $B/uploads.tar.gz
docker compose exec redis redis-cli incr cache:version    # clear cached pages
```

## Updating the site

```bash
cd ~/audio4
git pull
docker compose up -d --build
```

## Troubleshooting

| Problem | Likely cause |
|---------|--------------|
| Site doesn't load at all | Ports 80/443 not open: check the Security List (step 2) **and** iptables (step 3) |
| Certificate errors / Caddy log shows ACME errors | The domain doesn't point to this server's IP yet, or port 80 is blocked |
| `required variable SITE_ADDRESS is missing` | `.env` is missing or `SITE_ADDRESS` is empty |
| Backend keeps restarting, "password authentication failed" | `POSTGRES_PASSWORD` was changed after the database was created. Change it inside Postgres too: `docker compose exec db psql -U audio4 -d audio4 -c "ALTER USER audio4 PASSWORD '...';"` |
| Admin sign-in loops back to the sign-in page | The site isn't on HTTPS (the session cookie is HTTPS-only) |
| Forgot the admin password | `docker compose exec backend python -m app.manage reset-password you@yourcompany.com --password '...'` |
