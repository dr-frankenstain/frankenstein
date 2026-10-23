---
id: plan-phase1-skeleton
type: plan
status: done
updated: 2026-10-23
scope: [phase1, skeleton, scaffolding]
covers: []
related: [spec-phase1-design]
superseded_by: null
---

# Phase 1 — Skeleton & Scaffolding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A fresh clone runs the polyglot stack end to end (DB, PHP, Python, Next.js), each service started separately, with `.raise-the-monster.sh` as the hidden one-shot, and the landing page showing a live API round trip.

**Architecture:** Four independently-composed services share one external Docker network created by the DB's compose file, so start order matters by construction. Python and PHP both talk to the one MySQL directly. Tests are bash smoke scripts under `tests/phase1/` that hit the running containers; each task writes its script first and watches it fail.

**Tech Stack:** Docker Compose, MySQL 8.0, Python 3.8 + FastAPI 0.95.2 + Pydantic 1.10.13 + PyMySQL, PHP 7.4 + mysqli (built-in server), Node 16 + Next.js 12.3.4 (Pages Router) + React 17.0.2 + TypeScript 4.5.5, bash.

**Spec:** `docs/PHASE1_DESIGN.md` (`spec-phase1-design`). Read it first; this plan only records what it leaves open.

## Global Constraints

- No root `docker-compose.yml`. Each service has its own compose file and is started separately.
- Pins are exact in lockfiles/Dockerfiles: `mysql:8.0`, `python:3.8-slim`, `php:7.4-cli`, `node:16`; `fastapi==0.95.2`, `pydantic==1.10.13`, `uvicorn==0.22.0`, `PyMySQL==1.0.3`, `requests==2.31.0`; `next@12.3.4`, `react`/`react-dom@17.0.2`, `typescript@4.5.5`.
- Python uses PyMySQL with no ORM. PHP is plain PHP + mysqli, no framework. Python calls PHP with a plain `requests.get`; no client library, no shared contract.
- Config is deliberately three conventions. MySQL image: `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`. Python: `DB_HOST` `DB_USER` `DB_PASSWORD` `DB_NAME` `PHP_SERVICE_URL` `PHP_SERVICE_API_KEY`. PHP: `MYSQL_HOST` `MYSQL_USER` `MYSQL_PASS` `MYSQL_DATABASE` `API_KEY`.
- Schema: no foreign keys; inconsistent naming and timestamps exactly as listed in Task 2; money columns are `DECIMAL`, never `FLOAT`.
- No application-level bad patterns (Phase 2). Phase 1's badness is architecture, setup, and schema only.
- `.raise-the-monster.sh` is referenced in no public file: not `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.github/**`, or any service directory.
- All credentials are fake. `.env` files stay gitignored; only `.env.example` is committed.
- Commits: one per task, message ends with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push; the user pushes.

## Fixed values (chosen here; spec leaves open)

| Item | Value |
|---|---|
| Shared network | `frankenstein-net` (created by `db/docker-compose.yml`; others declare it `external: true`) |
| Containers / services | `frankenstein-db` / `db`; `frankenstein-php` / `php-service`; `frankenstein-python` / `python-api`; `frankenstein-frontend` / `frontend` |
| Host ports | frontend 3000, Python 8000, PHP 8080. DB is not published |
| DB creds | database `frankenstein`, user `frank`, password `monster`, root password `root_monster` |
| PHP API key | `igor-says-hello` |
| Python → PHP URL | `PHP_SERVICE_URL=http://php-service:8080` |
| Frontend → API | `NEXT_PUBLIC_API_URL=http://localhost:8000` |
| CORS | Python allows only origin `http://localhost:3000` |

## Review Focus

Likely failures the spec implies but doesn't state, each pinned by a test in the owning task:

1. **PHP down or rejecting Python's key** — `/api/php-check` must answer `502` JSON within seconds, never hang or return a traceback (Task 3 timeout, Task 4 key check).
2. **Browser calls from the frontend origin** — CORS must allow `http://localhost:3000` and no other origin (Task 3).
3. **Wrong or missing `X-API-Key` on PHP** — `401` JSON, no stack trace, no DB touched (Task 4).
4. **Starting a service before the DB** — fails at the compose level naming `frankenstein-net`, leaving no half-started container (Task 6).
5. **Frontend with the API down** — page still renders, each check shows its own failure, nothing blank (Task 5). Also covers running the bootstrap twice (Task 6).

---

## File Structure

| Path | Responsibility |
|---|---|
| `.raise-the-monster.sh` | Hidden bootstrap. Task 1: `--env-only`. Task 6: full bring-up |
| `tests/phase1/lib.sh` | Shared bash assertion/HTTP helpers |
| `tests/phase1/check_*.sh` | One smoke script per task |
| `db/docker-compose.yml`, `db/init.sql` | MySQL, network owner, schema + seed |
| `backend/python-api/*` | `main.py` (single FastAPI module), `requirements.txt`, `Dockerfile`, `docker-compose.yml`, `.env.example` |
| `backend/php-service/*` | `health.php`, `db.php`, `Dockerfile`, `docker-compose.yml`, `.env.example` |
| `frontend/*` | `pages/index.tsx`, `lib/checks.ts`, `lib/challenges.ts`, `package.json` + lockfile, `tsconfig.json`, `Dockerfile`, `docker-compose.yml`, `.env.local.example` |

---

### Task 1: Test helpers and env writer

**Files:**
- Create: `tests/phase1/lib.sh`, `tests/phase1/check_env_writer.sh`, `.raise-the-monster.sh` (executable)
- Modify: `.gitignore` (add `.env.local`)

**Interfaces:**
- Produces in `lib.sh`: `fail MSG` (stderr, exit 1); `assert_eq ACTUAL EXPECTED MSG`; `assert_contains HAYSTACK NEEDLE MSG`; `http_code URL [curl args…]` → prints status code; `wait_for_url URL SECONDS [curl args…]` → exit 0 once 2xx, 1 on timeout; `mysql_exec SQL` → runs `mysql -N` as `frank` inside `frankenstein-db`.
- Produces: `.raise-the-monster.sh --env-only` writes `backend/python-api/.env`, `backend/php-service/.env`, `frontend/.env.local` with the Fixed values above, overwriting existing files, exits 0.

- [ ] **Step 1: Write `tests/phase1/check_env_writer.sh`.** It runs `./.raise-the-monster.sh --env-only`, then asserts: the Python `.env` contains all six Python keys with `DB_HOST=db` and `PHP_SERVICE_API_KEY=igor-says-hello`; the PHP `.env` contains `MYSQL_PASS=monster` and `API_KEY=igor-says-hello` and no `MYSQL_PASSWORD`; the frontend file contains `NEXT_PUBLIC_API_URL=http://localhost:8000`; `git check-ignore` reports all three as ignored.
- [ ] **Step 2: Run `bash tests/phase1/check_env_writer.sh`.** Expected: FAIL (script missing).
- [ ] **Step 3: Implement `lib.sh` and `.raise-the-monster.sh`.** The script has a `write_env_files` function and an argument switch; with no arguments it prints "not implemented yet" and exits 1 (Task 6 replaces this). Add `.env.local` to `.gitignore`.
- [ ] **Step 4: Run the check.** Expected: `PASS`.
- [ ] **Step 5: Commit** — `feat: add phase1 test helpers and env writer`.

---

### Task 2: Database and shared network

**Files:**
- Create: `db/docker-compose.yml`, `db/init.sql`, `tests/phase1/check_db.sh`

**Interfaces:**
- Consumes: `lib.sh` helpers (Task 1).
- Produces: container `frankenstein-db` (healthcheck `mysqladmin ping`), named volume `frankenstein-db-data`, network `frankenstein-net`. Schema, exactly:
  - `users(id, email, name, password_plaintext, password_md5, created_at)`
  - `products(ID, ProductName, Description, Price DECIMAL(10,2), ImageUrl)` — no timestamp
  - `orders(order_id, user_id, status, total DECIMAL(10,2), created_at)` — no `updated_at`
  - `order_items(item_id, orderId, product_id, quantity, price DECIMAL(10,2))`
  - `venues(id, name, layout_json JSON)`
  - Seed: 5 users (2 with only `password_plaintext`, 3 with only `password_md5`), 6 products, 2 orders, 3 order items, 1 venue. Fake `@example.test` emails.

- [ ] **Step 1: Write `check_db.sh`**, using `mysql_exec`, asserting:
  - table list is exactly `order_items,orders,products,users,venues`;
  - `information_schema.REFERENTIAL_CONSTRAINTS` count for schema `frankenstein` is `0`;
  - `products` has columns `ID` and `ProductName`; `order_items` has `orderId`; `orders` has `order_id`;
  - `users` has `created_at`; `products` has no column named like `%created%`; `orders` has `created_at` and no `updated_at`;
  - every money column (`Price`, `total`, `price`) has `DATA_TYPE=decimal`;
  - `venues.layout_json` has `DATA_TYPE=json`;
  - counts: users 5, plaintext-only 2, md5-only 3, products 6, orders 2, order_items 3, venues 1;
  - `docker network inspect frankenstein-net` succeeds.
- [ ] **Step 2: Run it.** Expected: FAIL (container not found).
- [ ] **Step 3: Implement the compose file and `init.sql`.** Compose uses the MySQL image's own env names inline (fake creds), mounts `init.sql` into `/docker-entrypoint-initdb.d/`, names the default network `frankenstein-net` via `networks.default.name`, and defines the healthcheck. Create tables without `FOREIGN KEY` clauses.
- [ ] **Step 4:** `docker compose -f db/docker-compose.yml up -d`, wait for `healthy` (`docker inspect -f '{{.State.Health.Status}}' frankenstein-db`), run `check_db.sh`. Expected: `PASS`.
- [ ] **Step 5: Commit** — `feat: add MySQL service, schema, and seed data`.

---

### Task 3: Python API

**Files:**
- Create: `backend/python-api/{main.py,requirements.txt,Dockerfile,docker-compose.yml,.env.example}`, `tests/phase1/check_python.sh`

**Interfaces:**
- Consumes: DB schema and network (Task 2); `.env` from `--env-only` (Task 1).
- Produces on `localhost:8000`:
  - `GET /health` → `200 {"status":"ok"}`, no DB access.
  - `GET /api/products` → `200`, JSON array of objects with keys `ID, ProductName, Description, Price, ImageUrl` (Pydantic v1 `Product` response model, PyMySQL `DictCursor`).
  - `GET /api/php-check` → `200 {"php": <PHP health JSON>}`; on connection error, timeout (3 s), or any non-200 from PHP → `502 {"status":"error","detail":"php-service unreachable"}`.
  - CORS: `CORSMiddleware` with `allow_origins=["http://localhost:3000"]`.
  - Config read with `os.environ[...]` at import: a missing variable crashes the container with `KeyError`.
- `.env.example` lists `DB_HOST DB_USER DB_PASSWORD DB_NAME PHP_SERVICE_URL` and deliberately omits `PHP_SERVICE_API_KEY` (see Decisions).

- [ ] **Step 1: Write `check_python.sh`**, asserting (PHP is not running yet):
  - `/health` → `200`, body contains `"status":"ok"`;
  - `/api/products` → `200`, array length 6, first element has keys `ProductName` and `Price`;
  - `/api/php-check` → `502` within 5 s (use `curl --max-time 5`), body contains `unreachable`, body does not contain `Traceback`;
  - `curl -s -D- -H 'Origin: http://localhost:3000' …/health` has `access-control-allow-origin: http://localhost:3000`; the same request with `Origin: http://evil.test` has no `access-control-allow-origin` header.
- [ ] **Step 2: Run it.** Expected: FAIL (connection refused).
- [ ] **Step 3: Implement `main.py`, `requirements.txt`, `Dockerfile`, `docker-compose.yml`.** Compose: `env_file: .env`, publishes `8000:8000`, joins `frankenstein-net` as external. Run `./.raise-the-monster.sh --env-only` then `docker compose -f backend/python-api/docker-compose.yml up -d --build`.
- [ ] **Step 4: Run the check.** Expected: `PASS`.
- [ ] **Step 5: Commit** — `feat: add FastAPI service`.

---

### Task 4: PHP service

**Files:**
- Create: `backend/php-service/{health.php,db.php,Dockerfile,docker-compose.yml,.env.example}`, `tests/phase1/check_php.sh`

**Interfaces:**
- Consumes: DB and network (Task 2); `.env` (Task 1); Python `/api/php-check` (Task 3).
- Produces on `localhost:8080`: `GET /health.php` requires header `X-API-Key` equal to env `API_KEY` (compared with `hash_equals`).
  - valid key, DB reachable → `200 {"status":"ok","db":"ok"}`;
  - missing/wrong key → `401 {"status":"error","detail":"bad api key"}`, DB not contacted;
  - DB unreachable → `503 {"status":"error","detail":"db unavailable"}`.
- `db.php`: `function db_connect(): mysqli` reading `MYSQL_HOST MYSQL_USER MYSQL_PASS MYSQL_DATABASE` via `getenv`; throws `RuntimeException` on failure. Responses are always JSON with no PHP warnings or traces leaked.
- `.env.example` lists `MYSQL_HOST MYSQL_USER MYSQL_PASSWORD MYSQL_DATABASE API_KEY` — `MYSQL_PASSWORD` where the code reads `MYSQL_PASS` (see Decisions).

- [ ] **Step 1: Write `check_php.sh`**, asserting:
  - valid key → `200`, body contains `"db":"ok"`;
  - no header → `401`; header `X-API-Key: wrong` → `401`; both bodies contain `bad api key` and neither contains `Warning`, `Fatal`, or `Stack trace`;
  - `docker stop frankenstein-db` then valid key → `503` containing `db unavailable`; restart the DB and wait for healthy;
  - Python `/api/php-check` now → `200` with body containing `"php"` and `"status":"ok"`.
- [ ] **Step 2: Run it.** Expected: FAIL (connection refused on 8080).
- [ ] **Step 3: Implement the PHP files and Dockerfile.** Dockerfile: `FROM php:7.4-cli`, `docker-php-ext-install mysqli`, `CMD ["php","-S","0.0.0.0:8080","-t","/app"]`. Compose mirrors Task 3 (`env_file`, port `8080:8080`, external network). Use `mysqli_report(MYSQLI_REPORT_OFF)` and `display_errors=0` so failures surface only as the JSON above.
- [ ] **Step 4: Bring it up and run the check.** Expected: `PASS`.
- [ ] **Step 5: Commit** — `feat: add PHP service`.

---

### Task 5: Frontend

**Files:**
- Create: `frontend/{package.json,package-lock.json,tsconfig.json,next-env.d.ts,Dockerfile,docker-compose.yml,.env.local.example}`, `frontend/pages/index.tsx`, `frontend/lib/checks.ts`, `frontend/lib/challenges.ts`, `tests/phase1/check_frontend.sh`

**Interfaces:**
- Consumes: the three Python endpoints (Task 3/4); `NEXT_PUBLIC_API_URL`.
- Produces:
  - `lib/checks.ts`: `type CheckResult = { name: string; ok: boolean; detail: string }`; `async function runChecks(apiBase: string): Promise<CheckResult[]>` returning results for names `health`, `products`, `php-check` in that order. Each check catches its own error, so one failure never hides the others.
  - `lib/challenges.ts`: `export const challenges: { route: string; title: string }[] = []`.
  - `pages/index.tsx`: title and blurb; a "Backend status" block rendering one row per check with `data-testid="check-<name>"` and the text `OK` or `FAIL: <detail>`; a "Challenges" section listing `challenges`, or the text `No challenges yet` when empty. Checks run client-side in `useEffect`.
  - `localhost:3000` served by `next dev`.
- `package.json` pins exactly the versions in Global Constraints; `@types/react@17`, `@types/node@16`.

- [ ] **Step 1: Write `check_frontend.sh`**, asserting:
  - `docker run --rm -v "$PWD/frontend:/app" -w /app node:16 sh -c "npm ci && npx tsc --noEmit && npx next build"` exits 0;
  - `package-lock.json` has `"node_modules/next"` version `12.3.4` and `"node_modules/react"` version `17.0.2`;
  - `curl localhost:3000/` → `200`, HTML contains `Challenges` and `No challenges yet`.
- [ ] **Step 2: Run it.** Expected: FAIL (no `package.json`).
- [ ] **Step 3: Create `package.json`, then generate the lockfile** with `docker run --rm -v "$PWD/frontend:/app" -w /app node:16 npm install --package-lock-only`. Implement the remaining files. Dockerfile: `node:16`, `npm ci`, `CMD ["npm","run","dev"]`; compose publishes `3000:3000`, `env_file: .env.local`. Do not attach it to `frankenstein-net`.
- [ ] **Step 4: Run the script's automated assertions**, then `docker compose -f frontend/docker-compose.yml up -d --build`. Expected: `PASS`.
- [ ] **Step 5: Browser verification.** With all services up, load `http://localhost:3000`: `check-health`, `check-products`, `check-php-check` each show `OK`; console has no errors. Then `docker stop frankenstein-python` and reload: the page still renders, all three rows show `FAIL:`, and `Challenges` is still visible. Restart Python.
- [ ] **Step 6: Commit** — `feat: add Next.js frontend`.

---

### Task 6: Friction, hidden bootstrap, and full verification

**Files:**
- Modify: `.raise-the-monster.sh` (full bring-up)
- Create: `tests/phase1/check_friction.sh`, `tests/phase1/check_bootstrap.sh`

**Interfaces:**
- Consumes: every service from Tasks 2–5; `write_env_files` from Task 1.
- Produces: `./.raise-the-monster.sh` (no args). Steps: write env files; `docker compose up -d --build` in order **db → php-service → python-api → frontend**; after each, poll its readiness (DB: container health; PHP: `/health.php` with the key; Python: `/health`; frontend: `/`) for `WAIT_TIMEOUT` seconds (default 30). A timeout prints a message to stderr naming the service and `did not become healthy` and exits 1; success prints the three URLs and exits 0. Safe to run when already up.

- [ ] **Step 1: Write `check_friction.sh`**, asserting:
  - Python `.env.example` lacks `PHP_SERVICE_API_KEY`; PHP `.env.example` contains `MYSQL_PASSWORD` and no `MYSQL_PASS=`;
  - starting the PHP container from a copy of `.env.example` as `.env` makes `/health.php` fail to connect to the DB (503 or 401), and starting Python from the example `.env` exits with `KeyError: 'PHP_SERVICE_API_KEY'` in `docker logs`;
  - with the DB stack fully down, `docker compose -f backend/php-service/docker-compose.yml up -d` exits non-zero, its output contains `frankenstein-net`, and `docker ps -a --filter name=frankenstein-php -q` is empty;
  - none of `README.md CONTRIBUTING.md SECURITY.md CODE_OF_CONDUCT.md .github frontend backend db` mentions `raise-the-monster` (`grep -r` finds nothing). The script restores working env files at the end by running `./.raise-the-monster.sh --env-only`.
- [ ] **Step 2: Write `check_bootstrap.sh`**, asserting: after tearing everything down with `down -v` in order frontend → python-api → php-service → db, a first `./.raise-the-monster.sh` exits 0 and prints `localhost:3000`; `/health` (8000), `/health.php` with the key (8080), and `/` (3000) all return 200; `/api/php-check` returns 200; a **second** run exits 0 and endpoints still return 200; then after another full teardown, `WAIT_TIMEOUT=1 ./.raise-the-monster.sh` exits non-zero with `db` and `did not become healthy` on stderr (fresh volume cannot be healthy in 1 s).
- [ ] **Step 3: Run both.** Expected: FAIL (bootstrap unimplemented).
- [ ] **Step 4: Implement the full bootstrap** per the Interfaces block. Fix any friction-check failures by adjusting the `.env.example` files from Tasks 3–4, not the checks.
- [ ] **Step 5: Run `check_friction.sh`, then `check_bootstrap.sh`, then every earlier `check_*.sh` once against the final running stack.** Expected: all `PASS`.
- [ ] **Step 6: Commit** — `feat: add hidden bootstrap and friction checks`.

---

### Task 7: Docs catch-up and ADRs

**Files:**
- Modify: `docs/PHASE1_DESIGN.md`, `docs/STATE.md`, `docs/INDEX.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/ROADMAP.md`, `docs/frontend/SETUP.md`, `docs/PROJECT.md` and any other doc that says "Next 13" or shows `app/…/page.tsx` paths (grep first)
- Create: `docs/decisions/0001-next12-react17.md`, `docs/decisions/0002-shared-external-network.md` from `docs/_templates/adr.md`

- [ ] **Step 1: Grep** `docs/` and `README.md` for `Next 13`, `Next.js 13`, `next@13`, `page.tsx`, `app/`; list every hit.
- [ ] **Step 2: Edit living docs in place** (present tense, no history sections): Next 12.3.4 + Pages Router everywhere it said Next 13/App Router; `PHASE1_DESIGN.md` gains `covers:` globs for the new code, the Fixed values, the `/health.php` key check, CORS, the env-example friction, and loses "hardcoded URL" in favor of `PHP_SERVICE_URL`; `ROADMAP.md` marks Phase 1 done; `STATE.md` moves Phase 1 from "In progress" to "Shipped and working" and lists decisions settled; bump `updated:` on every touched doc.
- [ ] **Step 3: Write the two ADRs** (frontend pins; shared external network) and add both to `docs/INDEX.md` routing.
- [ ] **Step 4: Run `python3 scripts/docs_lint.py`.** Expected: 0 errors.
- [ ] **Step 5: Retire this plan:** set `status: done`, `git mv` it to `docs/_archive/plans/`, remove its line from `docs/INDEX.md`.
- [ ] **Step 6: Commit** — `docs: record phase 1 as shipped`.

---

## Decisions made while planning

- Next.js 12.3.4 instead of 13: Next 13 declares `react ^18` as a peer and cannot run on React 17. User chose to keep React 17 and the Pages Router. → needs ADR? **yes** (Task 7)
- Shared external network `frankenstein-net`, owned by the DB compose file: the only way separately-composed services can resolve each other by name; start order is enforced by compose itself. → needs ADR? **yes**
- Spec says Python calls PHP with a "hardcoded URL" yet lists `PHP_SERVICE_URL` in Python's config. Plan reads the env var; only the path `/health.php` is hardcoded. → needs ADR? no (spec edit)
- Spec says PHP "validates" the API key without naming an endpoint. Plan puts the check on `health.php`, so the bootstrap polls it with the key. → needs ADR? no (spec edit)
- Spec's `.env.example` lists are the names the code reads; `IMPLEMENTATION_PLAN.md` §4 requires the examples to omit vars and mis-name one. Plan applies §4: Python's example omits `PHP_SERVICE_API_KEY`; PHP's example says `MYSQL_PASSWORD` for what the code reads as `MYSQL_PASS`. → needs ADR? no (spec edit)
- CORS is not in the spec but is required for browser calls from `:3000` to `:8000`. Plan allows exactly that origin, avoiding a pre-baked "CORS misconfig" challenge. → needs ADR? no

## Done when

- [ ] `check_bootstrap.sh` and every earlier `check_*.sh` pass against a fresh stack
- [ ] the spec reflects the shipped behavior
- [ ] docs/STATE.md moved this out of "In progress"
- [ ] this file is in docs/_archive/plans/
