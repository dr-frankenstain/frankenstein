---
id: ops-02-untyped-profile-page
type: ops
status: current
updated: 2026-08-10
scope: [untyped, profile, page]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# FE Page 02 — Profile Page (`any` everywhere)

- **Route:** `/profile`
- **Headline bad pattern:** TypeScript in name only — `any` on every variable, prop, and API response.
- **Difficulty:** 🟢 Junior
- **Disciplines:** `frontend`

## What the page does (and should do)

Displays the logged-in user's profile (name, email, join date, order count) fetched from the Python API, with an edit form. It works — but TypeScript provides zero safety.

## The flaws (each becomes an issue)

1. **`any` everywhere** — `const user: any = await res.json()`, props typed `any`, event handlers `(e: any)`. `[junior]`
2. **No API response type** — the shape of the profile response is untyped, so a renamed field fails silently at runtime instead of at compile time. `[junior]`
3. **`@ts-ignore` covering real errors** — a couple of genuine type errors are suppressed rather than fixed. `[junior]`
4. **Unsafe access** — `user.address.city` with no optional chaining; crashes for users without an address. `[junior]`
5. **Secondary flaw (upgrade-fixable):** the join date is formatted with **`moment.js`** — a large, deprecated dependency pulled in for a single `moment(user.joinDate).format('MM/DD/YYYY')` call. The best fix is to *drop it entirely* for native `Intl.DateTimeFormat` (or a lighter lib like `date-fns`). `[junior]`

## Intended learning / what a good fix shows

Can the contributor define proper interfaces/types for the domain and the API response, remove every `any` and `@ts-ignore`, add safe access, and keep the page compiling and behaving the same? The date flaw adds an **upgrade angle**: recognizing that `moment.js` is deprecated and bloated, and replacing it with a native/lighter solution.

> Related (deferred to a later batch): this page is on **React 17** and hand-rolls element IDs, which can cause SSR hydration mismatches — a `useId` (React 18) upgrade fix. Kept out of the junior scope; tracked in `docs_local/IDEAS.md` → "Deliberately outdated versions."

## Solver hints (for the issue body)

> This page "uses TypeScript" but every type is `any`. Introduce real types for the user model and the API response, remove the `@ts-ignore`s, and make field access safe.

## Constraints for solvers

- No `any`, no `@ts-ignore` in the final version.
- Behavior unchanged; the fix is purely about type safety and safe access.
