---
id: audit-<feature>-YYYY-MM-DD
type: audit
status: current
updated: YYYY-MM-DD
scope: [feature-name, audit]
covers: ["src/<area>/**"]
related: [spec-<feature>]
supersedes: null
superseded_by: null
---

# Audit: <feature> — YYYY-MM-DD

<!-- LOG doc. The record of one audit run. Never edited; a re-audit is a new file that
     supersedes this one. Fixes go in the code and the spec, not in here. -->

**Audited against:** `spec-<feature>` as of <its updated date>
**Commit:** <sha>

## Verdict

One line: does the implementation match the spec?

## Findings

| # | Severity | Finding | Spec says | Code does | Status |
|---|---|---|---|---|---|
| 1 | high/med/low | | | | open / fixed / accepted |

## Spec problems found

<!-- Audits usually reveal the SPEC is wrong, not the code. Those corrections must be
     applied to the spec in place (it is a Living doc) and listed here for the record. -->

- <spec statement that was wrong> → corrected in `spec-<feature>`

## Not checked

Scope limits of this audit, so the next one knows where to look.
