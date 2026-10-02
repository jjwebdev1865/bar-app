# Bartender bot (phase 1) ✅

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
