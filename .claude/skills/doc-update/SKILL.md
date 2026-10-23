---
name: doc-update
description: Close the documentation loop after making a change — decide which docs to edit in place, which to supersede, and which to archive. Use before reporting any task complete, when a decision was made, when behavior changed, when research produced a new conclusion, or when a plan's work has shipped. Triggers on "we're done", "that works now", "we decided", "update the docs", "I changed my mind about".
---

# Close the documentation loop

Run this before saying a task is finished. Work top to bottom; do not skip the sweep.

## 1. List what changed in reality

Write down, in one line each: behavior that changed, decisions made, facts learned,
work that shipped. This list drives everything below.

## 2. Find every doc those changes touch

```bash
git diff --name-only HEAD          # code that changed this session
grep -rl "covers:.*<changed-path>" docs/ --include="*.md"
grep -rl "scope:.*<topic>" docs/ --include="*.md"
```

Docs are usually missed because the search stopped at the obvious one. A behavior change
typically touches its spec **and** `STATE.md` **and** often `ops/testing.md`.

## 3. Apply the right operation per doc

| Doc `type` | Operation |
|---|---|
| `spec`, `ops`, `state`, `index` | **Edit in place.** Rewrite the false sentences; delete what no longer applies. |
| `adr`, `audit`, `research` | **Supersede.** New file, new id; old file gets `status: superseded` + `superseded_by:`. |
| `plan` whose work shipped | **Archive.** `git mv` to `docs/_archive/plans/`, drop its INDEX line. |

For every doc touched: bump `updated:` to today, and fix its one-line entry in
`docs/INDEX.md` if the summary or status changed.

## 4. Sweep for collateral staleness

This is the step that actually prevents rot. For each edited doc, re-read the **whole**
file, not just the part you changed, and ask of every remaining paragraph: is this still
true? Falsified statements usually sit some distance from the edit — in an overview
section near the top, or in an examples block near the bottom.

Also check: does any *other* current doc repeat a fact you just changed? Duplicated facts
are the main source of contradictions. Replace the copy with a link to the owner.

## 5. Write STATE.md as truth, not history

Move finished items out of "In progress" into "Shipped". **Delete** the "Next up" line the
work consumed. Add anything newly broken or deferred. Add settled decisions with their ADR
id so future sessions stop re-litigating them.

Never append to `STATE.md`. If the file is growing, you are appending.

## 6. Verify

```bash
python3 scripts/docs_lint.py --strict
```

Fix what it reports. Then state plainly which docs you changed and which you checked and
deliberately left alone. "No docs needed updating" is an acceptable answer only with a
reason attached.
