#!/usr/bin/env bash
# SessionStart hook — runs at startup, on resume, on /clear, and AFTER COMPACTION.
#
# This is the fix for "Claude forgets things after compacting".
#
# When the context compacts, the conversation is replaced by a summary. Claude Code
# re-injects: the project-root CLAUDE.md, the summary, the ~5 most recently modified
# files read during the session, the bodies of skills that were invoked — and the
# output of SessionStart hooks matching the `compact` source. Everything else is gone,
# including path-scoped rules (`paths:` frontmatter) and anything that only ever
# existed in the conversation.
#
# Whatever this script prints on stdout is added to the post-compaction context.
# Note: it must be SessionStart, not PreCompact — PreCompact stdout goes to the debug
# log only, not into context.
#
# Keep the output tight. It is paid for on every session start and every compaction.

set -uo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"

echo "=== Project documentation context — treat as current ==="
echo

echo "## Documentation rules"
cat <<'RULES'
- docs/ has three classes, given by each file's `type:` frontmatter.
  Log (adr, audit, research): never edit the body — write a new doc and set
  `superseded_by:` on the old one.
  Living (spec, ops, state, index): edit in place, never append, delete what is false.
  Ephemeral (plan): move to docs/_archive/ once the work ships.
- Bump `updated:` on every doc you touch; keep its line in docs/INDEX.md in sync.
- Run `python3 scripts/docs_lint.py` before reporting any task done.
- Write findings into the relevant doc as you make them, not at the end of the session.
RULES
echo

if [ -f "$ROOT/docs/STATE.md" ]; then
  echo "## docs/STATE.md — current project state"
  echo
  sed -n '1,120p' "$ROOT/docs/STATE.md"
  echo
fi

if [ -f "$ROOT/docs/INDEX.md" ]; then
  echo "## docs/INDEX.md — routing map (read individual docs from disk as needed)"
  echo
  sed -n '1,140p' "$ROOT/docs/INDEX.md"
  echo
fi

# Docs already edited but not committed: signals work in flight on them.
if git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
  CHANGED="$(git -C "$ROOT" diff --name-only -- 'docs/*' 2>/dev/null || true)"
  if [ -n "$CHANGED" ]; then
    echo "## Docs with uncommitted edits"
    printf '%s\n' "$CHANGED" | sed 's/^/- /'
    echo
  fi
fi

echo "=== End documentation context ==="
exit 0
