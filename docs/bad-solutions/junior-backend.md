---
id: ops-junior-backend
type: ops
status: current
updated: 2026-08-10
scope: [junior, backend]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# Bad Solutions — Junior Backend Developer

This catalog defines the **junior-level** bad patterns for backend, across both languages in the stack (**Python API** and **PHP legacy service**). Junior = single-service, self-contained flaws a junior backend developer should catch and fix without needing to reason about the cross-service architecture.

Cross-service and architectural flaws (the seams between Python and PHP) are deferred to later (senior/lead) batches.

## The junior BE catalog

### Python

#### 1. No input validation

- **Endpoints:** `POST /api/orders`, `POST /api/signup` — [impl doc](../backend/python/01-no-input-validation.md)
- **What's bad:** trusts the client; negative/oversized quantities, bad emails, client-set prices, unbounded strings all accepted.
- **Why it's bad:** data integrity and security hole; client controls trusted values.
- **Good fix shows:** schema validation, proper `400`s, server-computed totals, sane limits.

#### 2. Wrong HTTP semantics & status codes

- **Endpoints:** `GET /api/delete-item`, order handlers — [impl doc](../backend/python/02-wrong-http-semantics.md)
- **What's bad:** mutation via `GET`, `200` with error body, `500` for user errors, `200` for not-found, inconsistent error shapes.
- **Why it's bad:** misleads caches, clients, and monitoring; unsafe deletes.
- **Good fix shows:** correct verbs and status codes, consistent error shape.

#### 3. Leaked stack traces & secrets

- **Endpoints:** global error handling, `GET /api/config` — [impl doc](../backend/python/03-leaked-stack-traces.md)
- **What's bad:** full tracebacks and raw DB errors returned to clients, debug mode on, a config endpoint that dumps secrets, secrets in logs.
- **Why it's bad:** hands attackers a map of the system and its credentials.
- **Good fix shows:** generic client errors + server-side logging, debug off, no secret exposure.

### PHP

#### 4. SQL injection via string concatenation

- **Handler:** `GET /php/lookup` — [impl doc](../backend/php/01-sql-injection.md)
- **What's bad:** user input concatenated into SQL, no prepared statements, `SELECT *` leaking password hashes, SQL echoed on error.
- **Why it's bad:** trivially injectable; leaks sensitive columns.
- **Good fix shows:** prepared statements, minimal column selection, no SQL in error output.

#### 5. Plaintext / MD5 passwords

- **Handlers:** `POST /php/register`, login — [impl doc](../backend/php/02-plaintext-passwords.md)
- **What's bad:** plaintext + unsalted MD5 passwords, `==` comparison (type juggling), no login throttling, password echoed in response, password in URL on login.
- **Why it's bad:** catastrophic credential handling.
- **Good fix shows:** `password_hash`/`password_verify`, strict comparison, POST login, throttling, rehash migration.

## Coverage checklist (junior BE)

| Pattern | Service | Endpoint | Tags |
|---|---|---|---|
| No input validation | Python | `/api/orders`, `/api/signup` | `python`, `backend` |
| Wrong HTTP semantics | Python | `/api/delete-item`, orders | `python`, `backend` |
| Leaked traces/secrets | Python | error path, `/api/config` | `python`, `backend`, `security` |
| SQL injection | PHP | `/php/lookup` | `php`, `backend`, `security` |
| Plaintext/MD5 passwords | PHP | `/php/register`, login | `php`, `backend`, `security` |

## Not in the junior batch (deferred to mid/senior/lead)

IDOR, missing pagination, N+1, missing transactions, race conditions, mass assignment, idempotency on payments, CORS misconfig, rate-limit design, caching bugs, and all **cross-service seam** flaws (datetime/serialization mismatches, float money reconciliation, cross-network N+1, auth-done-three-ways). These need broader system context and belong to higher difficulty tiers.
