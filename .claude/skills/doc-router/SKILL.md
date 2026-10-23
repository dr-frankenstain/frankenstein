---
name: doc-router
description: Find which project documents are relevant to a task before starting work. Use at the start of any task that touches a feature, a decision, pricing, positioning, competitors, deployment, or testing — and after every context compaction to re-orient. Triggers on "what should I read", "where is this documented", "get up to speed on", "before we start", or any task naming a feature area.
---

<!-- Skill bodies ARE re-injected after compaction (capped ~5,000 tokens each, truncated
     from the END). Keep the load-bearing instructions at the top of this file. -->

# Route to the right documents

## Do this first, in order

1. Read `docs/INDEX.md`. Match the task to a row in its routing table.
2. Read `docs/STATE.md`. Check "Known broken", "Decisions that are settled", and
   "In progress" before proposing anything.
3. Read only the docs the routing table names. Do not read `docs/_archive/`.
4. Report what you read and what you deliberately skipped, in one line, before starting.

## When the routing table has no row for the task

Search frontmatter, not prose — it is far cheaper and more precise:

```bash
grep -rl "scope:.*<keyword>" docs/ --include="*.md"
grep -rl "covers:.*<path-fragment>" docs/ --include="*.md"
```

Then filter out anything whose frontmatter says `status: superseded` or `status: archived`:

```bash
grep -L "status: \(superseded\|archived\)" <matches>
```

If that still finds nothing, say so and ask. Do not infer structure that isn't there,
and do not create a new doc type on your own.

## Reading order matters

`STATE.md` → decisions → spec → code. Going the other way round (code first) means you
form a model from the implementation and then read the docs as confirmation, which is how
stale docs survive: nobody notices they are wrong because nobody read them cold.

## Conflicts you must surface, not resolve

- A doc says X, the code does Y → report both, ask which is correct.
- Two current docs contradict each other → report it; one of them needs superseding.
- A `plan` describes work that `STATE.md` says is shipped → the plan should be archived.

## After a compaction

If the conversation was compacted, re-run steps 1–2 above before continuing. The summary
kept the shape of the work but not the contents of the docs.
