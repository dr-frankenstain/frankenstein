# How to change a document

<!-- NO `paths:` frontmatter on purpose.

     An unscoped rule loads at launch and survives compaction the same way the
     project-root CLAUDE.md does. A rule WITH `paths:` frontmatter gets summarized
     away when the context compacts and only comes back if Claude happens to read a
     matching file again. Doc discipline must never silently evaporate mid-session,
     so this file stays unscoped. Keep it short for the same reason. -->

## Decide before you write

Ask one question: **is this document a log or a truth?**

- A **log** records something that happened at a point in time (a decision, an audit run,
  a market snapshot). Its value is that it did not change. Editing it destroys the record.
- A **truth** describes how things are right now (a spec, a runbook, the state file).
  Its value is that it has no history in it. Appending to it destroys the truth.

Getting this backwards is the single most common way documentation rots.

## Editing a Living doc (`spec`, `ops`, `state`, `index`)

Rewrite the affected sentences. Then check the rest of the file for statements the change
just falsified — they are usually two paragraphs away, not where you were editing.

Forbidden in these files:

- `## Update 2026-09-18` / `## Changelog` / `## History` sections
- `~~struck-through~~` old content left in place
- "Previously we used X, now we use Y" — just say "Uses Y"
- "TODO: this section may be out of date" — either fix it or delete it

Bump `updated:` in the frontmatter. If you changed what the doc is about, fix `scope:`
and its one-line entry in `docs/INDEX.md` too.

## Superseding a Log doc (`adr`, `audit`, `research`)

Never edit the body. Instead:

1. Create the new doc with a new `id` and today's date.
2. In the old doc's frontmatter only: set `status: superseded` and `superseded_by: <new-id>`.
3. In the new doc, set `supersedes: <old-id>` and open with one line saying what changed
   and why — that line is what future sessions read instead of the old doc.
4. Update `docs/INDEX.md`: the old doc's line moves under the archive note, the new one
   takes its place in the routing table.

A superseded doc stays on disk. It is excluded from reading by default.

## Retiring a Plan

When the work described by a `plan` ships, `git mv` it to `docs/_archive/plans/` and
delete its line from `docs/INDEX.md`. Do not leave finished plans in `docs/plans/` —
a session reading them will re-propose work that is already done.

## Conflicts

If a doc contradicts the code, stop and report it. Do not quietly update the doc to match
the code (the code may be the bug) and do not quietly change the code to match the doc.
State both readings and ask which is correct.
