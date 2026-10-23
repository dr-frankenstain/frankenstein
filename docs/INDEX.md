---
id: index
type: index
status: current
updated: 2026-10-23
scope: [routing, navigation]
covers: []
related: []
superseded_by: null
---

# Frankenstein — documentation index

<!-- Imported into CLAUDE.md, so this loads in EVERY session and is re-injected after
     compaction. ONE LINE PER DOC. It is a routing table, not a summary.
     Regenerate the Documents section with:
         python3 scripts/docs_fix.py --write-index
     or       python3 scripts/docs_lint.py --emit-index -->

## Task routing

| If the task is... | Read first | Then update |
|---|---|---|
| Implementing a feature | that feature's `spec`, `docs/STATE.md` | the `spec`, `docs/STATE.md` |
| Changing architecture or picking a technology | current ADRs in `docs/decisions/` | new ADR + supersede the old one |
| Deploying or changing infra | `docs/ops/deployment.md` | same file, in place |
| Writing or changing tests | `docs/ops/testing.md` | same file, in place |
| Market, pricing or competitor question | newest doc in `docs/research/` | new dated `research` doc |
| "What's the status of X?" | `docs/STATE.md` only | — |

## Documents

### State

- `state` — Frankenstein — current state — `docs/STATE.md` (current, 2026-10-23)

### Decisions

- `adr-0001-next12-react17` — The frontend runs Next.js 12.3.4 on React 17 (Pages Router) — `docs/decisions/0001-next12-react17.md` (current, 2026-10-23)
- `adr-0002-shared-external-network` — Services share one external Docker network created by the DB — `docs/decisions/0002-shared-external-network.md` (current, 2026-10-23)

### Specs

- `spec-phase1-design` — Phase 1 — Skeleton & Scaffolding: Technical Design — `docs/PHASE1_DESIGN.md` (current, 2026-10-23)

### Operations

- `ops-01-inline-styles-product-page` — FE Page 01 — Product Page (inline-styles chaos) — `docs/frontend/pages/01-inline-styles-product-page.md` (current, 2026-08-10)
- `ops-01-no-input-validation` — BE Python 01 — No input validation (trusts the client) — `docs/backend/python/01-no-input-validation.md` (current, 2026-08-10)
- `ops-01-sql-injection` — BE PHP 01 — SQL injection via string concatenation — `docs/backend/php/01-sql-injection.md` (current, 2026-08-10)
- `ops-02-plaintext-passwords` — BE PHP 02 — Plaintext / MD5 passwords — `docs/backend/php/02-plaintext-passwords.md` (current, 2026-08-10)
- `ops-02-untyped-profile-page` — FE Page 02 — Profile Page (`any` everywhere) — `docs/frontend/pages/02-untyped-profile-page.md` (current, 2026-08-10)
- `ops-02-wrong-http-semantics` — BE Python 02 — Wrong HTTP semantics & status codes — `docs/backend/python/02-wrong-http-semantics.md` (current, 2026-08-10)
- `ops-03-leaked-stack-traces` — BE Python 03 — Leaked stack traces & secrets in errors — `docs/backend/python/03-leaked-stack-traces.md` (current, 2026-08-10)
- `ops-03-localstorage-cart` — FE Page 03 — Cart Page (localStorage abuse) — `docs/frontend/pages/03-localstorage-cart.md` (current, 2026-08-10)
- `ops-04-no-validation-signup` — FE Page 04 — Signup Form (no validation) — `docs/frontend/pages/04-no-validation-signup.md` (current, 2026-08-10)
- `ops-05-case-sensitive-search` — FE Page 05 — Search Page (case-sensitive exact match) — `docs/frontend/pages/05-case-sensitive-search.md` (current, 2026-08-10)
- `ops-06-annoying-popups` — FE Page 06 — Deals Page (the popup hellscape) — `docs/frontend/pages/06-annoying-popups.md` (current, 2026-08-10)
- `ops-github-setup` — GitHub Repository Configuration — Project Frankenstein — `docs/GITHUB_SETUP.md` (current, 2026-08-10)
- `ops-ideas` — Frankenstein — Idea Backlog — `docs/IDEAS.md` (current, 2026-10-23)
- `ops-junior-backend` — Bad Solutions — Junior Backend Developer — `docs/bad-solutions/junior-backend.md` (current, 2026-08-10)
- `ops-junior-frontend` — Bad Solutions — Junior Frontend Developer — `docs/bad-solutions/junior-frontend.md` (current, 2026-08-10)
- `ops-project` — Project Frankenstein — Vision & Overview — `docs/PROJECT.md` (current, 2026-08-10)
- `ops-setup` — Backend — Setup & Conventions — `docs/backend/SETUP.md` (current, 2026-08-10)
- `ops-setup-2` — Frontend — Setup & Conventions — `docs/frontend/SETUP.md` (current, 2026-10-23)

### Plans

- `plan-implementation-plan` — Project Frankenstein — Technical Implementation Plan — `docs/IMPLEMENTATION_PLAN.md` (current, 2026-10-23)
- `plan-owner-manual-tasks` — Owner Manual Tasks — Sergey's Checklist — `docs/OWNER_MANUAL_TASKS.md` (current, 2026-08-10)
- `plan-roadmap` — Project Frankenstein — Roadmap — `docs/ROADMAP.md` (current, 2026-10-23)

## Archive

`docs/_archive/` holds superseded and finished documents. **Never read from `_archive/`
unless explicitly asked.**
