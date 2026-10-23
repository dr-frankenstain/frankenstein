---
id: adr-0001-next12-react17
type: adr
status: current
updated: 2026-10-23
scope: [frontend, versions, nextjs, react]
covers: [frontend/**]
related: [spec-phase1-design]
supersedes: null
superseded_by: null
---

# ADR 0001: The frontend runs Next.js 12.3.4 on React 17 (Pages Router)

**Date:** 2026-10-23
**Status:** Accepted

## Context

The project pins React 17 as one of its deliberately outdated versions, and the original plan named Next.js 13 and an `app/` directory. Next 13 declares `react ^18` as a peer dependency (checked against the npm registry on 2026-10-23: `next@13.0.0` → `react ^18.0.0-0`, `next@13.5.6` → `react ^18.2.0`), and the App Router needs React 18. Next 12.3.4, the last 12.x, accepts `react ^17.0.2 || ^18` and runs on Node 16.

## Decision

We use Next.js 12.3.4 with the Pages Router, React 17.0.2, TypeScript 4.5.5 and Node 16, exact-pinned in `package-lock.json`.

## Options considered

| Option | Why it was attractive | Why it lost |
|---|---|---|
| Next 12.3.4 + React 17 | Keeps the React 17 pin and the planned React 17→18 upgrade challenges; genuinely old | Docs that said "Next 13" needed correcting |
| Next 13 + React 18 | Matches the original docs | Drops the React 17 pin and the `useId`/`createRoot` challenges |
| Next 13 with `--legacy-peer-deps` on React 17 | Matches both docs | Unsupported combination; breaks at runtime |

## Consequences

Challenge pages are files under `frontend/pages/`. The "upgrade to Next 13+" fix is bundled with the React 18 upgrade, which fits the mid-batch upgrade challenges.

## Revisit if

- The React 17 pin is dropped from the deliberately-outdated list.
- Next 12.3.4 cannot be installed or built on the pinned Node version.
