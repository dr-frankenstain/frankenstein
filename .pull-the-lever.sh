#!/usr/bin/env bash
# It's alive.
set -euo pipefail
cd "$(dirname "$0")"

API_KEY="igor-says-hello"

write_env_files() {
  mkdir -p backend/python-api backend/php-service frontend
  cat > backend/python-api/.env <<ENV
DB_HOST=db
DB_USER=frank
DB_PASSWORD=monster
DB_NAME=frankenstein
PHP_SERVICE_URL=http://php-service:8080
PHP_SERVICE_API_KEY=${API_KEY}
ENV
  cat > backend/php-service/.env <<ENV
MYSQL_HOST=db
MYSQL_USER=frank
MYSQL_PASS=monster
MYSQL_DATABASE=frankenstein
API_KEY=${API_KEY}
ENV
  cat > frontend/.env.local <<ENV
NEXT_PUBLIC_API_URL=http://localhost:8000
ENV
}

case "${1:-}" in
  --env-only) write_env_files ;;
  *) echo "not implemented yet" >&2; exit 1 ;;
esac
