# Audit prompt — paste into a fresh session in the project repo

---

You are auditing a documentation migration that I just performed on this repository. Your
job is to find what is wrong with it. Do not fix anything — report only.

Be adversarial. I am asking because I expect there are errors, and a report that tells me
everything is fine is only useful if you can show me exactly what you checked to reach
that conclusion. Do not compliment the work. Do not soften findings. If something is
wrong, say it plainly in the first sentence of the finding.

## What I did

A script (`scripts/docs_fix.py`) bulk-added YAML frontmatter to every markdown file under
`docs/`. It **inferred** the values from directory names, filenames, body text and git
history. Inference is exactly where the errors will be. A second script
(`scripts/docs_lint.py`) enforces the schema mechanically.

The migration is in recent git history — find it with `git log --oneline -20` and
`git log --diff-filter=M --name-only -1 -- docs/`.

## The contract being audited

Every doc under `docs/` has frontmatter:

```yaml
id: <unique, kebab-case>
type: adr | spec | plan | audit | research | ops | state | index
status: current | draft | superseded | archived | done
updated: <ISO date — must equal the last git commit that touched the file>
scope: [<task keywords>]
covers: [<globs of the code this doc describes>]
related: [<ids>]
superseded_by: <id or null>
```

`type` determines how the doc may be changed, and getting it wrong is the most damaging
possible error because it licenses the wrong operation forever after:

- **Log** (`adr`, `audit`, `research`) — immutable. Changed conclusions require a new
  file plus `superseded_by` on the old one. Editing the body destroys the record.
- **Living** (`spec`, `ops`, `state`, `index`) — exactly one current truth, edited in
  place, no history inside the file.
- **Ephemeral** (`plan`) — archived to `docs/_archive/plans/` once the work ships.

## Method

Work in this order. Run the commands; do not answer from assumption.

**Step 1 — mechanical baseline.**
Run `python3 scripts/docs_lint.py --strict`. Report the output verbatim. Note that a
passing linter proves only that the *shape* is right; it cannot tell whether a `type` is
semantically correct or a `status` is honest. That is what the rest of this audit is for.

**Step 2 — confirm no content was destroyed.**
The migration should have *added* frontmatter and rewritten some link targets, nothing
else. Count removed lines per file:

```bash
git show <migration-sha> -- docs/ \
  | awk '/^\+\+\+ b\//{f=$2} /^-[^-]/{c[f]++} END{for(k in c) print c[k], k}' | sort -rn
```

Only two kinds of file may legitimately appear: `docs/INDEX.md` (its Documents section
was regenerated wholesale) and files whose markdown links were repointed. Any other file
with removed lines is a critical finding — open it and say exactly what was lost.

**Step 3 — verify `updated:` is not falsely fresh.**
The migration commit touched every file, so `git log -1` now returns the migration date
for all of them and is useless here. Compare against the last commit *before* the
migration instead:

```bash
git log --format=%cs --skip=1 -1 -- <path>
```

The rule is one-directional: **`updated:` must never be later than that date.** A doc
claiming to be fresher than its last real content change is a false freshness signal and
defeats the drift detection this system exists to provide. An `updated:` *earlier* than
that date is acceptable and often correct — the script adopted the document's own stated
`date:` field where one existed, which is more honest than the commit timestamp. Sample
at least 8 docs across different directories and report only the ones that are too fresh.

**Step 4 — challenge every inferred `type`.** This is the core of the audit.
Read the actual content of each doc below and judge whether its `type` matches what the
document *is*, ignoring what its filename or folder says:

- Everything in `docs/superpowers/specs/` — this directory is mixed. Files ending
  `-technical-plan.md`, `-research.md`, and anything that is a design *prompt* rather
  than a specification are very likely mistyped as `spec`.
- Everything in `docs/superpowers/plans/`.
- `docs/CONTEXT.md`, `docs/design_handoff/README.md`,
  `docs/design_handoff/*/README.md`, `docs/superpowers/DIRECTOR-ACTION-PLAN.md` —
  these had no frontmatter at all, so the type is a pure guess.
- `docs/manual_qa_1.md`, `docs/manual_qa_2.md` — consider whether a completed QA pass is
  a dated record (`audit`) rather than a living process doc (`ops`).
- `docs/icp.md`, `docs/theming_by_tier.md`, `docs/pre_launch_hardening.md`,
  `docs/refactoring_plan.md`.

For each one you judge wrong, give: current type, correct type, and the sentence from the
document that proves it.

**Step 5 — challenge every `status`.**
List every doc with `type: plan` and `status` not in (`done`, `archived`). For each,
determine from the code and from `docs/STATE.md` whether the work has actually shipped.
A shipped plan still marked live is the specific failure that makes future sessions
re-propose finished work. Where you cannot tell from the repo, say so and name the one
question I need to answer — do not guess.

**Step 6 — check `covers:` is useful rather than merely present.**
`covers:` globs were inferred from source paths mentioned in each doc's body. Two failure
modes: a glob so broad it matches most of the codebase (drift then fires constantly and I
learn to ignore it), and a glob matching nothing (drift never fires). Count the matches:

```bash
python3 - <<'PY'
import glob, os, re
for root, _, files in os.walk("docs"):
    for fn in (f for f in files if f.endswith(".md")):
        p = os.path.join(root, fn)
        m = re.search(r"^covers:\s*\[(.+?)\]", open(p, encoding="utf-8").read(), re.M)
        if not m or not m.group(1).strip():
            continue
        for g in (x.strip() for x in m.group(1).split(",")):
            n = len([f for f in glob.glob(g, recursive=True) if os.path.isfile(f)])
            if n == 0 or n > 40:
                print(f"{p}: {g} -> {n} {'MATCHES NOTHING' if n == 0 else 'TOO BROAD'}")
PY
```

Also report which `spec` docs have an **empty** `covers:`. Those are invisible to drift
detection entirely, which is the more common and more dangerous failure.

**Step 7 — find the leftovers and contradictions.**

- `grep -rn '^review:' docs/` — every one of these is an unresolved guess. List them.
- Identify every doc with `type: state`. There must be exactly one. If `docs/STATE.md`
  and `docs/implementation_status.md` both exist, compare them and list every statement
  where they disagree.
- Look for the same fact asserted in two different current docs. Duplicated facts are
  where contradictions come from. Report the duplicates you find, with both locations.
- Check `docs/INDEX.md`: its one-line descriptions were auto-generated from each file's
  first heading. Flag every row whose description would not actually help someone decide
  whether to open that file.

**Step 8 — check the Log docs were never edited in place.**
For a sample of ADRs and research docs, run `git log --oneline -- <path>`. More than one
content-changing commit on a Log doc means someone edited history. Distinguish the
migration commit (frontmatter only) from real body edits.

**Step 9 — verify the tooling is actually wired.**
Confirm `.claude/settings.json` references hooks that exist and are executable, that
`.claude/rules/docs-are-truth.md` has **no** `paths:` frontmatter (if it does, it will be
summarized away at compaction and silently stop applying mid-session), and that
`CLAUDE.md` imports `docs/INDEX.md` and `docs/STATE.md`.

## Evidence rules

- Every finding cites a file path and, where it applies, a line number, a quoted sentence,
  or the command you ran and its output.
- Never write that something "looks correct" or "seems fine" without naming what you
  checked. An unverified claim is worse than an admitted gap.
- If you sampled rather than read everything, say what you sampled and what you skipped.
- If a step was impossible in this environment, say so and move on. Do not substitute a
  plausible-sounding answer.

## Output

```
## Verdict
One of: SOUND / SOUND WITH FIXES NEEDED / NOT SOUND — plus one sentence of why.

## Critical — wrong in a way that will cause future damage
Numbered. Each: what is wrong · where · the evidence · the one-line fix.

## Should fix — wrong but contained
Same format.

## Judgment calls I could not make
Questions only I can answer, each phrased so a yes/no or one-word answer resolves it.

## What I verified and found correct
Terse list of checks that genuinely passed, each naming the check — not praise.

## What I did not check
Be specific. This section is not optional.
```

Start with Step 1 and work through in order. Do not modify any file.
