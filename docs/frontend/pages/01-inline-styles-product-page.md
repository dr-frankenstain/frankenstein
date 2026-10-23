---
id: ops-01-inline-styles-product-page
type: ops
status: current
updated: 2026-08-10
scope: [inline, styles, product]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# FE Page 01 — Product Page (inline-styles chaos)

- **Route:** `/product`
- **Headline bad pattern:** styling done entirely with inline `style={{...}}` objects, with hardcoded magic values everywhere.
- **Difficulty:** 🟢 Junior
- **Disciplines:** `frontend`, `design`

## What the page does (and should do)

Shows a single product: image, title, price, description, and an "Add to cart" button. It works — you can see the product and click the button. It just does so in the worst possible way.

## The flaws (each becomes an issue)

1. **Inline styles everywhere** — every element has a `style={{}}` object. No reuse, no theme, no responsive behavior. Colors and spacing are hardcoded hex/px repeated dozens of times. `[junior]`
2. **Magic numbers** — `marginTop: 37`, `width: 413` with no rationale. `[junior]`
3. **No responsive design** — fixed pixel widths break on mobile. `[junior]`
4. **Duplicated color values** — the same brand blue is written as `#1a73e8`, `#1A73E8`, and `rgb(26,115,232)` in different places. `[junior]`
5. **Secondary flaw (image):** uses a raw `<img>` with a huge unoptimized asset instead of `next/image`. `[junior]`

## Intended learning / what a good fix shows

Can the contributor extract styles into a maintainable system (CSS modules / SCSS / Tailwind — their choice), introduce design tokens for color and spacing, make it responsive, and swap in optimized images — without changing the visible behavior?

## Solver hints (for the issue body)

> This page renders fine but is a styling nightmare. Migrate it to a consistent, maintainable styling approach with reusable tokens and responsive layout. Bonus: optimize the product image.

## Constraints for solvers

- Keep the page's behavior and layout intent identical.
- Don't introduce a second bad pattern while fixing this one.
