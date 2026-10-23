---
id: plan-owner-manual-tasks
type: plan
status: current
updated: 2026-08-10
scope: [owner, manual, tasks]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated,status"
---
# Owner Manual Tasks — Sergey's Checklist

Everything that **only you can do** — things that require your machine, your accounts, money, or the GitHub UI (not something I can do from here). Grouped by when it's needed. Check items off as you go.

Legend: 🔴 blocker · 🟡 important · 🟢 nice-to-have. References point to [`GITHUB_SETUP.md`](./GITHUB_SETUP.md).

> 🤫 **Insider knowledge (keep it off all public docs).** There is deliberately no single documented "up everything" command — each service starts separately (that friction is intentional). The one-shot easy button is a hidden, committed-but-undocumented script at the repo root: **`.raise-the-monster.sh`**. It brings the whole stack up in the right order. It's referenced only here and in `IMPLEMENTATION_PLAN.md` (both private). Anyone who digs through the repo can discover it; nobody is told. Built in Phase 1.

---

## A. Do now (Phase 0 — governance)

### Git: get the work onto GitHub
- [ ] 🔴 In Terminal, from the repo folder, clear the stale lock and push:
  ```bash
  cd "/Users/ser/Documents/Personal Projects/Frankenstein"
  rm -f .git/index.lock
  git add -A
  git status                 # confirm: no .DS_Store, no .env
  git commit -m "Add project docs and GitHub configuration"
  git push -u origin main
  ```
  *(I can't do this from here — pushing needs your `personal.github.com` SSH key, and the sandbox can't remove the lock.)*

### GitHub connection for me
- [ ] 🟡 Confirm the **GitHub MCP** connector is authorized and, if needed, reopen/refresh the app so its tools reach this session. Tell me once it's live and I'll create the 28 labels and open the first batch of issues.

### Repo settings (Settings → General) — ref §1
- [ ] 🟡 Features: Issues ON, Discussions ON, Projects ON, Wiki OFF, Forking ON.
- [ ] 🔴 Pull Requests: merge commits OFF, **squash ON**, rebase OFF, **Allow auto-merge OFF**, auto-delete head branches ON.

### Branch protection (Settings → Rules → Rulesets) — ref §3
- [ ] 🔴 `main` ruleset: require PR before merging (1 approval), **require status check `challenge-guard`**, block force pushes, restrict deletions, linear history, squash-only.
- [ ] 🟢 Tag ruleset on `refs/tags/*`: restrict creation/deletion to you.
  > Note: rulesets need the repo **public** or a **paid plan** to enforce. Until then they're inert.

### Actions & automation
- [ ] 🟡 Settings → Actions → General: allow the workflows to run; if you restrict actions, allowlist `actions/*`, `micnncim/action-label-syncer`.
- [ ] 🟡 Settings → Actions → General → Workflow permissions: give Actions **read/write** (the leaderboard commits `LEADERBOARD.md`, labelers write labels/comments).

### Discussions — ref §9
- [ ] 🟡 Create categories, including the two that `config.yml` links to: **`getting-it-to-run`** and **`non-code-challenges`** (plus Announcements, Propose a horror, Show & tell, Q&A).
- [ ] 🟢 After launch, pin a "Getting it to run (God help you)" thread with the current workaround.

### Security config (the intentional-vuln handling) — ref §11
- [ ] 🟡 Dependabot **alerts ON**, **security updates OFF**, **version updates OFF**.
- [ ] 🟡 Secret scanning: since fake secrets are committed on purpose, **disable push protection** for this repo (or be ready to dismiss detections as test fixtures).
- [ ] 🟢 Code scanning (CodeQL): optional, and if on, keep it **non-blocking**.

### Decisions only you can make
- [ ] 🟢 CODEOWNERS is set to `@SergeyIsakhanyan`. If you create an org + `maintainers` team later, switch it.
- [ ] 🟢 Contact emails in `SECURITY.md` / `CODE_OF_CONDUCT.md` are `…@projectfrankenstein.com` (pending the domain). Change if you'll use a different address.

---

## B. Pre-launch (Phases 2–3)

### Domain & DNS
- [ ] 🔴 Buy **projectfrankenstein.com** (or your chosen domain).
- [ ] 🔴 Point `@` and `www` DNS records at the host once provisioned.
- [ ] 🟡 Set up email on the domain (or an alias) so `security@` and `conduct@` actually receive mail.

### Hosting (intentionally-vulnerable app → must be sandboxed) — ref §15 + IMPLEMENTATION_PLAN §9
- [ ] 🔴 Provision an **isolated, throwaway host** (own VPS/containers, no access to anything real).
- [ ] 🔴 Deploy the `v1.0` compose stack.
- [ ] 🔴 Configure **ephemeral, auto-resetting data** (e.g., nightly wipe-and-reseed) with obviously fake data only.
- [ ] 🔴 Put it behind **rate limiting / a WAF**; set up basic abuse monitoring.
- [ ] 🔴 Publish a **Terms of Use / disclaimer** page (it's a lab; no real data; don't use it to attack others).
- [ ] 🟡 GitHub → Settings → Environments: create `production`, add deploy secrets **there** (never in the repo), require you as reviewer.

### Going public
- [ ] 🔴 **Scrub history** — confirm no *real* secrets ever landed (only the intentional fakes) before flipping to public.
- [ ] 🔴 Flip the repo to **public**.
- [ ] 🟡 Open the junior challenge issues (I can do this via MCP), pin a few `good-first-challenge`.
- [ ] 🟢 Add the "Hall of Shame" section screenshots; post to HN / r/programming to seed the first wave.

---

## C. Ongoing (Phase ∞)

- [ ] 🟡 Run the **Dr. Frankenstein** cadence: periodically merge a worsening, tag a new monster version, write the in-character changelog.
- [ ] 🟡 Triage `needs-triage`, confirm auto-applied labels, keep the leaderboard sensible.
- [ ] 🟡 Moderate per the Code of Conduct; handle in-scope security reports (infra only) via Private Vulnerability Reporting.
- [ ] 🟢 Watch hosting for abuse; confirm the reset job runs; rotate anything that needs rotating.
- [ ] 🟢 Periodic growth pushes (Hall of Shame updates, challenge drops).

---

## What I (Claude) will handle once unblocked

Once the files are pushed and the GitHub MCP tools are live, I can: create the **28 labels** from `.github/labels.yml`, open the **first batch of challenge issues** (junior FE + BE) pre-labeled by discipline/difficulty, and draft the Dr. Frankenstein release notes. I can also start the **Phase 1 skeleton** (compose file + service scaffolds) whenever you want to move from planning to building.

The items above stay with you because they need your accounts, your money (domain/hosting), your machine's keys, or GitHub settings the API can't fully reach.
