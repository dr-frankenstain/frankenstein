#!/usr/bin/env bash
cd "$(dirname "$0")/../.." || exit 1
source tests/phase1/lib.sh

./.pull-the-lever.sh --env-only || fail "env writer exited non-zero"

py=$(cat backend/python-api/.env)
php=$(cat backend/php-service/.env)
fe=$(cat frontend/.env.local)

for k in DB_HOST DB_USER DB_PASSWORD DB_NAME PHP_SERVICE_URL PHP_SERVICE_API_KEY; do
  assert_contains "$py" "$k=" "python .env has $k"
done
assert_contains "$py" "DB_HOST=db" "python DB_HOST"
assert_contains "$py" "PHP_SERVICE_API_KEY=igor-says-hello" "python api key"

assert_contains "$php" "MYSQL_PASS=monster" "php MYSQL_PASS"
assert_contains "$php" "API_KEY=igor-says-hello" "php api key"
assert_not_contains "$php" "MYSQL_PASSWORD" "php .env must use MYSQL_PASS, not MYSQL_PASSWORD"

assert_contains "$fe" "NEXT_PUBLIC_API_URL=http://localhost:8000" "frontend api url"
assert_contains "$fe" "NEXT_PUBLIC_LANDING_URL=http://localhost:3000" "frontend landing url"

for f in backend/python-api/.env backend/php-service/.env frontend/.env.local; do
  git check-ignore -q "$f" || fail "$f must be gitignored"
done
echo "PASS: env writer"
