#!/usr/bin/env bash
# Expects: the full stack up. The landing page (:3000) and the legacy app (:3001) are separate
# origins; the legacy / forwards visitors to the landing page.
cd "$(dirname "$0")/../.." || exit 1
source tests/phase1/lib.sh

landing=http://localhost:3000
legacy=http://localhost:3001
redirect() { curl -s -o /dev/null -w '%{http_code} %{redirect_url}' --max-time 30 "$@"; }

html=$(curl -s --max-time 30 "$landing/")
assert_eq "$(http_code "$landing/" --max-time 30)" 200 "landing /"
assert_contains "$html" "Alive, and" "landing serves the landing page"
assert_not_contains "$html" "localhost:3001" "landing HTML never points at the legacy origin while no room is built"

assert_eq "$(redirect "$legacy/")" "302 $landing/" "legacy / redirects to landing"
assert_eq "$(redirect "$legacy/?redirectTo=%2Fproduct")" "302 $landing/?redirectTo=%2Fproduct" "redirectTo survives"

# each app serves its own /_next assets from its own origin
for origin in "$landing" "$legacy"; do
  page=$(curl -s --max-time 30 "$origin/$([ "$origin" = "$legacy" ] && echo nope)")
  asset=$(echo "$page" | grep -o '/_next/static/[^"]*\.js' | head -1)
  [ -n "$asset" ] || fail "$origin: no /_next/static asset in its HTML"
  assert_eq "$(http_code "$origin$asset")" 200 "$origin serves its own asset $asset"
done
echo "PASS: routing"
