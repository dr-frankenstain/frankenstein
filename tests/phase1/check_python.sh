#!/usr/bin/env bash
# Expects: DB up, Python API up on :8000, PHP service NOT up.
cd "$(dirname "$0")/../.." || exit 1
source tests/phase1/lib.sh
API=http://localhost:8000

assert_eq "$(http_code $API/health)" 200 "/health status"
assert_contains "$(curl -s $API/health)" '"status":"ok"' "/health body"

products=$(curl -s $API/api/products)
assert_eq "$(http_code $API/api/products)" 200 "/api/products status"
assert_eq "$(echo "$products" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))')" 6 "product count"
assert_eq "$(echo "$products" | python3 -c 'import json,sys; d=json.load(sys.stdin)[0]; print(all(k in d for k in ("ID","ProductName","Description","Price","ImageUrl")))')" True "product keys"

# PHP is down: a clear 502 JSON, quickly, no traceback
out=$(curl -s --max-time 5 -w '\n%{http_code}' $API/api/php-check) || fail "php-check hung or errored (>5s)"
assert_eq "${out##*$'\n'}" 502 "/api/php-check status when PHP is down"
assert_contains "$out" "unreachable" "php-check detail"
assert_not_contains "$out" "Traceback" "php-check must not leak a traceback"

# CORS: only the frontend origin
ok=$(curl -s -D- -o /dev/null -H 'Origin: http://localhost:3000' $API/health)
assert_contains "$(echo "$ok" | tr 'A-Z' 'a-z')" "access-control-allow-origin: http://localhost:3000" "CORS allows frontend origin"
bad=$(curl -s -D- -o /dev/null -H 'Origin: http://evil.test' $API/health | tr 'A-Z' 'a-z')
assert_not_contains "$bad" "access-control-allow-origin" "CORS must not allow other origins"
echo "PASS: python"
