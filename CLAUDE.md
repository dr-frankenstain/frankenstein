<!-- docs-system:begin -->
# Project instructions

<!-- Keep this file under ~200 lines. It loads into every session and competes with
     the actual work for context. Anything longer belongs in .claude/rules/ (path-scoped)
     or a skill (loads on demand). -->

## Documentation map

@docs/INDEX.md

@docs/STATE.md

## The three document classes

Every `.md` under `docs/` belongs to exactly one class. The class decides whether you
edit it or add to it. Never guess — the `type:` field in the file's frontmatter says which.

| Class | Types | Rule |
|---|---|---|
| **Log** (immutable) | `adr`, `audit`, `research` | Never edit the body. To change a conclusion, write a NEW file and set `superseded_by` on the old one. |
| **Living** (mutable, exactly one truth) | `spec`, `ops`, `state`, `index` | Edit in place. Delete what is no longer true. Do not append "Update 2026-09-18:" sections — git holds the history. |
| **Ephemeral** | `plan` | Delete or move to `docs/_archive/` once the work ships. A plan that describes shipped work is a lie. |

## Before you start any task

1. Read `docs/INDEX.md` (already in context above) and pick the docs whose `scope:` matches.
2. Read those docs **before** reading code. Contradiction between a doc and the code is a
   finding to report, not something to silently resolve.
3. If the task touches a feature, its `spec` is mandatory reading. Its `plan` is not —
   plans are historical once status is `done`.

## Before you finish any task (definition of done)

A change is not done until the docs match reality. Before saying you are finished:

- [ ] Every **Living** doc whose statements the change invalidated has been **edited in place**.
- [ ] `updated:` bumped to today's date on every doc you touched.
- [ ] `docs/STATE.md` reflects what is now true — edited, not appended.
- [ ] A new decision produced a new ADR; the ADR it replaces got `status: superseded` and `superseded_by:`.
- [ ] `python3 scripts/docs_lint.py` passes.
- [ ] Any `plan` for shipped work moved to `docs/_archive/`.

If you changed code and touched no docs, say so explicitly and explain why none applied.
Silence is treated as a missed update.

## Writing rules for docs

- **State the present tense only.** "Auth uses JWT" — not "we decided to use JWT, previously sessions."
- **One fact, one home.** If two docs state the same fact, one of them links to the other instead.
- **Delete aggressively.** Superseded content in a Living doc is worse than no content:
  it is actively misleading and it costs context every time the doc is read.
- **Date every claim that can rot** — prices, competitor features, benchmarks — inline: `(as of 2026-09)`.
- No changelog sections inside Living docs. That is what `git log` is for.

## Long sessions

- Write findings to the relevant doc **as you discover them**, not at the end of the session.
  Anything that exists only in the conversation is lost at the next compaction.
- Before starting a distinctly new task in the same session, run `/compact` with a focus
  argument, e.g. `/compact focus on the pricing spec changes`.
- After compaction, re-read `docs/INDEX.md` and `docs/STATE.md` before continuing.

## Frontmatter contract

Every doc under `docs/` starts with YAML frontmatter. `scripts/docs_lint.py` enforces it.

```yaml
---
id: spec-order-routing      # unique, kebab-case, stable forever
type: spec                  # adr | spec | plan | audit | research | ops | state | index
status: current             # current | draft | superseded | archived
updated: 2026-09-18         # ISO date, bumped on every content change
scope: [orders, routing]    # task keywords — how sessions find this doc
covers: [src/orders/**]     # code this doc describes; empty for non-code docs
related: [adr-0012]         # ids, not paths
superseded_by: null         # id of the doc that replaced this one
---
```

## Commands

<!-- Detected from the project's manifest; correct as needed. -->

- _fill these in_
- Lint docs: `python3 scripts/docs_lint.py`
- Fix doc frontmatter: `python3 scripts/docs_fix.py`
<!-- docs-system:end -->
