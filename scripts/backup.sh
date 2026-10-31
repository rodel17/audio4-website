#!/bin/sh
# Back up the production database and uploaded images to backups/<date-time>/.
# Keeps the 14 most recent backups. Run from anywhere; schedule daily with cron, e.g.:
#   0 3 * * * /home/ubuntu/audio4/scripts/backup.sh >> /home/ubuntu/audio4/backups/backup.log 2>&1
set -eu

cd "$(dirname "$0")/.."
compose() { docker compose -f compose.yaml -f compose.prod.yaml "$@"; }

dest="backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$dest"

compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' > "$dest/db.dump"
compose exec -T backend tar -C /data -czf - uploads > "$dest/uploads.tar.gz"

# Remove all but the 14 newest backups.
ls -1dt backups/*/ | tail -n +15 | xargs -r rm -rf

echo "$(date): backup written to $dest ($(du -sh "$dest" | cut -f1))"
