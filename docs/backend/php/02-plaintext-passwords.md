---
id: ops-02-plaintext-passwords
type: ops
status: current
updated: 2026-08-10
scope: [plaintext, passwords]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# BE PHP 02 — Plaintext / MD5 passwords

- **Handler(s):** `php-service/handlers/auth.php` (`POST /php/register`, `POST /php/login`)
- **Headline bad pattern:** passwords stored and compared insecurely.
- **Difficulty:** 🟢 Junior
- **Disciplines:** `php`, `backend`, `security`

## What it does (and should do)

The legacy PHP service still owns registration and login. It works — you can register and log in — but password handling is straight out of 2008.

## The flaws (each becomes an issue)

1. **Passwords stored as plaintext** (some legacy rows) and as **unsalted MD5** (newer rows) — two bad schemes coexisting. `[junior]`
2. **Login compares with `==`** — PHP type juggling means some non-matching values compare equal (the classic magic-hash / `"0e..."` problem). `[junior→mid]`
3. **No rate limiting on login** — unlimited attempts. `[junior]`
4. **Password sent back in the response** — the register response echoes the submitted password "for confirmation." `[junior]`
5. **Password in the URL on login** — login is a `GET` with the password in the query string, so it lands in logs. `[junior]`

## Intended learning / what a good fix shows

Move to `password_hash()` / `password_verify()` (bcrypt/argon2), use strict comparison, switch login to `POST` (keep credentials out of URLs/logs), stop returning the password, and add basic attempt throttling — with a migration path for existing rows.

## Solver hints (for the issue body)

> Passwords here are plaintext or unsalted MD5, compared with `==`, sent over GET, and echoed back. Move to `password_hash`/`password_verify`, use strict comparison, and stop leaking the password.

## Constraints for solvers

- Address existing stored passwords (describe or implement a rehash-on-login migration).
- PHP-only fix for this challenge.
