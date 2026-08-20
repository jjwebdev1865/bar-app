@AGENTS.md

## Project summary

"Bar Signal" (bar-app) is an Expo/React Native + TypeScript app for coordinating
spontaneous meetups at bars with friends. Currently it's a UI-only scaffold —
no backend is wired up yet.

**Stack**: Expo SDK 57, Expo Router (file-based routing, drawer nav), React 19 /
React Native 0.86, i18next for localization (en/es), custom theme context.

**Structure**:
- `app/` — thin Expo Router routes that delegate to `src/pages/*`
- `src/navigation/AppLayout.tsx` — drawer with Home, Contacts, Groups,
  Locations, Settings screens
- `src/context/SettingsContext.tsx` — app-wide theme mode + language + `t()`
  translation helper
- `src/pages/*` — screen implementations, currently driven by static mock
  data in `src/data/*.ts` (contacts, groups, locations)
- `src/components/_MyContacts`, `_MyGroups`, `_MyLocations`, `common` —
  create/detail modals and shared UI (Dropdown, CreateModal, CreateFooter)
- `src/theme/theme.ts`, `src/i18n/` — theming and localization resources
- `src/constants/` — shared constant values (e.g. `safeAreaEdges.ts`)

**Current functionality**: Home screen lets you pick a group + location and
"activate a signal" (broadcast intent to meet up) with an elapsed-time
counter; Contacts/Groups/Locations screens are mock-data CRUD UIs; Settings
toggles theme/language.

**Planned direction** (see `V1_goals.md`, not yet implemented): Firebase auth
(phone/email) → contacts sync with hashed phone-number matching → groups →
bar "invites" (manual entry or GPS "near me") → push notifications via Cloud
Functions/FCM → realtime RSVP status via Firestore listeners.
