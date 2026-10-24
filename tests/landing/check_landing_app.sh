#!/usr/bin/env bash
# Expects: landing container up on :3000. Typecheck and build run in a throwaway node:22 container.
cd "$(dirname "$0")/../.." || exit 1
source tests/phase1/lib.sh

[ -f landing/package-lock.json ] || fail "landing/package-lock.json missing"
lock() { python3 -c "import json; print(json.load(open('landing/package-lock.json'))['packages']['node_modules/$1']['version'])"; }
assert_eq "$(lock next)" 16.4.3 "locked next version"
assert_eq "$(lock react)" 19.3.1 "locked react version"
assert_eq "$(lock react-dom)" 19.3.1 "locked react-dom version"
assert_eq "$(lock typescript)" 7.0.2 "locked typescript version"
assert_eq "$(lock gsap)" 3.15.0 "locked gsap version"
assert_eq "$(lock @gsap/react)" 2.1.2 "locked @gsap/react version"
assert_eq "$(lock vitest)" 5.0.5 "locked vitest version"
python3 - <<'PY' || fail "landing/package.json has a non-exact version"
import json, sys
pkg = json.load(open('landing/package.json'))
bad = [k for d in ('dependencies', 'devDependencies') for k, v in pkg[d].items() if v[:1] in '^~']
sys.exit(1 if bad else 0)
PY

docker run --rm -v "$PWD/landing:/src:ro" node:22 sh -c '
  mkdir /app && tar -C /src --exclude=node_modules --exclude=.next -cf - . | tar -C /app -xf - && cd /app &&
  npm ci --no-audit --no-fund && npx tsc --noEmit && npx next build' \
  > "${TMPDIR:-/tmp}/landing-build.log" 2>&1 || { tail -30 "${TMPDIR:-/tmp}/landing-build.log"; fail "npm ci / tsc / next build failed"; }

assert_eq "$(http_code http://localhost:3000/ --max-time 30)" 200 "landing status"
assert_contains "$(curl -s --max-time 30 http://localhost:3000/)" "<title>Frankenstein" "landing title"
echo "PASS: landing app"
