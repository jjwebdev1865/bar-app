# Multiple Local Users

**Date:** 2026-09-30

## Scope

`src/data/user.ts`'s single `MOCK_USER: TCredentials` fixture became
`MOCK_USERS: TCredentials[]`, holding three accounts that can all sign in on
the same device:

- `jjiracek` / `Password1!`
- `jjiracekSlalom` / `Password1!`
- `jjiracekArcos` / `Password1!`

Changes:

- `authStore.signIn` now looks up a matching `{ username, password }` pair in
  `MOCK_USERS` instead of comparing against one fixed pair. The rejection
  behavior is unchanged — a failed match still doesn't say which half (or
  which account) was wrong.
- `Login`'s `signInHint` now lists every username in `MOCK_USERS` (joined by
  `, `) against the one shared password, instead of naming a single account.
  `signInHint` in both locales (`en.json`, `es.json`) changed from
  `{{username}}` to `{{usernames}}` to match.
- `CLAUDE.md` updated to describe `src/data/user.ts` as holding credential
  *pairs* rather than *a pair*.

This builds on `03_login.md`, which put the original single-account fixture
and the `signIn`/`signInHint` wiring in place; this change only widens the
fixture from one entry to a list.

## Update (2026-09-30, same day): per-account isolation attempted, then reverted

A same-day follow-up scoped `contactsStore` / `groupsStore` / `locationsStore`
persistence per signed-in username (`persistStorage.ts`'s `setPersistScope`,
`authStore`'s `switchDomainStores`), so each `MOCK_USERS` account would only
see its own saved contacts/groups/locations. That was reverted the same day at
the user's request — `authStore` and `persistStorage.ts` are back to the state
described in "What this does not cover" below, and `authStore` still has no
cross-store fan-out.

## What this does **not** cover

- **Per-account data isolation.** `contactsStore`, `groupsStore` and
  `locationsStore` are still persisted under one fixed `persistKey(...)` per
  domain (`persistStorage.ts`), not namespaced by the signed-in username. All
  three `MOCK_USERS` accounts on a device currently read and write the *same*
  contacts/groups/locations. `authStore`'s doc comment already flagged this as
  the fix a second account would require (`signOut` growing a clear, and
  `persistKey` growing a per-account namespace) — a same-day attempt at this
  fix was reverted (see above), so it remains outstanding.
- No changes to `TCredentials`/`TAuthUser` shapes, or to the `signIn` fixture
  being a plain-text `===` check — that remains a fixture to be deleted, not
  hardened, when step 04 (`04_event_creation_api.md`) lands real auth.

## Follow-on work

- Namespace persisted domain-store keys per signed-in username, and clear (or
  swap) them on `signOut` / `signIn`, so the three accounts stop sharing one
  contacts/groups/locations dataset. (Attempted and reverted once already —
  see the update above.)
