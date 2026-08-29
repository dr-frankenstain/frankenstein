# Security Policy 🧟

## This application is intentionally insecure

Frankenstein is a deliberately vulnerable training app. SQL injection, plaintext passwords, exposed secrets, broken auth, IDOR, and many other flaws are **features, not bugs** — they exist so people can practice finding and fixing them.

**Please do NOT report the app's intentional vulnerabilities as security issues.** They are the whole point. If you've found one, that's a *challenge* — open it via the Challenge or QA Bug Bounty issue forms, or submit a solution PR against the relevant challenge.

## Never deploy this with real data

- Do **not** run Frankenstein with real user data, real credentials, or on infrastructure that can reach anything you care about.
- All secrets committed to this repository are **fake and non-functional**, present as challenges. Treat them as such.
- If you self-host it, isolate and sandbox it, keep its data ephemeral, and put it behind rate limiting. Assume it will be compromised.

## What IS in scope

Security reports are welcome **only** for the project's own infrastructure — not the intentionally-broken app. In scope:

- The GitHub Actions workflows (e.g., a way to abuse `leaderboard`, `auto-labeler`, or `auto-scorer`).
- The leaderboard/scoring pipeline or any bot with write access.
- The official hosting/deployment configuration (not the app's deliberate flaws).
- Anything that could compromise contributors, maintainers, or the repo itself.

## Reporting an in-scope issue

Use **[GitHub Private Vulnerability Reporting](../../security/advisories/new)** (Security tab → Report a vulnerability), or email `security@projectfrankenstein.com` (once the domain's email is set up).

Please include repro steps and impact. We'll acknowledge and follow up.

## Not sure if it's intentional?

If you can't tell whether a flaw is an intentional challenge or a real infra problem, ask in [Discussions](../../discussions) — when in doubt, it's probably intentional.
