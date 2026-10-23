#!/usr/bin/env bash
# Expects: frontend container up on :3000 (build/typecheck run in a throwaway node:16 container).
cd "$(dirname "$0")/../.." || exit 1
source tests/phase1/lib.sh

[ -f frontend/package-lock.json ] || fail "frontend/package-lock.json missing"
lock() { python3 -c "import json; print(json.load(open('frontend/package-lock.json'))['packages']['node_modules/$1']['version'])"; }
assert_eq "$(lock next)" 12.3.4 "locked next version"
assert_eq "$(lock react)" 17.0.2 "locked react version"
assert_eq "$(lock react-dom)" 17.0.2 "locked react-dom version"
assert_eq "$(lock typescript)" 4.5.5 "locked typescript version"

docker run --rm -v "$PWD/frontend:/app" -w /app node:16 sh -c "npm ci --no-audit --no-fund && npx tsc --noEmit && npx next build" \
  > "${TMPDIR:-/tmp}/frontend-build.log" 2>&1 || { tail -30 "${TMPDIR:-/tmp}/frontend-build.log"; fail "npm ci / tsc / next build failed"; }

html=$(curl -s --max-time 30 http://localhost:3000/)
assert_eq "$(http_code http://localhost:3000/ --max-time 30)" 200 "frontend status"
assert_contains "$html" "Challenges" "challenges heading"
assert_contains "$html" "No challenges yet" "empty challenges state"
echo "PASS: frontend"
