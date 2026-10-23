---
id: ops-ideas
type: ops
status: current
updated: 2026-08-24
scope: [ideas]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# Frankenstein — Idea Backlog

Everything discussed during brainstorming, captured so nothing is lost. Items here are not all committed — this is the pool we draw from when building batches. Decisions that are locked are marked ✅.

## Concept & mechanics

- ✅ Deliberately-bad-but-working web app for hiring assignments, challenges, portfolios, onboarding.
- ✅ Community-first; growth and shareability over label purity.
- ✅ `main` is permanently broken; only ever worsened, never fixed.
- ✅ Solutions = Pull Requests that are **never merged**.
- ✅ Voting = GitHub 👍 reactions; top-👍 PR per issue = crowd's best answer.
- ✅ Fully open; not worried about being reused as a hiring answer key.
- ✅ Issues tagged by discipline, language, and difficulty (junior/mid/senior/lead).
- ✅ Leaderboard via GitHub Action for retention.
- ✅ "Dr. Frankenstein" maintainer persona commits new horrors / reintroduces bugs to keep the cycle alive.
- Idea: "Hall of Shame" README section screenshotting the worst features for HN/Reddit virality.
- Idea: only the *data* (best solution per issue type) is the long-term asset, even though community is the near-term focus.

## Architecture

- ✅ Polyglot legacy mess: Next.js → Python API → PHP service, sharing a DB two services write to.
- ✅ Realistic legacy tone with a backstory (2014 PHP → 2019 half-migration to Python → 2023 Next.js rewrite).
- ✅ Bad code both *within* layers and at the *seams* between services.
- ✅ Setup is deliberately broken but **survivable** (pinned workaround always exists).
- Cross-service bug ideas: PHP timestamps vs Python ISO vs JS parsing; `[]` vs `{}` serialization; no shared contract/OpenAPI; auth done 3 ways; synchronous cross-network N+1; float money math mismatches.

## Frontend "bad" catalog (raw pool)

- Legacy / unused / duplicate dependencies (same problem solved multiple ways).
- Mixed language discipline: pure JS, correct TS, and `any`-everywhere TS coexisting.
- Partially refactored code.
- Mixed styling: pure CSS, inline styles, SCSS, Tailwind — ideally **one approach per page** so inconsistency is navigable.
- Custom hooks that make things worse.
- Wrong usage of localStorage / sessionStorage / IndexedDB.
- Wrong query params, unreachable paths, non-existing paths.
- Workarounds for problems that have trivial solutions.
- Dumb features: newsletter popup every 3s; cookie banner covering the accept button; infinite scroll + pagination together; dark mode toggle that changes one div; case-sensitive exact-match search; captcha to log out; loading spinner that never resolves while content loads behind it; form that clears on validation error; "1 item in cart" that's always there; comic-sans error messages.

## Backend "bad" catalog (raw pool)

- Non-existing / wrong endpoints.
- Writing to DB before checks/success.
- Sensitive data sent openly.
- Wrong rate limits (or on the wrong thing).
- Wrong authn/authz.
- IDOR (fetch anyone's record by changing the ID).
- No pagination (returns everything).
- `SELECT *` + N+1 queries.
- No DB transactions; partial writes.
- Race conditions (no locking) — oversell stock/balance.
- Mass assignment (trusts every client field, e.g. `isAdmin`).
- Float money math that doesn't reconcile across services.
- Wrong HTTP semantics (GET mutates, DELETE via GET).
- Wrong status codes (200 with error body; 500 for validation).
- No input validation.
- Inconsistent response shapes.
- Two live API versions that differ subtly.
- No idempotency on payments (double charge on retry).
- SQL injection via string concatenation.
- Plaintext / MD5 passwords.
- Secrets in repo / in `NEXT_PUBLIC_`.
- CORS `*` with credentials.
- Verbose stack traces leaked to client.
- Logs recording PII / full card numbers.
- No timeout on inter-service calls.
- Sync long task blocking request (no queue).
- Cache never invalidated / per-user data cached globally.
- Missing indexes.
- Retry storm (no backoff).

## QA challenge ideas

- Bug bounty: planted undocumented bugs; best-documented report wins 👍.
- Write test plans for broken features (expected vs actual + edge cases).
- Automation challenge made hard by no `data-testid`, dynamic IDs, no ARIA.
- Regression suite vs Dr. Frankenstein's reintroduced bugs.
- API/contract testing catching Python↔PHP seam bugs.
- Edge-case hunting (negative quantities, emoji, huge input, SQL in fields).
- Cross-browser / responsive / a11y sweeps.
- "Bugs found" leaderboard.

## PM challenge ideas

- Reconcile contradictory issue/README/comment requirements into an authoritative spec.
- Write a feature spec from incomplete/wrong docs.
- Write acceptance criteria for a vague feature.
- Sprint prioritization from a tagged backlog with fixed capacity.
- Migration roadmap (PHP→Python) with phases, dependencies, risk.
- Turn "make it faster" into measurable requirements.
- Release notes for a confusing change.
- Bug-vs-feature calls.

## Designer challenge ideas

- Redesign a specific bad screen (popups, cookie banner, broken form).
- UX/heuristic audit of a flow.
- Design-system cleanup (5 blues, 3 button styles, random spacing) → tokens.
- Design missing empty/loading/error states.
- Accessibility redesign (contrast, focus rings, touch targets).
- IA/navigation redesign (unreachable pages, confusing menu).
- UX writing (rewrite bad error messages).
- Cross-role: designer proposes, FE dev implements as a never-merged PR.

## Product Owner challenge ideas

- Backlog grooming (dedupe, rank the messy tracker).
- Value-vs-effort prioritization (RICE) with defense.
- Build/kill decisions with rationale.
- ROI business case (is the PHP→Python migration worth it?).
- MVP/release scoping ("only 5 fixes — which?").
- Define KPIs/OKRs for a doomed product.
- Accept/reject completed work vs acceptance criteria (ties PO↔QA↔PM).
- Stakeholder conflict resolution.
- Note: keep PO (value/ownership) distinct from PM (execution/delivery).

## Seniority framing

- ✅ Every discipline's catalog must span junior → lead.
- Junior = obvious, self-contained flaws. Lead = systemic/architectural flaws spanning services.

## Accessibility (a11y) — new challenge line

Serves designers + frontend + a QA a11y-audit track (target WCAG 2.1 AA).

- Near-zero contrast ratios.
- Broken DOM tab order; keyboard navigation disabled.
- Unannounced dynamic updates (missing `aria-live` / roles) — screen readers hear nothing.
- Countdown timers that lock out input.
- Misleading modal close ('X') targets; focus not trapped in modals.
- Inverted color cues (red = confirm, green = cancel).

## More dark-pattern / UX bad ideas (extends `/deals`)

- "Next" button styled as a disabled/inactive link.
- Dynamic form field resets mid-entry.
- Aggressively strict, non-intuitive input masks.

## More API / backend bad ideas

- Schema drift: endpoints accept unpredictable payload types; required fields not enforced.
- Non-idempotent retries (duplicate side effects on retry).
- Erratic cookie expiration; flaky webhooks.
- Pagination boundary bugs (off-by-one, last page, page beyond range).
- Concurrent voting double-count / DB lock — explicit senior race-condition challenge.

## Challenge formats & mechanics

- **Auto-detecting score:** a bot runs a hidden test against a submitted PR and marks the challenge solved (a signal beyond raw 👍).
- **CTF / team mode:** time-boxed team competitions for hiring events and inter-company challenges.
- **Contract-writing deliverables (PO/PM):** pair a broken API with "write the standardized error-payload schema + OpenAPI contract it should honor."
- **Safe-refactor challenge (senior/lead):** write characterization tests for an untested legacy module, then add a new rule without changing existing behavior. (Native to our own code — no external module.)

## ✅ Flagship scenario — Venue seat booking (Go + Redis) — LOCKED into official architecture

Real-world-inspired. A React/Next page loads a **ThreeJS venue map** (venue stored as a JSON blob in the DB). Clicking a seat goes **FE → PHP BE → Go booking service → back to FE**, with **Redis** holding seat locks/holds. Introduces two new stack members (Go, Redis) and a genuinely hard concurrency domain — ideal senior/lead + cross-service material, and a whole new language community (Go).

**Backstory hook:** the 2021 attempt to survive high-demand on-sales — a Go microservice + Redis bolted onto the PHP booking path by a team that has since left.

**Concurrency / correctness (senior/lead):**
- No lock → two users reserve the same seat, both succeed (double-booking).
- Check-then-set race in Go: `GET status` then `SET reserved`, non-atomic (should be `SETNX` / Lua).
- Redis lock with no TTL → a crashed request locks a seat forever (ghost seats).
- Redis lock TTL too short → expires mid-flow → double booking.
- Holds never released (no TTL) → venue fills with unconfirmed ghost reservations.
- Redis (holds) and DB (confirmed) drift; no reconciliation.
- Reservation written to DB before the hold/lock is acquired.
- No idempotency: a double-click creates two reservations.

**Seams (Go ↔ PHP ↔ FE):**
- PHP calls Go synchronously with no timeout → Go slow → FE spinner forever.
- Retry storm when Go is down (no backoff / circuit breaker).
- `int64` seat IDs from Go truncated/floated by PHP on large venues.
- JSON field-name / enum / boolean mismatches across Go ↔ PHP ↔ JS.
- Hold-expiry timezone/format differs between Go and PHP.
- Go returns an error; PHP swallows it and returns success to FE.

**Frontend / ThreeJS:**
- Loads the entire venue JSON on every render; parses on the main thread → frozen UI, no loading state.
- Every seat a separate mesh (no instancing) → FPS tanks on big venues.
- ThreeJS geometries/materials never disposed on unmount → memory leak.
- Optimistic UI marks a seat reserved before confirmation and never rolls back on failure.
- Double-click sends two requests; no disable/debounce after click.
- Whole map re-polled every 500ms instead of deltas/websocket.

**Data modeling:**
- Whole venue in one JSON blob/row → must load/rewrite the entire venue to change one seat.
- Seat availability computed by scanning the full JSON each request.
- No optimistic-concurrency/version on the venue JSON → concurrent edits lost (last write wins).

**Go-specific (junior→mid for Go devs):**
- Goroutine leaks; goroutines that never exit.
- Shared map written by multiple goroutines without a mutex → data race / panic.
- Unbuffered channel deadlock.
- Errors ignored (`_ =`); no `context`/timeout on downstream calls.
- Seat holds kept in a global in-memory map instead of Redis (lost on restart, not shared across instances).

**Redis-specific:**
- Confirmed bookings stored only in Redis (data loss on eviction/restart).
- `KEYS *` to scan seats in production.
- Giant JSON under one key; whole-venue `SET` on every seat change.
- New connection per request (no pooling).

This scenario alone can seed an entire senior/lead + Go + cross-service batch, plus QA concurrency/automation challenges and a PO "how do we guarantee no double-booking?" spec challenge. **Locked ✅:** now part of the official stack — Go + Redis added, diagrams and lore updated in `README.md`, `PROJECT.md`, and `backend/SETUP.md`. Implementation docs land in the senior/lead batch.

## ✅ Deliberately outdated versions — upgrade challenges

Every technology is pinned **a major version or two behind** on purpose. A distinct class of bad solution is one whose best fix is *not* a rewrite but an **upgrade + adoption of the newer idiomatic API/hook/pattern**. This tests whether a contributor knows how the ecosystem has evolved — strong hiring signal. Pins are explicit (lockfiles, `go.mod`, `composer.json`, `pyproject.toml`); this coexists with the "unpinned deps" mess elsewhere, which is realistically inconsistent.

Keep versions **old-but-not-fossil** so the upgrade is a realistic 1–2 major bumps, not an archaeology dig.

| Tech | Pinned (bad) | Upgrade unlocks (the intended fix) |
|---|---|---|
| React | 17.x | 18/19: automatic batching, `useId`, `useTransition`, `useDeferredValue`, `createRoot`, `useSyncExternalStore`; (19) `use`, Actions, `useOptimistic`, `useFormStatus` |
| Next.js | 13.x (mixed Pages + App router) | modern App Router, Server Actions, `next/font`, image improvements |
| Node | 16 (EOL) | 20/22: native `fetch`, built-in test runner, performance |
| TypeScript | 4.5 | 5.x: `satisfies`, `const` type params, modern decorators |
| Python | 3.8 (EOL) | 3.11/3.12: `match`, `X | Y` unions, `list[..]` generics, tz-aware datetime, speed |
| Pydantic | v1 | v2: `model_validate`/`model_dump`, `field_validator`, big perf gains |
| PHP | 7.4 (EOL) | 8.1+: enums, `match`, constructor promotion, `readonly`, nullsafe `?->`, strict types, JIT |
| Go | 1.19 | 1.21/1.22: `slices`/`maps` stdlib, `min`/`max`, `errors.Join`, **fixed loop-variable capture**, generics adoption |
| Misc deps | `moment.js`, `node-fetch` polyfill, old `axios` | native `Intl`/`date-fns`/`Temporal`, native `fetch` |

**Example upgrade-fixable flaws (by level):**

- **[junior]** `moment.js` used just to format the profile join date — heavy, deprecated. Fix: drop it for native `Intl.DateTimeFormat`.
- **[junior/mid]** Node 16 relying on a `node-fetch` polyfill. Fix: upgrade, use native `fetch`.
- **[mid]** React 17: hand-rolled unique IDs (SSR mismatch bugs) and `ReactDOM.render`. Fix: React 18 + `useId` + `createRoot` + automatic batching.
- **[mid]** TS 4.5: awkward casts where `satisfies` belongs. Fix: TS 5 + `satisfies`.
- **[mid]** Python 3.8: long `if/elif` chains screaming for `match`; `Optional[List[int]]`; `datetime.utcnow()`. Fix: 3.12 + `match` + modern typing + tz-aware datetimes.
- **[senior]** Pydantic v1 (`.dict()`, `@validator`, `Config`). Fix: migrate to v2.
- **[mid/senior]** PHP 7.4: string status constants + `switch`, manual constructor assignment, `array()`, loose `==`. Fix: PHP 8.1 enums + `match` + constructor promotion + strict types — *also closes the type-juggling auth bug in `php/02`.*
- **[senior]** Go 1.19: the classic **loop-variable capture** bug in the seat-booking goroutines (every goroutine sees the last seat). Fix: upgrade to Go 1.22 (semantics fixed) or capture correctly; adopt `slices`/`maps`/generics. *Ties directly into the concurrency flagship.*

**Cross-links worth noting:** the PHP `==` auth bug and the Go loop-var concurrency bug are each fixable from *two* angles (correct the code, or upgrade the platform) — great for showing multiple valid solutions competing on 👍.

## ✅ Dependency & migration challenges

Builds on "Deliberately outdated versions," but these test managing breaking change at the **graph / architecture / scale** level, not a single-package bump. Primary audience: senior devs, tech leads, and the new **DevOps/DevSecOps** discipline.

- **Transitive / lockfile / peer-dependency conflicts.** Seed the tree so an upgrade triggers `npm ERESOLVE`, diamond conflicts (two sub-deps needing incompatible versions of a third library), and mismatched `@types/*`. Fix: `overrides`/`resolutions`, deduping, and graph untangling. Elevates the existing "duplicate dependencies" idea from cosmetic to a real puzzle. `[senior / devops]`
- **Supply-chain / known-CVE remediation.** Pin specific old libraries that carry *public CVEs*. Challenge: detect them (`npm audit` / SCA / Dependabot-style scanning), bump them, resolve the breaking patch, and prove no regression. On-brand — the app is already intentionally vulnerable. ⚠️ **Label clearly as an intentional lab**, since these are real CVEs in a public, running app. `[devsecops / security]`
- **Framework coupling → dependency inversion (architecture).** Business logic entangled with framework/ORM/serialization annotations so the framework can't be upgraded without breaking the domain (e.g., Pydantic models used directly as domain models; business logic living in route handlers; PHP logic fused with `mysqli`). Fix: extract interfaces / ports-and-adapters so the framework or library can be swapped with zero domain changes. Connects the upgrade theme to the architecture theme. `[senior/lead]`
- **Codemod-scale migration.** Repeat a legacy pattern across *many* components (e.g., React class components with `componentWillReceiveProps` everywhere) so the fix is a written/applied AST codemod (jscodeshift-style), not a per-file edit. The senior version of our upgrade challenges. Coexists with the one-bad-pattern-per-page rule — same pattern repeated, one codemod fixes all. `[senior]`
- **Cross-cutting rule:** every upgrade/migration challenge should require *proving no behavior change* — pairs naturally with the QA characterization-tests angle.

These, plus the deliberately broken setup, lockfile mess, and CI/deploy path, anchor the new **DevOps/DevSecOps** discipline (see below).

## ✅ Disciplines (now seven)

Frontend, Backend (Python + PHP + Go), QA, PM, Design, Product Owner, and **DevOps/DevSecOps**. The last is newly added: it owns the broken setup, missing env docs, the container/DB race, dependency/lockfile/peer conflicts, CVE remediation, and CI/deploy gatekeeping. Now official in `PROJECT.md` and `README.md`; its bad-solutions catalog will follow in a later batch.

## ✅ Deliberately bad ARCHITECTURE — the "distributed monolith"

Goal: the system's *architecture* is as bad as the code inside it. The meta-framing: it's a **distributed monolith** — the operational pain of microservices with the tight coupling of a monolith. Worst of both worlds, and the flagship **lead/architect** challenge ("how would you actually decompose or recombine this without downtime?").

Architectural anti-patterns to bake in:

- **Polyglot for no reason** — four languages where one would do; each service a different stack, style, and tooling.
- **No single entry point / no gateway** — the FE calls the Python API for most things but hits PHP *directly* for seat booking (already locked). Clients must know the topology.
- **Integration-by-database** — Python, PHP (and Go via PHP) read/write the same tables with no clear ownership; the DB *is* the integration layer, so a schema change anywhere breaks others.
- **Circular service calls** — Python → PHP → back into Python for some flows; no clear dependency direction.
- **Duplicated business logic across services** — price/total computed in both Python and PHP with subtly different rounding → results that don't reconcile.
- **No shared contracts** — no OpenAPI/schema/typed clients between services; loosely-typed JSON passed around; rename a field and things break silently.
- **Three ways to do everything** — auth (JWT / session cookie / hardcoded API key), config (env / `.ini` / hardcoded / JSON), error handling, date formats.
- **Inconsistent communication styles** — sync REST here, direct DB writes there, Redis as ad-hoc IPC; a queue absent where you'd want one and (later) present where you wouldn't.
- **God service + anemic services** — PHP does too much (payments, PDFs, booking entry, lookups); others are thin pass-throughs.
- **Distributed-monolith deployability** — nothing deploys independently (shared DB + synchronous chains), yet ops are *split into separate startups* anyway (see the separate-startup decision) → the pain of distribution without the benefit.
- **Wrong state placement** — durable data in Redis (evictable), session/ephemeral data in the DB, secrets in `NEXT_PUBLIC_`, business state in the frontend.
- **Structure that lies** — repo layout doesn't match runtime/service boundaries; shared code copy-pasted rather than shared.
- **No layering within services** — controllers reach into other services' internals / DB tables directly; no domain layer (feeds the dependency-inversion challenge).
- **Version chaos** — `/v1` and `/v2` coexist and diverge; no deprecation path.

Challenge value: prime **lead/architect + PM/PO** territory ("map the architecture, identify the coupling, propose a migration — consolidate? real boundaries? add a gateway + contracts? — with no downtime"). Feeds `architecture`-tagged issues and the framework-coupling/dependency-inversion challenges.

## ✅ Deliberately MESSY code & project organization (cross-cutting)

Distinct from per-feature flaws: pervasive, low-grade mess spanning every page/service and every seniority (juniors spot obvious misplacement; leads spot systemic inconsistency). Use as many as possible and **sprinkle throughout** rather than concentrating.

**Project / folder organization (FE):**
- Proper folders exist (`components/`, `hooks/`, `utils/`, `reducers/`, `contexts/`) but some hooks/components/utils/reducers are dumped directly inside a page/section/component folder instead — no consistent colocation strategy. *(the owner's example)*
- Mixed philosophies: some features colocated by feature, others split by type — inconsistently.
- Barrel `index.ts` in some folders, not others; some re-export everything, some nothing; a few create circular imports.
- Duplicate utilities: the same helper (date format, currency, debounce) reimplemented in 3 places, slightly differently.
- Giant files (a 2000-line `page.tsx`) next to over-fragmented one-line-component files.
- Inconsistent file naming: `PascalCase.tsx` vs `camelCase.tsx` vs `kebab-case.tsx`; `.jsx` and `.tsx` mixed.
- Tests (where they exist) placed inconsistently: some `__tests__/`, some `*.test.tsx` beside the file, most missing.

**Code style / patterns (FE):**
- Class and function components coexist for no reason.
- State managed four ways for similar data: Redux + Context + prop-drilling + local `useState`.
- Mixed async: `.then()` chains and `async/await` intermixed, sometimes in one function.
- Data fetching everywhere: in `useEffect`, event handlers, inside components, occasionally a service layer — no single approach.
- Inconsistent imports: relative `../../../` and alias `@/` mixed; deep imports into other modules' internals.
- Inconsistent error handling: some `try/catch`, some swallowed, some unhandled.
- Magic numbers/strings inline; a `constants.ts` exists but is half-ignored.
- Copy-pasted components with tiny variations instead of one parameterized component.
- Business logic in the view layer.
- Linter/formatter effectively off: `eslint-disable` littered, no/ignored Prettier → inconsistent quotes, semicolons, indentation, trailing commas.
- Leftover `console.log`, dead code, commented-out blocks, stale `TODO`/`FIXME`/`HACK` (some dated years back).
- Comments in mixed languages / misleading comments that contradict the code.

**Backend parallels (Python / PHP / Go):**
- Business logic in route handlers; a 1500-line `utils.py` / `helpers.php`; no service/domain layer.
- Inconsistent module structure across services; duplicated logic (the price calc again).
- Mixed sync/async (Python); mixed procedural/OO (PHP); ignored errors (Go `_ =`).
- Inconsistent response shapes and error handling per endpoint.
- Config read inline in random places; magic values; commented-out code and TODOs.
- Naming inconsistency: `snake_case`/`camelCase` mixed within a single service.

## ✅ Real-world-sourced ideas — from seat-map-creator / seat-map-view / seat-map-creator-svg

🔒 **Private provenance note — do not mention these source repos anywhere public.** These are patterns found by auditing three of the owner's real past projects (a seat-map creator on 2019-era CRA + Express, its companion renderer package, and a 2023 Gatsby/TS rewrite). They're kept here so we don't lose *why* each idea is credible, but every public-facing doc (issues, README, page docs) must describe the flaw generically — never name or imply the source project. Reimplement fresh inside Frankenstein's own stack (Next.js/Python/PHP/Go); don't import any of this code or its dependencies.

Rated by how much stronger they are than what we'd invented — top picks first.

**No-auth, single-shared-file "database" (backend).** The Express backend has zero authentication and stores its entire state in one `venue.json` / `sample.png` on disk — every client reads and writes the *same* file, so two "different" venues are silently the same venue. Stronger than our existing IDOR/no-multi-tenancy ideas because it's not even row-level — there's no isolation concept at all. **Adapt directly** as a Python or PHP junior/mid challenge: an endpoint that "saves the venue" to one global record with no user/tenant scoping. `[junior/mid, backend]`

**Double-response / crash-on-error bug (backend).** A handler performs two independent `fs.writeFile`s, each able to send a `500` on failure, then unconditionally sends a `200` afterward regardless — triggers "Cannot set headers after they are sent" whenever either write fails. A sibling handler does `if (err) throw err` inside an fs callback, which crashes the whole process instead of returning `500`. Two distinct, very specific error-handling flaws in adjacent code. **Adapt directly** as two separate junior BE issues (Python or PHP): "handler sends a response after already sending one" and "unhandled error in a callback takes down the process." `[junior, backend]`

**Dual-schema conversion layer (architecture/migration).** Real code has two live venue-data shapes (`seatmap` array-based old structure vs `groups` newer structure) coexisting, with dedicated `mergeData`/`splitData`-style modules whose only job is converting between them on every read/write — evidence of a schema migration that was started but never finished. Stronger than our generic "framework coupling" idea. **Adapt** as a mid/senior migration challenge: two endpoints/tables represent the same entity differently, with an ever-growing translation layer between them; the fix is picking one shape and completing the migration. `[mid/senior, backend, architecture]`

**Copy-pasted component fork instead of a prop (messy code).** A component and its entire stylesheet were duplicated wholesale for a client variant (different suffix, ~half the lines removed/changed) instead of adding a variant prop — both the `.js` and its `.css` forked in parallel. Stronger than our generic "copy-pasted components" bullet because it shows the *whole vertical slice* (component + styles) forked. **Adapt directly** into the messy-code catalog and/or a dedicated FE page: two near-identical components/stylesheets where a `variant` prop was clearly warranted. `[junior/mid, frontend]`

**Decorative TypeScript strictness (upgrade/TS-discipline, sharper than our `/profile` page).** `tsconfig.json` has `"strict": true`, but the build script is a bundler/transpiler (Babel-based) that strips types without ever running `tsc` — so nothing is actually type-checked, and hooks/components have fully untyped parameters (implicit `any`, not even the explicit keyword) that would fail strict mode if it were enforced. This is a *better* version of "TS in name only" than an explicit `any` everywhere: the config looks rigorous but is theater. **Strongly consider replacing or supplementing** the junior `/profile` `any`-everywhere page with this variant — the fix isn't "remove `any`," it's "wire `tsc --noEmit` into the actual build/CI so strict mode is real." `[junior/mid, frontend, devops]`

**Leftover scaffold identity (messy code / DevOps).** `package.json` still has `"name": "gatsby-starter-default"` (the framework's own starter name, never renamed) and `"test": "echo \"Write tests! -> ...\" && exit 1"` (the scaffold's placeholder test script, still in place — so `npm test` always "fails with a reminder" and clearly nobody runs it). Small but very authentic. **Adapt** as a couple of one-line easter eggs in Frankenstein's own `package.json`/CI: an unrenamed placeholder project name, and a stub `test` script that never got replaced. `[junior, devops]`

**`window.onresize =` / `window.onkeydown =` with a fake-Firefox-bug workaround (workaround-for-a-simple-problem, frontend).** Global handlers assigned via property (not `addEventListener`, so only one handler can ever exist and nothing is cleaned up on unmount), and the resize handler's fix for "reload not working in Firefox" is `window.location.href = window.location.href` — a full page reload on every resize, with a comment blaming the browser for what's actually the app's own bug. Excellent, ready-to-use example for the existing "workaround for an issue with a simple solution" FE category. **Adapt directly.** `[junior/mid, frontend]`

**postMessage origin-bypass (security, frontend).** An iframe-bridge HOC accepts cross-frame messages whenever a configured origin equals `'*'` (i.e., "trust everyone" is a valid config value, not just "unset"), plus `JSON.parse(e.data)` with no try/catch, plus a `message` listener added in `componentDidMount` with no removal in `componentWillUnmount`. A real CWE-346 instance, not contrived. **Adapt directly** as a mid/senior FE security challenge on any postMessage-based integration (e.g., an embed/widget feature). `[mid/senior, frontend, security]`

**Direct state mutation inside a hook (frontend, subtle).** Inside a mouse-drawing hook, a `useState` value is mutated in place (`currentPoint.y = startPoint.y`) instead of replacing it with a new object — the kind of bug that "mostly works" and only shows up as stale/inconsistent renders under specific interaction sequences. Good senior-level "looks fine, isn't" material. **Adapt** into a mid/senior FE challenge involving drag/draw interactions (relevant to the seat-booking flagship's canvas work). `[mid/senior, frontend]`

**Duplicate functions with a fake distinction (backend/frontend utility, minor).** An `addData`/`updateData` pair in an IndexedDB wrapper are byte-for-byte identical implementations under different names, with no error handling around `openDB` (breaks in Safari private browsing), and the wrapper's data interface is named `IMyData` — an unrenamed copy-paste from library example code. Minor but authentic; folds into the existing localStorage/IndexedDB-misuse catalog rather than needing its own page. `[junior, frontend]`

**`shouldComponentUpdate` used for side effects instead of its actual purpose (frontend, subtle).** A class component's `shouldComponentUpdate` runs dispatches/`setTimeout`s based on prop diffs but always `return true`s regardless — so the lifecycle hook whose entire purpose is skipping renders never actually skips one; the perf optimization is fully inert. Good "looks like an optimization, isn't" mid-level React-class-era challenge, pairs with the React 17→18 upgrade material (`useMemo`/`useEffect` doing this correctly). `[mid, frontend]`

**Validated, not new:** the old projects run genuinely outdated pinned versions (2019 CRA-era toolchain in one, a Three.js version old enough to still use the removed `THREE.Geometry()` class) — this doesn't add a new idea, but it's real-world confirmation that our "deliberately outdated dependencies" design (see above) reflects how actual projects drift, not an invented scenario.

Seniority spread: **junior** = obvious misplacement, dead code, `console.log`, naming. **mid** = inconsistent state/async/fetching patterns, duplicate utils. **senior/lead** = systemic organization strategy, barrel/circular-import cleanup, establishing consistent conventions repo-wide (a `tech-debt`/`architecture` challenge). Also great for QA (find the inconsistencies) and a lead "define and enforce conventions" challenge.
