#!/usr/bin/env python3
"""
docs_lint.py — make documentation rot a build failure instead of a surprise.

No dependencies. Python 3.8+. Run from the repo root:

    python3 scripts/docs_lint.py            # report; exit 1 only on errors
    python3 scripts/docs_lint.py --strict   # exit 1 on warnings too (use in CI)
    python3 scripts/docs_lint.py --emit-index   # print a regenerated doc list for INDEX.md

What it checks
--------------
ERRORS (always fail)
  * missing or malformed frontmatter
  * unknown `type` or `status`
  * duplicate `id`
  * `superseded_by` pointing at an id that does not exist
  * a doc marked `superseded` with no `superseded_by`, or vice versa
  * broken relative links between markdown files
  * a current doc missing from docs/INDEX.md, or INDEX.md listing a dead doc

WARNINGS (fail with --strict)
  * DRIFT: code matched by `covers:` was committed more recently than the doc's
    `updated:` date — the single highest-signal staleness check there is
  * append-style writing in a Living doc (changelog/history sections, "previously we…")
  * docs/STATE.md over its line budget (it is meant to be rewritten, not grown)
  * a `plan` with `status: done` still sitting in docs/plans/
  * `updated:` far in the past with no `covers:` to check against
"""

import argparse
import datetime
import fnmatch
import os
import re
import subprocess
import sys

DOCS_DIR = "docs"
INDEX_PATH = os.path.join(DOCS_DIR, "INDEX.md")
ARCHIVE_DIR = os.path.join(DOCS_DIR, "_archive")

VALID_TYPES = {"adr", "spec", "plan", "audit", "research", "ops", "state", "index"}
VALID_STATUS = {"current", "draft", "superseded", "archived", "done"}

LOG_TYPES = {"adr", "audit", "research"}
LIVING_TYPES = {"spec", "ops", "state", "index"}

REQUIRED_FIELDS = ["id", "type", "status", "updated"]

STATE_MAX_LINES = 90
STALE_DAYS_NO_COVERS = 180

APPEND_SMELLS = [
    (re.compile(r"^#+\s*(change ?log|history|revision history|updates?)\b", re.I | re.M),
     "history/changelog section — git already holds this; state the present instead"),
    (re.compile(r"^#+\s*update[ :\-]+\d{4}-\d{2}-\d{2}", re.I | re.M),
     "dated update section — edit the original statement in place"),
    (re.compile(r"\b(previously|formerly|used to|we used to)\b.{0,60}\b(now|instead)\b", re.I),
     "before/after phrasing — a Living doc states only what is true now"),
    (re.compile(r"~~[^~\n]{8,}~~"),
     "struck-through content left in place — delete it"),
    (re.compile(r"^\s*(?:>\s*)?(TODO|FIXME)[:\s].{0,40}(out ?of ?date|stale|verify|check)", re.I | re.M),
     "self-reported stale marker — fix or delete the section"),
]

RESET = "\033[0m"; RED = "\033[31m"; YEL = "\033[33m"; DIM = "\033[2m"; BOLD = "\033[1m"
if not sys.stdout.isatty() or os.environ.get("NO_COLOR"):
    RESET = RED = YEL = DIM = BOLD = ""


class Doc:
    def __init__(self, path, meta, body):
        self.path = path
        self.meta = meta
        self.body = body

    def get(self, key, default=None):
        return self.meta.get(key, default)

    @property
    def id(self):
        return self.meta.get("id")

    @property
    def type(self):
        return self.meta.get("type")

    @property
    def status(self):
        return self.meta.get("status")


# ---------------------------------------------------------------- frontmatter

def parse_frontmatter(text):
    """Minimal YAML: scalars, inline lists [a, b], and block lists. No nesting."""
    m = re.match(r"^---\n(.*?)\n---\n?", text, re.DOTALL)
    if not m:
        return None, text
    meta, key = {}, None
    for raw in m.group(1).split("\n"):
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        if re.match(r"^\s*-\s+", raw) and key:                 # block list item
            meta.setdefault(key, [])
            if isinstance(meta[key], list):
                meta[key].append(_scalar(re.sub(r"^\s*-\s+", "", raw)))
            continue
        km = re.match(r"^([A-Za-z_][\w\-]*)\s*:\s*(.*)$", raw)
        if not km:
            continue
        key, val = km.group(1), km.group(2).strip()
        if val == "":
            meta[key] = []
        elif val.startswith("[") and val.endswith("]"):
            inner = val[1:-1].strip()
            meta[key] = [_scalar(p) for p in inner.split(",") if p.strip()] if inner else []
        else:
            meta[key] = _scalar(val)
    return meta, text[m.end():]


def _scalar(v):
    v = v.strip().strip('"').strip("'")
    if v.lower() in ("null", "none", "~", ""):
        return None
    return v


def as_list(v):
    if v is None:
        return []
    return v if isinstance(v, list) else [v]


# ------------------------------------------------------------------- git glue

def git_available():
    try:
        subprocess.run(["git", "rev-parse", "--git-dir"],
                       capture_output=True, check=True)
        return True
    except Exception:
        return False


def tracked_files():
    try:
        out = subprocess.run(["git", "ls-files"], capture_output=True,
                             text=True, check=True).stdout
        return out.splitlines()
    except Exception:
        return []


def last_commit_date(paths):
    """Most recent commit date (ISO) touching any of `paths`."""
    if not paths:
        return None
    try:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%cs", "--"] + paths[:400],
            capture_output=True, text=True, check=True,
        ).stdout.strip()
        return out or None
    except Exception:
        return None


def expand_globs(patterns, all_files):
    hits = []
    for pat in patterns:
        if not pat:
            continue
        p = pat.rstrip("/")
        for f in all_files:
            if fnmatch.fnmatch(f, p) or fnmatch.fnmatch(f, p + "/*") or f.startswith(p.rstrip("*")):
                if fnmatch.fnmatch(f, p) or fnmatch.fnmatch(f, p.rstrip("*") + "*"):
                    hits.append(f)
    return sorted(set(hits))


def parse_date(s):
    try:
        return datetime.date.fromisoformat(str(s))
    except Exception:
        return None


# --------------------------------------------------------------------- checks

class Report:
    def __init__(self):
        self.errors = []
        self.warnings = []

    def error(self, path, msg):
        self.errors.append((path, msg))

    def warn(self, path, msg):
        self.warnings.append((path, msg))


# Build output and vendored trees that turn up inside docs/ in real repos
# (Rust's target/doc, generated API docs, a stray node_modules).
SKIP_DIRS = {"_archive", "_templates", "node_modules", "target", "dist", "build",
             "vendor", "coverage", ".next", ".venv", "venv", "__pycache__", "site-packages"}

# Repository meta files, not project documentation. They have their own conventions and
# must never be given frontmatter.
SKIP_FILES = {"license.md", "licence.md", "changelog.md", "contributing.md",
              "code_of_conduct.md", "security.md", "skill.md", "claude.md",
              "claude.local.md", "agents.md", "pull_request_template.md",
              "issue_template.md", "notice.md", "authors.md"}


def is_doc(fn):
    return fn.endswith(".md") and fn.lower() not in SKIP_FILES


def collect_docs(report):
    docs = []
    for root, dirs, files in os.walk(DOCS_DIR):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
        for fn in sorted(files):
            if not is_doc(fn):
                continue
            path = os.path.join(root, fn)
            try:
                text = open(path, encoding="utf-8").read()
            except Exception as e:
                report.error(path, f"unreadable: {e}")
                continue
            meta, body = parse_frontmatter(text)
            if meta is None:
                report.error(path, "no YAML frontmatter — every doc under docs/ needs one")
                continue
            docs.append(Doc(path, meta, body))
    return docs


def check_fields(docs, report):
    seen = {}
    for d in docs:
        for f in REQUIRED_FIELDS:
            if not d.get(f):
                report.error(d.path, f"frontmatter missing `{f}`")
        if d.type and d.type not in VALID_TYPES:
            report.error(d.path, f"unknown type `{d.type}` (expected one of {sorted(VALID_TYPES)})")
        if d.status and d.status not in VALID_STATUS:
            report.error(d.path, f"unknown status `{d.status}` (expected one of {sorted(VALID_STATUS)})")
        if d.get("updated") and not parse_date(d.get("updated")):
            report.error(d.path, f"`updated: {d.get('updated')}` is not an ISO date (YYYY-MM-DD)")
        if d.id:
            if d.id in seen:
                report.error(d.path, f"duplicate id `{d.id}` (also in {seen[d.id]})")
            else:
                seen[d.id] = d.path
    return seen


def check_supersession(docs, ids, report):
    for d in docs:
        sb = d.get("superseded_by")
        if sb and sb not in ids:
            report.error(d.path, f"`superseded_by: {sb}` does not match any document id")
        if d.status == "superseded" and not sb:
            report.error(d.path, "status is `superseded` but `superseded_by` is empty — "
                                 "a superseded doc must point at its replacement")
        if sb and d.status != "superseded":
            report.error(d.path, f"has `superseded_by: {sb}` but status is `{d.status}` — set status to `superseded`")
        for sup in as_list(d.get("supersedes")):
            if sup and sup not in ids:
                report.error(d.path, f"`supersedes: {sup}` does not match any document id")
        for rel in as_list(d.get("related")):
            if rel and rel not in ids:
                report.warn(d.path, f"`related: {rel}` does not match any document id")


# Balanced-paren aware: a URL like src/app/(dashboard)/page.tsx is one target,
# not a link that ends at the first ")". Also skips fenced code blocks.
# The plain run must exclude "(" as well as ")", or the greedy match eats the opening
# paren of src/app/(dashboard)/page.tsx, stops at the closing one, and reports a phantom
# broken link to "src/app/(dashboard".
LINK_RE = re.compile(r"!?\[[^\]]*\]\(\s*(<[^>]*>|[^()\s]*(?:\([^()]*\)[^()\s]*)*)\s*(?:\"[^\"]*\")?\)")
FENCE_RE = re.compile(r"^(```|~~~).*?^\1", re.DOTALL | re.MULTILINE)


def check_links(docs, report):
    for d in docs:
        base = os.path.dirname(d.path)
        body = FENCE_RE.sub("", d.body)          # code samples are not links
        for m in LINK_RE.finditer(body):
            target = m.group(1).strip().strip("<>").split("#")[0].strip()
            if not target or re.match(r"^(https?:|mailto:|tel:|data:)", target):
                continue
            rel = os.path.normpath(os.path.join(base, target))
            if os.path.exists(rel):
                continue
            # Written as repo-root-relative ("src/lib/x.ts") rather than relative to
            # the doc. Common and harmless in prose — warn, and docs_fix.py --fix-links
            # rewrites it.
            if os.path.exists(os.path.normpath(target)):
                report.warn(d.path, f"link `{target}` resolves from the repo root, not from "
                                    f"this file — run docs_fix.py --fix-links")
                continue
            report.error(d.path, f"broken link → {target}")


def check_writing_style(docs, report):
    for d in docs:
        if d.type not in LIVING_TYPES:
            continue
        for pattern, why in APPEND_SMELLS:
            m = pattern.search(d.body)
            if m:
                line = d.body[:m.start()].count("\n") + 1
                snippet = m.group(0).strip().split("\n")[0][:60]
                report.warn(d.path, f"line ~{line}: {why} — “{snippet}”")


def check_drift(docs, report, all_files, today):
    for d in docs:
        if d.status in ("superseded", "archived"):
            continue
        updated = parse_date(d.get("updated"))
        if not updated:
            continue
        covers = [c for c in as_list(d.get("covers")) if c]
        if covers:
            files = expand_globs(covers, all_files)
            if not files:
                report.warn(d.path, f"`covers:` matches no tracked files: {covers}")
                continue
            code_date = parse_date(last_commit_date(files))
            if code_date and code_date > updated:
                days = (code_date - updated).days
                report.warn(
                    d.path,
                    f"DRIFT: code it covers was changed {code_date} but the doc says "
                    f"updated: {updated} ({days}d behind). Re-read it against "
                    f"{files[0]}{' and %d more' % (len(files) - 1) if len(files) > 1 else ''}."
                )
        elif d.type in LIVING_TYPES and d.type != "index":
            age = (today - updated).days
            if age > STALE_DAYS_NO_COVERS:
                report.warn(d.path, f"not updated in {age} days and has no `covers:` to verify against")


def check_state_and_plans(docs, report):
    for d in docs:
        if d.type == "state":
            n = len(d.body.strip().split("\n"))
            if n > STATE_MAX_LINES:
                report.warn(d.path, f"{n} lines (budget {STATE_MAX_LINES}) — STATE.md is being "
                                    f"appended to. Rewrite it: delete what is no longer true, "
                                    f"push detail into specs.")
        if d.type == "plan" and d.status in ("done", "archived") and ARCHIVE_DIR not in d.path:
            report.warn(d.path, "finished plan still in docs/plans/ — move it to docs/_archive/plans/ "
                                "so sessions stop re-proposing shipped work")


def check_index(docs, report):
    if not os.path.exists(INDEX_PATH):
        report.error(INDEX_PATH, "missing — this is the routing map every session depends on")
        return
    index_text = open(INDEX_PATH, encoding="utf-8").read()
    for d in docs:
        if d.path == INDEX_PATH or not d.id:
            continue
        listed = f"`{d.id}`" in index_text or d.id in index_text
        if d.status in ("current", "draft") and not listed:
            report.error(INDEX_PATH, f"does not list `{d.id}` ({d.path}) — unlisted docs are invisible to sessions")
        if d.status in ("superseded", "archived") and listed:
            report.warn(INDEX_PATH, f"still lists `{d.id}`, which is {d.status} — remove the row")


def emit_index(docs):
    groups = {}
    for d in docs:
        if d.type in ("index",) or d.status in ("superseded", "archived"):
            continue
        groups.setdefault(d.type, []).append(d)
    order = ["state", "adr", "spec", "ops", "research", "audit", "plan"]
    labels = {
        "state": "State", "adr": "Decisions — `docs/decisions/`",
        "spec": "Specs — `docs/specs/`", "ops": "Operations — `docs/ops/`",
        "research": "Research — `docs/research/`", "audit": "Audits — `docs/audits/`",
        "plan": "Plans — `docs/plans/`",
    }
    out = []
    for t in order + [k for k in groups if k not in order]:
        if t not in groups:
            continue
        out.append(f"\n### {labels.get(t, t)}\n")
        for d in sorted(groups[t], key=lambda x: x.id or ""):
            first = next((l.strip().lstrip("# ").strip()
                          for l in d.body.split("\n")
                          if l.strip() and not l.strip().startswith("<!--")), "")
            out.append(f"- `{d.id}` — {first[:90]} — `{d.path}` ({d.status}, {d.get('updated')})")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--strict", action="store_true", help="exit non-zero on warnings too")
    ap.add_argument("--emit-index", action="store_true", help="print a regenerated doc list")
    args = ap.parse_args()

    if not os.path.isdir(DOCS_DIR):
        print(f"{RED}no {DOCS_DIR}/ directory here — run from the repo root{RESET}")
        return 2

    report = Report()
    docs = collect_docs(report)

    if args.emit_index:
        print(emit_index(docs))
        return 0

    ids = check_fields(docs, report)
    check_supersession(docs, ids, report)
    check_links(docs, report)
    check_writing_style(docs, report)
    check_state_and_plans(docs, report)
    check_index(docs, report)

    if git_available():
        check_drift(docs, report, tracked_files(), datetime.date.today())
    else:
        report.warn(".", "not a git repo — drift detection skipped")

    for path, msg in report.errors:
        print(f"{RED}ERROR{RESET} {BOLD}{path}{RESET}: {msg}")
    for path, msg in report.warnings:
        print(f"{YEL}WARN {RESET} {BOLD}{path}{RESET}: {msg}")

    n_docs = len(docs)
    print(f"\n{DIM}checked {n_docs} doc{'s' if n_docs != 1 else ''} — "
          f"{len(report.errors)} error(s), {len(report.warnings)} warning(s){RESET}")

    if report.errors:
        return 1
    if args.strict and report.warnings:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
