---
id: ops-setup-2
type: ops
status: current
updated: 2026-10-23
scope: [setup]
covers: []
related: []
superseded_by: null
review: "guessed: type,updated"
---
# Frontend — Setup & Conventions

The frontend is a **Next.js (App Router)** application. It is the "face" of the monster: every bad pattern gets its own dedicated page/route so it can be understood and challenged in isolation.

## Stack

- **Next.js** (App Router), React, TypeScript — though TypeScript discipline is *deliberately inconsistent* (see below).
- **Versions are deliberately outdated.** React, Next, Node, and TypeScript are pinned a major version or two behind. Some flaws are best fixed by *upgrading* and adopting the newer idiomatic API (e.g., React 17→18 `useId`/`createRoot`/automatic batching, or dropping `moment.js` for native `Intl`). See `docs/IDEAS.md` → "Deliberately outdated versions."
- Styling is **intentionally mixed**: some pages use plain CSS, some inline styles, some SCSS, some Tailwind. This is a feature, not a bug — inconsistency is one of the challenges.
- Talks to the Python API over HTTP. Never talks to the PHP service or DB directly (that would be a *new* bad pattern we haven't sanctioned yet).

## Golden rule: one bad pattern = one page

Per the project constraints, **do not** combine multiple bad patterns into a single page. Each page:

- lives at its own route under `app/`,
- demonstrates **one** primary bad pattern (it may have secondary flaws, but one is the headline),
- has a matching implementation doc in `docs/frontend/pages/`,
- is registered in the app's page index so contributors can find it.

## Folder layout (target)

```
frontend/
├── app/
│   ├── page.tsx                     # landing / index of bad pages
│   ├── product/page.tsx             # → docs/frontend/pages/01-inline-styles-product-page.md
│   ├── profile/page.tsx             # → docs/frontend/pages/02-untyped-profile-page.md
│   ├── cart/page.tsx                # → docs/frontend/pages/03-localstorage-cart.md
│   ├── signup/page.tsx              # → docs/frontend/pages/04-no-validation-signup.md
│   ├── search/page.tsx              # → docs/frontend/pages/05-case-sensitive-search.md
│   └── deals/page.tsx               # → docs/frontend/pages/06-annoying-popups.md
├── components/
├── hooks/                           # includes deliberately-bad custom hooks
├── styles/                          # global.css, some .scss, plus a Tailwind config nobody fully uses
└── package.json                     # includes duplicate + unused deps on purpose
```

## Running it

```bash
cd frontend
npm install      # note: package.json intentionally has duplicate/unused deps
npm run dev      # http://localhost:3000
```

The frontend expects the Python API at `http://localhost:8000` (see `docs/backend/SETUP.md`). If the API isn't up, most pages still render but data calls fail — some pages "fail" more gracefully than others (on purpose).

## Difficulty tagging

Every page doc states its difficulty (`junior` / `mid` / `senior` / `lead`). This batch is **junior**: obvious, self-contained flaws a junior developer should be able to spot and fix. Mid/senior/lead pages will be added later.

## Adding a new bad page (for maintainers / Dr. Frankenstein)

1. Create the route under `app/`.
2. Implement exactly one headline bad pattern.
3. Write the implementation doc in `docs/frontend/pages/NN-name.md` using the existing docs as a template.
4. Open the matching GitHub issue(s), tagged `frontend` + language + difficulty.
5. Link the page from the landing index.
