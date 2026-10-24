---
id: plan-roadmap
type: plan
status: current
updated: 2026-10-24
scope: [roadmap]
covers: []
related: []
superseded_by: null
review: "guessed: updated,status"
---
# Project Frankenstein — Roadmap

A phased plan for building and launching the monster. Framed as **Now / Next / Later** to avoid false precision on dates (this is a nights-and-weekends project, so phases are sized small and shippable). Each phase has a clear **exit criterion** and a **monster version** tag.

> **Sequencing principle:** ship a *Minimum Lovable Monster* early. We don't wait for every batch of badness before going live — we launch after the junior batch, then keep worsening in public. A live, growing monster is the whole point.

---

## Status at a glance

| Phase | Name | Horizon | Status | Version |
|---|---|---|---|---|
| 0 | Governance & repo setup | **Now** | In progress | — |
| 1 | Skeleton & scaffolding | **Now** | Done | `v0.1` |
| 2 | Junior batch (Minimum Lovable Monster) | **Next** | Docs ready, code not started | `v1.0` |
| 3 | Soft launch & hosting | **Next** | Not started | `v1.x` |
| 4 | Seat-booking flagship (Go + Redis) | **Later** | Design ready | `v2.0` |
| 5 | Mid batch | **Later** | Not started | `v2.x` |
| 6 | Senior / Lead batch | **Later** | Not started | `v3.0` |
| 7 | Non-dev disciplines (QA/PM/PO/Design/DevOps) | **Later** | Not started | `v3.x` |
| ∞ | Ongoing worsening & community ops | **Continuous** | — | rolling |

Content status so far: junior FE + BE **challenge docs are written**; all app **code is still to be built**. Everything else is design/backlog.

---

## NOW

### Phase 0 — Governance & repo setup

**Goal:** the repo is configured to serve the never-merge model before any code lands.

**Scope:** push the current docs; create the 28 labels; issue/PR templates and workflows live; `main` ruleset with `challenge-guard` as a required check; Discussions categories; Dependabot/secret-scanning configured the "wrong" way on purpose (see `GITHUB_SETUP.md`).

**Dependencies:** GitHub MCP connected (for labels/issues); manual UI steps by the owner (`OWNER_MANUAL_TASKS.md`).

**Exit criterion:** a contributor could, in principle, fork, open a `solution/*` PR, and see it auto-labeled and blocked from merge.

---

### Phase 1 — Skeleton & scaffolding (`v0.1`)

**Goal:** the polyglot app runs end-to-end — with *no bad features yet*, just the wiring — where **each service is started separately** (no unified command) and the hidden `.pull-the-lever.sh` brings it all up in one shot. This is the hardest, highest-leverage phase: everything else hangs off a running skeleton.

**Scope:**

- Monorepo layout with **per-service compose files** (`frontend/`, `backend/python-api/`, `backend/php-service/`, `db/`) — **no root compose** — plus the hidden `.pull-the-lever.sh`.
- Next.js app boots; its `/` forwards to the landing app, a separate Next 16 app that indexes the (soon-to-exist) bad pages (`adr-0003-landing-as-separate-app`).
- Python API boots and serves a couple of trivial endpoints; talks to the shared DB.
- PHP service boots and is reachable from Python.
- Shared MySQL with seed schema + obviously-fake data.
- The **deliberately broken but survivable** setup baked in from day one (separate-startup friction, service ordering, missing env docs) — plus the pinned "Getting it to run" workaround.
- The **distributed-monolith architecture** established from the start (shared DB, API bypass, no shared contracts).
- Deliberately outdated pinned versions (React 17, Next 12, Node 16, Python 3.8, PHP 7.4, Pydantic v1) locked in lockfiles.

**Dependencies:** Phase 0 (repo exists).

**Exit criterion:** a fresh clone runs (bring each service up separately — or use the hidden bootstrap — expecting the intentional first-try friction) and serves the landing page + a sample API round-trip.

**Trade-off flagged:** it's tempting to skip straight to bad pages, but without a running skeleton every page is un-testable and un-hostable. Do this first.

---

## NEXT

### Phase 2 — Junior batch: Minimum Lovable Monster (`v1.0`)

**Goal:** the first real, playable slice — enough badness to be worth sharing.

**Scope (already specced in `docs/`):**

- 6 FE pages: `/product` (inline styles), `/profile` (`any` + moment.js), `/cart` (localStorage abuse), `/signup` (no validation + node-fetch), `/search` (case-sensitive), `/deals` (hostile UX).
- 5 BE features: Python (no input validation, wrong HTTP semantics, leaked traces/secrets) + PHP (SQL injection, plaintext/MD5 passwords).
- One GitHub **issue per flaw**, labeled by discipline + difficulty, a few marked `good-first-challenge`.
- Hidden auto-scorer tests for the objectively-checkable ones.
- Tag **`v1.0`** with a Dr. Frankenstein changelog.

**Dependencies:** Phase 1 skeleton.

**Exit criterion:** every junior challenge doc has (a) a working bad page/endpoint and (b) an open, labeled issue. `v1.0` tagged.

---

### Phase 3 — Soft launch & hosting (`v1.x`)

**Goal:** the monster is live at `projectfrankenstein.com` and the first contributors arrive.

**Scope:**

- Provision isolated, sandboxed hosting; deploy the `v1.0` containers.
- Ephemeral, auto-resetting data; rate limiting / WAF; a Terms-of-Use page.
- DNS for the domain; `production` environment + deploy workflow on tag push.
- Flip the repo **public**; pin `good-first-challenge` issues.
- Seed the community: the "Hall of Shame" README section, first post to HN / r/programming.

**Dependencies:** Phase 2 (`v1.0`), domain purchased, hosting chosen (owner tasks).

**Exit criterion:** a stranger can visit the site, pick an issue, fork, and open a solution PR that gets auto-labeled and voted on.

---

## LATER

### Phase 4 — Seat-booking flagship (`v2.0`)

**Goal:** the deep end — add Go + Redis and the ThreeJS venue map, the home of senior/lead concurrency challenges.

**Scope:** `backend/go-booking/` service; Redis for holds/locks; ThreeJS venue map page; the booking path that bypasses the Python API (FE → PHP → Go → Redis). Concurrency, seam, ThreeJS, and data-modeling flaws per `IDEAS.md`. Tag **`v2.0`** (major — new subsystem + language).

**Dependencies:** Phase 1/2 (running stack, shared DB). Independent of Phases 5–7, so it can move earlier if the flagship is the bigger community draw.

**Exit criterion:** clicking a seat completes the full polyglot round-trip and reproduces at least the double-booking race; Go + Redis run in compose and in production.

### Phase 5 — Mid batch (`v2.x`)

**Goal:** mid-difficulty challenges across FE + BE (custom hooks that worsen code, React 17→18 `useId`, IDOR, N+1, missing transactions, Pydantic v1→v2, PHP 8 enums/`match`, lockfile/peer-dependency conflicts).

**Dependencies:** Phase 2 content patterns established.

**Exit criterion:** mid FE + BE catalogs written, pages/endpoints built, issues opened; `v2.x` tags.

### Phase 6 — Senior / Lead batch (`v3.0`)

**Goal:** the systemic stuff — cross-service seams (datetime/serialization/auth mismatches, float money reconciliation, cross-network N+1), framework-coupling → dependency-inversion, codemod-scale migrations, known-CVE remediation.

**Dependencies:** Phase 4 (many seam challenges live in the Go/PHP/Redis boundary).

**Exit criterion:** senior/lead catalogs + issues; `v3.0` tag.

### Phase 7 — Non-dev disciplines (`v3.x`)

**Goal:** QA bounties, and PM / PO / Design / DevOps challenge sets — turning existing raw material (broken setup, contradictory docs, dark-pattern pages, lockfile mess) into structured, votable challenges in Discussions and issues.

**Dependencies:** enough surface area from Phases 2–6 to audit and prioritize.

**Exit criterion:** each discipline has a starter catalog and live challenges.

---

## CONTINUOUS

### Phase ∞ — Ongoing worsening & community ops

Not a phase with an end — the operating rhythm once live:

- **Dr. Frankenstein cadence:** a regular worsening (new horror or a reintroduced bug), each tagged as a new monster version with an in-character changelog.
- **Community ops:** triage `needs-triage`, mark `top-solution`, keep the leaderboard healthy, moderate per the Code of Conduct.
- **Growth:** periodic "Hall of Shame" updates and challenge drops to keep the news cycle alive.
- **Guardrail:** batch changes at a natural cadence; don't whiplash the roadmap on every idea — new ideas land in `IDEAS.md` first, then graduate into a phase.

---

## Dependency map (critical path)

```yaml
Phase 0 ─► Phase 1 ─► Phase 2 ─► Phase 3 (LAUNCH)
                          │
                          ├─► Phase 4 ─► Phase 6
                          └─► Phase 5 ─┘
                                        └─► Phase 7
```

The critical path to launch is **0 → 1 → 2 → 3**. Everything after launch runs in parallel-ish, gated mostly by the flagship (Phase 4) feeding the senior/lead seam challenges (Phase 6).

## Prioritization note (value vs. effort)

- **Quick wins (do first):** Phase 0 governance (low effort, unblocks everything), junior pages (specced, moderate effort, high community value).
- **Big bet:** Phase 4 seat booking — high effort, high value; scope it carefully.
- **Sequencing risk:** the skeleton (Phase 1) is the single biggest effort blocker; under-estimating it is the main way this roadmap slips. Give it buffer.

## Related docs

- Technical build details per phase: [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).
- Everything the owner must do by hand: [`OWNER_MANUAL_TASKS.md`](./OWNER_MANUAL_TASKS.md).
- Repo configuration: [`GITHUB_SETUP.md`](./GITHUB_SETUP.md). Backlog of all ideas: [`IDEAS.md`](./IDEAS.md).
