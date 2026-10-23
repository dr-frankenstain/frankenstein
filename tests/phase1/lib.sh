#!/usr/bin/env bash
# Shared helpers for tests/phase1/check_*.sh. Source this; do not run it.

fail() { echo "FAIL: $*" >&2; exit 1; }

assert_eq() { [ "$1" = "$2" ] || fail "$3 (expected '$2', got '$1')"; }

assert_contains() {
  case "$1" in *"$2"*) ;; *) fail "$3 (missing '$2' in: ${1:0:300})" ;; esac
}

assert_not_contains() {
  case "$1" in *"$2"*) fail "$3 (unexpected '$2' in: ${1:0:300})" ;; esac
}

# http_code URL [curl args...] -> prints the HTTP status ("000" if unreachable)
http_code() {
  local url=$1; shift
  curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$@" "$url"
}

# wait_for_url URL SECONDS [curl args...] -> 0 once a 2xx is seen, 1 on timeout
wait_for_url() {
  local url=$1 secs=$2 i code; shift 2
  for ((i = 0; i < secs; i++)); do
    code=$(http_code "$url" "$@")
    [[ $code == 2* ]] && return 0
    sleep 1
  done
  return 1
}

# mysql_exec SQL -> rows (tab-separated, no header) from the frankenstein DB
mysql_exec() {
  docker exec frankenstein-db mysql -ufrank -pmonster frankenstein -N -e "$1" 2>/dev/null
}

# teardown_stack -> stop and remove all four services and their volumes (reverse start order)
teardown_stack() {
  local d
  ./.pull-the-lever.sh --env-only
  for d in frontend backend/python-api backend/php-service db; do
    docker compose -f "$d/docker-compose.yml" down -v >/dev/null 2>&1 || true
  done
}
