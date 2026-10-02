# Bartender bot

## Phase 1 ✅ — floating button + placeholder screen

**Date**: 2026-10-02

**Status**: Phase 1 complete.

## Scope

- Phase one of the Bartender Bot feature: a small circular floating button
  pinned to the bottom-right of the Home screen. Tapping it pushes a new
  screen that only renders "Hello World" for now — no chat UI, no bot logic.
- New component [BartenderBotButton.tsx](../../components/_Home/BartenderBotButton.tsx),
  exported from `src/components/_Home`'s barrel and rendered inside
  [Home.tsx](../../pages/Home/Home.tsx), absolutely positioned over the
  screen's content.
- New route: `EAppRoute.BARTENDER_BOT` / `EDrawerScreen.BARTENDER_BOT`
  (`/bartender-bot`), plus
  [app/bartender-bot.tsx](../../../app/bartender-bot.tsx) delegating to
  [src/pages/BartenderBot/BartenderBot.tsx](../../pages/BartenderBot/BartenderBot.tsx),
  following the same thin-route pattern as the other screens.
- Drawer wiring in [AppLayout.tsx](../../navigation/AppLayout.tsx): registered
  as a `Drawer.Screen` hidden from the menu via `drawerItemStyle` (same
  pattern as Profile/Settings), since it's reached only from Home's floating
  button, not from the drawer list. The default header (hamburger +
  `DrawerToggleButton`) is left in place rather than wired to a back button,
  so returning to Home works the same way Profile/Settings already do.
- New i18n keys (`bartenderBot`, `openBartenderBot`, `bartenderBotHello`) in
  both `en.json` and `es.json`.

## Not covered (deferred)

- Any actual bot behavior, chat interface, or backend wiring — the pushed
  screen is a placeholder.
- Button placement on screens other than Home.

## Phase 2 ✅ — new-account welcome

**Date**: 2026-10-02

**Status**: Phase 2 complete.

### Scope

- A brand-new account (`CreateAccount` → `authStore.signUp`) is greeted by
  the Bartender Bot instead of landing straight on Home: a hello/welcome
  message, a line noting the bot will explain the project in a later phase,
  and a button to go fill out the profile. An existing account signing in
  (`signIn`) still lands on Home as before — this is new-account-only, per
  the phase 1 doc's scope decision.
- [BartenderBot.tsx](../../pages/BartenderBot/BartenderBot.tsx) now branches
  on a `BARTENDER_BOT_WELCOME_PARAM` search param (`src/constants/routes.ts`):
  absent, it still renders phase 1's plain "Hello World" (the floating
  button's entry point); present, it renders the welcome copy
  (`bartenderBotWelcomeGreeting`, `bartenderBotWelcomeIntro`) plus a
  `bartenderBotGoToProfile` button that pushes `EAppRoute.PROFILE`.
- **Why the redirect happens from `Home`, not from `CreateAccount` directly**:
  `signUp` flips `authStore.user`, which is what flips `AppLayout`'s
  `Drawer.Protected` guard from the signed-out screen set to the signed-in
  one. Pushing `EAppRoute.BARTENDER_BOT` from inside `CreateAccount`'s submit
  handler would race that guard swap — the target screen isn't mounted yet
  in the same synchronous call. Instead, `signUp` sets a new `justSignedUp`
  flag; `Home` (the guard's anchor route, so always mounted first) reads it
  in a `useEffect` and immediately pushes on to `/bartender-bot` with the
  welcome param, then clears the flag via `clearJustSignedUp`. `signOut`
  also resets the flag defensively.
- New i18n keys (`bartenderBotWelcomeGreeting`, `bartenderBotWelcomeIntro`,
  `bartenderBotGoToProfile`) in both `en.json` and `es.json`.

### Not covered (deferred)

- Any real explanation of the project — the intro line only promises it's
  coming later.
- Actual profile-completion guidance beyond the button; the Profile screen
  itself is unchanged.
