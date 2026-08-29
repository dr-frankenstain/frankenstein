# 🧟 Frankenstein

**The web app that is intentionally, gloriously terrible — and never gets fixed, only worse.**

Frankenstein is a real, running, full-stack application stitched together from every bad decision, anti-pattern, and dumb feature you've ever met in production. It exists so that engineers, QAs, PMs, designers, and product owners can practice fixing real-world messes — and so the community can vote on the best way to fix each one.

We do **not** fix `main`. We fix it in Pull Requests that are never merged. The monster stays alive.

---

## 📖 The lore

> Frankenstein started in 2014 as a PHP monolith (the founder's cousin built it).
> In 2019 a new team "modernized" the backend to Python — but only had budget to port half of it, so the payment and PDF logic still lives in the old PHP service that nobody understands.
> In 2021, to survive a high-demand on-sale, someone bolted a Go microservice and Redis onto the seat-booking flow — wired straight into the old PHP service, bypassing the new Python API entirely. That team is gone too.
> In 2023 the frontend was rewritten in Next.js by a contractor who left mid-project.
> Nobody has the full picture. Now it's your turn.

This backstory is why the app is a polyglot legacy mess — and why "should we even keep the PHP service?" is a real challenge here, not a joke.

## 🏗️ Architecture

```yaml
Next.js frontend ──► Python (FastAPI/Flask) API ──► PHP legacy service
   │  (ThreeJS venue map)          │                       │
   │                               └────► shared DB ◄───────┘
   │                                   (both write directly)
   │
   └─ seat booking (bypasses the API) ─► PHP ─► Go booking service ─► Redis
                                                         (seat locks / holds)
```

Five languages (JS/TS, Python, PHP, Go) plus Redis and a shared DB. The most instructive bugs live **within** each layer *and* at the **seams** between services — and the seat-booking path is the deep end: real-time 3D rendering over a polyglot round-trip with hard concurrency (double-booking, lock TTLs, ghost holds).

## 🎯 What you can do here

| You are a... | You... |
|---|---|
| **Frontend dev** | Fix a broken page (styling chaos, `any` everywhere, localStorage abuse, no validation) |
| **Backend dev** | Fix a Python, PHP, or Go flaw (injection, broken auth, race conditions, double-booking, leaked secrets) |
| **QA** | Find undocumented bugs, write test plans, build automation that survives the chaos |
| **PM** | Reconcile contradictory docs, write specs, prioritize the backlog |
| **Designer** | Redesign a bad screen, audit a flow, fix the design system |
| **Product Owner** | Groom the backlog, prioritize by value, make build/kill calls |
| **DevOps / DevSecOps** | Fix the broken setup, untangle lockfile/peer-dependency conflicts, remediate CVEs, harden the CI/deploy path |

## 🔧 How it works

1. **Issues are the problems.** Each documents one flaw, tagged by discipline (`frontend`, `python`, `php`, `go`, `qa`, `pm`, `design`, `po`, `devops`, `security`, `cross-service`, `architecture`) and difficulty (`junior`, `mid`, `senior`, `lead`).
2. **You submit a solution as a Pull Request** linked to the issue. It will **not** be merged — that's by design. It's your answer, on the record.
3. **The community votes with 👍 reactions.** The top-👍 PR on an issue is the crowd's chosen best answer.
4. **Dr. Frankenstein makes it worse.** Maintainers periodically add new horrors and reintroduce old bugs. QA regression suites and everyone's vigilance are tested.

## 🚀 Getting it to run (God help you)

The setup is *also* deliberately bad — but it is always survivable. There is **no single command** that brings the app up: every part is its own thing, and you start each one separately, in the right order, with its own config. Working that out is part of the challenge.

```bash
git clone https://github.com/SergeyIsakhanyan/frankenstein.git
cd frankenstein
# Then bring each piece up on its own — database, then the APIs, then the frontend.
# Each service has its own compose/run steps and its own env. Order matters.
# Stuck? The pinned "Getting it to run (God help you)" discussion has the current workaround.
```

New here? Start with [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## 🏆 Leaderboard

Top contributors and top-voted solutions are tracked automatically. Climb it by writing fixes the community loves.

## 🤝 Contributing

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before your first PR. The golden rules:

- **Solutions are PRs and are never merged.** Don't try to fix `main`.
- **One issue = one flaw. One PR = one solution to one issue.**
- **Voting is 👍 only.**
- **Worsening is maintainers only** (via Dr. Frankenstein).
- **Every new bad feature ships with its own issues**, so it's a challenge from day one.

## 📜 License

TBD — will be permissive/open, since everything here is public by design.
