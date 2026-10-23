---
id: ops-04-no-validation-signup
type: ops
status: current
updated: 2026-08-10
scope: [validation, signup]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# FE Page 04 — Signup Form (no validation)

- **Route:** `/signup`
- **Headline bad pattern:** a form with no client-side validation and hostile error handling.
- **Difficulty:** 🟢 Junior
- **Disciplines:** `frontend`, `design`

## What the page does (and should do)

A signup form (name, email, password, confirm password) that posts to the Python API. It works — it submits — but the UX around input is awful.

## The flaws (each becomes an issue)

1. **No validation at all** — empty fields, invalid emails, and mismatched passwords all submit to the server. `[junior]`
2. **Form clears on error** — when the server rejects the submission, every field is wiped and the user starts over. `[junior]`
3. **No inline feedback** — no field-level messages; the only signal is a generic `alert()`. `[junior]`
4. **No loading/disabled state** — the submit button can be clicked repeatedly, firing duplicate requests. `[junior]`
5. **Password field autocompletes and is not masked correctly** — `type="text"` on the password input. `[junior]`
6. **Secondary flaw (upgrade-fixable):** the form submits through a bundled **`node-fetch` polyfill** (with old `axios` also in the tree) on **Node 16**, instead of the platform's native `fetch`. Best fixed by upgrading Node and removing the polyfill in favor of native `fetch`. `[junior/mid]`

## Intended learning / what a good fix shows

Add client-side validation with clear inline errors, preserve user input on failure, disable the button while submitting, and fix the password field — without removing the server round-trip. Bonus **upgrade angle**: replace the `node-fetch` polyfill with native `fetch` (Node upgrade).

## Solver hints (for the issue body)

> This signup form submits invalid data, wipes everything on error, and gives no useful feedback. Add proper validation and error handling while keeping the existing submit flow.

## Constraints for solvers

- Keep the API call; this is about the client experience, not the backend.
- Don't introduce a heavy form library unless you justify it — hand-rolled or lightweight is fine.
