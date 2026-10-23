---
id: plan-<feature>
type: plan
status: draft
updated: YYYY-MM-DD
scope: [feature-name]
covers: []
related: [spec-<feature>]
superseded_by: null
---

# Plan: <feature>

<!-- EPHEMERAL doc. Delete or move to docs/_archive/plans/ once the work ships.
     A plan left in docs/plans/ after shipping will be read as pending work.

     A plan is NOT a spec. When the work lands, the durable knowledge moves into
     the spec and this file dies. Set `status: done` the moment it ships. -->

**Target spec:** `spec-<feature>`

## Goal

One sentence. What is true after this is done that isn't true now.

## Steps

- [ ] step
- [ ] step

## Decisions made while planning

<!-- Anything architectural here must graduate to an ADR before this file is archived,
     or it is lost. List them so archiving is a checklist, not a judgment call. -->

- <decision> → needs ADR? yes/no

## Done when

- [ ] the spec reflects the shipped behavior
- [ ] docs/STATE.md moved this out of "In progress"
- [ ] this file is in docs/_archive/plans/
