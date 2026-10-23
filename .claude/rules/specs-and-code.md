---
paths:
  - "src/**/*"
  - "docs/specs/**/*.md"
---

# Spec ↔ code coupling

<!-- This rule is path-scoped: it loads only when Claude reads a file under src/ or
     docs/specs/. That keeps it out of context for docs-only or research work.

     Trade-off to know about: path-scoped rules are SUMMARIZED AWAY on compaction and
     only return when a matching file is read again. Anything here must therefore be
     re-derivable from the file itself. The non-negotiable doc rules live unscoped in
     docs-are-truth.md for exactly this reason.

     Adjust these globs to your real source layout. -->

Each spec's `covers:` frontmatter lists the code it describes. That link runs both ways.

**Editing code under a spec's `covers:` globs** means the spec is in scope for this task.
Read it before writing code. If the change makes any statement in it false, edit the spec
in the same change — not in a follow-up.

**Editing a spec** means the code it `covers:` is in scope. Check whether the code already
behaves the way the spec now says. If it does not, the spec describes intended future
behavior: mark that section with `> Not yet implemented.` and add it to `docs/STATE.md`
under "In progress" or "Next up". A spec that silently describes unbuilt behavior is how
the next session ends up "fixing" something that was never broken.

**A spec with no `covers:`** is unanchored. Either fill it in or the spec is really a plan
and belongs in `docs/plans/`.
