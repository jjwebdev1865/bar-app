@AGENTS.md

## Project summary

"Bar Signal" (bar-app) is an Expo/React Native + TypeScript app for coordinating
spontaneous meetups at bars with friends. Currently it's a UI-only scaffold —
no backend is wired up yet.

**Stack**: Expo SDK 57, Expo Router (file-based routing, drawer nav), React 19 /
React Native 0.86, zustand 5 for shared state, i18next for localization
(en/es), custom theme context.

**Structure**:
- `app/` — thin Expo Router routes that delegate to `src/pages/*`
- `src/navigation/AppLayout.tsx` — drawer with Home, Contacts, Groups,
  Locations, Settings screens
- `src/context/SettingsContext.tsx` — app-wide theme mode + language + `t()`
  translation helper
- `src/stores/*.ts` — zustand stores holding the shared domain state
  (`contactsStore`, `groupsStore`), seeded from `src/data/*.ts`
- `src/pages/*` — screen implementations; they read domain state from
  `src/stores/*` and keep only UI state (open modal, selected row) in `useState`
- `src/components/_MyContacts`, `_MyGroups`, `_MyLocations`, `common` —
  create/detail modals and shared UI (Dropdown, CreateModal, CreateFooter)
- `src/data/*.ts` — static mock seed data (contacts, groups, locations)
- `src/theme/theme.ts`, `src/i18n/` — theming and localization resources
- `src/constants/` — shared constant values (e.g. `safeAreaEdges.ts`)

**State management**: Domain data that more than one screen touches lives in a
zustand store, not in screen-level `useState`. Conventions:
- Plain module-level `create()` stores — no context provider. The data is
  app-global and singular, so per-subtree store instances would be ceremony.
- **Select atomically**: `useStore((state) => state.contacts)`, one hook call
  per value. zustand v5 dropped the automatic shallow-compare on selector
  results, so a selector returning an object literal re-renders on every
  store write. Use `useShallow` from `zustand/react/shallow` if a multi-value
  selector is genuinely needed.
- `TGroup.contacts` holds full `TContact` copies rather than IDs, so those
  copies go stale when a contact changes. `contactsStore.updateContact` /
  `removeContact` fan out to `groupsStore.applyContactUpdate` /
  `removeContactFromGroups` via `useGroupsStore.getState()`. **Keep that
  fan-out inside the store action** — a screen that calls only `updateContact`
  must not be able to skip the sync. Dependency direction is contacts →
  groups; don't add the reverse edge.
- Stores are in-memory only. There is no persistence yet, so all state
  (including theme/language in `SettingsContext`) resets on app reload.

**Current functionality**: Home screen lets you pick a group + location and
"activate a signal" (broadcast intent to meet up) with an elapsed-time
counter; Contacts supports create/edit/delete against the store, Groups
supports create; Locations is still screen-local state reading
`MOCK_LOCATIONS`; Settings toggles theme/language.

**Planned direction** (see `V1_goals.md`, not yet implemented): Firebase auth
(phone/email) → contacts sync with hashed phone-number matching → groups →
bar "invites" (manual entry or GPS "near me") → push notifications via Cloud
Functions/FCM → realtime RSVP status via Firestore listeners.
