#!/usr/bin/env bash
# Stop hook — fires when Claude finishes responding.
#
# Catches the specific failure you are trying to fix: code changed, docs did not.
# By default this only *warns* (systemMessage). Once the flow feels right, switch to
# the blocking variant at the bottom, which makes Claude keep working until the docs
# are updated. Start non-blocking — a blocking Stop hook that misfires is maddening.

set -uo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"

git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1 || exit 0

CHANGED="$(git -C "$ROOT" status --porcelain 2>/dev/null | awk '{print $NF}')"
[ -z "$CHANGED" ] && exit 0

CODE_CHANGED=0
DOCS_CHANGED=0

while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in
    docs/*)           DOCS_CHANGED=1 ;;
    *.md|*.txt|*.lock|.claude/*) ;;   # not code, not docs — ignore
    *)                CODE_CHANGED=1 ;;
  esac
done <<< "$CHANGED"

if [ "$CODE_CHANGED" -eq 1 ] && [ "$DOCS_CHANGED" -eq 0 ]; then
  cat <<'JSON'
{
  "systemMessage": "Code changed this session but nothing under docs/ did. Run the doc-update skill: check the affected spec, docs/STATE.md, and docs/ops/testing.md. If genuinely no doc applies, say so explicitly and why."
}
JSON
  exit 0
fi

# Also flag docs that were edited without the linter passing.
if [ "$DOCS_CHANGED" -eq 1 ] && [ -f "$ROOT/scripts/docs_lint.py" ]; then
  if ! OUT="$(cd "$ROOT" && python3 scripts/docs_lint.py 2>&1)"; then
    python3 - <<PY
import json
print(json.dumps({"systemMessage": "docs_lint.py reported problems:\n\n" + """$OUT"""[:1500]}))
PY
  fi
fi

exit 0

# ---------------------------------------------------------------------------
# BLOCKING VARIANT — replace the systemMessage block above with this once ready.
# `decision: block` sends `reason` back to Claude and makes it continue working
# instead of ending the turn.
#
#   cat <<'JSON'
#   {
#     "decision": "block",
#     "reason": "Code changed but no doc under docs/ was updated. Invoke the doc-update skill and close the loop before finishing."
#   }
#   JSON
#   exit 0
# ---------------------------------------------------------------------------
