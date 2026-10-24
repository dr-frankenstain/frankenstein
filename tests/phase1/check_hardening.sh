#!/usr/bin/env bash
# Expects: all four services up. Pins review findings: loopback-only ports, unique compose
# project names, and docs that match the shipped code.
cd "$(dirname "$0")/../.." || exit 1
source tests/phase1/lib.sh

for pair in python:8000 php:8080 frontend:3001; do
  assert_contains "$(docker port "frankenstein-${pair%%:*}")" "127.0.0.1:${pair##*:}" "${pair%%:*} port must bind 127.0.0.1 only"
done

for svc in db php python frontend; do
  proj=$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' "frankenstein-$svc")
  assert_eq "$proj" "frankenstein-$svc" "$svc compose project name must be unique to this repo"
done

grep -q "unpinned on purpose" docs/backend/SETUP.md && fail "docs/backend/SETUP.md still says requirements are unpinned on purpose"
grep -q "intentionally unpinned" docs/backend/SETUP.md && fail "docs/backend/SETUP.md still says deps are intentionally unpinned"
grep -q "uvicorn main:app --reload" docs/backend/SETUP.md && fail "docs/backend/SETUP.md still tells users to run uvicorn on the host"
grep -q "races the DB" docs/backend/SETUP.md && fail "docs/backend/SETUP.md still claims PHP races the DB"
grep -q '^- Python.s `.env.example`' docs/PHASE1_DESIGN.md && fail "PHASE1_DESIGN.md still says Python's .env.example lists PHP_SERVICE_API_KEY"
echo "PASS: hardening"
