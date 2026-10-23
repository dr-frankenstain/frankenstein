---
id: state
type: state
status: current
updated: 2026-10-23
scope: [status, current, progress]
covers: []
related: [index]
superseded_by: null
---

# Frankenstein — current state

<!-- The single answer to "where is this project right now?".
     Imported into CLAUDE.md and re-injected after compaction, so it is the one thing
     guaranteed to survive a long session.

     HARD RULES:
     - Edit in place. Never append. Never add a "History" section.
     - Present tense only. If a line is no longer true, delete it.
     - Keep under 80 lines. Detail belongs in a spec.
     - Update it DURING work, not at the end of the session. -->

## Shipped and working

- Phase 1 skeleton (`spec-phase1-design`): MySQL with the deliberately messy schema and seed data, FastAPI service, PHP service, Next.js landing page showing a live API round trip, and the hidden `.raise-the-monster.sh` one-shot bring-up. Verified by `tests/phase1/check_*.sh`.

## In progress

| Feature | Spec | Status | Blocked by |
|---|---|---|---|
| _none_ | | | |

## Next up

1. Phase 2 junior batch: build the 6 frontend pages and 5 backend handlers specced under `docs/frontend/pages/` and `docs/backend/`.

## Known broken / deliberately deferred

<!-- Things a session would otherwise "helpfully" fix. Saves the most time of any section. -->

- Money columns are `DECIMAL`; degrading them to `FLOAT` belongs to the Phase 6 reconciliation challenge, not before.
- Application-level flaws (SQL injection, no validation, etc.) are Phase 2; Phase 1 code has none.
- The committed `.env.example` files are deliberately wrong; do not "fix" them.

## Decisions that are settled — do not re-open

<!-- One line each, with the ADR id. Stops sessions re-deriving choices you already made. -->

- Frontend is Next.js 12.3.4 + React 17 on the Pages Router (`adr-0001-next12-react17`).
- Services share the external network `frankenstein-net` owned by the DB compose file (`adr-0002-shared-external-network`).

## Open questions

- `docs/` is committed, so it becomes public with the repo, including the hidden-script details in `OWNER_MANUAL_TASKS.md` and `IMPLEMENTATION_PLAN.md` and the "provenance" note in `IDEAS.md`. Decide what stays out of the public tree before launch.
