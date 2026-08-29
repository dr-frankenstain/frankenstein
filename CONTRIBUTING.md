# Contributing to Frankenstein 🧟

Frankenstein is a deliberately terrible, fully working app. You don't fix it — you submit how you *would* fix it, and the community votes on the best answers. Please read the golden rules before your first contribution.

## The golden rules

1. **`main` is permanently broken and only ever gets worse.** Do not open a PR that "fixes" `main`. Worsening is maintainers-only (via the Dr. Frankenstein persona).
2. **Solutions are Pull Requests that are never merged.** Your PR is your submitted answer, kept on the record. A bot check (`challenge-guard`) keeps solution PRs un-mergeable by design.
3. **One issue = one flaw. One PR = one solution to one issue.**
4. **Voting is 👍 reactions.** The top-👍 solution per issue is the crowd's chosen best answer.
5. **Every new bad feature ships with its own issues**, so it's a challenge from day one (maintainers).

## How to submit a solution (developers)

1. **Find a challenge.** Browse [Issues](../../issues), filter by your discipline (`frontend`, `python`, `php`, `go`, `devops`, `security`…) and difficulty (`junior` → `lead`). New here? Look for `good-first-challenge`.
2. **Fork** the repo.
3. **Branch** in your fork: `solution/<issue#>-<short-slug>` — e.g. `solution/42-input-validation`. Start with the issue number so automation can link it.
4. **Implement** your fix. Address exactly one issue. Don't fix unrelated flaws in the same PR.
5. **Open a PR** against `main`, titled `solution: #<issue> <short summary>`.
   - In the description, write **`Addresses #<issue>`** — **not** `Fixes`/`Closes` (those keywords try to auto-close on a merge we never do).
   - Fill in the PR template and tick the acknowledgement box.
6. **That's it.** A bot labels your PR `solution`, copies the discipline/difficulty, and reminds everyone it won't be merged. The community votes with 👍. The daily `leaderboard` ranks solutions and marks the current `top-solution`.

Your PR **stays open** as part of the answer bank. It's closed only if it's `invalid` or a `duplicate`. Closing is not merging — your 👍 stay visible.

## Non-code contributions (QA / PM / PO / Design)

Not every discipline submits code:

- **QA** — file undocumented bugs via the **QA Bug Bounty** issue form (great repro steps earn 👍), or attach test plans / automation.
- **PM / PO / Design** — post specs, prioritizations, redesigns, and audits in the **Non-code challenges** category in [Discussions](../../discussions). Designers can share Figma links / mockups / write-ups there.

## Branch naming

| Prefix | Who | Merged? |
|---|---|---|
| `solution/<issue#>-<slug>` | you (from your fork) | **Never** |
| `worsen/<slug>` | maintainers | yes (the only app changes) |
| `docs/`, `ci/`, `chore/`, `infra/<slug>` | maintainers | yes (project tooling only) |

## What makes a good solution

- It addresses the issue's **"What a good solution shows"** guidance.
- It fixes the **one** headline flaw without introducing new ones.
- It keeps the visible behavior intact unless the issue says otherwise.
- Bonus: some flaws are best fixed by **upgrading** a deliberately-old dependency and adopting the modern idiom — that counts, and it's a strong signal.

## Security note

This app is **intentionally insecure**. Please read [`SECURITY.md`](./SECURITY.md): do **not** report the intentional vulnerabilities as security issues, and never deploy this app with real data.

## Code of conduct

The code is toxic; the community is not. Be kind — see [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).
