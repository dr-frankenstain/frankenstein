---
id: ops-setup
type: ops
status: current
updated: 2026-10-23
scope: [setup]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# Backend — Setup & Conventions

The backend is deliberately polyglot: a **Python API** that the frontend talks to, which in turn calls a **legacy PHP service**. Both write to the same database. This is the realistic legacy mess described in the project lore.

## Services

```
Python API (FastAPI/Flask) ── HTTP ──► PHP legacy service ── HTTP ──► Go booking service ──► Redis
        │                                    │                                                (locks/holds)
        └──────────────► MySQL ◄─────────────┘
                   (both services write directly)

Seat booking bypasses the Python API: frontend calls PHP directly, PHP → Go → Redis.
```

- **Python API** — the "modern" backend. Owns most endpoints the frontend uses. Talks to PHP for payment/PDF-style legacy operations.
- **PHP legacy service** — the old code nobody wants to touch. Still owns some critical logic (payments, PDFs, and — since 2021 — the seat-booking entry point). Full of classic PHP-era mistakes.
- **Go booking service** — bolted on in 2021 for high-demand on-sales. Handles seat reservations with Redis-backed locks/holds. This is where the hard concurrency lives.
- **Redis** — seat locks and holds for the booking flow (and a source of many lock-TTL / ghost-hold / drift bugs).
- **Shared MySQL** — the source of many cross-service bugs because multiple services touch it without coordination.

> **Batch note:** the Go booking service and Redis are the home of the **senior/lead** cross-service concurrency challenges (double-booking, lock TTLs, ghost holds, Redis/DB drift, idempotency). The current shipped batch is **junior** and stays within a single service — Go/Redis/booking docs land in later batches.

## Golden rule: one bad feature = one doc

Each backend flaw gets its own doc:

- Python features → `docs/backend/python/NN-name.md`
- PHP features → `docs/backend/php/NN-name.md`

Cross-service flaws (bugs at the *seam* between Python and PHP) will get their own `cross-service` docs in later (mid/senior/lead) batches. This junior batch keeps each flaw contained within a single service.

## Folder layout (target)

```
backend/
├── python-api/
│   ├── main.py                 # routes; junior batch flaws live here
│   ├── db.py                   # DB access (intentionally naive)
│   ├── requirements.txt        # unpinned on purpose
│   └── ...
├── php-service/
│   ├── index.php               # entry; routes to legacy handlers
│   ├── db.php                  # mysqli, string-concatenated queries
│   └── ...
├── go-booking/                 # 2021 seat-booking microservice (Redis-backed)
│   ├── main.go                 # booking handlers; concurrency flaws live here
│   └── ...
└── db/
    └── init.sql                # schema + seed data (incl. venue JSON blob)
```

Redis runs as its own service in `docker compose` (seat locks/holds).

## Running it

There is **no root compose / single "up" command** — each service (DB, Python API, PHP, Go, Redis) is started **separately**, in the right order, with its own config. The hidden `.raise-the-monster.sh` at the repo root does it all at once, but it is undocumented publicly (owner-only; see `IMPLEMENTATION_PLAN.md`). To run services individually:

```bash
# Python API
cd backend/python-api
pip install -r requirements.txt      # requirements are intentionally unpinned
uvicorn main:app --reload --port 8000

# PHP service
cd backend/php-service
php -S localhost:8080                 # or via the compose container

# Go booking service
cd backend/go-booking
go run .                              # needs Redis running (see compose)
```

> Reminder: services must come up in order (DB first, then APIs, then frontend); the PHP service races the DB on first boot, so starting things out of order fails. This is a known (intentional) issue; the workaround is pinned in Discussions.

## Versions are deliberately outdated

Python, Pydantic, PHP, and Go are pinned a major version or two behind (e.g., Python 3.8, Pydantic v1, PHP 7.4, Go 1.19). A whole class of challenge is fixable by *upgrading* and adopting the newer idiomatic pattern — PHP 8.1 enums/`match`, Pydantic v2, Python `match` + modern typing, Go 1.22 (which fixes loop-variable capture) + `slices`/generics. Pins are explicit even though other deps are intentionally unpinned. See `docs/IDEAS.md` → "Deliberately outdated versions."

## Difficulty tagging

Every feature doc states its difficulty. This batch is **junior**: single-service, self-contained flaws a junior backend developer should catch. Cross-service and architectural flaws come in later batches.

## Adding a new bad feature (for maintainers / Dr. Frankenstein)

1. Implement exactly one headline bad pattern in the relevant service.
2. Write the doc in `docs/backend/python/` or `docs/backend/php/`.
3. Open the matching GitHub issue(s), tagged with the language + difficulty.
