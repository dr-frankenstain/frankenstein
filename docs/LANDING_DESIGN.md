---
id: spec-landing-design
type: spec
status: current
updated: 2026-10-24
scope: [landing, frontend, design, motion, gsap]
covers: [landing/app/**, landing/components/**, landing/lib/**, landing/styles/**]
related: [spec-phase1-design, adr-0001-next12-react17, adr-0003-landing-as-separate-app]
superseded_by: null
---

# Landing Page — Design

## Intent

A stranger opening the site for the first time should feel **intrigued**: the page looks like a cold gothic laboratory where something has just been brought to life, and it quietly proves that claim. The landing page is the only polished surface in the project. Every other page is deliberately ugly, broken or unfinished, because their flaws are the challenges. The contrast is the point: a beautiful front door onto a monster.

The organising idea is the monster itself. Frankenstein's monster is patched together from different parts, so **the page is assembled from patches as you scroll**. Each section is a separate donor part that settles into place, gets stitched to the one above, and is zapped by the same lightning that animates the hero.

## Goals

- Intrigue in the first five minutes: a hero that reanimates on load, a lore timeline, a stack anatomy, a "how it works" sequence, and the list of challenges.
- The page reads as one designed thing, with a single idea (patchwork assembly) carried by motion, not decoration.
- A live "vital signs" strip makes the monster feel alive (see Vital signs).
- Lightweight and robust: it works with the API down, with reduced motion, on mobile, and without imagery.

## Non-goals

- No photographs or illustrations. The lightning is the hero visual. The only drawings are small SVG line drawings: the four how-it-works step diagrams, the lore's architecture diagram, and the brain and nerve in the vital signs.
- No light theme. Dark only.
- No new routes or challenge pages (Phase 2 builds those).
- No change to the challenge pages or their stack. The landing page is a separate app (`adr-0003-landing-as-separate-app`), so none of its styles or fonts can reach them.
- No custom cursor, scroll cue, version badge, or decorative status dots.

## Anti-goals (a failure even if it technically works)

- Landing styles or fonts leak onto the deliberately ugly pages. Concretely: the landing page is its own app; `app/globals.css` sets only the dark `html`/`body`, and component styles live in one CSS Module.
- Patch motion makes content hard to read, or hides it until an animation finishes.
- Any full-screen flash or strobing. See Accessibility.
- The page looks empty, blank or broken when the Python API is down.

## Constraints

- The landing page is `landing/`, a latest-stack app: Next.js 16.4.3 App Router, React 19.3.1, TypeScript 7.0.2 (5.9.3 only if Next rejects it), Node 22, exact-pinned lockfile (`adr-0003-landing-as-separate-app`). The challenge pages stay in `frontend/` on Next 12.3.4 and React 17 (`adr-0001-next12-react17`). Dependencies are pinned exactly and install without `--legacy-peer-deps`.
- GSAP from npm, free build. Use the installed GSAP skills (`gsap-react`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-core`, `gsap-performance`).
- Component styles are one CSS Module (`landing/styles/landing.module.css`); `landing/app/globals.css` sets only `html`/`body`. No inline styles except a patch's computed `clip-path`.
- Fonts are self-hosted: `@fontsource` packages loaded through `next/font/local`.
- Ship no scroll listeners on `window` and no `requestAnimationFrame` loops that touch React state. Use ScrollTrigger and `gsap.ticker`. Every animation has cleanup on unmount.
- Honour `prefers-reduced-motion`. Motion that collapses to static in that mode: the load intro, lightning strikes, patch settle, zaps, marquee, pinned lore pan, sticky stack, the step diagrams, and the heartbeat.

## Look and feel

- **Theme:** dark only, `color-scheme: dark`. Near-black ground `#0a0c0b`, text `#e6e8e1`, muted `#9aa39c`, and **one accent**, galvanic green `#a3e635`, used identically everywhere. No second accent, including for errors.
- **Type:** condensed uppercase display (Big Shoulders Display 800/900), a grotesk for body (Geist Sans 400/500/600), a mono (Geist Mono 400/500), all self-hosted from `@fontsource` packages through `next/font/local`. No Inter, no serif.
- **Shape:** sharp corners everywhere. Stitched look comes from dashed borders and the patch seams.
- **Hero:** asymmetric, headline "Alive, and broken on purpose." in at most 2 lines on desktop, one sub line of at most 20 words, one primary and one secondary button. No eyebrow, tagline, trust strip or bottom text strip.
- **Navigation:** one line, 64px, brand with a dashed underline, anchor links, one ghost button to GitHub.

## Code layout

The app is `landing/`. Server components render the static sections; each animating piece is a `'use client'` leaf in `landing/components/` that calls GSAP directly. Pure logic lives in `landing/lib/` and is unit-tested: `challenges.ts`, `issues.ts`, `board.ts`, `github.ts`, `links.ts`, `rng.ts`, `bolt.ts`, `patch.ts`, `vitals.ts`. `lib/lightning.ts` owns the one shared canvas layer, reached through a module-level ref.

## Page structure

Order:

1. Hero (lightning canvas, reanimation intro)
2. Marquee: one only, real flaws from the project
3. Vital signs (patch)
4. Lore: "How the monster got built", pinned horizontal pan on desktop, vertical stack on mobile, years 2014 to 2026, each panel beside a diagram of the stack as it stood that year (patch)
5. Anatomy: five-cell bento of the stack, exactly five cells, each with a different texture (patch)
6. How it works: Pick / Fork / Fix / Vote as a sticky stack, each step with a small animated diagram (patch)
7. Challenges: sticky headline beside a searchable, filterable list of GitHub issues (patch)
8. Final call to action (patch), then the footer

The marquee is part of the hero's band and has no cut edge. The footer is not a patch. That makes six patches: Vital signs, Lore, Anatomy, How it works, Challenges, Final call to action.

The challenges intro says "Every flaw is open as its own issue" and never hard-codes a count of flaws, because a fixed number rots. The headline ("56 flaws, all on fire") is derived from the number of issues. No em-dashes anywhere on the page (issue text has them replaced by hyphens); use hyphens. No emoji.

## Challenges board

The list is the repo's open issues carrying the `challenge` label, fetched server-side from the GitHub REST API (`lib/github.ts`, revalidated every 30 minutes; an optional `GITHUB_TOKEN` env var lifts the unauthenticated rate limit). `lib/issues.ts` reads each issue form into `Issue`: the title without its `[stack]` prefix and without the route, the affected route, the "What's wrong" text, the stack (Frontend, Python API, PHP service), the difficulty, and the tags (labels other than the challenge, stack and difficulty ones). If GitHub cannot be reached, the board falls back to the 11-room registry in `lib/challenges.ts`, one featured entry per room. The registry's `Challenge` type is `{ label: string; group: 'Frontend' | 'Python API' | 'PHP service'; summary: string; href: string; built: boolean }`; all 11 junior-batch rooms are registered with `built: false`, and Phase 2 flips `built` as each room ships. `href` is the route for a frontend room (joined to `NEXT_PUBLIC_CHALLENGES_URL`, default `http://localhost:3001`) and a GitHub issue search for a backend room. Rooms link with plain `<a>`, not `next/link`.

A row shows only the route and the one-line flaw, in the same two-column look as before. Stack, difficulty and tags are never shown on a row; they are values for the controls. Opening a row (`<details>`) shows the "What's wrong" text and links to the issue; a frontend room whose registry `built` flag is true also links to its live page on `NEXT_PUBLIC_CHALLENGES_URL`.

Default view: the issues labelled `good-first-challenge`, grouped by stack, with a "Show all" button. Controls (client component `ChallengeBoard`, logic in `lib/board.ts`):

- Search: every word must appear in the title, route, "What's wrong" text, stack, difficulty or a tag.
- Filter: one stack, and any number of tags (an issue needs all selected tags). Chips show counts.
- Sort: Stack (grouped, default), Newest, Oldest, Route, Most tagged.
- Any search or filter looks through all issues, not just the featured ones. The status line states how many of the total are shown. An empty result offers to clear the search.
- Without JavaScript the featured rows still render and expand; the controls do nothing.

## The patch system (the central piece)

Each of the six sections tagged "(patch)" in Page structure is wrapped in a patch. A patch is a section wrapper with:

- A **cut top edge**: a jagged `clip-path` polygon, different for every patch, deterministic (seeded, not random per render).
- A **seam**: stitches drawn along the cut edge. They are short strokes crossing the edge at regular spacing, generated from the polygon's points (not hand-drawn), in the accent at reduced opacity.
- A **settle**: as the patch enters, it starts slightly misaligned (about 1 degree of rotation and a small vertical offset, alternating direction per patch) and settles to rest, scrubbed to scroll from the patch's top reaching 92% of the viewport height to 10%. The seam's stitches fill in across that whole range and the last one closes as the patch reaches the top.
- A **spark**: when the patch finishes settling, one short lightning strike runs along its seam, once per page load per patch.

Chosen level: **restrained**. Sections settle into place with a stitch and a spark; they do not fly in from different directions.

Rules:
- The settle must be finished (and `transform` cleared with `clearProps`) before any pinned content inside the patch reaches its pin start. Pinned lore and the sticky stack work as soon as it has settled. A transformed ancestor breaks pinning, so never leave a transform on a patch.
- A patch that contains a pinned element (the lore) does not tilt or offset: a transformed ancestor skews the pin's range after any refresh. Its stitches still draw and it still sparks.
- Each lore diagram (`lib/lore.ts`, `LoreArt`) shows every part that exists by that year; the parts and links new that year are drawn in the accent and play in once as the panel arrives (2026 adds a flaw marker on every part). Without JavaScript or under reduced motion the diagram is static.
- The lore pan holds on its first and last panel (extra scroll distance with the track at rest), and the sticky stack keeps its last card stuck for another 60% of the viewport height before releasing it.
- Hero lightning strikes every 0.5 to 1.4 seconds while the hero is on screen. Once it scrolls away, a bolt still comes down at a random spot every 2.5 to 5 seconds.
- Links to GitHub (nav, footer, "Browse challenges" buttons, issue links) open in a new tab with `rel="noopener noreferrer"`.
- The sticky stack dims a buried card with a brightness filter, never with opacity, so the next card cannot show through it. Each step diagram starts when its card has stuck in place (one at a time, not while it is still scrolling in), resets when the page scrolls back above the card so it plays again on the next arrival, and is server-rendered in its final state. The triggers are computed from the stack's position and the card heights, because a trigger on a sticky card measures a moving target.
- Content inside a patch is readable at all times; the settle moves the patch, it never fades content to invisible. There are no scroll-triggered fades: the patch settle is the only scroll motion.
- **Server-rendered and no-JS state is the final, fully visible state.** The hero's masked headline and hidden sub line and buttons are only set up by JavaScript, in a layout effect before paint, and only when motion is allowed. A wall-clock failsafe (`setTimeout`, not GSAP's clock) reveals everything after 3 seconds if the intro has not finished. The lore track scrolls sideways by hand until JS marks it pinned.
- All lightning is drawn on **one shared fixed canvas** (`pointer-events: none`) driven by one `gsap.ticker` callback. The hero strikes and the seam sparks use the same bolt generator. Do not create a canvas per patch.
- Mobile (below 768px): no tilt or offset; stitches draw once on entry; no sparks. The lore pan and sticky stack collapse to vertical.
- Reduced motion: patches are static with their stitches already drawn, no sparks, one static bolt in the hero.

## Vital signs

Layout: a full-width patch with the heading "Proof of life", the one-line intro "These readings come from the stack running right now.", and three equal tiles in a row (stacked on mobile). Each tile has its organ name, a one-line descriptor, and the live reading. The heart tile carries the heartbeat line; the brain tile a triangulated mesh in the outline of a side-view brain, with a brainstem running out to the right edge; the nerve tile a bare nerve tree in the shape of a horizontal arm (shoulder at the left, trunk and branches, four fingers of different lengths and a thumb, all ending clear of the tile's right edge; no outline is drawn). Brain and nerve also show their detail text. Descriptors: Heart "The Python API answers"; Brain "MySQL remembers"; Nerve "PHP, reached through Python".

The live Phase 1 API round trip stays on the landing page, restyled as the monster's vitals. Reuse `runChecks` (moved unchanged into `landing/lib/checks.ts`); keep each row's `data-testid="check-<name>"` and its `OK (...)` / `FAIL: ...` text so tests and the browser check keep working.

Mapping:

| Check | Reads as | Backed by |
|---|---|---|
| `health` | **Heart** | Python API `/health` |
| `products` | **Brain** (memory) | MySQL via `/api/products` |
| `php-check` | **Nerve** (the old spine) | PHP service via `/api/php-check` |

States, all within the single accent:
- Loading: "Checking" with a placeholder shaped like the final tile.
- OK: the heart tile shows a pulsing line (heartbeat). The brain tile animates: several pulses hop between cells at random at any moment, and every few seconds one travels down the brainstem and leaves through the outlet on the tile's right edge. That signal enters the nerve tile at the shoulder on its left edge and spreads down the arm along every branch, ending in the fingertips. If the brain check fails while the nerve is OK, the nerve fires on its own every few seconds. Both stop while off screen and are static under reduced motion. Loading and fail dim the drawing.
- Fail: the line goes flat and dims, the tile shows `FAIL: <reason>`, and the page layout does not shift. Each tile fails on its own. Each tile fills in as its own check answers. If a check has not answered after 8 seconds, only its tile shows `FAIL: timed out`. Tiles reserve four lines for the reading, so a long error never changes their height.

## Accessibility and safety

- **No flashing.** The page never flashes the screen: there is no full-viewport overlay, and a bolt's brightness only decays smoothly, so nothing changes luminance more than three times a second (WCAG).
- Text contrast meets WCAG AA. The muted text colour is only used at sizes where it passes.
- Keyboard focus is visible (accent outline). Anchor links work without JavaScript.
- Decorative canvas and stitches are `aria-hidden`.

## Routing

Two apps, two origins, no proxy. The landing page owns `http://localhost:3000`; the Next 12 app owns `http://localhost:3001`. The legacy `/` redirects to the landing origin and forwards a `redirectTo` query param (the destination origin comes from `NEXT_PUBLIC_LANDING_URL`, never from the request). The Python API's CORS list contains both origins. Production uses two hostnames with the same env-driven code.

## Tests and verification

- Pure logic (challenge registry, bolt and patch geometry, vitals view-model) has Vitest unit tests, run by `tests/landing/run_unit.sh`.
- `tests/landing/check_landing_html.sh` builds the app and asserts on the server-rendered HTML (copy, order, six patches, no em-dash, no flash CSS). `tests/landing/check_routing.sh` asserts the redirect and origins against the running stack. `tests/landing/check_landing_app.sh` pins the versions and runs typecheck and build.
- `tests/phase1/check_frontend.sh` checks the legacy app: build, typecheck, lockfile, and its redirecting `/`.
- Browser verification at desktop and mobile widths: hero reanimates, a bolt is visible, each patch settles and shows its stitches, vitals show `OK` with the stack up and per-tile `FAIL:` with Python stopped, lore pan and sticky stack still work after settling, and there is no horizontal overflow on mobile.
- Verify with `prefers-reduced-motion` on, and with Back from the legacy origin.
