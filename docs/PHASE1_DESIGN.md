---
id: spec-phase1-design
type: spec
status: current
updated: 2026-10-23
scope: [phase1]
covers: [.pull-the-lever.sh, frontend/**, backend/**, db/**, tests/phase1/**]
related: []
superseded_by: null
review: "guessed: updated"
---
# Phase 1 — Skeleton & Scaffolding: Technical Design

Concrete, code-level elaboration of [`ROADMAP.md`](./ROADMAP.md) Phase 1 and [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) §10. `IMPLEMENTATION_PLAN.md` stays the stable, phase-spanning reference; this doc is "exactly what Phase 1 code looks like." Produced via brainstorming session, approved section by section.

**Scope:** the polyglot app runs end-to-end with **no bad features yet** — only the wiring, the architecture, and the setup are (deliberately) bad. Application-level flaws (SQL injection, no validation, etc.) are Phase 2.

**Resolved decisions:**
- Build order: **dependency order** — DB → Python API → PHP service → Next.js frontend → wiring/friction/hidden script last.
- Python framework: **FastAPI** (the plan's explicit Pydantic v1 pin only makes sense with FastAPI; the junior "no validation" flaw later reads naturally as a handler that skips the Pydantic model).
- Frontend: **Next.js 12.3.4, Pages Router, React 17.0.2.** Next 13 and App Router both require React 18, so they cannot coexist with the React 17 pin; see `adr-0001-next12-react17`.
- Services share one external Docker network, `frankenstein-net`, created by the DB's compose file; see `adr-0002-shared-external-network`.

---

## 1. Monorepo layout

```
frankenstein/
├── .pull-the-lever.sh
├── frontend/
│   ├── docker-compose.yml
│   ├── pages/index.tsx        # landing page, indexes future bad pages
│   ├── lib/checks.ts          # runChecks(apiBase): the three API round-trip checks
│   ├── lib/challenges.ts      # empty list; Phase 2 pages register here
│   ├── package.json           # next@12.3.4, react/react-dom@17.0.2, typescript@4.5.5
│   ├── Dockerfile
│   └── .env.local.example
├── backend/
│   ├── python-api/
│   │   ├── docker-compose.yml
│   │   ├── main.py            # FastAPI app
│   │   ├── requirements.txt   # fastapi==0.95.2, pydantic==1.10.13, uvicorn, PyMySQL, requests
│   │   ├── Dockerfile         # python:3.8
│   │   └── .env.example
│   └── php-service/
│       ├── docker-compose.yml
│       ├── health.php
│       ├── db.php             # mysqli connection helper
│       ├── Dockerfile         # php:7.4-cli, built-in server
│       └── .env.example
└── db/
    ├── docker-compose.yml     # mysql:8.0 (not on the deliberately-outdated list)
    └── init.sql
```

No root `docker-compose.yml` — each service is started separately, per `IMPLEMENTATION_PLAN.md` §4. This is the primary carrier of the "distributed monolith" architecture at the ops level.

**Runtime wiring.** `db/docker-compose.yml` creates the network `frankenstein-net`; the PHP and Python compose files declare it `external`, so starting either before the DB fails at the compose level with an error naming the network. Containers: `frankenstein-db`, `frankenstein-php`, `frankenstein-python`, `frankenstein-frontend` (services `db`, `php-service`, `python-api`, `frontend`). Host ports: frontend 3000, Python 8000, PHP 8080; the DB is not published. All credentials are fake: DB `frankenstein`, user `frank`, password `monster`, PHP API key `igor-says-hello`.

## 2. Database (`db/init.sql`)

Starter tables per `IMPLEMENTATION_PLAN.md` §6, seeded with obviously-fake data.

- **`users`** — `password_plaintext` and `password_md5` columns, both nullable. Seed a few legacy rows with plaintext set and a few newer rows with only MD5 set — the dual-scheme mess exists from day one (Phase 2's PHP password challenge needs pre-existing bad data to migrate, not just a bug that starts triggering going forward).
- **`products`** — handful of rows for `/product` and `/search` (Phase 2).
- **`orders`** / **`order_items`** — a couple of seed rows.
- **`venues`** — one row, layout stored as a JSON blob column. Unused until Phase 4's seat-booking flagship; schema exists now per the plan's "starter tables" list.

**Schema-level "worst practice" (structural, not app-level bugs — legitimate Phase 1 scope since the schema is being authored now):**
- **Inconsistent naming across tables.** `users` uses `id`/`created_at` (looks modern); `products` uses `ID`/`ProductName` (PascalCase, reads like it was ported from something else); `orders`/`order_items` mix `order_id` vs `orderId` between the two *related* tables. Reads as "different people touched this over the years with no style guide," not random noise.
- **No foreign keys anywhere**, despite obvious relationships. Motivated: two independent services (Python + PHP) write to this DB directly, and real systems like that often drop FKs specifically so one service's write can't be blocked by the other's data — ties straight back to the distributed-monolith premise.
- **Inconsistent timestamps** — `users` has `created_at`, `products` has none, `orders` has `created_at` but no `updated_at` anywhere.

**Explicitly deferred (not Phase 1):** money as `FLOAT` instead of `DECIMAL`. The plan ties that to the senior/lead cross-service reconciliation challenge (Phase 6), and the project's core mechanic is "`main` only gets worse over time" — ship `DECIMAL` correctly now, degrade it via a future Dr. Frankenstein worsening commit when that challenge lands.

## 3. Backend services

**Python API (FastAPI, Pydantic v1):**
- `GET /health` — liveness only, no DB.
- `GET /api/products` — queries MySQL directly via PyMySQL (no ORM), returns seeded rows.
- `GET /api/php-check` — calls `PHP_SERVICE_URL` + `/health.php` with the API key (3 s timeout) and returns `{"php": <PHP health JSON>}`; any failure returns `502 {"status":"error","detail":"php-service unreachable"}`.
- CORS allows only the origin `http://localhost:3000`.
- Config is read with `os.environ[...]` at import; a missing variable crashes the container.

**PHP service (plain PHP 7.4 + mysqli, no framework):**
- `health.php` — requires header `X-API-Key` equal to `API_KEY` (`401 {"status":"error","detail":"bad api key"}` otherwise, DB untouched); then mysqli connect + trivial query: `200 {"status":"ok","db":"ok"}`, or `503 {"status":"error","detail":"db unavailable"}`. Never leaks warnings or traces. Served via `php -S` (built-in server) in a `php:7.4-cli` container.

**Config, done three different ways** — directly implements the "auth/config done three ways" architectural smell from `IMPLEMENTATION_PLAN.md` §2, and falls out naturally rather than being contrived:
- `db/docker-compose.yml` uses MySQL's own image convention: `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`.
- Python's `.env.example`: `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME`, plus `PHP_SERVICE_URL` and `PHP_SERVICE_API_KEY`.
- PHP's code reads `MYSQL_HOST` / `MYSQL_USER` / `MYSQL_PASS` / `MYSQL_DATABASE` (note: `PASS`, not `PASSWORD`), plus its own `API_KEY`.

The committed `.env.example` files are deliberately wrong (`IMPLEMENTATION_PLAN.md` §4): Python's omits `PHP_SERVICE_API_KEY`, so a container started from it crashes with `KeyError`; PHP's documents `MYSQL_PASSWORD`, so it never receives the DB password and answers `503`. `.pull-the-lever.sh --env-only` writes the working `.env` files.

Three services, three naming conventions, for what's fundamentally the same DB credential. No shared OpenAPI spec or types between Python and PHP either — Python calls PHP with a bare `requests.get()` to `PHP_SERVICE_URL`; only the path `/health.php` is hardcoded.

**The API key matters beyond Phase 1.** Python holds `PHP_SERVICE_API_KEY` and sends it to PHP; PHP validates it. Genuine plumbing, not a bug — but it's also exactly the secret that gets echoed by the `/api/config` endpoint and printed to startup logs in Phase 2's junior batch (BE Python 03). Wiring it in now means that challenge doesn't need a schema/config change later.

## 4. Frontend

`pages/index.tsx` — title/blurb, a "Backend status" block that calls `/health`, `/api/products`, and `/api/php-check` client-side (`lib/checks.ts`) and renders one row per check (`data-testid="check-<name>"`, `OK (...)` or `FAIL: ...`; each check handles its own failure), and a "Challenges" section that shows "No challenges yet" until Phase 2 registers pages in `lib/challenges.ts`. Served by `next dev` in a `node:16` container.

## 5. Hidden bootstrap (`.pull-the-lever.sh`)

Writes the working `.env` files, then brings services up in **runtime-dependency order**: DB → PHP → Python → frontend. PHP before Python because Python's `/api/php-check` calls it; nothing else has a hard cross-service ordering requirement. Between each step, polls readiness (DB container health; `/health.php` with the key; Python `/health`; frontend `/`) for `WAIT_TIMEOUT` seconds (default 30) before moving on, and fails loudly with a clear message if something never comes up — the politeness the public path deliberately lacks. Committed to the repo but referenced in **no public doc** — not the README, not CONTRIBUTING, nowhere. Documented only here and in `OWNER_MANUAL_TASKS.md`.

## 6. README

Checked the existing `README.md` before finalizing this design — it already says "no single command," lists the correct DB→APIs→frontend order in vague terms, states no version requirements, and never mentions `.pull-the-lever.sh`. That already satisfies the "public docs don't fully unblock you" requirement from `IMPLEMENTATION_PLAN.md` §4 without fabricating a wrong order. **Decision: leave it untouched.**

## 7. Version pinning

`package-lock.json` locks `next@12.3.4` / `react@17.0.2` / `typescript@4.5.5` exactly (Node 16). `requirements.txt` pins `fastapi` to a version old enough to natively expect Pydantic v1 (pre-0.100) plus `pydantic==1.10.x`. Actual lockfiles, not loose ranges, so the pins hold under Dependabot per the plan (alerts on, auto-updates off).

## 8. Verification approach

No PHP is installed on the dev host, so all PHP verification happens through Docker. Bash smoke scripts live in `tests/phase1/` (`check_env_writer`, `check_db`, `check_python`, `check_php`, `check_frontend`, `check_friction`, `check_bootstrap`; shared helpers in `lib.sh`). `check_python` expects PHP stopped; `check_friction` and `check_bootstrap` tear the stack down. The frontend's live round trip and its failure state are verified in the browser.

## 9. Explicitly out of scope for Phase 1

Application-level bad patterns (SQL injection, no input validation, inline styles, etc. — Phase 2 junior batch), `FLOAT` money columns (Phase 6), ThreeJS venue map / Go booking / Redis (Phase 4), any cross-service seam bugs (Phase 5–6). Phase 1 is wiring and architecture only, per its own exit criterion: "no bad features yet."
