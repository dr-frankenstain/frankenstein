#!/usr/bin/env bash
# Builds the landing app, serves it on :3999 and asserts on the server-rendered HTML.
# Runs in a throwaway node:22 container; set LANDING_HOST=1 to use the host's node instead.
cd "$(dirname "$0")/../.." || exit 1
source tests/phase1/lib.sh

tmp=$(mktemp -d)
pid=
cleanup() {
  [ -n "$pid" ] && kill "$pid" 2>/dev/null
  [ -n "$LANDING_HOST" ] || docker rm -f frankenstein-landing-check >/dev/null 2>&1
  rm -rf "$tmp"
}
trap cleanup EXIT

if [ -n "$LANDING_HOST" ]; then
  (cd landing && npx next build >"$tmp/build.log" 2>&1) || { tail -30 "$tmp/build.log"; fail "next build failed"; }
  (cd landing && exec npx next start -p 3999 >"$tmp/start.log" 2>&1) &
  pid=$!
else
  docker run -d --name frankenstein-landing-check -p 127.0.0.1:3999:3999 -v "$PWD/landing:/app" -w /app node:22 \
    sh -c "npm ci --no-audit --no-fund && npx next build && npx next start -p 3999" >/dev/null || fail "could not start the check container"
fi
wait_for_url http://localhost:3999/ 240 || { [ -n "$LANDING_HOST" ] || docker logs frankenstein-landing-check 2>&1 | tail -30; tail -30 "$tmp/build.log" 2>/dev/null; fail "landing did not come up on :3999"; }

curl -s --max-time 30 http://localhost:3999/ >"$tmp/home.html"
curl -s --max-time 30 http://localhost:3999/does-not-exist >"$tmp/missing.html"
html=$(cat "$tmp/home.html")

# --- shell, nav, hero, marquee, footer
assert_contains "$html" '<html lang="en"' "html lang"
assert_contains "$html" "Alive, and" "hero headline line 1"
assert_contains "$html" "broken on purpose." "hero headline line 2"
assert_contains "$html" "Browse challenges" "primary cta"
assert_contains "$html" "Read the lore" "secondary cta"
assert_contains "$html" 'href="#lore"' "lore anchor"
assert_contains "$html" "https://github.com/dr-frankenstain/frankenstein" "github link"
assert_contains "$html" "SELECT * FROM users" "marquee flaw"
assert_contains "$html" "Intentionally vulnerable" "footer disclaimer"
case "$html" in *$'—'*) fail "page copy contains an em-dash" ;; esac

echo "PASS: landing html"
