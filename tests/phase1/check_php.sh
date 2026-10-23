#!/usr/bin/env bash
# Expects: DB, Python API and PHP service all up.
cd "$(dirname "$0")/../.." || exit 1
source tests/phase1/lib.sh
PHP=http://localhost:8080/health.php
KEY="X-API-Key: igor-says-hello"

out=$(curl -s -H "$KEY" -w '\n%{http_code}' $PHP)
assert_eq "${out##*$'\n'}" 200 "valid key status"
assert_contains "$out" '"db":"ok"' "valid key body"

for hdr in "X-API-Key: wrong" "X-Nothing: 1"; do
  out=$(curl -s -H "$hdr" -w '\n%{http_code}' $PHP)
  assert_eq "${out##*$'\n'}" 401 "bad key status ($hdr)"
  assert_contains "$out" "bad api key" "bad key body ($hdr)"
  for leak in Warning Fatal "Stack trace"; do
    assert_not_contains "$out" "$leak" "bad key must not leak '$leak'"
  done
done

# DB down -> 503 JSON, then restore
docker stop frankenstein-db >/dev/null
out=$(curl -s -H "$KEY" -w '\n%{http_code}' $PHP)
docker start frankenstein-db >/dev/null
for _ in $(seq 1 40); do
  [ "$(docker inspect -f '{{.State.Health.Status}}' frankenstein-db)" = healthy ] && break; sleep 2
done
assert_eq "${out##*$'\n'}" 503 "db down status"
assert_contains "$out" "db unavailable" "db down body"
for leak in Warning Fatal "Stack trace"; do
  assert_not_contains "$out" "$leak" "db down must not leak '$leak'"
done

# Python -> PHP end to end
out=$(curl -s -w '\n%{http_code}' --max-time 8 http://localhost:8000/api/php-check)
assert_eq "${out##*$'\n'}" 200 "python php-check status"
assert_contains "$out" '"php"' "python php-check body"
assert_contains "$out" '"status":"ok"' "python php-check nested status"
echo "PASS: php"
