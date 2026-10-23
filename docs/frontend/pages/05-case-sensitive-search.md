---
id: ops-05-case-sensitive-search
type: ops
status: current
updated: 2026-08-10
scope: [case, sensitive, search]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# FE Page 05 — Search Page (case-sensitive exact match)

- **Route:** `/search`
- **Headline bad pattern:** a search box that only matches exact, case-sensitive, whole strings.
- **Difficulty:** 🟢 Junior
- **Disciplines:** `frontend`

## What the page does (and should do)

Lets the user search a product list rendered on the client. It works — if you type the product name *exactly* right, including capitalization and trailing spaces.

## The flaws (each becomes an issue)

1. **Case-sensitive match** — `product.name === query`, so "iphone" finds nothing but "iPhone" works. `[junior]`
2. **Exact whole-string match** — no substring/`includes`, so partial queries fail. `[junior]`
3. **No trimming** — a trailing space breaks the match. `[junior]`
4. **No empty/no-results state** — an empty query shows nothing; zero results shows a blank area with no message. `[junior]`
5. **Filters on every keystroke over the full list with a heavy per-item computation** — noticeable lag on large lists (no debounce, no memo). `[junior→mid]`

## Intended learning / what a good fix shows

Case-insensitive substring matching with trimming, sensible empty/no-results states, and (bonus) debounced/memoized filtering for responsiveness.

## Solver hints (for the issue body)

> Search only matches exact, case-sensitive strings, so it's nearly unusable. Make it forgiving (case-insensitive, substring, trimmed) and add empty/no-results states.

## Constraints for solvers

- Keep search client-side for this challenge.
- Preserve the existing result list rendering.
