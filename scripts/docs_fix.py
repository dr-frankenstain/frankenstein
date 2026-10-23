#!/usr/bin/env python3
"""
docs_fix.py — add missing frontmatter to existing docs, inferring what it safely can.

No dependencies. Python 3.8+. Run from the repo root.

    python3 scripts/docs_fix.py                  # DRY RUN — shows a plan, writes nothing
    python3 scripts/docs_fix.py --apply          # write the frontmatter
    python3 scripts/docs_fix.py --apply --fix-links
    python3 scripts/docs_fix.py --apply --write-index
    python3 scripts/docs_fix.py --emit-overrides > docs/.docmeta.yml

Design rules, because a bulk metadata writer that guesses wrong is worse than nothing:

  * DRY RUN IS THE DEFAULT. Nothing is written without --apply.
  * Existing values are never overwritten. Only missing keys are added.
  * The body is preserved byte for byte.
  * `updated:` is set from the LAST GIT COMMIT that touched the file — never today's
    date. Stamping everything with today would mark the whole corpus fresh and destroy
    the drift signal you are installing this to get.
  * Every guess carries a confidence. Anything below `high` is written with a
    `review:` field naming the guessed keys, and listed in the report. You are meant
    to sweep those; the script does not pretend to know.
  * `docs/.docmeta.yml` overrides everything. Generate a starter with --emit-overrides,
    edit the rows you disagree with, re-run.
"""

import argparse
import datetime
import os
import re
import subprocess
import sys
from collections import OrderedDict

DOCS_DIR = "docs"
OVERRIDES_PATH = os.path.join(DOCS_DIR, ".docmeta.yml")
INDEX_PATH = os.path.join(DOCS_DIR, "INDEX.md")

VALID_TYPES = {"adr", "spec", "plan", "audit", "research", "ops", "state", "index"}
LOG_TYPES = {"adr", "audit", "research"}

FIELD_ORDER = ["id", "type", "status", "updated", "scope", "covers",
               "related", "supersedes", "superseded_by"]

# Existing keys that mean the same thing as one of ours. Value is copied, original kept.
ALIASES = {
    "updated": ["date", "last_updated", "updated_at", "lastmod", "modified"],
    "status":  ["state", "stage"],
    "id":      ["slug", "key"],
    "type":    ["kind", "category", "doctype"],
    "scope":   ["tags", "keywords", "topics"],
}

# (regex on posix path, type, confidence). First match wins.
DIR_RULES = [
    (r"(^|/)(adr|adrs|decisions)(/|$)",              "adr",      "high"),
    (r"(^|/)(feature-audits?|audits?)(/|$)",         "audit",    "high"),
    (r"(^|/)(market-maps?|pricing-intel|positioning|channel-map|research|competitive)(/|$)",
                                                      "research", "high"),
    (r"(^|/)plans?(/|$)",                            "plan",     "high"),
    (r"(^|/)specs?(/|$)",                            "spec",     "high"),
    (r"(^|/)(ops|runbooks?|operations|installation[_-]guides?|guides?)(/|$)",
                                                      "ops",      "high"),
    (r"(^|/)design[_-]handoff(/|$)",                 "spec",     "medium"),
    (r"(^|/)(design|ux|ui)(/|$)",                    "spec",     "medium"),
    (r"(^|/)marketing(/|$)",                         "research", "medium"),
    (r"(^|/)launch(/|$)",                            "plan",     "low"),
]

# (regex on filename stem, type, confidence)
NAME_RULES = [
    (r"implementation[_-]?status|^status$|current[_-]state",  "state",    "high"),
    (r"deploy",                                               "ops",      "high"),
    (r"testing|test[_-]plan|manual[_-]?qa|^qa",               "ops",      "high"),
    (r"runbook|incident|oncall|monitoring",                   "ops",      "high"),
    (r"refactor|hardening|migration|rollout|action[_-]plan|roadmap|phases",
                                                              "plan",     "medium"),
    (r"^plan|plan$",                                          "plan",     "medium"),
    (r"icp|persona|market|competitive|pricing|positioning|launch[_-]kit|channel",
                                                              "research", "medium"),
    (r"design|theming|handoff|ux|ui[_-]",                     "spec",     "medium"),
    (r"policy|lifecycle|contract|schema",                     "spec",     "medium"),
    (r"^context$|architecture|overview|glossary",             "ops",      "low"),
    (r"^readme$",                                             "ops",      "low"),
]

# (regex on first ~2000 chars of body, type, confidence) — last resort before default.
BODY_RULES = [
    (r"^#+\s*ADR\b|^\*\*?Status:?\*\*?\s*(Accepted|Proposed|Superseded)", "adr",      "medium"),
    (r"^#+\s*(Decision|Options considered)\b",                            "adr",      "low"),
    (r"^#+\s*(Findings|Competitors?|Market)\b",                           "research", "low"),
    (r"\[[ x]\]",                                                          "plan",     "low"),
]

DEFAULT_TYPE = "ops"
DATE_IN_NAME = re.compile(r"(20\d{2})-(\d{2})-(\d{2})")

RESET = "\033[0m"; RED = "\033[31m"; YEL = "\033[33m"; GRN = "\033[32m"
DIM = "\033[2m"; BOLD = "\033[1m"; CYA = "\033[36m"
if not sys.stdout.isatty() or os.environ.get("NO_COLOR"):
    RESET = RED = YEL = GRN = DIM = BOLD = CYA = ""


# ------------------------------------------------------------------ frontmatter

def split_frontmatter(text):
    """Return (ordered meta dict or None, raw fm string or None, body)."""
    m = re.match(r"^---[ \t]*\n(.*?)\n---[ \t]*\n?", text, re.DOTALL)
    if not m:
        return None, None, text
    raw = m.group(1)
    meta, key = OrderedDict(), None
    for line in raw.split("\n"):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if re.match(r"^\s*-\s+", line) and key:
            if not isinstance(meta.get(key), list):
                meta[key] = []
            meta[key].append(_scalar(re.sub(r"^\s*-\s+", "", line)))
            continue
        km = re.match(r"^([A-Za-z_][\w\-]*)\s*:\s*(.*)$", line)
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
    return meta, raw, text[m.end():]


def _scalar(v):
    v = v.strip().strip('"').strip("'")
    return None if v.lower() in ("null", "none", "~", "") else v


def dump_value(v):
    if v is None:
        return "null"
    if isinstance(v, list):
        return "[" + ", ".join(str(x) for x in v if x is not None) + "]"
    s = str(v)
    if re.search(r"[:#\[\]{}&*!|>'\"%@`]", s) or s != s.strip():
        return '"' + s.replace('"', '\\"') + '"'
    return s


def dump_frontmatter(meta):
    keys = [k for k in FIELD_ORDER if k in meta]
    keys += [k for k in meta if k not in keys]
    return "---\n" + "\n".join(f"{k}: {dump_value(meta[k])}" for k in keys) + "\n---\n"


# -------------------------------------------------------------------- git glue

def _git(args, default=""):
    try:
        return subprocess.run(["git"] + args, capture_output=True, text=True,
                              check=True).stdout.strip()
    except Exception:
        return default


def in_git_repo():
    return bool(_git(["rev-parse", "--git-dir"]))


def git_is_clean():
    return _git(["status", "--porcelain"]) == ""


def git_last_modified(path):
    return _git(["log", "-1", "--format=%cs", "--", path]) or None


def git_created(path):
    return _git(["log", "--diff-filter=A", "-1", "--format=%cs", "--", path]) or None


def tracked_files():
    out = _git(["ls-files"])
    return out.splitlines() if out else []


# ------------------------------------------------------------------- inference

def slugify(stem):
    s = DATE_IN_NAME.sub("", stem)
    s = re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower()
    s = re.sub(r"-{2,}", "-", s)
    return s or "doc"


STOPWORDS = {"the", "and", "for", "with", "from", "into", "plan", "spec", "design",
             "doc", "docs", "notes", "v1", "v2", "v3", "v4", "claude", "prompt"}


def keywords(stem, limit=3):
    """Topic words for `scope:` — drop numbers, dates and filler."""
    out = []
    for w in slugify(stem).split("-"):
        if len(w) <= 3 or w.isdigit() or w in STOPWORDS:
            continue
        if w not in out:
            out.append(w)
    return out[:limit]


def infer_type(relpath, stem, body):
    posix = relpath.replace(os.sep, "/")
    for pat, t, conf in DIR_RULES:
        if re.search(pat, os.path.dirname(posix), re.I):
            return t, conf, f"directory matches /{pat}/"
    for pat, t, conf in NAME_RULES:
        if re.search(pat, stem, re.I):
            return t, conf, f"filename matches /{pat}/"
    head = body[:2000]
    for pat, t, conf in BODY_RULES:
        if re.search(pat, head, re.I | re.M):
            return t, conf, f"body matches /{pat}/"
    return DEFAULT_TYPE, "none", "no rule matched — default"


def infer_id(dtype, relpath, stem, taken):
    posix = relpath.replace(os.sep, "/")
    num = re.match(r"^(\d{3,4})[-_]", stem)
    if dtype == "adr" and num:
        base = f"adr-{int(num.group(1)):04d}"
    else:
        slug = slugify(stem)
        if slug in ("readme", "index"):
            parent = os.path.basename(os.path.dirname(posix)) or "root"
            slug = slugify(parent)
        base = slug if slug.startswith(dtype + "-") else f"{dtype}-{slug}"
        if dtype in LOG_TYPES:
            d = DATE_IN_NAME.search(stem)
            if d:
                base = f"{base}-{d.group(1)}-{d.group(2)}"
    base = re.sub(r"-{2,}", "-", base).strip("-")[:70]
    cand, n = base, 2
    while cand in taken:
        cand, n = f"{base}-{n}", n + 1
    return cand


def infer_updated(path, stem):
    """Last real modification. Git first, filename date second, mtime last."""
    g = git_last_modified(path)
    if g:
        return g, "high", "last git commit touching the file"
    d = DATE_IN_NAME.search(stem)
    if d:
        return f"{d.group(1)}-{d.group(2)}-{d.group(3)}", "medium", "date in filename"
    ts = datetime.date.fromtimestamp(os.path.getmtime(path)).isoformat()
    return ts, "low", "filesystem mtime (unreliable after a clone)"


def infer_status(dtype, body, path):
    head = body[:3000]
    m = re.search(r"^\**status:?\**[:\s]+\**\s*(\w+)", head, re.I | re.M)
    if m:
        word = m.group(1).lower()
        if word in ("accepted", "active", "approved", "done", "complete", "completed",
                    "shipped", "implemented"):
            return ("done" if dtype == "plan" else "current"), "high", f"body says status: {word}"
        if word in ("draft", "proposed", "wip", "pending"):
            return "draft", "high", f"body says status: {word}"
        if word in ("superseded", "deprecated", "obsolete", "replaced"):
            return "superseded", "high", f"body says status: {word}"
    if dtype == "plan":
        boxes = re.findall(r"^\s*[-*]\s*\[([ xX])\]", body, re.M)
        if boxes and all(b.lower() == "x" for b in boxes):
            return "done", "medium", "every checkbox in the plan is ticked"
        if boxes:
            return "current", "low", "plan has unticked checkboxes — verify it is still live"
        return "current", "none", "plan with no checkboxes — cannot tell if it shipped"
    if dtype in LOG_TYPES:
        return "current", "high", "log documents are current until superseded"
    # A doc sitting in the repo is presumed current unless it says otherwise. That is
    # right often enough to be `medium`; only plans (did it ship?) are a real coin flip.
    return "current", "medium", "present in the repo and says nothing else"


def infer_covers(body, all_files, limit=4):
    """Propose `covers:` globs from source paths mentioned in the doc. Opt-in."""
    mentioned = set()
    for m in re.finditer(r"(?:^|[\s`(\[<])((?:src|app|lib|packages)/[A-Za-z0-9_\-./()\[\]]+)", body):
        p = m.group(1).rstrip(".,;:`)>\]")
        if "." in os.path.basename(p):
            mentioned.add(p)
    dirs = {}
    for p in mentioned:
        d = os.path.dirname(p)
        while d and d.count("/") > 1:
            d = os.path.dirname(d)
        if d:
            dirs[d] = dirs.get(d, 0) + 1
    chosen = [f"{d}/**" for d, _ in sorted(dirs.items(), key=lambda kv: -kv[1])[:limit]]
    existing = set(all_files)
    return [g for g in chosen if any(f.startswith(g[:-3]) for f in existing)]


# ----------------------------------------------------------------- overrides

def load_overrides():
    """docs/.docmeta.yml — `path: {key: value, ...}` one doc per block."""
    if not os.path.exists(OVERRIDES_PATH):
        return {}
    out, cur = {}, None
    for line in open(OVERRIDES_PATH, encoding="utf-8"):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if not line.startswith((" ", "\t")):
            cur = line.split(":", 1)[0].strip().strip('"').strip("'")
            out[cur] = {}
        elif cur:
            km = re.match(r"^\s+([A-Za-z_][\w\-]*)\s*:\s*(.*)$", line.rstrip("\n"))
            if km:
                out[cur][km.group(1)] = _scalar(km.group(2))
    return out


# --------------------------------------------------------------------- links

# "(" is excluded from the plain run so that src/app/(dashboard)/page.tsx is captured
# whole instead of truncating at the first ")".
LINK_RE = re.compile(r"(!?\[[^\]]*\]\()(<[^>]*>|[^()\s]*(?:\([^()]*\)[^()\s]*)*)(\s+\"[^\"]*\")?(\))")


def link_targets(body):
    """Markdown links, with balanced parens inside the URL handled properly."""
    for m in LINK_RE.finditer(body):
        yield m, m.group(2)


def fix_links(path, body, repo_files):
    """Repoint repo-root-relative links; angle-bracket URLs containing parens."""
    base = os.path.dirname(path)
    changes = []

    def repl(m):
        target = m.group(2)
        if not target or re.match(r"^(https?:|mailto:|#)", target):
            return m.group(0)
        frag = ""
        if "#" in target:
            target, frag = target.split("#", 1)
            frag = "#" + frag
        if not target:
            return m.group(0)
        clean = target.strip("<>")
        if os.path.exists(os.path.normpath(os.path.join(base, clean))):
            new = clean
        elif os.path.exists(clean) or clean in repo_files:
            new = os.path.relpath(clean, base or ".").replace(os.sep, "/")
            changes.append((target, new))
        else:
            return m.group(0)
        if "(" in new or ")" in new or " " in new:
            new = f"<{new}>"
        return f"{m.group(1)}{new}{frag}{m.group(3) or ''}{m.group(4)}"

    return LINK_RE.sub(repl, body), changes


# ---------------------------------------------------------------------- main

class Plan:
    def __init__(self, path):
        self.path = path
        self.added = OrderedDict()
        self.reasons = {}
        self.confidence = {}
        self.had_fm = False
        self.link_changes = []
        self.body_changed = False

    # Only these decide whether a human needs to look. `scope` and `covers` are
    # always rough guesses; bucketing on them would flag every file and make the
    # triage list useless.
    DECIDING = ("type", "status", "updated", "id")

    @property
    def weakest(self):
        ranks = {"high": 3, "medium": 2, "low": 1, "none": 0}
        vals = [ranks.get(c, 0) for k, c in self.confidence.items()
                if k in self.added and k in self.DECIDING]
        return min(vals) if vals else 3


# Keep in step with docs_lint.py — build output, vendored trees, and repository meta
# files that must never be given frontmatter.
SKIP_DIRS = {"_archive", "_templates", "node_modules", "target", "dist", "build",
             "vendor", "coverage", ".next", ".venv", "venv", "__pycache__", "site-packages"}
SKIP_FILES = {"license.md", "licence.md", "changelog.md", "contributing.md",
              "code_of_conduct.md", "security.md", "skill.md", "claude.md",
              "claude.local.md", "agents.md", "pull_request_template.md",
              "issue_template.md", "notice.md", "authors.md"}


def walk_docs():
    for root, dirs, files in os.walk(DOCS_DIR):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
        for fn in sorted(files):
            if fn.endswith(".md") and fn.lower() not in SKIP_FILES:
                yield os.path.join(root, fn)


def build_plans(args):
    overrides = load_overrides()
    repo_files = set(tracked_files())
    taken = set()
    plans = []

    paths = sorted(walk_docs())

    # Reserve ids that already exist so generated ones never collide.
    for p in paths:
        meta, _, _ = split_frontmatter(open(p, encoding="utf-8").read())
        if meta and meta.get("id"):
            taken.add(meta["id"])

    for path in paths:
        rel = os.path.relpath(path).replace(os.sep, "/")
        text = open(path, encoding="utf-8").read()
        meta, _, body = split_frontmatter(text)
        plan = Plan(rel)
        plan.had_fm = meta is not None
        meta = meta if meta is not None else OrderedDict()
        stem = os.path.splitext(os.path.basename(path))[0]
        ov = overrides.get(rel, {})

        def need(key):
            return not meta.get(key)

        def put(key, value, conf, why):
            plan.added[key] = value
            plan.confidence[key] = conf
            plan.reasons[key] = why

        # 1. adopt equivalent keys already present
        for canon, alts in ALIASES.items():
            if need(canon):
                for a in alts:
                    if meta.get(a):
                        v = meta[a]
                        if canon == "updated":
                            d = DATE_IN_NAME.search(str(v))
                            v = f"{d.group(1)}-{d.group(2)}-{d.group(3)}" if d else v
                        if canon == "status":
                            v = str(v).lower()
                            v = {"accepted": "current", "active": "current",
                                 "proposed": "draft", "deprecated": "superseded"}.get(v, v)
                        if canon == "type" and str(v) not in VALID_TYPES:
                            continue
                        put(canon, v, "high", f"copied from existing `{a}:`")
                        meta[canon] = v
                        break

        # 2. type
        if need("type"):
            t = ov.get("type")
            if t:
                put("type", t, "high", "docs/.docmeta.yml override")
            else:
                t, conf, why = infer_type(rel, stem, body)
                put("type", t, conf, why)
            meta["type"] = t
        dtype = meta.get("type", DEFAULT_TYPE)

        # 3. id
        if need("id"):
            i = ov.get("id") or infer_id(dtype, rel, stem, taken)
            put("id", i, "high" if ov.get("id") else ("high" if plan.confidence.get("type", "high") == "high" else "medium"),
                "docs/.docmeta.yml override" if ov.get("id") else f"derived from path as `{dtype}-<slug>`")
            meta["id"] = i
        taken.add(meta["id"])

        # 4. updated
        if need("updated"):
            u = ov.get("updated")
            if u:
                put("updated", u, "high", "docs/.docmeta.yml override")
            else:
                u, conf, why = infer_updated(path, stem)
                put("updated", u, conf, why)
            meta["updated"] = u

        # 5. status
        if need("status"):
            s = ov.get("status")
            if s:
                put("status", s, "high", "docs/.docmeta.yml override")
            else:
                s, conf, why = infer_status(dtype, body, path)
                put("status", s, conf, why)
            meta["status"] = s

        # 6. structural fields the linter requires to be present but not filled
        for k, default in (("scope", []), ("covers", []), ("related", []),
                           ("superseded_by", None)):
            if k not in meta:
                if k == "scope":
                    put(k, keywords(stem), "low", "keywords from the filename — refine these")
                elif k == "covers" and args.infer_covers and dtype in ("spec", "audit", "ops"):
                    c = infer_covers(body, repo_files)
                    put(k, c, "low" if c else "none",
                        "source paths mentioned in the body" if c else "none found")
                else:
                    put(k, default, "high", "structural placeholder")
                meta[k] = plan.added[k]

        # 7. links
        if args.fix_links:
            new_body, changes = fix_links(rel, body, repo_files)
            if changes:
                plan.link_changes = changes
                plan.body_changed = True
                body = new_body

        plan.meta = meta
        plan.body = body
        plan.text = text
        plans.append(plan)

    return plans


def apply_plan(plan):
    low = [k for k in plan.added
           if plan.confidence.get(k) in ("low", "none") and k in Plan.DECIDING]
    if low:
        plan.meta["review"] = "guessed: " + ",".join(low)
    out = dump_frontmatter(plan.meta) + plan.body
    with open(plan.path, "w", encoding="utf-8") as f:
        f.write(out)


def write_index(plans):
    if not os.path.exists(INDEX_PATH):
        print(f"{YEL}skipping --write-index: {INDEX_PATH} does not exist{RESET}")
        return
    text = open(INDEX_PATH, encoding="utf-8").read()
    groups = {}
    for p in plans:
        m = p.meta
        if m.get("type") == "index" or m.get("status") in ("superseded", "archived"):
            continue
        groups.setdefault(m.get("type"), []).append((m, p))
    order = ["state", "adr", "spec", "ops", "research", "audit", "plan"]
    labels = {"state": "State", "adr": "Decisions", "spec": "Specs", "ops": "Operations",
              "research": "Research", "audit": "Audits", "plan": "Plans"}
    lines = ["## Documents", ""]
    for t in order + [k for k in groups if k not in order]:
        if t not in groups:
            continue
        lines.append(f"### {labels.get(t, t)}")
        lines.append("")
        for m, p in sorted(groups[t], key=lambda x: x[0].get("id") or ""):
            title = next((l.strip().lstrip("#").strip() for l in p.body.split("\n")
                          if l.strip() and not l.strip().startswith("<!--")), "")
            lines.append(f"- `{m['id']}` — {title[:90]} — `{p.path}` "
                         f"({m.get('status')}, {m.get('updated')})")
        lines.append("")
    block = "\n".join(lines)
    if "## Documents" in text:
        head, _, tail = text.partition("## Documents")
        nxt = re.search(r"\n## (?!Documents)", tail)
        tail = tail[nxt.start():] if nxt else "\n"
        text = head + block + tail
    else:
        text = text.rstrip() + "\n\n" + block + "\n"
    open(INDEX_PATH, "w", encoding="utf-8").write(text)
    print(f"{GRN}rewrote the Documents section of {INDEX_PATH}{RESET}")


def emit_overrides(plans):
    print("# docs/.docmeta.yml — per-file overrides for docs_fix.py.")
    print("# Edit any row the script got wrong, then re-run with --apply.")
    print("# Anything you leave out is re-inferred each run.\n")
    for p in sorted(plans, key=lambda x: (x.weakest, x.path)):
        flag = "   # REVIEW" if p.weakest <= 1 else ""
        print(f"{p.path}:{flag}")
        for k in ("type", "status", "updated", "id"):
            v = p.meta.get(k)
            why = p.reasons.get(k, "already set")
            print(f"  {k}: {dump_value(v)}   # {why}")
        print()


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true", help="actually write files (default: dry run)")
    ap.add_argument("--fix-links", action="store_true",
                    help="repoint repo-root-relative links and bracket URLs containing parens")
    ap.add_argument("--infer-covers", action="store_true",
                    help="propose covers: globs from source paths mentioned in each doc")
    ap.add_argument("--write-index", action="store_true",
                    help="regenerate the Documents section of docs/INDEX.md")
    ap.add_argument("--emit-overrides", action="store_true",
                    help="print a starter docs/.docmeta.yml and exit")
    ap.add_argument("--force", action="store_true", help="skip the clean-git-tree check")
    args = ap.parse_args()

    if not os.path.isdir(DOCS_DIR):
        print(f"{RED}no {DOCS_DIR}/ here — run from the repo root{RESET}")
        return 2

    git = in_git_repo()
    if not git:
        print(f"{YEL}warning: not a git repo. `updated:` will fall back to filesystem "
              f"mtime, which is wrong after a clone, and there is no undo.{RESET}\n")
    elif args.apply and not git_is_clean() and not args.force:
        print(f"{RED}working tree is dirty.{RESET} Commit or stash first so this is "
              f"one reviewable diff — or pass --force.")
        return 2

    plans = build_plans(args)

    if args.emit_overrides:
        emit_overrides(plans)
        return 0

    todo = [p for p in plans if p.added or p.body_changed]
    if not todo:
        print(f"{GRN}nothing to do — every doc already has complete frontmatter.{RESET}")
        return 0

    # ---- report ----
    print(f"{BOLD}Plan{RESET} {DIM}({'APPLYING' if args.apply else 'dry run — nothing written'}){RESET}\n")

    by_conf = {"none": [], "low": [], "medium": [], "high": []}
    for p in todo:
        by_conf[{3: "high", 2: "medium", 1: "low", 0: "none"}[p.weakest]].append(p)

    for label, colour, bucket in (("NEEDS REVIEW", RED, by_conf["none"] + by_conf["low"]),
                                  ("probably right", YEL, by_conf["medium"]),
                                  ("confident", GRN, by_conf["high"])):
        if not bucket:
            continue
        print(f"{colour}{BOLD}── {label} ({len(bucket)}){RESET}")
        for p in bucket:
            marker = "" if p.had_fm else f" {DIM}[no frontmatter at all]{RESET}"
            print(f"  {BOLD}{p.path}{RESET}{marker}")
            for k in FIELD_ORDER:
                if k not in p.added or k not in Plan.DECIDING:
                    continue          # structural placeholders are noise in the report
                c = p.confidence.get(k, "high")
                tag = {"high": " ", "medium": "?", "low": "!", "none": "!"}[c]
                print(f"    {tag} {k}: {CYA}{dump_value(p.added[k])}{RESET} "
                      f"{DIM}— {p.reasons.get(k,'')}{RESET}")
            for old, new in p.link_changes:
                print(f"    ~ link {DIM}{old}{RESET} → {CYA}{new}{RESET}")
        print()

    # Structural problems the linter cannot express but you need to know about now.
    notes = []
    states = [p for p in plans if p.meta.get("type") == "state"]
    if len(states) > 1:
        notes.append(f"{len(states)} docs typed `state`: "
                     + ", ".join(p.path for p in states)
                     + ". There can only be one current-state doc — merge them into "
                       "docs/STATE.md and retype or delete the others.")
    live_plans = [p for p in plans if p.meta.get("type") == "plan"
                  and p.meta.get("status") not in ("done", "archived", "superseded")]
    if live_plans:
        notes.append(f"{len(live_plans)} plan(s) will be marked live. Any whose work has "
                     f"already shipped should be `status: done` and moved to "
                     f"docs/_archive/plans/ — otherwise sessions re-propose finished work.")
    if notes:
        print(f"{YEL}{BOLD}── also worth knowing{RESET}")
        for n in notes:
            print(f"  • {n}")
        print()

    n_low = len(by_conf["none"]) + len(by_conf["low"])
    print(f"{DIM}{len(todo)} file(s) to change; {n_low} need a human decision.{RESET}")

    if not args.apply:
        print(f"\nNext:\n"
              f"  1. {BOLD}python3 scripts/docs_fix.py --emit-overrides > {OVERRIDES_PATH}{RESET}\n"
              f"  2. edit the rows marked REVIEW\n"
              f"  3. {BOLD}python3 scripts/docs_fix.py --apply --fix-links --write-index{RESET}\n"
              f"  4. {BOLD}git diff{RESET}, then {BOLD}python3 scripts/docs_lint.py{RESET}")
        return 0

    for p in todo:
        apply_plan(p)
    print(f"\n{GRN}wrote {len(todo)} file(s).{RESET}")

    if args.write_index:
        write_index(plans)

    print(f"\nNow: {BOLD}git diff{RESET} — then grep for `review:` to find the "
          f"{n_low} guess(es) that need you.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
