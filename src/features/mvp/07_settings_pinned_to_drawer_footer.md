# Settings pinned to drawer footer

**Date**: 2026-09-30

## Scope

- Moved the Settings drawer item out of the scrollable `DrawerItemList` in
  [AppLayout.tsx](../../navigation/AppLayout.tsx) and into the footer area,
  pinned directly above the sign-out row.
- Settings screen registration (`Drawer.Screen name={EDrawerScreen.SETTINGS}`)
  is unchanged and still reachable — only its `drawerItemStyle` was set to
  `hiddenDrawerItem` so it no longer renders inline in the scrollable list.
- The footer row reuses the same `Pressable` pattern as the existing sign-out
  row (rather than pulling in `DrawerItem`/`DrawerActions` internals from
  `expo-router`'s vendored `@react-navigation` fork), and manually tracks
  active/focused state via `props.state` to mirror the active tint/background
  styling `DrawerItemList` gives every other item.
- Does **not** cover: reordering Home/Contacts/Groups/Locations, changing the
  sign-out row's behavior, or any change to the Settings screen itself.

## Context

- Builds on the existing `DrawerMenu` component, which already separated the
  sign-out row into a footer sibling of `DrawerContentScrollView` so it stays
  pinned to the bottom regardless of list length. Settings now follows the
  same footer pattern instead of introducing a new one.
- Reused the `hiddenDrawerItem` style already applied to the login/create-account
  screens (hidden from the drawer without removing the route) rather than
  inventing a second mechanism for "registered but not listed" screens.

## Follow-on work

- None identified.
