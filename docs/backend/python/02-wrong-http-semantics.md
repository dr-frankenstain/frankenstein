---
id: ops-02-wrong-http-semantics
type: ops
status: current
updated: 2026-08-10
scope: [wrong, http, semantics]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# BE Python 02 — Wrong HTTP semantics & status codes

- **Endpoint(s):** `GET /api/delete-item`, `POST /api/orders` (status handling), various
- **Headline bad pattern:** HTTP verbs and status codes that lie about what happened.
- **Difficulty:** 🟢 Junior
- **Disciplines:** `python`, `backend`

## What it does (and should do)

CRUD-style endpoints for items and orders. They function, but they misuse HTTP so badly that caches, clients, and monitoring all get misled.

## The flaws (each becomes an issue)

1. **Mutation via `GET`** — `GET /api/delete-item?id=5` deletes an item. Any prefetch, crawler, or cache warm-up can wipe data. `[junior]`
2. **`200 OK` with an error body** — validation failures return `200` and `{"success": false, "error": "..."}`, so clients and monitors think it succeeded. `[junior]`
3. **`500` for user errors** — a missing required field returns `500 Internal Server Error` instead of `400`. `[junior]`
4. **`200` for "not found"** — fetching a non-existent order returns `200` with an empty body instead of `404`. `[junior]`
5. **No consistent error shape** — different endpoints return errors in different formats. `[junior→mid]`

## Intended learning / what a good fix shows

Use correct verbs (`DELETE` for deletes, `POST/PUT/PATCH` for writes), correct status codes (`400`/`401`/`403`/`404`/`409`/`422` vs `500`), and a consistent error response shape — without changing successful behavior.

## Solver hints (for the issue body)

> These endpoints delete via GET, return 200 on errors, and 500 on bad input. Fix the HTTP semantics and status codes and standardize the error response shape.

## Constraints for solvers

- Coordinate with the frontend contract: if you change a verb/route, note the client change needed.
- Keep the happy-path responses intact.
