---
id: ops-03-leaked-stack-traces
type: ops
status: current
updated: 2026-08-10
scope: [leaked, stack, traces]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# BE Python 03 — Leaked stack traces & secrets in errors

- **Endpoint(s):** global error handling, `GET /api/config`
- **Headline bad pattern:** internal details leaked to the client on error.
- **Difficulty:** 🟢 Junior
- **Disciplines:** `python`, `backend`, `security`

## What it does (and should do)

Standard request handling with a global exception path. It works — but when things go wrong, it overshares dramatically.

## The flaws (each becomes an issue)

1. **Full stack traces in responses** — unhandled exceptions return the traceback (file paths, line numbers, library versions) to the client. `[junior]`
2. **DB errors leaked verbatim** — a failed query returns the raw driver error, revealing table/column names. `[junior]`
3. **Debug mode on in "production"** — the app runs with debug enabled, so the interactive debugger/verbose errors are exposed. `[junior]`
4. **Secrets echoed** — a `GET /api/config` endpoint returns the whole config dict, including the DB password and the PHP service API key. `[junior]`
5. **Secrets logged** — the same secrets are written to stdout logs on startup. `[junior]`

## Intended learning / what a good fix shows

Return generic, safe error messages to clients while logging details server-side; disable debug in production; remove the config-dump endpoint (or gate + redact it); and stop logging secrets — without losing useful server-side observability.

## Solver hints (for the issue body)

> On error, this API returns full stack traces and raw DB errors, runs in debug mode, and even has an endpoint that dumps secrets. Make error handling safe and stop leaking internals.

## Constraints for solvers

- Don't remove logging entirely — move detail server-side, keep the client responses generic.
- Valid responses must be unchanged.
