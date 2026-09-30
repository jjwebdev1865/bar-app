---
paths:
  - "**"
---

# Feature Documentation Required

## Rule
- **Every unit of implementation work** (a new feature, screen, store, schema, or non-trivial refactor) **must be documented in a markdown file inside `src/features/`**
- Before starting work, check the relevant phase folder for an existing file covering the area; update it if one exists, otherwise create a new one
- The doc file must be created or updated **as part of the same change** — not deferred to a follow-up

## Required Questions

Before creating or updating the doc file, ask the user:
1. **Phase** — does this work belong in the existing `mvp` phase, or does it start a new phase (e.g. `v1`, `v2`)? If a new phase, get its folder name.
2. **Feature name** — what should this feature/unit of work be called? This becomes the file's descriptive slug.

Do not guess either answer — always ask.

## Drifting to a New Concept

If the conversation keeps adding work that belongs to a different feature or concept than the one currently being documented (i.e. the user keeps extending the same context window into something the current doc file doesn't cover), stop and ask whether they want to start a **new** feature doc/plan for it rather than folding it into the current one.

## Naming

Follow the existing numbered convention, continuing the next available number within the chosen phase folder:

```
src/features/mvp/05_push_notifications.md
src/features/v1/01_bar_invites.md
```

Cross-cutting audits that don't map to a single feature (like `initial_setup.md`) are the one exception to the numbering.

## What Must Be Recorded

- Date the entry was written
- Scope: what the change covers, and explicitly what it does **not** cover (deferred to a later step)
- Context: which prior steps/decisions this builds on, and why an existing pattern was reused or deliberately not reused
- Any follow-on work the change created

## What Is Banned

```
// BAD — new screen/store/schema lands with no file in src/features/mvp/
```

- Silently expanding an existing feature file's scope without noting the addition and its date

## When This Doesn't Apply

- Pure bug fixes with no scope/behavior change
- Formatting-only or lint-fix changes
