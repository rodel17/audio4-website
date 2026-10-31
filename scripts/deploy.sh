#!/bin/sh
# Deploy the latest main branch on this server: pull, rebuild what changed, restart, and wait
# until the backend is healthy. Run automatically by GitHub Actions over SSH (see DEPLOY.md,
# "Automatic deploys"), or by hand: ./scripts/deploy.sh
set -eu

cd "$(dirname "$0")/.."
compose() { docker compose -f compose.yaml -f compose.prod.yaml "$@"; }

fail() {
  echo "!!! Deploy failed: $1"
  echo "--- recent backend logs ---"
  compose logs --tail 40 backend || true
  exit 1
}

echo "==> Updating code"
git fetch --quiet origin main
# Fast-forward only: if the server's copy was edited by hand, stop instead of overwriting it.
git merge --ff-only --quiet origin/main || fail "the server's copy has local changes; resolve them in ~/audio4 first"
echo "    now at $(git log -1 --format='%h %s')"

echo "==> Building and restarting changed services"
compose up -d --build --remove-orphans || fail "services did not start"

echo "==> Waiting for the backend to be healthy"
tries=0
until [ "$(docker inspect -f '{{.State.Health.Status}}' "$(compose ps -q backend)")" = "healthy" ]; do
  tries=$((tries + 1))
  [ "$tries" -lt 90 ] || fail "the backend did not become healthy within 3 minutes"
  sleep 2
done

echo "==> Removing unused images"
docker image prune -f >/dev/null

echo "==> Deployed $(git log -1 --format='%h') successfully"
