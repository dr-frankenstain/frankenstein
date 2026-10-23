---
id: ops-01-no-input-validation
type: ops
status: current
updated: 2026-08-10
scope: [input, validation]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# BE Python 01 — No input validation (trusts the client)

- **Endpoint(s):** `POST /api/orders`, `POST /api/signup`
- **Headline bad pattern:** the API trusts whatever the client sends, with no validation.
- **Difficulty:** 🟢 Junior
- **Disciplines:** `python`, `backend`

## What it does (and should do)

Accepts an order (or signup) payload and writes it to the DB. It works for well-formed input — and equally "works" for garbage, which is the problem.

## The flaws (each becomes an issue)

1. **No schema validation** — the handler reads `request.json` and uses fields directly; missing fields raise 500s, extra fields are stored blindly. `[junior]`
2. **No type/range checks** — `quantity` can be negative, zero, a string, or `999999999`. A negative quantity produces a negative total. `[junior]`
3. **No email format check** on signup — `"not-an-email"` is accepted. `[junior]`
4. **Trusts client-provided price/total** — the order payload includes `price` and `total`, and the server stores them instead of computing them, so the client can set its own price. `[junior→mid]`
5. **No length limits** — a 5 MB string in `notes` is accepted and stored. `[junior]`

## Intended learning / what a good fix shows

Introduce request validation (e.g., Pydantic models / schema validation), reject malformed input with proper `400`s and field-level messages, compute price/total server-side, and add sane limits — without breaking valid requests.

## Solver hints (for the issue body)

> This endpoint trusts the client completely: negative quantities, bad emails, client-set prices, and huge payloads all go straight through. Add proper input validation and compute trusted values server-side.

## Constraints for solvers

- Keep the endpoint contract for *valid* requests unchanged.
- Don't fix unrelated flaws in the same PR.
