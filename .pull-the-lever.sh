#!/usr/bin/env bash
# It's alive.
set -euo pipefail
cd "$(dirname "$0")"

API_KEY="igor-says-hello"
WAIT_TIMEOUT="${WAIT_TIMEOUT:-30}"

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
NEXT_PUBLIC_LANDING_URL=http://localhost:3000
ENV
}

up() { docker compose -f "$1/docker-compose.yml" up -d --build >/dev/null; }

# wait_for NAME CMD... : poll CMD once a second for WAIT_TIMEOUT seconds
wait_for() {
  local name=$1 i; shift
  for ((i = 0; i < WAIT_TIMEOUT; i++)); do
    "$@" >/dev/null 2>&1 && return 0
    sleep 1
  done
  echo "$name did not become healthy within ${WAIT_TIMEOUT}s" >&2
  exit 1
}

db_healthy() { [ "$(docker inspect -f '{{.State.Health.Status}}' frankenstein-db 2>/dev/null)" = healthy ]; }
php_up()      { curl -fs --max-time 10 -H "X-API-Key: ${API_KEY}" http://localhost:8080/health.php; }
python_up()   { curl -fs --max-time 10 http://localhost:8000/health; }
# the legacy app's / answers 302 (it forwards to the landing page), so only the status counts
frontend_up() { [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 http://localhost:3001/)" = 302 ]; }

raise() {
  write_env_files
  up db;                  wait_for db db_healthy
  up backend/php-service; wait_for php-service php_up
  up backend/python-api;  wait_for python-api python_up
  up frontend;            wait_for frontend frontend_up
  echo "It's alive!"
  echo "  frontend:   http://localhost:3001"
  echo "  python api: http://localhost:8000"
  echo "  php:        http://localhost:8080"
}

case "${1:-}" in
  --env-only) write_env_files ;;
  *) raise ;;
esac
