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
- **2026-10-01 addendum**: added a "Favorites" card below Address, the first
  of what will be more customizable profile settings. It holds a plain
  `Dropdown` (not `FormDropdown` — there's no surrounding form) bound to a
  new `TAuthUser.favoriteBarId?: string`, sourced from `locationsStore` the
  same way `TContact.favoriteBarId` is. Unlike email/phone/address, this
  field isn't waiting on real auth: `authStore` grew a `setFavoriteBar`
  action the dropdown calls directly, so picking a bar actually works today.
  It still resets on sign-out/sign-in like the rest of `user`, since none of
  `authStore` persists yet. `authStore` also grew `clearFavoriteBar`, called
  by `locationsStore.removeLocation` alongside `contactsStore.clearFavoriteBar`
  so a deleted bar doesn't leave a dangling id on the signed-in user — same
  fan-out rule, now with `locations → authStore` added to the dependency
  direction note in `CLAUDE.md`. New i18n key: `profileFavorites`; reused
  the existing `favoriteBar`/`chooseLocation`/`none` keys contacts already use.
- **2026-10-01 addendum 2**: added "Favorite drink" and "Favorite shot" plain
  text inputs to the Favorites card, below the favorite-bar dropdown.
  `TAuthUser` grew matching `favoriteDrink?`/`favoriteShot?: string` fields,
  and `authStore` grew `setFavoriteDrink`/`setFavoriteShot`, each called
  directly from `onChangeText` the same way `setFavoriteBar` is called from
  the dropdown — no local draft state, no save button. New i18n keys:
  `favoriteDrink`, `favoriteShot`.
- **2026-10-01 addendum 3**: `TNamedCredentials` grew matching
  `favoriteDrink?`/`favoriteShot?: string`, following the same `signIn` →
  `TAuthUser` path as email/phone/address. The `jjiracek` fixture now sets
  `favoriteDrink: 'Miller Lite'` and `favoriteShot: 'Fireball'`, so that
  account's Favorites card shows both pre-filled on sign-in; `favoriteBarId`
  is deliberately left unset for this fixture, so the bar dropdown still
  opens on "Choose a location" for it.
- **2026-10-01 addendum 4**: tried locking the drink/shot inputs once they
  held a value, unlocked via a far-right edit button — reverted, it looked
  wrong in practice. Replaced with a Save/Cancel pair: the inputs stay plain
  `TextInput`s always, bound to new local `draftDrink`/`draftShot` state
  rather than `authStore` directly, so typing doesn't commit a change
  keystroke-by-keystroke. Save calls `setFavoriteDrink`/`setFavoriteShot`,
  Cancel resets the drafts back to the stored value. The bar dropdown is
  unchanged — a discrete pick still applies immediately, since there's no
  keystroke-by-keystroke concern for it. The `edit` i18n key from the
  reverted approach was removed.
- **2026-10-01 addendum 5**: moved Save/Cancel out of the Favorites card and
  into an always-visible screen-level footer, rather than only appearing
  once a draft was dirty. The three cards now sit inside a `ScrollView`
  (`screen` lost its padding/gap to a new `scrollContent` style), and the
  footer is a sibling after it — bordered, `colors.panel`-backed, and
  padded by `useSafeAreaInsets` the same way `CreateFooter` pads itself
  (`getFooterInsetStyle`, copied rather than imported since `CreateFooter`
  is single-button and this footer holds two). Save/Cancel are harmless
  no-ops when nothing changed, so always rendering them needed no dirty
  check.
- **2026-10-01 addendum 6**: several follow-up tweaks to the same footer —
  equal-width buttons (`flex: 1` on both), a shorter `minHeight` (44) after
  trying 56, and the divider restyled a few times (`colors.panel` →
  `colors.background`, hairline → thicker, `colors.border` →
  `colors.textMuted`, landing on `borderTopWidth: 4`). More substantively:
  the favorite-bar `Dropdown` is now also draft state (`draftFavoriteBarId`,
  alongside `draftDrink`/`draftShot`) instead of calling `setFavoriteBar`
  straight from `onChange` — so changing it, like the text fields, only
  commits on Save and only enables the footer once something actually
  differs. Save/Cancel now pass `disabled={!isFavoritesDirty}` (with a new
  `footerButtonDisabled` dim style) instead of always being interactive, and
  `cancelButton` moved off `colors.background` onto `colors.panel` so it
  reads as a secondary surface rather than blending into the footer.
- Does **not** cover: editing profile fields, an avatar/photo, or any backend
  — this is a display-only screen against the same `MOCK_USERS`/`authStore`
  fixture called out in `src/data/user.ts`. The Favorites section is the one
  exception — the dropdown and both text inputs are real, working fields,
  not placeholders.

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
- More customizable settings under Favorites beyond the favorite bar.
- Persisting `favoriteBarId` (and the rest of `authStore`) once there's a
  backend/account to attach it to, so it survives sign-out/sign-in.
