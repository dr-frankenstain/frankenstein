#!/usr/bin/env bash
# PostToolUse hook (matcher: Edit|Write) — keeps `updated:` honest automatically.
#
# Nobody, human or model, reliably remembers to bump a date field. So don't rely on it:
# whenever a file under docs/ with YAML frontmatter is written, stamp today's date.
# This makes the linter's staleness check meaningful instead of noise.
#
# Hook input arrives as JSON on stdin; we read tool_input.file_path from it.

set -uo pipefail

INPUT="$(cat)"

FILE="$(printf '%s' "$INPUT" | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
print((d.get("tool_input") or {}).get("file_path") or "")
' 2>/dev/null)"

[ -z "$FILE" ] && exit 0
[ -f "$FILE" ] || exit 0

case "$FILE" in
  *docs/*.md) ;;
  *) exit 0 ;;
esac

python3 - "$FILE" <<'PY'
import re, sys, datetime

path = sys.argv[1]
try:
    text = open(path, encoding="utf-8").read()
except Exception:
    sys.exit(0)

# Only touch files that already have frontmatter; never add it silently.
m = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
if not m:
    sys.exit(0)

fm = m.group(1)
today = datetime.date.today().isoformat()

if re.search(r"^updated:\s*\S+", fm, re.MULTILINE):
    new_fm = re.sub(r"^updated:.*$", f"updated: {today}", fm, count=1, flags=re.MULTILINE)
else:
    new_fm = fm.rstrip("\n") + f"\nupdated: {today}"

if new_fm == fm:
    sys.exit(0)

open(path, "w", encoding="utf-8").write(f"---\n{new_fm}\n---\n" + text[m.end():])
PY

exit 0
