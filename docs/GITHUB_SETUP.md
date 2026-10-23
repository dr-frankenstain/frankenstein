---
id: ops-github-setup
type: ops
status: current
updated: 2026-08-10
scope: [github, setup]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# GitHub Repository Configuration — Project Frankenstein

How to configure the repo so it serves Frankenstein's inverted model rather than fighting it. Read `PROJECT.md` first for the mechanics; this doc turns them into concrete GitHub settings.

> **The guiding principle:** `main` is permanently broken and only ever *worsened*. **Solutions are Pull Requests that are never merged.** Voting is 👍 reactions. Almost every GitHub default assumes the opposite (that PRs get merged and code improves), so we deliberately reconfigure or guard those defaults below.

---

## 0. The one thing to internalize first

There are **three kinds of change** in this repo, and the whole config exists to keep them separate:

| Kind | Who | Example | Merges to `main`? |
|---|---|---|---|
| **Solution** | Contributors (from a fork) | "Here's how I'd fix the SQL injection" | **Never** — it's an answer, not a change |
| **Worsening** | Maintainers / Dr. Frankenstein | "Add a new race condition to booking" | **Yes** (the *only* app changes that land) |
| **Meta** | Maintainers | Docs, CI, leaderboard, hosting config | **Yes** — project tooling is maintained normally |

The app code is never *improved*. The project's own tooling (docs, workflows, leaderboard) is maintained like any normal repo. Keep that distinction crisp — it resolves almost every "wait, are we allowed to merge this?" question.

---

## 1. Repository settings

**Visibility:** private now, public at launch. Do the full pre-launch checklist (§14) before flipping — once public, history is public.

**Features (Settings → General → Features):**

- **Issues:** ON — issues are the challenges.
- **Discussions:** ON — the meta layer (setup help, non-code deliverables, announcements).
- **Projects:** ON — the batch roadmap board.
- **Wiki:** OFF — all docs live in `docs_local/` and are version-controlled.
- **Sponsorships:** optional.
- **Forking:** **ON** — contributors submit from forks; this is essential, do not disable.

**Pull Requests (Settings → General → Pull Requests):**

- **Allow merge commits:** OFF.
- **Allow squash merging:** ON — the only merge method (for worsening/meta PRs). Set default squash commit message to "PR title and description."
- **Allow rebase merging:** OFF.
- **Allow auto-merge:** **OFF** — critical. Auto-merge is how a solution PR could get merged by accident.
- **Automatically delete head branches:** ON (applies to maintainer branches; fork branches are unaffected).

**Default branch:** `main`.

> **Plan note:** full branch protection / rulesets require the repo to be **public** or on a **paid plan** (Pro/Team/Enterprise). While it's a free private repo, treat the rules below as policy; they become enforceable once public or paid.

---

## 2. Branch naming conventions

Contributors work in **their own fork** and open PRs against `upstream/main`. Maintainers work in branches on the main repo. Use these prefixes so both humans and automation can parse intent. (GitHub can't natively reject a mis-named branch, so this is convention + an optional CI lint; see §12.)

| Prefix | Who | Purpose | Target | Merged? |
|---|---|---|---|---|
| `solution/<issue#>-<slug>` | Contributors (fork) | One answer to one issue | `main` (PR only) | **Never** |
| `worsen/<slug>` | Maintainers / Dr. Frankenstein | Add or intensify badness | `main` | Yes (squash) |
| `docs_local/<slug>` | Maintainers | Documentation only | `main` | Yes |
| `ci/<slug>` | Maintainers | Workflows / automation | `main` | Yes |
| `chore/<slug>` | Maintainers | Repo meta, tooling, deps machinery | `main` | Yes |
| `infra/<slug>` | Maintainers | Hosting / deploy config | `main` | Yes |

Examples: `solution/42-input-validation`, `worsen/booking-lock-ttl`, `docs_local/mid-batch-catalog`, `ci/leaderboard-action`.

Rules of thumb: lowercase, kebab-case, no personal names, always start with the issue number for `solution/*` so automation can link PR → issue.

---

## 3. Branch protection — `main` ruleset

Create a **branch ruleset** (Settings → Rules → Rulesets) targeting `main`:

- **Restrict who can push:** maintainers team only (contributors can't push regardless, since they fork).
- **Require a pull request before merging:** ON. 1 maintainer approval for worsening/meta PRs.
- **Require status checks to pass:** ON — add the **`challenge-guard`** check (§13). This is the mechanism that makes solution PRs *un-mergeable*: the check fails whenever a PR is labeled `solution`, so the merge button stays blocked even if a maintainer slips.
- **Block force pushes:** ON.
- **Restrict deletions:** ON (nobody deletes `main`).
- **Require linear history:** ON (pairs with squash-only).
- **Require conversation resolution before merging:** ON.
- **Allowed merge methods:** squash only.

Optionally add a **tag ruleset** targeting `refs/tags/*`: restrict tag creation and deletion to maintainers, so the "monster version" tags (§5) stay authoritative.

---

## 4. Why solution PRs stay open (and the alternative)

**Recommended:** solution PRs stay **open indefinitely**. They are the living answer bank — 👍 accumulate on open PRs, the top-voted one per issue is the crowd's best answer, and a scheduled action ranks them. They are closed only if invalid or duplicate.

- **Pro:** the corpus is browsable, votable, and directly comparable per issue.
- **Con:** the open-PR count grows large over time.

**Alternative if that gets unwieldy:** after an issue "matures," a maintainer closes the losing PRs and keeps the top few open with a `top-solution` label. Decide later based on volume; start with "keep open."

Either way: **never merged.** Closing ≠ merging; reactions remain visible on closed PRs.

---

## 5. Tags & releases — "Monster versions"

Because `main` only worsens, use tags/releases as **snapshots of the monster over time** — invaluable for hiring ("complete this assignment against tag `v2.0`").

- **Scheme:** `vMAJOR.MINOR`.
  - **Minor** bump: a new worsening or a batch of new challenges (e.g., `v1.3`).
  - **Major** bump: a whole new subsystem or language (e.g., the Go seat-booking feature → `v2.0`).
- **Release notes = Dr. Frankenstein's changelog:** written in-character, listing the new horrors and the issues they open ("Added: seats can now be double-booked under load. New challenges #120–#128.").
- Tag every worsening so assignments can pin to a fixed state and stay reproducible even as `main` degrades further.

---

## 6. Labels

Define labels in four families. (Colors are suggestions; import them with a labels tool or the API — see §12.)

### **Discipline / language**

| Label | Hex | Meaning |
|---|---|---|
| `frontend` | `#1f6feb` | Next.js/React/TS |
| `python` | `#3572A5` | Python API |
| `php` | `#4F5D95` | PHP legacy service |
| `go` | `#00ADD8` | Go booking service |
| `qa` | `#d876e3` | Testing / bug bounty |
| `pm` | `#0e8a16` | Product management |
| `design` | `#ff69b4` | UI/UX/a11y |
| `po` | `#5319e7` | Product ownership |
| `devops` | `#0052cc` | Setup/CI/deploy |
| `security` | `#b60205` | Security / DevSecOps |

### **Difficulty**

| Label | Hex |
|---|---|
| `junior` | `#c2e0c6` |
| `mid` | `#fef2c0` |
| `senior` | `#f9d0c4` |
| `lead` | `#e99695` |

### **Type / scope**

| Label | Hex | Meaning |
|---|---|---|
| `challenge` | `#0075ca` | A fixable flaw (most issues) |
| `qa-bounty` | `#c5def5` | Undocumented bug to find + report |
| `cross-service` | `#fbca04` | Bug at a service seam |
| `architecture` | `#d93f0b` | Systemic/structural |
| `upgrade-fixable` | `#fef2c0` | Best fixed by upgrading a version |

### **Workflow / status**

| Label | Hex | Meaning |
|---|---|---|
| `solution` | `#6f42c1` | **On PRs** — marks a never-merge answer; triggers `challenge-guard` |
| `top-solution` | `#a371f7` | Current highest-👍 answer for its issue |
| `good-first-challenge` | `#7057ff` | Easy entry point |
| `help-wanted` | `#008672` | Wants more attempts |
| `dr-frankenstein` | `#24292e` | A worsening (maintainer) |
| `needs-triage` | `#ededed` | Unlabeled/unsorted |
| `duplicate` | `#cfd3d7` | — |
| `invalid` | `#e4e669` | — |
| `wontfix-by-design` | `#ffffff` | It's *supposed* to be broken |

---

## 7. Issues (the challenges)

Use **Issue Forms** (`.github/ISSUE_TEMPLATE/*.yml`) so every challenge is well-structured and self-labeling.

**`challenge.yml`** — the main template. Fields:

- Title prefix convention: `[discipline] short description`.
- Dropdown: **Discipline** (frontend/python/php/go/qa/pm/design/po/devops/security) → apply matching label.
- Dropdown: **Difficulty** (junior/mid/senior/lead).
- Input: **Affected page / route / endpoint / service.**
- Textarea: **What's wrong** (the flaw).
- Textarea: **What a good solution shows** (acceptance-style guidance).
- Checkbox: this is a challenge, not a real bug to fix in `main`.

**`qa-bounty.yml`** — for QA-found bugs: repro steps, expected vs. actual, severity, environment.

**`worsening.yml`** — maintainer-only proposal for a new horror (or use Discussions).

**`config.yml`** — disable blank issues; link out to Discussions for "how do I run it?" and non-code (PM/PO/design) deliverables.

Pin a few `good-first-challenge` issues. Keep `needs-triage` on anything unlabeled until a maintainer sorts it.

---

## 8. Pull Requests (the never-merge model)

**Contributor flow:**

1. Fork → branch `solution/<issue#>-<slug>` → implement the fix in the fork.
2. Open a PR against `upstream/main`, title `solution: #<issue> <short summary>`.
3. Automation labels it `solution`, links the referenced issue, and runs `auto-scorer` (hidden tests) to give an objective signal.
4. The community votes with 👍. The `leaderboard` action ranks solutions per issue and applies `top-solution`.
5. The PR **stays open**; `challenge-guard` keeps it un-mergeable. It's closed only if `invalid`/`duplicate`.

**`PULL_REQUEST_TEMPLATE.md`** should include:

- Which issue does this solve? (`Fixes #` is intentionally avoided — that would auto-close the issue on a merge we never do; use `Addresses #<n>` instead.)
- Discipline + difficulty.
- Summary of the approach and trade-offs.
- A required acknowledgement checkbox: **"I understand this PR will not be merged — it's my submitted solution."**
- Self-assessment against the issue's "what a good solution shows."

**Maintainer worsening/meta flow (the only merges):** branch `worsen/*` or `docs|ci|chore|infra/*` → PR → 1 approval → status checks green → **squash merge**. Worsening PRs get the `dr-frankenstein` label and a release/tag when they land (§5).

---

## 9. Discussions

Categories:

- **📌 Getting it to run (God help you)** — pinned; the current setup workaround (the setup is intentionally broken but survivable).
- **Announcements** — Dr. Frankenstein's changelog and batch releases.
- **Propose a horror** — community-suggested worsenings.
- **Non-code challenges (PM / PO / Design)** — where specs, prioritizations, redesigns, and audits are posted and 👍-voted (these aren't PRs).
- **Show & tell / Hall of Shame** — screenshots of the worst features; the viral surface.
- **Q&A / General.**

---

## 10. Projects

One **Project board** as the public roadmap: columns for batches (`Junior ✅`, `Mid`, `Senior/Lead`, `QA/PM/Design/PO/DevOps`, `Ideas`). Lets contributors see what's coming and where help is wanted. Mirrors the roadmap in `PROJECT.md`.

---

## 11. Security configuration (the ironic part)

The app is **intentionally vulnerable**, so GitHub's security automation will try to "help" in ways that undermine the project. Configure deliberately:

- **Dependabot alerts:** **ON** — the alerts themselves are a DevSecOps *challenge* surface.
- **Dependabot security updates:** **OFF** — do **not** let it auto-open PRs that fix the vulnerable deps; that's the contributor's job.
- **Dependabot version updates:** **OFF** — we deliberately pin old versions (see IDEAS → "Deliberately outdated versions").
- **Secret scanning + push protection:** the repo contains *fake* secrets on purpose (a challenge). Push protection will block commits containing them. Either **disable push protection** for this repo, or mark those specific detections as "used in tests / false positive." Document that all committed secrets are fake and non-functional.
- **Code scanning (CodeQL):** optional; if enabled, run it **non-blocking** — it's a way to *surface* vulnerabilities as challenges, not a gate.
- **Private vulnerability reporting:** ON, but see `SECURITY.md` below — the *intentional* vulnerabilities are explicitly out of scope; only flaws in the project's own infrastructure (leaderboard bot, CI, hosting) are in scope.

---

## 12. Required `.github/` and root files

Create these (I can generate them on request):

| File | Purpose |
|---|---|
| `README.md` | ✅ exists — public front door |
| `CONTRIBUTING.md` | **Missing** — the golden rules (never-merge, one issue = one flaw, 👍 voting, forking flow, branch naming). README currently links to it. |
| `CODE_OF_CONDUCT.md` | Community standards |
| `SECURITY.md` | **Important & clever** — "This app is intentionally insecure. Do NOT report the intentional vulnerabilities. Do NOT deploy it with real data. In scope: only the project's own infra." |
| `LICENSE` | Permissive (MIT-style) **plus** a strong disclaimer: intentionally vulnerable, provided as-is, not for production. |
| `.github/ISSUE_TEMPLATE/challenge.yml` / `qa-bounty.yml` / `config.yml` | Issue forms (§7) |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR template (§8) |
| `.github/CODEOWNERS` | Route reviews to maintainers; require maintainer review on `main` |
| `.github/labels.yml` | Source of truth for labels (§6), importable via a labels action |
| `.github/workflows/*.yml` | Automation (§13) |

---

## 13. Automation (GitHub Actions)

| Workflow | Trigger | Does |
|---|---|---|
| **`challenge-guard`** | PR opened/labeled | Fails (as a required check) if the PR is labeled `solution`, making it un-mergeable. The backbone of the never-merge rule. |
| **`auto-labeler`** | PR opened | Labels `solution`, copies discipline/difficulty from the linked issue, comments the "not merged" reminder. |
| **`issue-form-labeler`** | Issue opened/edited | Reads the Discipline/Difficulty dropdown answers from the issue body and applies matching labels; drops `needs-triage` once a discipline is set. |
| **`auto-scorer`** | PR / push | Runs the hidden test(s) for the linked challenge and posts an objective pass/fail signal (complements 👍). |
| **`leaderboard`** | Scheduled (daily) | Reads 👍 reaction counts via the API, ranks solutions per issue, applies `top-solution`, and regenerates the leaderboard section/page. |
| **`label-sync`** | Push to `labels.yml` | Applies the label taxonomy from `.github/labels.yml`. |
| **`branch-name-lint`** | PR opened | Warns if the head branch doesn't match the naming convention (§2). |
| **`stale`** *(optional)* | Scheduled | Manages abandoned `needs-triage` items (never touches `solution` PRs). |

---

## 14. Teams, permissions & the Dr. Frankenstein account

- **`@maintainers` team:** write access; the only ones who merge and tag.
- **A dedicated "Dr. Frankenstein" identity** (a bot/machine account or a shared persona) authors the worsening commits and release notes, so the "monster fights back" theme is consistent and visible in history.
- Everyone else contributes via forks with no direct access — the default for public repos.

---

## 15. Hosting & deploy wiring (`projectfrankenstein.com`)

GitHub Pages can't host this (it's a polyglot full-stack app with Python/PHP/Go/Redis/DB), so hosting is external. On the GitHub side:

- **Environments (Settings → Environments):** create `production`. Add required reviewers and store deploy secrets there (never in the repo — the repo's fake secrets are the *challenge*, real deploy creds are not).
- **Deploy workflow:** an `infra/*`-owned Action that builds the containers and deploys on tag push (so each "monster version" is what's live, matching what assignments pin to).
- **DNS:** at your registrar, point `projectfrankenstein.com` (and `www`) to the host. This is registrar/host configuration, not GitHub.

**⚠️ Critical hosting cautions — you are putting a deliberately vulnerable app on the public internet:**

- Host it **isolated and sandboxed** (its own throwaway VPS/containers, no shared network, no access to anything real).
- **No real user data. Ever.** Seed it with obviously fake data; state should be **ephemeral and auto-reset** on a schedule.
- Put it behind **rate limiting / a WAF** and monitor abuse — an intentionally-injectable public app will be probed and used for mischief.
- Add a **Terms of Use / disclaimer** page: it's a lab, provided as-is, do not submit real data, do not use it to attack others.
- Assume it *will* be compromised and design so that "compromised" costs you nothing.

---

## 16. Pre-launch checklist (private → public)

- [ ] `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `LICENSE` exist.
- [ ] Labels imported from `.github/labels.yml`.
- [ ] Issue forms + PR template in place.
- [ ] `main` ruleset active with `challenge-guard` as a required check.
- [ ] Auto-merge disabled; squash-only confirmed.
- [ ] Dependabot security/version updates OFF; alerts ON; secret-scanning push protection handled.
- [ ] Discussions categories created; "Getting it to run" pinned.
- [ ] First batch of challenge issues opened and labeled (junior FE + BE).
- [ ] A few `good-first-challenge` issues pinned.
- [ ] `production` environment + deploy secrets set; hosting isolated and resettable; ToS page live.
- [ ] No real secrets in history (only intentional fakes); scrub if needed **before** going public.
