---
id: adr-0003-landing-as-separate-app
type: adr
status: current
updated: 2026-10-24
scope: [landing, frontend, routing, nextjs, origins]
covers: [landing/**, frontend/pages/index.tsx, frontend/docker-compose.yml]
related: [adr-0001-next12-react17, spec-landing-design]
supersedes: null
superseded_by: null
---

# ADR 0003: The landing page is a separate latest-stack app on its own origin

**Date:** 2026-10-23
**Status:** Accepted

Supplements `adr-0001-next12-react17` instead of superseding it: Next 12.3.4 and React 17 still govern `frontend/`, which keeps every challenge page. This ADR only moves the landing page out of that app.

## Context

The landing page is the one polished surface and uses the latest stack (Next 16, React 19, Node 22, GSAP). The challenge pages must stay on the deliberately outdated stack, because upgrading it is itself a challenge. One Next app can run only one Next version, so the landing page cannot live in `frontend/`. Two Next apps behind one origin also collide: both serve `/_next/*`.

A spike on 2026-10-23 put a Next 16 app in front of a Next 12 app using Next rewrites. In production builds it worked: routes, assets under a path `assetPrefix`, `_next/data` for server-rendered pages, back and forward. In dev mode (how the containers run) the HMR websocket cannot pass through rewrites, and a path `assetPrefix` breaks Fast Refresh even when the legacy app is opened directly. Pointing `assetPrefix` at the legacy port fails on CORS.

## Decision

`landing/` is its own Next 16 app on `http://localhost:3000`. `frontend/` stays on Next 12.3.4 and moves to `http://localhost:3001`; its `/` redirects to the landing origin and forwards a `redirectTo` query param. Each app builds absolute links to the other from env vars (`NEXT_PUBLIC_CHALLENGES_URL`, `NEXT_PUBLIC_LANDING_URL`), so production uses two hostnames with the same code. The Python API's CORS list contains both origins.

## Options considered

| Option | Why it was attractive | Why it lost |
|---|---|---|
| Next rewrites from landing to legacy, one origin | Clean URLs, no CORS change | No Fast Refresh for legacy pages in dev; dev and production would differ |
| Reverse-proxy container, one origin | Clean URLs and working HMR | An extra container and config to maintain |
| Keep everything in the Next 12 app | One app | No latest stack for the landing page |
| Replace the whole frontend with the latest stack | One modern app | Removes the deliberately outdated challenge surface |

## Consequences

Challenge pages live on a second origin, so browser storage such as the cart's `localStorage` is per origin. The stack has a fifth container, `frankenstein-landing`. Every new challenge page flips a `built` flag in `landing/lib/challenges.ts`. Legacy pages link home with the absolute landing URL.

## Revisit if

- A deployment target requires one hostname for both apps.
- Challenge pages need cookies or storage shared with the landing page.
- The legacy app is upgraded off Next 12, which would remove the reason for two apps.
