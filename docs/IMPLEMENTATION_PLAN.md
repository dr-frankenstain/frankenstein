---
id: plan-implementation-plan
type: plan
status: current
updated: 2026-10-23
scope: [implementation]
covers: []
related: []
superseded_by: null
review: "guessed: updated,status"
---
# Project Frankenstein — Technical Implementation Plan

The engineering companion to [`ROADMAP.md`](./ROADMAP.md). It defines *how* the monster is built: the stack, the repo, the local/dev setup, how bad features are implemented, CI, versioning, and deployment — plus explicit trade-offs.

---

## 1. Requirements

### Functional
- A working, browsable web app where **each bad pattern is its own page/route** (FE) or **its own endpoint/handler** (BE).
- A polyglot backend: Next.js → Python API → PHP service, plus (from `v2.0`) a Go booking service with Redis; a shared DB.
- Every flaw maps to a GitHub issue; solutions are never-merged PRs voted by 👍.
- Reproducible **monster versions** (tags) so assignments can pin to a fixed state.

### Non-functional (deliberately inverted)
- **"Bad but working":** it must run and be usable; the badness is in *how*, not in crashing on boot.
- **Deliberately broken but survivable setup:** first-run friction is intentional, but a documented workaround always exists.
- **Deliberately outdated:** versions pinned 1–2 majors behind (React 17, Next 12, Node 16, TS 4.5, Python 3.8, Pydantic v1, PHP 7.4, Go 1.19).
- **Hostable safely:** because it's intentionally vulnerable, production must be isolated, data-free, ephemeral/auto-reset, and rate-limited.

### Constraints
- Small team / part-time → phases sized small; favor boring, well-known tech.
- Public and open → no real secrets; all committed secrets are fake challenges.

---

## 2. High-level architecture

```
                         ┌───────────────► Python API (FastAPI) ──► PHP legacy service
Next.js frontend ────────┤                      │                        │
  (ThreeJS venue map)     │                      └──────► MySQL ◄─────────┘
                          │                         (both write directly)
                          │
                          └─ seat booking (bypasses the API) ─► PHP ─► Go booking ─► Redis
                                                                        (holds/locks)
```

**Data flow — normal page:** browser → Next.js (SSR/client) → `fetch` Python API → (optionally) PHP → MySQL → back.

**Data flow — seat booking (`v2.0`):** browser (ThreeJS) → PHP directly → Go booking → Redis (hold) + MySQL (confirm) → back. The API bypass is an intentional architectural smell and its own challenge.

**The architecture is deliberately bad too** (not just the code). Treat it as a **distributed monolith**: services are split for operations but coupled at runtime (shared DB written by multiple services, synchronous cross-service chains, circular calls, duplicated business logic, no shared contracts, auth/config done three ways, the API bypass). The full catalog is in `IDEAS.md` → "Deliberately bad ARCHITECTURE." This makes the topology itself a `lead`/`architect` + PM/PO challenge.

---

## 3. Monorepo layout

```
frankenstein/
├── .raise-the-monster.sh         # ⚠ HIDDEN, UNDOCUMENTED one-shot bootstrap (see §4)
├── .env.example                  # intentionally missing a few required vars
├── frontend/                     # Next.js 12.3.4 (Pages Router), React 17, TS 4.5
│   ├── docker-compose.yml        # frontend brought up ON ITS OWN
│   ├── pages/                    # one route per bad page
│   ├── components/ hooks/ styles/
│   └── package.json              # pinned-old + duplicate/unused deps
├── backend/
│   ├── python-api/               # FastAPI/Flask, Python 3.8, Pydantic v1
│   ├── php-service/              # PHP 7.4, mysqli
│   └── go-booking/               # Go 1.19 (from v2.0)
├── db/
│   ├── docker-compose.yml        # MySQL brought up on its own
│   └── init.sql                  # schema + fake seed data (incl. venue JSON blob)
└── .github/                      # governance + automation (already built)
    ├── challenge-tests/<issue#>/ # hidden auto-scorer tests
    └── workflows/
```

Note: there is **no root `docker-compose.yml`**. Each service (`frontend/`, `backend/python-api/`, `backend/php-service/`, `backend/go-booking/`, `db/`, `redis`) owns its own compose file / run steps and is started **separately**. The only thing that brings everything up in one shot is the hidden `.raise-the-monster.sh` (§4).

Each `docs/frontend/pages/NN-*.md` and `docs/backend/**/NN-*.md` maps 1:1 to a route/handler here.

---

## 4. Local development, separate startup & the hidden script

**There is deliberately NO single documented "up everything" command.** Each part of the app is a separate unit that must be started on its own — the DB, then the Python API, then the PHP service, then the frontend (and Redis + Go from `v2.0`), each with its own compose file / run steps, its own env, and its own quirks. Standing the whole thing up from the public docs is a genuine, tedious chore. This is intentional (it mirrors real polyglot systems and is itself a DevOps challenge) and reinforces the "distributed monolith" architecture (§2 in IDEAS): split to operate, coupled to run.

**Intentional setup badness (baked in Phase 1):**
- Services must be started in the right (undocumented) order or they fail; e.g., PHP races the DB and the frontend errors if the APIs aren't up yet.
- `.env.example` omits a few required vars and one documented name mismatches the code; each service reads config differently.
- Public README steps are subtly mis-ordered; version requirements unstated.

**The hidden bootstrap — `.raise-the-monster.sh`:**
- A single script at the repo root that brings the entire stack up correctly in one shot (right order, waits for health, seeds the DB, wires env).
- It **is committed** (so it's in the public repo) but is **referenced nowhere** — not in the README, not in any public doc, not in `CONTRIBUTING`. Only the owner and anyone who actually *digs through the repo* (lists dotfiles, reads the tree) will find it. A reward for the curious.
- Keep it out of every public doc. It is documented **only here and in `OWNER_MANUAL_TASKS.md`** (both in `docs/`, which is committed to the repo).
- Hidden-ness is by obscurity, not enforcement: a leading-dot filename that no doc points to.

**The safety valve:** a pinned "Getting it to run (God help you)" Discussion holds a *partial*, painful public workaround (the per-service path), so newcomers aren't fully locked out — but the easy button stays hidden.

---

## 5. How bad features are implemented (conventions)

- **One headline bad pattern per page/handler.** Secondary flaws are allowed but the doc names the headline.
- **FE:** a new route under `pages/`, styling approach chosen *per page* on purpose (inline / CSS / SCSS / Tailwind) so inconsistency is visible and navigable.
- **BE:** one handler per flaw; junior batch stays within a single service (no cross-service seams until senior/lead).
- **Ship with issues:** every new bad feature opens its GitHub issue(s), tagged discipline + difficulty, in the same change.
- **Realistic, not cartoonish:** the flaw should look like real production decay (N+1, missing validation), not a contrived crash.

---

## 6. Data model (shared MySQL)

Starter tables (grow per phase):

- `users` — includes password column(s) with the intentional plaintext/MD5 mix (PHP challenge).
- `products` — catalog for `/product`, `/search`.
- `orders`, `order_items` — for the validation / HTTP-semantics / transaction challenges.
- `venues` — the whole venue stored as a **single JSON blob** column (the seat-booking data-modeling flaw).
- Redis (from `v2.0`) — seat holds/locks (not durable; a source of drift bugs).

The shared DB written by both Python and PHP is itself the seedbed for cross-service challenges.

---

## 7. CI, hidden tests & the never-merge guard

- **`challenge-guard`** (required check) fails any `solution`-labeled PR → un-mergeable. Backbone of the model.
- **`auto-scorer`** runs a hidden test at `.github/challenge-tests/<issue#>/run.sh` (exit 0 = solved) against the PR's code, using the `pull_request` trigger so fork code runs with a read-only token and no secrets. Its pass/fail is an objective signal alongside 👍.
- **`auto-labeler`**, **`issue-form-labeler`**, **`leaderboard`**, **`label-sync`**, **`branch-name-lint`** — as documented in `GITHUB_SETUP.md`.
- **Hidden-test authoring:** when a challenge is objectively checkable (e.g., "endpoint now rejects negative quantity with 400"), add a `run.sh` that spins up the relevant service and asserts the fixed behavior. Subjective challenges (design, PM) rely on 👍 only.

---

## 8. Versioning & releases

- Tags are **monster versions** `vMAJOR.MINOR`. Minor = a worsening / challenge batch; Major = a new subsystem or language.
- Every worsening lands via a `worsen/*` PR (squash), then a tag + in-character release notes listing new challenges.
- Deployment is driven by tag push, so production always equals a known monster version — matching what assignments pin to.

---

## 9. Deployment & scale/reliability

**Topology (Phase 3+):** the compose stack on an **isolated, throwaway host** (its own VPS/containers, no access to anything real).

- **Data:** obviously fake; **ephemeral and auto-reset** on a schedule (e.g., nightly wipe-and-reseed). This doubles as a feature — state resets keep challenges reproducible.
- **Abuse controls:** rate limiting / WAF in front; monitor for misuse (an intentionally-injectable public app *will* be probed).
- **Isolation:** assume compromise; design so "compromised" costs nothing (no secrets, no lateral access, disposable infra).
- **Scale:** not a real concern — it's a lab. Scale *down* aggressively; a single small host is fine. If load spikes from a launch, put it behind a CDN/cache for static assets and cap dynamic concurrency.
- **Monitoring:** basic uptime + abuse alerts; the app's own errors are features, so alert on *infra*, not app errors.

---

## 10. Build order per phase (engineering tasks)

- **Phase 1 (`v0.1`):** per-service compose files (no root compose) + the hidden `.raise-the-monster.sh`; Next skeleton + landing index; Python API hello + DB; PHP reachable from Python; `init.sql` seed; bake the separate-startup friction + env gaps; pin old versions in lockfiles.
- **Phase 2 (`v1.0`):** implement the 6 FE pages + 5 BE handlers; open issues; add hidden tests where objective; tag `v1.0`.
- **Phase 3:** deploy pipeline (tag → build → deploy to isolated host); reset job; WAF/rate-limit; ToS page; DNS.
- **Phase 4 (`v2.0`):** `go-booking` service + Redis (each its own compose); ThreeJS venue page; PHP→Go path; inject concurrency/seam/ThreeJS/data flaws; extend `.raise-the-monster.sh`; tag `v2.0`.
- **Phase 5–6:** mid then senior/lead pages/handlers + cross-service seams + dependency/migration + CVE challenges.
- **Phase 7:** structure QA/PM/PO/Design/DevOps challenges over the existing surface.

---

## 11. Trade-offs & what we'd revisit

- **Monorepo vs. polyrepo:** monorepo — the shared DB/seams are the point and it keeps everything in one place. But startup is deliberately *not* unified (per-service compose only), so onboarding pain is intentional, offset by the hidden `.raise-the-monster.sh` for insiders. Revisit only if the repo becomes unwieldy.
- **Per-service startup vs. one compose:** we chose separate startup on purpose (realistic polyglot friction + a DevOps challenge). Trade-off: worse onboarding. Mitigated by the hidden bootstrap script; do not "fix" this by adding a documented root compose.
- **Docker Compose vs. k8s:** compose — it's a lab, not a scaled service; k8s would be overkill. Revisit only if multi-host demos are needed.
- **"Keep solution PRs open" (open-PR sprawl):** accept for now; revisit with a close-losing-PRs policy if volume explodes (see `GITHUB_SETUP.md` §4).
- **Intentional vulnerability vs. hosting risk:** the biggest real risk. Mitigate with isolation + ephemerality + rate limiting; never relax that even under time pressure.
- **Auto-scorer coverage:** hidden tests are effort; start with the few objective challenges and lean on 👍 elsewhere. Revisit as the challenge count grows.
- **Outdated pins vs. CI noise:** deliberately-old deps will trip Dependabot/CVE scanners — that's intended (DevSecOps challenges); keep auto-updates off so the pins hold.
