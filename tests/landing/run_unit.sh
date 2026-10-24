#!/usr/bin/env bash
# Runs the landing unit tests in a throwaway node:22 container (sources are copied in, so the
# host's node_modules are never touched).
cd "$(dirname "$0")/../.." || exit 1
source tests/phase1/lib.sh

docker run --rm -v "$PWD/landing:/src:ro" node:22 sh -c '
  mkdir /app && tar -C /src --exclude=node_modules --exclude=.next -cf - . | tar -C /app -xf - && cd /app &&
  npm ci --no-audit --no-fund >/dev/null 2>&1 && npx vitest run --passWithNoTests' || fail "landing unit tests failed"
echo "PASS: landing unit"
