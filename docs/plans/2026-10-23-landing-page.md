---
id: plan-landing-page
type: plan
status: current
updated: 2026-10-23
scope: [landing, frontend, gsap, motion, routing]
covers: []
related: [spec-landing-design, adr-0001-next12-react17]
superseded_by: null
---

# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the patchwork Frankenstein landing page as its own app on the latest stack (`landing/`, Next 16 + React 19), served on its own origin next to the deliberately outdated Next 12 app (`frontend/`), whose `/` now redirects to the landing page.

**Architecture:** Two independent Next apps, no proxy and no rewrites. `landing/` owns `http://localhost:3000`; `frontend/` (Next 12.3.4, React 17, unchanged stack) moves to `http://localhost:3001` and keeps every challenge page. URLs between them come from env vars (`NEXT_PUBLIC_CHALLENGES_URL`, `NEXT_PUBLIC_LANDING_URL`) so production uses two hostnames with the same code. In `landing/`, static sections are server components and each animating leaf is a `'use client'` component calling GSAP directly (`useGSAP`, `gsap.matchMedia`). Pure logic (seeded RNG, bolt geometry, patch cut edge and stitches, vitals view-model, challenge registry) lives in `landing/lib/` and is unit-tested with Vitest. One fixed canvas and one `gsap.ticker` callback draw all lightning.

**Tech Stack:** `landing/`: Next 16.4.3 App Router, React 19.3.1, TypeScript 7.0.2 (fall back to 5.9.3 only if `next build` rejects it, and ledger it), `gsap` 3.15.0, `@gsap/react` 2.1.2, `@fontsource/big-shoulders-display|geist-sans|geist-mono` 5.3.0 via `next/font/local`, Vitest 5.0.5, `@types/react` and `@types/react-dom` 19.3.0, `@types/node` 22.20.5, Node 22 (`node:22`). `frontend/`: unchanged pins (Next 12.3.4, React 17.0.2, TypeScript 4.5.5, `node:16`).

**Spec:** `docs/LANDING_DESIGN.md` (id `spec-landing-design`), updated in Task 1 for the separate-app topology. The approved visual draft is `docs/assets/landing-draft/index.html`: copy, class structure, sizes and CSS in it are the reference for look and copy. The spec wins where they differ (no flashing, no `data-reveal` fades, six patches).

## Global Constraints

- Pins above are exact (`npm install --save-exact`); `npm ci` succeeds with no `--legacy-peer-deps`. The legacy app's pins do not change (`adr-0001-next12-react17` stands).
- Ports and origins: landing `127.0.0.1:3000`, legacy `127.0.0.1:3001`, both bound to loopback; Python CORS allows exactly both origins (`http://localhost:3000`, `http://localhost:3001`) and no others. Links between apps are absolute and built from env vars, never hard-coded in components. Landing code links to legacy routes with plain `<a>`, not `next/link`.
- Compose: `landing/docker-compose.yml` with project `name: frankenstein-landing`, container `frankenstein-landing`; the legacy compose keeps `frankenstein-frontend`. Neither app needs `frankenstein-net` (only the browser talks to the API).
- Landing styling: component styles in `landing/styles/landing.module.css`; a small `landing/app/globals.css` sets only `html`/`body` (dark `color-scheme`, background, box-sizing reset). Custom properties live on `.root`. Fonts come from `next/font/local`. If `next/font/local` cannot read woff2 files under `node_modules`, use `next/font/google` and ledger the ruling.
- Dark only: `#0a0c0b` ground, `#e6e8e1` text, `#9aa39c` muted, ONE accent `#a3e635` used for everything including failure states. Sharp corners everywhere. No em-dashes, no emoji in page copy; use hyphens.
- No `scroll`/`wheel` listeners on `window`, no `requestAnimationFrame` loops touching React state. Use ScrollTrigger and `gsap.ticker`. Every animation, trigger, ticker callback and listener is cleaned up on unmount.
- NO full-screen flash and no strobing. Bolt brightness only decays monotonically (no alternating frames); no `steps()` yoyo blinks on hero text.
- Reduced motion collapses to static: intro, strikes, patch settle, sparks, marquee, lore pan, sticky stack, heartbeat. Below 768px: no tilt or offset, no sparks, lore and stack collapse to vertical; stitches still draw.
- Server-rendered HTML and no-JS is the fully visible final state. The hidden pre-intro hero state is set only by JS before paint, with a 3 second failsafe.
- `runChecks` and `CheckResult` (copied from the old `frontend/lib/checks.ts` into `landing/lib/checks.ts`, logic unchanged) drive the vitals. Each vital keeps `data-testid="check-<name>"` and the `OK (...)` / `FAIL: ...` text.
- Commits are authored as Dr. Frankenstein and end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Never push; the user asks for that.
- Docker commands run in throwaway containers (`node:22` for `landing/`, `node:16` for `frontend/`). `python3 scripts/docs_lint.py` passes before the last task finishes.

## Review Focus

Failure modes the spec implies that no feature test exercises directly (each is pinned by the step named in brackets):

1. `redirectTo` is attacker-controlled: legacy `/?redirectTo=https://evil.example` must still redirect only to the configured landing origin, with the value merely forwarded URL-encoded [Task 2 test].
2. Browser calls the API from the legacy origin (`:3001`) and from landing (`:3000`); any other origin must stay blocked [Task 2 CORS test].
3. One API call hangs (not fails): tiles must not stay on "Checking" forever [Task 4 `toVitals` timeout test, Task 7 watchdog].
4. JavaScript disabled, late hydration, or Back from the legacy origin (bfcache restore or reload): every section readable, nothing stuck hidden or tilted [Task 5/6 HTML check, Task 11].
5. Resize/orientation change mid-scroll and extremes (320px, 2560px, long `GET /api/delete-item` label): stitches and pins recomputed, no stray transform, no horizontal scroll [Task 9, Task 11].

---

## File Structure

| File | Responsibility |
|---|---|
| `docs/decisions/0003-landing-as-separate-app.md` | ADR for the two-app, two-origin topology |
| `frontend/pages/index.tsx` | Legacy `/`: server-side redirect to the landing origin |
| `landing/package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `Dockerfile`, `docker-compose.yml`, `.env.local.example`, `.dockerignore` | App scaffold |
| `landing/app/layout.tsx`, `page.tsx`, `globals.css`, `fonts.ts` | Shell, fonts, page composition |
| `landing/lib/challenges.ts`, `links.ts`, `checks.ts`, `rng.ts`, `bolt.ts`, `patch.ts`, `vitals.ts`, `lightning.ts` | Logic (all but `lightning.ts` are pure and unit-tested) |
| `landing/components/*.tsx` | `LightningCanvas`, `Nav`, `Hero`, `Marquee`, `Patch`, `VitalSigns`, `Lore`, `Anatomy`, `HowItWorks`, `Challenges`, `FinalCta`, `Footer` |
| `landing/styles/landing.module.css` | All component styles |
| `landing/tests/*.test.ts` | Vitest unit tests |
| `tests/landing/run_unit.sh`, `check_landing_app.sh`, `check_landing_html.sh`, `check_routing.sh` | Test runners |

---

### Task 1: Branch, ADR, spec update

**Files:**
- Create: `docs/decisions/0003-landing-as-separate-app.md`
- Modify: `docs/LANDING_DESIGN.md`, `docs/INDEX.md`, `docs/STATE.md`

- [ ] **Step 1: Create the branch and commit what exists.** `git switch -c landing-page`; commit `docs/LANDING_DESIGN.md`, `docs/assets/landing-draft/`, `docs/INDEX.md` and this plan as `docs: landing page design and plan`.
- [ ] **Step 2: Write ADR 0003** from `docs/_templates/adr.md` (status `current`): the landing page is a separate Next 16 app on its own origin (3000) and legacy Next 12 moves to 3001 with `/` redirecting to the landing page. Record why (the legacy stack is deliberately outdated and must stay so; one Next version per app) and what was rejected: same-origin Next rewrites (no HMR websocket through the proxy in dev, and a path `assetPrefix` breaks Fast Refresh, spike-verified 2026-10); a reverse-proxy container (extra moving part). It supplements, not supersedes, `adr-0001-next12-react17` (which still governs `frontend/`); say so in its first line. Add it to `docs/INDEX.md` and `docs/STATE.md` "settled decisions".
- [ ] **Step 3: Edit the spec in place** (`docs/LANDING_DESIGN.md`): `covers:` becomes `landing/app/**, landing/components/**, landing/lib/**, landing/styles/**`; the stack constraint now names the landing stack and links ADR 0003; the "Anti-goals" leak bullet and the dark-shell wrapper/effect description are replaced by "the landing page is its own app; `app/globals.css` sets the dark `html`/`body`"; the Navigation and Challenges sections say rooms link to `NEXT_PUBLIC_CHALLENGES_URL + route` with plain `<a>`; the "Tests" section names Vitest and `tests/landing/*`; add a short "Routing" section (two origins, env-driven URLs, legacy `/` redirects here carrying `redirectTo`). Keep the "Not yet implemented" banner. Bump `updated:`.
- [ ] **Step 4: Verify.** Run: `python3 scripts/docs_lint.py`. Expected: `0 error(s), 0 warning(s)`.
- [ ] **Step 5: Commit** `docs: adr 0003 and landing spec for the separate-app topology`.

### Task 2: Re-home the legacy app (port 3001, redirecting `/`)

**Files:**
- Modify: `frontend/pages/index.tsx`, `frontend/docker-compose.yml`, `frontend/.env.local.example`, `.pull-the-lever.sh` (legacy env block), `backend/python-api/main.py`, `tests/phase1/check_frontend.sh`, `tests/phase1/check_python.sh`, `tests/phase1/check_hardening.sh`, `tests/phase1/check_env_writer.sh`, `tests/phase1/check_bootstrap.sh`
- Delete: `frontend/lib/checks.ts`, `frontend/lib/challenges.ts` (their logic moves to `landing/lib/` in Tasks 3 and 4)

**Interfaces:**
- Produces: legacy `GET /` returns 302 to `${NEXT_PUBLIC_LANDING_URL}/` (default `http://localhost:3000`), and when `redirectTo` is a string query param, to `${NEXT_PUBLIC_LANDING_URL}/?redirectTo=<encodeURIComponent(value)>`. The destination origin is never taken from the request. `frontend/.env.local` gains `NEXT_PUBLIC_LANDING_URL=http://localhost:3000`.

- [ ] **Step 1: Write the failing tests.** `check_frontend.sh`: drop the "Challenges"/"No challenges yet" assertions; legacy is at `http://localhost:3001`; assert `GET /` status 302 and `Location` equals `http://localhost:3000/`; with `?redirectTo=%2Fproduct` the `Location` equals `http://localhost:3000/?redirectTo=%2Fproduct`; with `?redirectTo=https%3A%2F%2Fevil.example` the `Location` starts with `http://localhost:3000/` and contains `redirectTo=https%3A%2F%2Fevil.example` (value encoded, host unchanged); `GET /nope` is 404. `check_python.sh`: CORS allows `Origin: http://localhost:3000` and `http://localhost:3001`, and still does not reflect `http://evil.example`. `check_hardening.sh`: the port pair for the legacy frontend becomes `frontend:3001`. `check_env_writer.sh`/`check_bootstrap.sh`: legacy `.env.local` contains `NEXT_PUBLIC_LANDING_URL=http://localhost:3000`; bootstrap prints the legacy URL `localhost:3001`.
- [ ] **Step 2: Run to verify failure.** Run: `bash tests/phase1/check_python.sh`. Expected: `FAIL` CORS does not allow `http://localhost:3001`. (The others need the stack rebuilt; they fail the same way: connection refused on 3001.)
- [ ] **Step 3: Implement.** `frontend/pages/index.tsx`: `getServerSideProps` returning the redirect per Interfaces (non-permanent), default export renders `null`. `frontend/docker-compose.yml`: publish `127.0.0.1:3001:3000`. `main.py`: `allow_origins` lists both origins. Update `.pull-the-lever.sh` so its `frontend/.env.local` heredoc adds the landing URL and its frontend readiness check uses port 3001 (readiness: a 302 counts as up; use `curl -s -o /dev/null -w '%{http_code}'`). `frontend/.env.local.example` stays deliberately wrong in the same spirit (mirror how it is wrong today). Delete the two lib files.
- [ ] **Step 4: Rebuild and verify.** Run: `docker compose -f frontend/docker-compose.yml up -d --build` and restart the Python container so CORS reloads, then `bash tests/phase1/check_frontend.sh && bash tests/phase1/check_python.sh && bash tests/phase1/check_hardening.sh`. Expected: PASS for each (hardening still lacks the landing container until Task 3; if it asserts all four services, defer it and ledger).
- [ ] **Step 5: Commit** `feat: serve the legacy frontend on 3001 and redirect / to the landing page`.

### Task 3: Landing app scaffold, container, bootstrap wiring

**Files:**
- Create: `landing/` scaffold per the file table (`package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `Dockerfile`, `docker-compose.yml`, `.env.local.example`, `.dockerignore`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/fonts.ts`), `tests/landing/run_unit.sh`, `tests/landing/check_landing_app.sh`
- Modify: `.pull-the-lever.sh`, `.gitignore`, `tests/phase1/lib.sh`, `tests/phase1/check_hardening.sh`, `tests/phase1/check_env_writer.sh`, `tests/phase1/check_bootstrap.sh`, `tests/phase1/check_friction.sh`

**Interfaces:**
- Produces: `landing/` builds and serves a placeholder page on `127.0.0.1:3000` in container `frankenstein-landing` (`Dockerfile`: `node:22`, `npm ci`, `CMD ["npm","run","dev"]`, same shape as `frontend/Dockerfile`). `landing/.env.local` keys: `NEXT_PUBLIC_API_URL=http://localhost:8000`, `NEXT_PUBLIC_CHALLENGES_URL=http://localhost:3001`. `tests/landing/run_unit.sh` runs `npx vitest run` in a `node:22` container (installing deps only if `node_modules` is missing) and exits non-zero on any failure. `app/fonts.ts` exports `display`, `body`, `mono` (`next/font/local` results with CSS variable names `--font-display`, `--font-body`, `--font-mono`).

- [ ] **Step 1: Write the failing tests.** `check_landing_app.sh`: lock assertions (reuse the `lock` helper idea against `landing/package-lock.json`) for `next` 16.4.3, `react` 19.3.1, `react-dom` 19.3.1, `gsap` 3.15.0, `@gsap/react` 2.1.2, `vitest` 5.0.5, and exact (no `^`/`~`) versions in `landing/package.json`; a throwaway `node:22` container runs `npm ci --no-audit --no-fund && npx tsc --noEmit && npx next build`; then `GET http://localhost:3000/` is 200 and the HTML contains `<title>Frankenstein`. Phase 1 tests: `check_hardening.sh` loops cover the landing container (`landing:3000` port pair, project name `frankenstein-landing`); `lib.sh` `teardown_stack` also tears down `landing`; `check_env_writer.sh` asserts `landing/.env.local` content; `check_bootstrap.sh` asserts the landing URL line and that `GET /` on 3000 is 200; `check_friction.sh`'s grep for `pull-the-lever` covers `landing`.
- [ ] **Step 2: Run to verify failure.** Run: `bash tests/landing/check_landing_app.sh`. Expected: `FAIL: landing/package-lock.json missing`.
- [ ] **Step 3: Scaffold `landing/`** in a `node:22` container with the exact pins from the Tech Stack line (`npm install --save-exact`); confirm no peer warnings, that `gsap/ScrollTrigger` resolves, and that the fontsource woff2 files for weights 800/900 (Big Shoulders), 400/500/600 (Geist Sans), 400/500 (Geist Mono) exist. `next.config.ts` has no rewrites or redirects. `app/layout.tsx`: `<html lang="en">` with the three font variables on it and `globals.css` imported; `app/page.tsx`: placeholder with the title `Frankenstein`. `.gitignore` covers `landing/.next`, `landing/node_modules`, `landing/.env.local`, `landing/*.tsbuildinfo`. If TypeScript 7.0.2 fails `next build`, pin 5.9.3 and ledger it.
- [ ] **Step 4: Wire the stack.** `landing/docker-compose.yml` mirrors `frontend/docker-compose.yml` (port `127.0.0.1:3000:3000`, `env_file: .env.local`, unique project name). `.pull-the-lever.sh`: `mkdir -p` includes `landing`, `--env-only` writes `landing/.env.local`, the full bring-up starts landing after the legacy frontend with a readiness wait on `http://localhost:3000/`, and the final printout lists both URLs. `landing/.env.local.example` is deliberately wrong in the same way the other examples are.
- [ ] **Step 5: Verify.** Run: `bash tests/landing/check_landing_app.sh && bash tests/landing/run_unit.sh` (no tests yet; Expected: vitest reports no test files and the runner treats that as pass via `--passWithNoTests`) and `bash tests/phase1/check_hardening.sh && bash tests/phase1/check_env_writer.sh && bash tests/phase1/check_friction.sh && bash tests/phase1/check_bootstrap.sh`. Expected: PASS for each.
- [ ] **Step 6: Commit** `feat: scaffold the landing app on the latest stack`.

### Task 4: Pure logic (registry, links, checks, geometry, vitals)

**Files:**
- Create: `landing/lib/{links,challenges,checks,rng,bolt,patch,vitals}.ts`, `landing/tests/{challenges,geometry,vitals}.test.ts`

**Interfaces:**
- `links.ts`: `REPO_URL = 'https://github.com/dr-frankenstain/frankenstein'`, `ISSUES_URL = REPO_URL + '/issues'`, `issueSearchUrl(query: string): string` (`ISSUES_URL + '?q=' + encodeURIComponent('is:issue ' + query)`).
- `checks.ts`: `CheckResult`, `runChecks(apiBase: string): Promise<CheckResult[]>` copied from the old `frontend/lib/checks.ts` (git history has it), unchanged.
- `challenges.ts`: `type ChallengeGroup = 'Frontend' | 'Python API' | 'PHP service'`; `type Challenge = { label: string; group: ChallengeGroup; summary: string; href: string; built: boolean }`; `challenges: Challenge[]` (11 entries); `challengeGroups: ChallengeGroup[]`; `groupChallenges(list: Challenge[]): { group: ChallengeGroup; items: Challenge[] }[]`; `resolveHref(c: Challenge, challengesUrl: string): string` (Frontend rooms: `challengesUrl` with any trailing slash removed + `c.href`; backend rooms: `c.href` unchanged).
- `rng.ts`: `mulberry32(seed: number): () => number`.
- `bolt.ts`: `type Pt = { x: number; y: number }`; `jaggedPath(a: Pt, b: Pt, rng: () => number, opts?: { roughness?: number; minSegment?: number }): Pt[]` (midpoint displacement as in the draft's `jag`; first point `a`, last `b`); `makeBolt(a: Pt, b: Pt, rng: () => number, branches?: number): Pt[][]` (main path first, then `branches` shorter ones starting on a main-path point; default 2).
- `patch.ts`: `type EdgePoint = { x: number; y: number }` (x fraction 0..1, y px 0..depth); `cutEdge(seed: number, opts?: { depth?: number; steps?: number }): EdgePoint[]` (default depth 28, steps 14; first x 0, last x 1, x strictly increasing); `clipPathFor(edge: EdgePoint[]): string` (`polygon(0% 12px, 7% 3px, ..., 100% 9px, 100% 100%, 0% 100%)`); `type Stitch = { x1: number; y1: number; x2: number; y2: number }`; `stitchesFor(edge: EdgePoint[], width: number, opts?: { spacing?: number; length?: number }): Stitch[]` (defaults 22 and 14 px).
- `vitals.ts`: `type VitalStatus = 'loading' | 'ok' | 'fail'`; `type Vital = { name: 'health' | 'products' | 'php-check'; organ: 'Heart' | 'Brain' | 'Nerve'; descriptor: string; status: VitalStatus; reading: string }`; `toVitals(results: CheckResult[] | null, timedOut?: boolean): Vital[]` always three, ordered Heart (`health`, "The Python API answers"), Brain (`products`, "MySQL remembers"), Nerve (`php-check`, "PHP, reached through Python").

- [ ] **Step 1: Write the failing tests** (Vitest). `challenges.test.ts`: `registry has the 11 junior rooms` (6 Frontend: `/product /profile /cart /signup /search /deals`; 3 Python API: `POST /api/orders`, `GET /api/delete-item`, `GET /api/config`; 2 PHP service: `GET /php/lookup`, `POST /php/login`; summaries are the draft's, e.g. `/product` "Inline styles on every element"); `all rooms start unbuilt`; `backend href is an issue search for the label`; `resolveHref joins challenges url and route and drops a trailing slash`; `groupChallenges keeps registry order and drops empty groups`; `no summary contains an em-dash`. `geometry.test.ts`: `mulberry32 is deterministic and in range`; `jaggedPath starts at a and ends at b`; `jaggedPath is deterministic per seed and differs across seeds`; `makeBolt returns main plus N branches that start on the main path`; `cutEdge is deterministic and stays inside 0..depth`; `cutEdge spans x 0 to 1 strictly increasing`; `clipPathFor opens with polygon( and closes through 100% 100%, 0% 100%`; `stitchesFor yields about width/spacing stitches`; `every stitch midpoint lies on the edge polyline within 0.5px`; `every stitch is perpendicular to its edge segment (dot product within 1e-6 of 0)`; `every stitch has the requested length`. `vitals.test.ts`: `null results are three loading vitals reading "Checking"`; `ok result reads "OK (detail)"`; `failed result reads "FAIL: detail"`; `one failure leaves the others ok`; `output order is Heart Brain Nerve whatever the input order`; `a missing result stays loading`; `null results with timedOut are three fails reading "FAIL: timed out"`; `a missing result with timedOut fails`.
- [ ] **Step 2: Run to verify failure.** Run: `bash tests/landing/run_unit.sh`. Expected: failures resolving the modules.
- [ ] **Step 3: Implement** the modules per Interfaces. `stitchesFor` samples the edge polyline (x in px = fraction * width) every `spacing` px along x, interpolates y, and builds a segment centred on that point along the local normal.
- [ ] **Step 4: Run to verify pass.** Run: `bash tests/landing/run_unit.sh` and a `tsc --noEmit` in the container. Expected: all pass.
- [ ] **Step 5: Commit** `feat: landing registry, geometry and vitals logic`.

### Task 5: Page shell, nav, hero (static), marquee, footer

**Files:**
- Create: `landing/styles/landing.module.css`, `landing/components/{Nav,Hero,Marquee,Footer}.tsx`, `tests/landing/check_landing_html.sh`
- Modify: `landing/app/page.tsx`, `landing/app/layout.tsx`, `landing/app/globals.css`

**Interfaces:**
- Produces: `Nav`, `Marquee`, `Footer` are server components with no props. `Hero` is a client component (`forwardRef<HTMLElement>`) so Task 8 can attach strike listeners. `check_landing_html.sh` runs `npm ci && next build && next start -p 3999` in a throwaway `node:22` container, saves `/` and `/does-not-exist` HTML to a temp dir, runs assertions with the `tests/phase1/lib.sh` helpers, and tears the container down. `.root` in the CSS module carries the draft's custom properties and sets `min-height: 100dvh`, `overflow-x: clip` (never `hidden`, which breaks sticky and pinning).

- [ ] **Step 1: Write the failing HTML check** with assertions on `/`: contains `Alive, and`, `broken on purpose.`, `Browse challenges`, `Read the lore`, `href="#lore"`, the GitHub repo link, `SELECT * FROM users`, `Intentionally vulnerable`, `<html lang="en"`; contains no em-dash (U+2014).
- [ ] **Step 2: Run to verify failure.** Run: `bash tests/landing/check_landing_html.sh`. Expected: `FAIL` missing `Alive, and`.
- [ ] **Step 3: Implement** the CSS Module base and the four pieces from the draft (nav one line 64px, hero headline exactly two lines with sub line and two buttons, one marquee duplicated for the loop with the second copy `aria-hidden` and CSS animation disabled under reduced motion, footer). `layout.tsx` metadata: title "Frankenstein", description. `globals.css`: `html, body` get the dark background, `color-scheme: dark`, reset.
- [ ] **Step 4: Run to verify pass.** Run: `bash tests/landing/check_landing_html.sh`. Expected: PASS; `tsc` and `next build` clean.
- [ ] **Step 5: Commit** `feat: landing shell, nav, hero and marquee`.

### Task 6: Static content sections

**Files:**
- Create: `landing/components/{Lore,Anatomy,HowItWorks,Challenges,FinalCta}.tsx`
- Modify: `landing/app/page.tsx`, `landing/styles/landing.module.css`, `tests/landing/check_landing_html.sh`

**Interfaces:**
- Consumes: `challenges`, `groupChallenges`, `resolveHref`, `ISSUES_URL`.
- Produces: five components, no props, rendering inner content only (no `<section>`, no id); until Task 9, `page.tsx` wraps each in a plain `<section id="lore|anatomy|how|challenges">`. `HowItWorks` uses the draft's `.stack-card` structure, `Lore` the `.lore-track` structure. `Challenges` reads `process.env.NEXT_PUBLIC_CHALLENGES_URL` on the server, falling back to `http://localhost:3001`.

- [ ] **Step 1: Write the failing checks.** `check_landing_html.sh` additions: contains `How the monster got built`, `2014`, `2019`, `2021`, `2023` (in that order), `Nobody has the full picture`, `Five languages, one shared database`, the five cell headings `Next.js frontend`, `Python API`, `PHP legacy`, `One MySQL`, `Go and Redis`, `Fix it on paper`, `Pick`/`Fork`/`Fix`/`Vote` in order, `Eleven rooms, all on fire`, `Every flaw is open as its own issue`, `id="challenges"`, `/product`, `POST /api/orders`, `POST /php/login`, `It stays broken. You can still win.`; does NOT contain `fifty` (case-insensitive) or `data-reveal`, and does NOT contain `href="http://localhost:3001/product"` (unbuilt rooms are plain text).
- [ ] **Step 2: Run to verify failure.** Run: `bash tests/landing/check_landing_html.sh`. Expected: `FAIL` missing `How the monster got built`.
- [ ] **Step 3: Implement** with the draft's copy, except the challenges intro "Every flaw is open as its own issue. Start with any junior one." and "Eleven" derived from `challenges.length` (small number-to-word lookup). Each row renders `<code>{label}</code><span>{summary}</span>`, wrapped in a plain `<a href={resolveHref(c, url)}>` only when `built`; CTAs link to `ISSUES_URL`. Port the draft CSS including mobile collapse and reduced-motion fallbacks (lore scrolls sideways with snap, stack static).
- [ ] **Step 4: Run to verify pass.** Run: `bash tests/landing/check_landing_html.sh && bash tests/landing/run_unit.sh`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: landing lore, anatomy, how-it-works, challenges and final sections`.

### Task 7: Vital signs (live)

**Files:**
- Create: `landing/components/VitalSigns.tsx`
- Modify: `landing/app/page.tsx`, `landing/styles/landing.module.css`, `tests/landing/check_landing_html.sh`

**Interfaces:**
- Consumes: `runChecks`, `toVitals`, `Vital`.
- Produces: `VitalSigns` (`'use client'`, no props): fetches on mount against `process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'`; renders "Proof of life", "These readings come from the stack running right now.", and three tiles. Each tile root has `data-testid={'check-' + vital.name}` and shows organ, descriptor and `vital.reading`. The heart tile carries the heartbeat SVG line (pulsing via CSS when `ok`, flat and dimmed on `fail`, dashed placeholder while `loading`). Tile height is identical in every state. An 8 second watchdog sets `timedOut` if results are still `null`; a result arriving after unmount is ignored.

- [ ] **Step 1: Write the failing check:** `Proof of life`, the intro line, `data-testid="check-health"`, `check-products`, `check-php-check`, `Heart`, `Brain`, `Nerve`, the three descriptors, and `Checking` (server-rendered loading state).
- [ ] **Step 2: Run to verify failure.** Run: `bash tests/landing/check_landing_html.sh`. Expected: `FAIL` missing `Proof of life`.
- [ ] **Step 3: Implement `VitalSigns`** and place it after the marquee in a plain `<section>` for now.
- [ ] **Step 4: Run to verify pass.** Run: `bash tests/landing/check_landing_html.sh && bash tests/landing/run_unit.sh`. Expected: PASS.
- [ ] **Step 5: Browser verify.** With the full stack up, `http://localhost:3000/`: three tiles read `OK (...)` (this also proves CORS from the landing origin). Stop the Python container and reload: three independent `FAIL: ...` tiles, no layout shift, page not blank. Restart it.
- [ ] **Step 6: Commit** `feat: vital signs from the live API checks`.

### Task 8: Lightning layer, shared canvas, hero reanimation

**Files:**
- Create: `landing/lib/lightning.ts`, `landing/components/LightningCanvas.tsx`
- Modify: `landing/components/Hero.tsx`, `landing/app/page.tsx`, `landing/styles/landing.module.css`, `tests/landing/check_landing_html.sh`

**Interfaces:**
- Consumes: `makeBolt`, `mulberry32`, `Pt`.
- Produces from `lightning.ts`: `type LightningLayer = { strike(from: Pt, to: Pt): void; strikeAlong(points: Pt[]): void; showStatic(from: Pt, to: Pt): void; clear(): void; destroy(): void }` (viewport pixel coordinates); `createLightningLayer(canvas: HTMLCanvasElement, opts: { reducedMotion: boolean }): LightningLayer` (one `gsap.ticker.add` callback that draws only while a bolt is alive; `destroy` removes it and the resize handling); `lightning: { current: LightningLayer | null }` module-level ref. `LightningCanvas` (`'use client'`, no props) renders `<canvas aria-hidden>` fixed to the viewport (`pointer-events: none`, above content, below the nav), creates the layer in `useGSAP`, sets `lightning.current`, clears it on cleanup. Bolt drawing: the draft's two-pass stroke (soft wide + bright thin) in the accent, alpha decaying monotonically to zero in about 0.4 s; no alternating-frame flicker.
- `Hero` behaviour (`useGSAP`, scoped): motion allowed, set the pre-intro hidden state in the layout phase (headline lines `yPercent: 110`, sub and buttons `opacity: 0, y: 18`), run the reanimation timeline (headline rises with one strike from the top toward the headline area, then sub and buttons ease in), and `gsap.delayedCall(3, finish)` jumps the timeline to its end as failsafe. Afterwards strikes repeat every 2.6 to 5.8 s toward the pointer if it moved in the last 2.5 s (listener on the hero element) else a random point in the hero area, only while the hero intersects the viewport (ScrollTrigger `onToggle` starts and stops the loop). Reduced motion: no timeline, no loop; `showStatic(...)` once, `clear()` when the hero leaves the viewport.

- [ ] **Step 1: Write the no-flash guard.** `check_landing_html.sh` additionally greps the built CSS and JS (`.next/static`, copied out by the script) for `mix-blend-mode: soft-light` and for the class name `flash`; both must be absent.
- [ ] **Step 2: Run it.** Run: `bash tests/landing/check_landing_html.sh`. Expected: PASS already (nothing has introduced a flash yet). This is a regression guard, not a red test; do not port the draft's `.flash` overlay or its `steps(1)` yoyo blinks.
- [ ] **Step 3: Implement** `lightning.ts`, `LightningCanvas.tsx`, and the Hero behaviours; mount `LightningCanvas` once in `page.tsx`.
- [ ] **Step 4: Run to verify.** Run: `bash tests/landing/check_landing_html.sh && bash tests/landing/run_unit.sh`. Expected: PASS.
- [ ] **Step 5: Browser verify** (1440 wide): headline reanimates once, a bolt is visible and fades smoothly, strikes repeat, the pointer pulls strikes, nothing flashes full-screen, the strike loop stops after scrolling past the hero. With reduced motion emulated: one static bolt, text visible immediately. Pause `gsap.globalTimeline` on load and confirm the 3 second failsafe leaves the page readable.
- [ ] **Step 6: Commit** `feat: shared lightning layer and hero reanimation`.

### Task 9: Patch component and the six patches

**Files:**
- Create: `landing/components/Patch.tsx`
- Modify: `landing/app/page.tsx`, `landing/styles/landing.module.css`, `tests/landing/check_landing_html.sh`

**Interfaces:**
- Consumes: `cutEdge`, `clipPathFor`, `stitchesFor`, `lightning`.
- Produces: `Patch(props: { id?: string; seed: number; tilt: 1 | -1; children: ReactNode })`, a client component. Renders `<div className={s.patch} data-patch>` containing `<section id className={s.patchBody} style={{ clipPath: clipPathFor(cutEdge(seed)) }}>{children}</section>` and an `aria-hidden` `<svg className={s.seam}>` overlay outside the clipped element so stitches cross the cut edge. Neither wrapper nor body sets `overflow` (it breaks sticky and pinning). The seam SVG is empty on the server; after mount it measures its width with a `ResizeObserver` (cleaned up) and renders `stitchesFor(edge, width)` as `<line pathLength="1">` in the accent at reduced opacity.
- Motion (`useGSAP`, `gsap.matchMedia`): at `(min-width: 768px) and (prefers-reduced-motion: no-preference)`, a scrubbed timeline on the wrapper from `{ rotation: tilt * 1, y: 24 }` to rest with stitches drawing (`strokeDashoffset 1 to 0`, staggered), `start: 'top 92%'`, `end: 'top 45%'`; `onLeave` runs `gsap.set(wrapper, { clearProps: 'transform' })` and fires one spark per page load via `lightning.current?.strikeAlong(points)` (cut-edge points converted to viewport pixels from the wrapper's current `getBoundingClientRect()`). Below 768px with motion allowed: no tilt, stitches draw once on enter, no spark. Reduced motion: no tween, stitches static. Seeds and tilt: Vital signs 11 / +1, Lore 23 / -1, Anatomy 37 / +1, How it works 41 / -1, Challenges 59 / +1, Final CTA 73 / -1. `page.tsx` also mounts a small client effect calling `ScrollTrigger.refresh()` on `window` `load` and when `document.fonts.ready` resolves, removing its listener on cleanup.

- [ ] **Step 1: Write the failing check:** exactly six `data-patch` attributes in `/`; `<section id=` for `lore`, `anatomy`, `how`, `challenges` once each; every patch body has an inline `clip-path:polygon(` style; the server HTML has no inline `transform:`.
- [ ] **Step 2: Run to verify failure.** Run: `bash tests/landing/check_landing_html.sh`. Expected: `FAIL` data-patch count 0.
- [ ] **Step 3: Implement `Patch`**, then wrap the six sections in `page.tsx` (Vital signs, Lore, Anatomy, How it works, Challenges, Final CTA), replacing the temporary plain sections. `.root` keeps `overflow-x: clip` so the 1 degree tilt cannot create horizontal scroll.
- [ ] **Step 4: Run to verify pass.** Run: `bash tests/landing/check_landing_html.sh && bash tests/landing/run_unit.sh`. Expected: PASS.
- [ ] **Step 5: Browser verify** (desktop): each patch arrives slightly tilted, settles by 45% of the viewport, stitches draw, one bolt runs along that seam, and never repeats on scroll-back. After scrolling past each, `getComputedStyle(patchWrapper).transform === 'none'` for all six. Mobile (375x812): no tilt, stitches visible, no sparks, `document.documentElement.scrollWidth === 375`.
- [ ] **Step 6: Commit** `feat: patch component with stitch, settle and spark`.

### Task 10: Pinned lore pan and sticky stack

**Files:**
- Modify: `landing/components/Lore.tsx`, `landing/components/HowItWorks.tsx` (both become `'use client'`), `landing/styles/landing.module.css`

**Interfaces:**
- Produces: behaviour only. `Lore` (`useGSAP`, `matchMedia` at `(min-width: 768px) and (prefers-reduced-motion: no-preference)`): the draft's pinned horizontal pan (pin the lore element, scrub 1, `end: '+=' + (track.scrollWidth - window.innerWidth)` as a function, `invalidateOnRefresh: true`). `HowItWorks` (same query): the draft's sticky stack, each card scaling to .93 and dimming as the next reaches `top 64px`. Both rely on the patch having finished settling (Task 9) before their trigger start; if triggers misplace, set `refreshPriority` or call `ScrollTrigger.sort()`/`refresh()` rather than leaving a transform on a patch.

- [ ] **Step 1: Write the order guard.** `check_landing_html.sh`: `2014 2019 2021 2023` then `Nobody has the full picture`, and `Pick Fork Fix Vote`, appear in order.
- [ ] **Step 2: Run it.** Run: `bash tests/landing/check_landing_html.sh`. Expected: PASS (content is already in order); it records the order guard.
- [ ] **Step 3: Implement** the two effects.
- [ ] **Step 4: Browser verify** (1440): Lore pins, pans through all six panels, releases into Anatomy with no gap or jump (pin spacer height = pan distance + viewport); the four cards stack and earlier ones scale down; scroll back up and repeat. Lore and How patch wrappers are `transform: none` once past their settle range and the pinned element's computed `position` is `fixed` while pinned. Mobile (375): lore vertical, cards in normal flow, no pins (`ScrollTrigger.getAll().filter(t => t.pin).length === 0`). Reduced motion: lore scrolls sideways by hand with snap, stack static.
- [ ] **Step 5: Run** `bash tests/landing/check_landing_html.sh && bash tests/landing/run_unit.sh`. Expected: PASS.
- [ ] **Step 6: Commit** `feat: pinned lore pan and sticky how-it-works stack`.

### Task 11: Full verification pass

**Files:**
- Create: `tests/landing/check_routing.sh`
- Modify only what a failing check shows.

- [ ] **Step 1: Write `check_routing.sh`** (stack up): `GET :3000/` is 200 and is the landing page; `GET :3001/` is 302 to `http://localhost:3000/`; `?redirectTo=%2Fproduct` is preserved in `Location`; the landing HTML never references `:3001` as an asset origin (all its `/_next/...` assets are same-origin) and the legacy app serves its own `/_next/static` on 3001. Run it: `bash tests/landing/check_routing.sh`. Expected: PASS.
- [ ] **Step 2: Typecheck and build both apps in their pinned containers.** `landing/`: `docker run --rm -v "$PWD/landing:/app" -w /app node:22 sh -c "npm ci --no-audit --no-fund && npx tsc --noEmit && npx next build"`; `frontend/`: the same with `node:16`. Expected: both succeed, no peer or CSS warnings.
- [ ] **Step 3: Whole suite.** Rebuild both frontends (`docker compose -f landing/docker-compose.yml up -d --build`, same for `frontend/`) and run `for t in tests/phase1/check_*.sh tests/landing/check_*.sh; do bash "$t" || break; done` and `bash tests/landing/run_unit.sh`. Expected: every script prints `PASS`. (`check_python.sh` stops PHP temporarily; restart it if needed.)
- [ ] **Step 4: Browser matrix** (built-in browser; take a second screenshot after navigation, the first can be stale): 1440x900, 2560x1440, 768x1024, 375x812, 320x640. For each: `documentElement.scrollWidth <= innerWidth`, headline at most two lines at desktop widths, no overlapping text, `GET /api/delete-item` wraps without overflow at 320. Vitals `OK` with the stack up and per-tile `FAIL:` with Python stopped (restart it).
- [ ] **Step 5: Cross-origin behaviour.** Open `http://localhost:3001/?redirectTo=%2Fproduct`: lands on `http://localhost:3000/?redirectTo=%2Fproduct` with the page intact. Scroll the landing page halfway, open `http://localhost:3001/`, press Back: the landing page is restored (bfcache or reload) with settled patches, no stuck tilt, hero not re-hidden.
- [ ] **Step 6: Motion and accessibility.** Emulate `prefers-reduced-motion: reduce`: everything static, stitches drawn, no pins. Tab through the page: visible accent outline on every link and button, anchors reach the right sections. Compute the contrast ratio of `#9aa39c` on `#0a0c0b` and `#0f1311` at the sizes used (AA); lighten the muted token if any size fails. Confirm no screen flash during the first two seconds (sample the page luminance per frame; no full-viewport change).
- [ ] **Step 7: No-JS look.** Read the raw HTML of `/` with JavaScript disabled and confirm all copy is present; only the canvas and seams are absent.
- [ ] **Step 8: Fix findings** one at a time with a failing check first when a check can express it; re-run the affected steps.
- [ ] **Step 9: Commit** any fixes `fix: landing verification findings` (skip if none).

### Task 12: Docs close-out

**Files:**
- Modify: `docs/LANDING_DESIGN.md`, `docs/STATE.md`, `docs/INDEX.md`, `docs/frontend/SETUP.md`, `docs/PHASE1_DESIGN.md`, `docs/ROADMAP.md`, `docs/IMPLEMENTATION_PLAN.md` (only statements the change made false)
- Delete: `docs/assets/landing-draft/` (and `docs/assets/` if then empty)
- Move: this plan to `docs/_archive/plans/` (`git mv`)

- [ ] **Step 1: Edit the spec in place.** `docs/LANDING_DESIGN.md`: `status: current`, remove the "Not yet implemented" banner, every "(author's call)" marker and every pointer to the draft file; state shipped facts in the present tense (file layout under `landing/`, the shared `lightning` ref, the 8 second vitals watchdog, no sparks on mobile). Bump `updated:`.
- [ ] **Step 2: Edit `docs/STATE.md`** in place: Shipped gets the landing page and the two-origin topology with how it is verified (`tests/landing/*`); Next up keeps the Phase 2 junior batch and adds "when a challenge page ships: set its `built` flag in `landing/lib/challenges.ts` and extend `tests/landing/check_routing.sh`; legacy pages link home with the absolute `NEXT_PUBLIC_LANDING_URL`". Bump `updated:`.
- [ ] **Step 3: Fix the other living docs.** `docs/frontend/SETUP.md`: describe both apps, ports 3000 and 3001, the legacy `/` redirect, that `pages/index.tsx` in `frontend/` is the redirect and not a page index, and that the landing page is the one deliberately polished surface (the "styling is intentionally mixed" rule applies to the challenge pages). Grep `docs/` (excluding `_archive/`) for `3000`, `localhost:3000` and `frontend` statements the move made false (`PHASE1_DESIGN.md`, `ROADMAP.md`, `IMPLEMENTATION_PLAN.md`) and edit them in place. Bump `updated:` on every touched doc.
- [ ] **Step 4: Remove the draft and retire the plan.** Delete `docs/assets/landing-draft/`; `git mv docs/plans/2026-10-23-landing-page.md docs/_archive/plans/`; set its `status: done`; remove its INDEX line; set the spec's INDEX line to `current`.
- [ ] **Step 5: Verify.** Run: `python3 scripts/docs_lint.py`. Expected: `0 error(s), 0 warning(s)`. Also `grep -rn "pull-the-lever" README.md CONTRIBUTING.md SECURITY.md CODE_OF_CONDUCT.md .github landing/app landing/components frontend/pages` finds nothing.
- [ ] **Step 6: Commit** `docs: record the landing page and two-origin topology as shipped`.
