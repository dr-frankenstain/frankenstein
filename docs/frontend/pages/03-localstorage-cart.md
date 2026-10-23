---
id: ops-03-localstorage-cart
type: ops
status: current
updated: 2026-08-10
scope: [localstorage, cart]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# FE Page 03 — Cart Page (localStorage abuse)

- **Route:** `/cart`
- **Headline bad pattern:** wrong, unsafe use of `localStorage` as the cart's source of truth.
- **Difficulty:** 🟢 Junior
- **Disciplines:** `frontend`

## What the page does (and should do)

Shows the shopping cart and lets you change quantities and remove items. It works — the cart persists across reloads — but the persistence is done badly.

## The flaws (each becomes an issue)

1. **`JSON.parse(localStorage.getItem('cart'))` with no try/catch** — one malformed entry throws and the whole page white-screens. `[junior]`
2. **No `null` handling** — first-time visitors (no `cart` key) hit `JSON.parse(null)` → crash. `[junior]`
3. **Sensitive data in localStorage** — the stored cart object also includes the user's email and a saved card's last4 + full name, which has no business being there. `[junior]`
4. **Writes on every render** — a `localStorage.setItem` runs in the component body (not an effect), so it writes on every render. `[junior]`
5. **No cross-tab sync** — two tabs disagree about the cart; no `storage` event handling. `[junior→mid]`

## Intended learning / what a good fix shows

Safe parsing with fallback, correct null handling, keeping sensitive data out of client storage, moving writes into an effect keyed on cart changes, and (bonus) syncing across tabs.

## Solver hints (for the issue body)

> The cart persists via localStorage but does it unsafely: it crashes on missing/corrupt data, stores things it shouldn't, and writes on every render. Make persistence safe and correct.

## Constraints for solvers

- Cart behavior (add/remove/quantity/persist) must still work.
- Don't move the whole cart to a backend — this challenge is about doing client persistence *correctly*.
