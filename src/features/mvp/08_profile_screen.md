# Profile screen

**Date**: 2026-09-30

## Scope

- New `Profile` screen, read-only for now: a single card labeled "Bio"
  showing the signed-in user's full name, username, email and phone, plus a
  hint that editing comes later. Name/username are sourced from `authStore`'s
  `user`, the same fixture data `Settings` already reads for its account row.
- **2026-09-30 addendum**: added the "Bio" section label, plus email/phone
  rows. `TAuthUser` grew optional `email?`/`phone?` fields — no sign-in path
  (`MOCK_USERS`, `CreateAccount`) populates either yet, so both always render
  the new `notAvailable` ("N/A") string today. The fields exist so real auth
  (step 04) has somewhere to put this data rather than the screen inventing
  its own shape later.
- **2026-09-30 addendum 2**: `TNamedCredentials` grew an optional `email?`,
  each `MOCK_USERS` fixture in `src/data/user.ts` now sets one, and
  `authStore.signIn` copies it onto `TAuthUser.email`. So the three fixture
  accounts (`jjiracek`, `jjiracekSlalom`, `jjiracekArcos`) now show a real
  email on the Bio card instead of "N/A" — phone and `CreateAccount`-created
  accounts still fall back to it.
- **2026-09-30 addendum 3**: `TNamedCredentials` grew an optional `phone?`
  alongside `email?`, following the same `signIn` → `TAuthUser.phone` path.
  Only the `jjiracek` fixture sets one so far; the Bio card formats it with
  `formatPhoneDisplay` (the same helper contacts use) rather than showing the
  raw digits.
- New route: `EAppRoute.PROFILE` / `EDrawerScreen.PROFILE` (`/profile`), plus
  [app/profile.tsx](../../../app/profile.tsx) delegating to
  [src/pages/Profile/Profile.tsx](../../pages/Profile/Profile.tsx), following
  the same thin-route pattern as `app/settings.tsx`.
- Drawer wiring in [AppLayout.tsx](../../navigation/AppLayout.tsx): Profile is
  registered as a `Drawer.Screen` (hidden from the scrollable `DrawerItemList`
  via `drawerItemStyle`) and rendered instead as a footer row, pinned directly
  above the Settings row, both above the bordered sign-out footer. The active/
  pressed styling previously named `settingsItem*` was generalized to
  `pinnedItem*` so both rows share one set of styles.
- New i18n keys (`navProfile`, `bio`, `profileName`, `profileUsername`,
  `profileEmail`, `profilePhone`, `notAvailable`, `profileHint`) in both
  `en.json` and `es.json`.
- **2026-09-30 addendum 4**: added an "Address" card below Bio. `TAuthUser`
  grew an optional `address?: TPostalAddress` (reusing the same shape
  contacts/locations use, not a bespoke one). No sign-in path sets it, so
  every account currently sees an "Add address" button instead of a
  formatted address (`formatAddressLines`). The button has no edit flow yet —
  pressing it only `console.log`s, as a placeholder until one exists. New
  i18n keys: `profileAddress`, `addAddress`.
- **2026-09-30 addendum 5**: `TNamedCredentials` grew an optional
  `address?: TPostalAddress`, following the same `signIn` → `TAuthUser.address`
  path as email/phone. Only the `jjiracek` fixture sets one (191 Vine Street,
  Apt 214, Columbus, Ohio 43215), so that account's Bio screen now shows the
  formatted address instead of the "Add address" button.
- Does **not** cover: editing profile fields, an avatar/photo, or any backend
  — this is a display-only screen against the same `MOCK_USERS`/`authStore`
  fixture called out in `src/data/user.ts`.

## Context

- Builds directly on
  [07_settings_pinned_to_drawer_footer.md](07_settings_pinned_to_drawer_footer.md):
  reuses the same "hide from `DrawerItemList`, render as a pinned footer
  `Pressable` instead" mechanism rather than introducing a second one.
- Reused `HEADER_SCREEN_EDGES` and the card/row layout pattern already
  established in `Settings.tsx`, rather than inventing new screen chrome.

## Follow-on work

- Editing profile fields (name, avatar, email, phone, address) once there's
  a backend to persist them to (see `V1_goals.md`).
- Populating `TAuthUser.email`/`phone`/`address` from a real sign-in path
  once step 04 lands, so the Bio/Address cards stop always falling back.
- Wiring the "Add address" button to an actual entry flow once one exists,
  replacing the placeholder `console.log`.
