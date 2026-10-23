---
id: spec-<feature>
type: spec
status: current
updated: YYYY-MM-DD
scope: [feature-name, area]
covers: ["src/<area>/**"]
related: []
superseded_by: null
---

# <Feature>

<!-- LIVING doc. Exactly one truth. Edit in place; delete what stops being true.
     No changelog, no "previously", no dated update sections.
     `covers:` is load-bearing — it is how drift detection and routing find this file. -->

## What it does

Present tense, one paragraph. A reader should be able to tell whether a given behavior
belongs to this feature.

## Contract

Inputs, outputs, invariants. Be specific enough to test against.

## Behavior

### Normal path

### Edge cases

<!-- The section that saves the most rework. List what was deliberately decided,
     not just what happens. -->

| Case | Behavior | Why |
|---|---|---|

## Out of scope

<!-- Explicitly list what this feature does NOT do. Without this, every new session
     proposes the same rejected extensions. -->

- <thing that looks in scope but isn't, and why>

## Not yet implemented

<!-- Mark anything the spec describes that the code does not do yet, and mirror it in
     docs/STATE.md. Delete this section when it empties. -->

- _none_
