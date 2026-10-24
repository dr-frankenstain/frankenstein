#!/usr/bin/env bash
# Destructive: tears the stack down, brings it up twice, then tears down and tests the timeout path.
cd "$(dirname "$0")/../.." || exit 1
source tests/phase1/lib.sh
KEY="X-API-Key: igor-says-hello"

stack_ok() {
  assert_eq "$(http_code http://localhost:8000/health)" 200 "$1: python /health"
  assert_eq "$(http_code http://localhost:8080/health.php -H "$KEY")" 200 "$1: php /health.php"
  assert_eq "$(http_code http://localhost:3001/ --max-time 30)" 302 "$1: legacy frontend / redirects"
  assert_eq "$(http_code http://localhost:8000/api/php-check)" 200 "$1: python /api/php-check"
}

teardown_stack
out=$(./.pull-the-lever.sh 2>&1) || fail "first bootstrap run failed: ${out: -400}"
assert_contains "$out" "localhost:3001" "bootstrap prints the legacy frontend URL"
stack_ok "first run"

./.pull-the-lever.sh >/dev/null 2>&1 || fail "second bootstrap run (already up) failed"
stack_ok "second run"

teardown_stack
if err=$(WAIT_TIMEOUT=1 ./.pull-the-lever.sh 2>&1 >/dev/null); then
  fail "WAIT_TIMEOUT=1 on a fresh volume should fail"
fi
assert_contains "$err" "db" "timeout message names the service"
assert_contains "$err" "did not become healthy" "timeout message says why"
teardown_stack
echo "PASS: bootstrap"
