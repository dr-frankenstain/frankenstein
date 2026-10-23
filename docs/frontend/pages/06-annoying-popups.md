---
id: ops-06-annoying-popups
type: ops
status: current
updated: 2026-08-10
scope: [annoying, popups]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# FE Page 06 — Deals Page (the popup hellscape)

- **Route:** `/deals`
- **Headline bad pattern:** dumb, hostile UX features stacked on one page.
- **Difficulty:** 🟢 Junior
- **Disciplines:** `frontend`, `design`

## What the page does (and should do)

Shows a list of "deals." It works — you can read the deals — if you can get past the interruptions.

## The flaws (each becomes an issue)

1. **Newsletter popup every 3 seconds** — a modal reappears on a `setInterval`, even after you dismiss it. `[junior]`
2. **Cookie banner covers the accept button** — the banner's own layout hides the button that dismisses it, so it can't be accepted normally. `[junior]`
3. **Dark mode toggle that only changes one `div`** — the toggle exists and flips a background on a single element while everything else stays light. `[junior]`
4. **"1 item in your cart" badge that's always there** — hardcoded, never reflects the real cart. `[junior]`
5. **Comic Sans error text** — when a deal image fails to load, the fallback text is styled in Comic Sans. `[junior]`

## Intended learning / what a good fix shows

Can the contributor make the page usable: a popup that respects dismissal (and reasonable frequency), a cookie banner that can actually be accepted, a dark mode that themes the whole page, an honest cart badge, and sane error styling?

## Solver hints (for the issue body)

> This page is a hostile-UX museum: a popup that won't stay closed, a cookie banner you can't accept, a fake dark mode, a lying cart badge, and Comic Sans errors. Fix each into humane behavior.

## Constraints for solvers

- Each sub-fix can be its own PR if desired (link them to the sub-issues).
- Keep the deals list itself intact.
