---
id: ops-01-sql-injection
type: ops
status: current
updated: 2026-08-10
scope: [injection]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# BE PHP 01 — SQL injection via string concatenation

- **Handler(s):** `php-service/handlers/lookup.php` (`GET /php/lookup?email=...`)
- **Headline bad pattern:** queries built by concatenating user input directly into SQL.
- **Difficulty:** 🟢 Junior
- **Disciplines:** `php`, `backend`, `security`

## What it does (and should do)

The legacy PHP service looks up a customer by email (called by the Python API). It works for normal emails — and is trivially injectable.

## The flaws (each becomes an issue)

1. **String-concatenated query** — `"SELECT * FROM users WHERE email = '" . $_GET['email'] . "'"` sent to `mysqli_query`. Classic injection. `[junior]`
2. **No escaping, no prepared statements** — `mysqli_real_escape_string` is not used anywhere. `[junior]`
3. **`SELECT *` returns everything** — including the password hash and internal flags, which then travel back to Python. `[junior]`
4. **Errors reveal the query** — on failure it echoes the full SQL string. `[junior]`
5. **`GET` used for a lookup that also increments a "views" counter** — so the read has a side effect (bonus bad). `[junior→mid]`

## Intended learning / what a good fix shows

Convert to prepared statements (parameterized queries), select only needed columns, stop echoing SQL on error, and remove the side effect from the read path — without breaking the lookup the Python API depends on.

## Solver hints (for the issue body)

> This PHP lookup builds SQL by concatenating `$_GET['email']` — it's wide open to injection and returns password hashes. Convert to prepared statements and select only what's needed.

## Constraints for solvers

- Keep the response shape the Python API expects (minus the fields that shouldn't be there — note the change).
- PHP-only fix; don't touch the Python side in this PR.
