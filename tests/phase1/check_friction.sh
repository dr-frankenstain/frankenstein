#!/usr/bin/env bash
# Destructive: leaves the stack torn down with working .env files. Expects the stack up on entry.
cd "$(dirname "$0")/../.." || exit 1
source tests/phase1/lib.sh

py_ex=$(cat backend/python-api/.env.example)
php_ex=$(cat backend/php-service/.env.example)
assert_not_contains "$py_ex" "PHP_SERVICE_API_KEY" "python example must omit PHP_SERVICE_API_KEY"
assert_contains "$php_ex" "MYSQL_PASSWORD" "php example documents MYSQL_PASSWORD"
assert_not_contains "$php_ex" "MYSQL_PASS=" "php example must not say MYSQL_PASS="

# Python started from its example env crashes on the missing key
cp backend/python-api/.env.example backend/python-api/.env
docker compose -f backend/python-api/docker-compose.yml up -d --force-recreate >/dev/null 2>&1
for _ in $(seq 1 20); do
  [ "$(docker inspect -f '{{.State.Running}}' frankenstein-python)" = false ] && break; sleep 1
done
assert_contains "$(docker logs frankenstein-python 2>&1)" "KeyError: 'PHP_SERVICE_API_KEY'" "python example env crashes"

# PHP started from its example env cannot reach the DB (key is valid, password never arrives)
cp backend/php-service/.env.example backend/php-service/.env
docker compose -f backend/php-service/docker-compose.yml up -d --force-recreate >/dev/null 2>&1
wait_for_url http://localhost:8080/health.php 1 >/dev/null 2>&1
for _ in $(seq 1 20); do
  [ "$(http_code http://localhost:8080/health.php -H 'X-API-Key: changeme')" = 503 ] && break; sleep 1
done
assert_eq "$(http_code http://localhost:8080/health.php -H 'X-API-Key: changeme')" 503 "php example env cannot connect to db"

# Starting a service before the DB fails at compose level and leaves nothing behind
teardown_stack
out=$(docker compose -f backend/php-service/docker-compose.yml up -d 2>&1); rc=$?
[ $rc -ne 0 ] || fail "php compose up should fail with the DB stack down"
assert_contains "$out" "frankenstein-net" "failure names the missing network"
assert_eq "$(docker ps -aq --filter name=frankenstein-php)" "" "no half-started php container"

# The hidden script is referenced nowhere public
hits=$(grep -rl "raise-the-monster" README.md CONTRIBUTING.md SECURITY.md CODE_OF_CONDUCT.md .github frontend backend db \
  --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null)
assert_eq "$hits" "" "raise-the-monster must not be referenced publicly"

./.raise-the-monster.sh --env-only
echo "PASS: friction"
