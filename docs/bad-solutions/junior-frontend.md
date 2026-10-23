---
id: ops-junior-frontend
type: ops
status: current
updated: 2026-08-10
scope: [junior, frontend]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# Bad Solutions — Junior Frontend Developer

This catalog defines the **junior-level** bad patterns for frontend. Junior = obvious, self-contained flaws that a junior developer should be able to recognize and fix without touching the rest of the system. Each entry is one page (per the project's "one bad pattern = one page" rule) and links to its implementation doc.

Later batches will add mid, senior, and lead frontend patterns.

## How to read this

Each pattern lists: the page, what's wrong, why it's bad, and what a good fix demonstrates. The detailed build/solve notes live in the linked page doc.

## The junior FE catalog

### 1. Inline-styles chaos

- **Page:** `/product` — [impl doc](../frontend/pages/01-inline-styles-product-page.md)
- **What's bad:** every element styled with inline `style={{}}`, magic numbers, duplicated color values, no responsiveness, unoptimized `<img>`.
- **Why it's bad:** unmaintainable, un-themeable, breaks on mobile.
- **Good fix shows:** migration to a consistent styling approach with reusable tokens + responsive layout.

### 2. `any` everywhere

- **Page:** `/profile` — [impl doc](../frontend/pages/02-untyped-profile-page.md)
- **What's bad:** TypeScript in name only — `any` on props, state, and API responses; `@ts-ignore` hiding real errors; unsafe deep access.
- **Why it's bad:** zero type safety; runtime crashes that types would have caught.
- **Good fix shows:** real domain/API types, no `any`, no `@ts-ignore`, safe access.
- **Also here (upgrade-fixable):** join date formatted with deprecated `moment.js` → drop for native `Intl`. `[junior]`

### 3. localStorage abuse

- **Page:** `/cart` — [impl doc](../frontend/pages/03-localstorage-cart.md)
- **What's bad:** `JSON.parse` with no try/catch or null handling, sensitive data (email, card last4) in localStorage, writes on every render.
- **Why it's bad:** crashes on corrupt/missing data; leaks sensitive data to client storage.
- **Good fix shows:** safe parsing with fallback, keeping sensitive data out, effect-scoped writes.

### 4. No form validation

- **Page:** `/signup` — [impl doc](../frontend/pages/04-no-validation-signup.md)
- **What's bad:** no client validation, form clears on error, no inline feedback, no loading state, unmasked password field.
- **Why it's bad:** hostile UX; invalid data hits the server; duplicate submits.
- **Good fix shows:** validation with inline errors, preserved input on failure, disabled-while-submitting, fixed password field.
- **Also here (upgrade-fixable):** submits via a `node-fetch` polyfill/old `axios` on Node 16 → native `fetch`. `[junior/mid]`

### 5. Case-sensitive exact-match search

- **Page:** `/search` — [impl doc](../frontend/pages/05-case-sensitive-search.md)
- **What's bad:** `===` matching, case-sensitive, no trim, no empty/no-results states, no debounce.
- **Why it's bad:** effectively unusable search.
- **Good fix shows:** case-insensitive substring matching, trimming, proper states, responsiveness.

### 6. Hostile-UX / dumb features

- **Page:** `/deals` — [impl doc](../frontend/pages/06-annoying-popups.md)
- **What's bad:** popup every 3s that ignores dismissal, cookie banner covering its own accept button, fake dark mode, always-on "1 item in cart" badge, Comic Sans errors.
- **Why it's bad:** classic dark patterns and dishonest UI.
- **Good fix shows:** humane popup behavior, acceptable cookie banner, real theming, honest badge, sane error styling.

## Coverage checklist (junior FE)

| Pattern | Page | Tags |
|---|---|---|
| Inline styles | `/product` | `frontend`, `design` |
| `any` everywhere | `/profile` | `frontend` |
| localStorage abuse | `/cart` | `frontend` |
| No validation | `/signup` | `frontend`, `design` |
| Bad search | `/search` | `frontend` |
| Hostile UX | `/deals` | `frontend`, `design` |

## Upgrade-fixable flaws in this batch

Some junior flaws are best fixed not by rewriting but by **upgrading + adopting the newer idiomatic API** (see `../IDEAS.md` → "Deliberately outdated versions"):

- `moment.js` on `/profile` → native `Intl.DateTimeFormat`.
- `node-fetch` polyfill on `/signup` (Node 16) → native `fetch`.

Richer upgrade challenges (React 17→18 `useId`/`createRoot`, TS `satisfies`, etc.) are deferred to the mid batch.

## Not in the junior batch (deferred to mid/senior/lead)

Custom hooks that worsen code, partially-refactored modules, duplicate/unused dependency untangling at scale, IndexedDB misuse, unreachable/non-existing route architecture, and cross-cutting styling-system consolidation. These require broader context and will appear in later batches.
