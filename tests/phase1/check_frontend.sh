#!/usr/bin/env bash
# Expects: legacy frontend container up on :3001 (build/typecheck run in a throwaway node:16 container).
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

legacy=http://localhost:3001
redirect() { curl -s -o /dev/null -w '%{http_code} %{redirect_url}' --max-time 30 "$@"; }
assert_eq "$(redirect "$legacy/")" "302 http://localhost:3000/" "legacy / redirects to the landing page"
assert_eq "$(redirect "$legacy/?redirectTo=%2Fproduct")" "302 http://localhost:3000/?redirectTo=%2Fproduct" "redirectTo is forwarded"
# redirectTo is attacker-controlled: it is forwarded as data, never used as the destination
assert_eq "$(redirect "$legacy/?redirectTo=https%3A%2F%2Fevil.example")" \
  "302 http://localhost:3000/?redirectTo=https%3A%2F%2Fevil.example" "an external redirectTo cannot change the destination"
assert_eq "$(http_code "$legacy/nope" --max-time 30)" 404 "legacy unknown route"
echo "PASS: frontend"
