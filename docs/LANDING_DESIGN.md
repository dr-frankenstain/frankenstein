---
id: spec-landing-design
type: spec
status: draft
updated: 2026-10-23
scope: [landing, frontend, design, motion, gsap]
covers: [landing/app/**, landing/components/**, landing/lib/**, landing/styles/**]
related: [spec-phase1-design, adr-0001-next12-react17, adr-0003-landing-as-separate-app]
superseded_by: null
---

# Landing Page — Design

> Not yet implemented. The approved visual draft is `docs/assets/landing-draft/index.html` (open it in a browser; add `?hold` to freeze each lightning strike). It is a throwaway reference, to be deleted when this ships. This doc says how the real page differs from it.

## Intent

A stranger opening the site for the first time should feel **intrigued**: the page looks like a cold gothic laboratory where something has just been brought to life, and it quietly proves that claim. The landing page is the only polished surface in the project. Every other page is deliberately ugly, broken or unfinished, because their flaws are the challenges. The contrast is the point: a beautiful front door onto a monster.

The organising idea is the monster itself. Frankenstein's monster is patched together from different parts, so **the page is assembled from patches as you scroll**. Each section is a separate donor part that settles into place, gets stitched to the one above, and is zapped by the same lightning that animates the hero.

## Goals

- Intrigue in the first five minutes: a hero that reanimates on load, a lore timeline, a stack anatomy, a "how it works" sequence, and the list of challenge rooms.
- The page reads as one designed thing, with a single idea (patchwork assembly) carried by motion, not decoration.
- A live "vital signs" strip makes the monster feel alive (see Vital signs).
- Lightweight and robust: it works with the API down, with reduced motion, on mobile, and without imagery.

## Non-goals

- No photographs or illustrations. The lightning is the hero visual.
- No light theme. Dark only.
- No new routes or challenge pages (Phase 2 builds those).
- No change to the challenge pages or their stack. The landing page is a separate app (`adr-0003-landing-as-separate-app`), so none of its styles or fonts can reach them.
- No custom cursor, scroll cue, version badge, or decorative status dots.

## Anti-goals (a failure even if it technically works)

- Landing styles or fonts leak onto the deliberately ugly pages. Concretely (author's call): the landing page is its own app; `app/globals.css` sets only the dark `html`/`body`, and component styles live in one CSS Module.
- Patch motion makes content hard to read, or hides it until an animation finishes.
- Any full-screen flash or strobing. See Accessibility.
- The page looks empty, blank or broken when the Python API is down.

## Constraints

- The landing page is `landing/`, a latest-stack app: Next.js 16.4.3 App Router, React 19.3.1, TypeScript 7.0.2 (5.9.3 only if Next rejects it), Node 22, exact-pinned lockfile (`adr-0003-landing-as-separate-app`). The challenge pages stay in `frontend/` on Next 12.3.4 and React 17 (`adr-0001-next12-react17`). Dependencies are pinned exactly and install without `--legacy-peer-deps`.
- GSAP from npm, free build. Use the installed GSAP skills (`gsap-react`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-core`, `gsap-performance`).
- Component styles are one CSS Module (`landing/styles/landing.module.css`); `landing/app/globals.css` sets only `html`/`body`. No inline styles except a patch's computed `clip-path`.
- Fonts are self-hosted: `@fontsource` packages loaded through `next/font/local`.
- Ship no scroll listeners on `window` and no `requestAnimationFrame` loops that touch React state. Use ScrollTrigger and `gsap.ticker`. Every animation has cleanup on unmount.
- Honour `prefers-reduced-motion`. Motion that collapses to static in that mode: the load intro, lightning strikes, patch settle, zaps, marquee, pinned lore pan, sticky stack, and the heartbeat.

## Look and feel (decided, matches the draft)

- **Theme:** dark only, `color-scheme: dark`. Near-black ground `#0a0c0b`, text `#e6e8e1`, muted `#9aa39c`, and **one accent**, galvanic green `#a3e635`, used identically everywhere. No second accent, including for errors.
- **Type:** condensed uppercase display (draft uses Big Shoulders Display 800/900), a grotesk for body (draft uses Geist), a mono (draft uses Geist Mono). The builder picks the self-hostable packages; if Geist is not available as an npm font package, choose the nearest grotesk and say so. No Inter, no serif.
- **Shape:** sharp corners everywhere. Stitched look comes from dashed borders and the patch seams.
- **Hero:** asymmetric, headline "Alive, and broken on purpose." in at most 2 lines on desktop, one sub line of at most 20 words, one primary and one secondary button. No eyebrow, tagline, trust strip or bottom text strip.
- **Navigation:** one line, 64px, brand with a dashed underline, anchor links, one ghost button to GitHub.

## Page structure

Order (the Vital signs position is the author's call, not the user's):

1. Hero (lightning canvas, reanimation intro)
2. Marquee: one only, real flaws from the project
3. Vital signs (patch)
4. Lore: "How the monster got built", pinned horizontal pan on desktop, vertical stack on mobile (patch)
5. Anatomy: five-cell bento of the stack, exactly five cells, each with a different texture (patch)
6. How it works: Pick / Fork / Fix / Vote as a sticky stack (patch)
7. Challenges: sticky headline beside grouped list (patch)
8. Final call to action (patch), then the footer

The marquee is part of the hero's band and has no cut edge. The footer is not a patch. That makes six patches: Vital signs, Lore, Anatomy, How it works, Challenges, Final call to action.

Copy is the draft's copy, with one change: the challenges intro says "Every flaw is open as its own issue" instead of a hard-coded "fifty-six" (author's call: a hard number rots). The "Eleven rooms" headline is derived from the registry length. No em-dashes anywhere on the page; use hyphens. No emoji.

The Challenges list renders from `landing/lib/challenges.ts`. The `Challenge` type becomes `{ label: string; group: 'Frontend' | 'Python API' | 'PHP service'; summary: string; href: string; built: boolean }` (author's call). `label` is what the code cell shows (`/product`, `POST /api/orders`). `href` is the route for frontend rooms, joined to `NEXT_PUBLIC_CHALLENGES_URL` (default `http://localhost:3001`) when rendered, and a GitHub issues search URL for that endpoint for backend rooms. Rooms link with plain `<a>`, not `next/link`. All 11 junior-batch rooms are registered now with `built: false`; an unbuilt entry renders as plain text, a built one as a link to `href`. Phase 2 flips `built` as each room ships. The old `route`/`title` fields are removed.

## The patch system (the central piece)

Each of the six sections tagged "(patch)" in Page structure is wrapped in a patch. A patch is a section wrapper with:

- A **cut top edge**: a jagged `clip-path` polygon, different for every patch, deterministic (seeded, not random per render).
- A **seam**: stitches drawn along the cut edge. They are short strokes crossing the edge at regular spacing, generated from the polygon's points (not hand-drawn), in the accent at reduced opacity.
- A **settle**: as the patch enters, it starts slightly misaligned (about 1 degree of rotation and a small vertical offset, alternating direction per patch) and settles to rest, scrubbed to scroll. The seam's stitches draw progressively over the same range.
- A **spark**: when the patch finishes settling, one short lightning strike runs along its seam, once per page load per patch.

Chosen level: **restrained**. Sections settle into place with a stitch and a spark; they do not fly in from different directions.

Rules:
- The settle must be finished (and `transform` cleared with `clearProps`) before any pinned content inside the patch reaches its pin start. Pinned lore and the sticky stack must behave exactly as in the draft once settled. A transformed ancestor breaks pinning, so never leave a transform on a patch.
- Content inside a patch is readable at all times; the settle moves the patch, it never fades content to invisible. The draft's scroll-triggered `data-reveal` fades are dropped (author's call): the patch settle is the only scroll motion.
- **Server-rendered and no-JS state is the final, fully visible state.** The hero's masked headline and hidden sub line and buttons are only set up by JavaScript, in a layout effect before paint, and only when motion is allowed. A failsafe reveals everything after 3 seconds if the intro has not finished (author's call).
- All lightning is drawn on **one shared fixed canvas** (`pointer-events: none`) driven by one `gsap.ticker` callback. The hero strikes and the seam sparks use the same bolt generator. Do not create a canvas per patch.
- Mobile (below 768px): no tilt or offset; stitches still draw; one spark per patch is optional. The lore pan and sticky stack collapse to vertical.
- Reduced motion: patches are static with their stitches already drawn, no sparks, one static bolt in the hero.

## Vital signs

Layout (author's call, there is no draft reference): a full-width patch with the heading "Proof of life", the one-line intro "These readings come from the stack running right now.", and three equal tiles in a row (stacked on mobile). Each tile has its organ name, a one-line descriptor, and the live reading. The heart tile carries the heartbeat line; brain and nerve show their detail text. Descriptors: Heart "The Python API answers"; Brain "MySQL remembers"; Nerve "PHP, reached through Python".

The live Phase 1 API round trip stays on the landing page, restyled as the monster's vitals. Reuse `runChecks` (moved unchanged into `landing/lib/checks.ts`); keep each row's `data-testid="check-<name>"` and its `OK (...)` / `FAIL: ...` text so tests and the browser check keep working.

Mapping (the metaphor names are the author's guess; the user asked for "heart and brain"):

| Check | Reads as | Backed by |
|---|---|---|
| `health` | **Heart** | Python API `/health` |
| `products` | **Brain** (memory) | MySQL via `/api/products` |
| `php-check` | **Nerve** (the old spine) | PHP service via `/api/php-check` |

States, all within the single accent:
- Loading: "Checking" with a placeholder shaped like the final tile.
- OK: the heart tile shows a pulsing line (heartbeat); brain and nerve tiles show their live detail text.
- Fail: the line goes flat and dims, the tile shows `FAIL: <reason>`, and the page layout does not shift. Each tile fails on its own.

## Accessibility and safety

- **No flashing.** The draft flashes the whole screen about four times in half a second during the intro, which exceeds the WCAG limit of three flashes per second. The real page must not flash the screen at all. Localised glow on the bolt is fine; any luminance change on a bolt stays at or below three per second and low contrast.
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

## Left to the builder

- Exact polygon shapes, stitch spacing and length, easing, and timings.
- Component and CSS Module file layout under `landing/components/` and `landing/styles/`.
- How the shared canvas knows each seam's position (read from the patch's DOM rect via ScrollTrigger).
- Heartbeat rendering (SVG path or canvas).
