# React Hook Form — Create Forms as Pages

Written 2026-09-18. Scope: the three **create** forms (contact, group,
location). Detail/edit modals are deliberately untouched — see
"Deliberately not changing".

## Context

React Hook Form + zod is already wired into every form in the app. Commit
`b6f92bc` converted all six create/edit surfaces to `useForm` + `zodResolver`,
and `FormTextField` / `FormDropdown` bind through `useController` — the correct
pattern for React Native, since RHF's `register()` depends on DOM refs. There
is no RHF *adoption* work left.

What's inconsistent is the presentation. `CreateContact` was promoted to a real
route (`/contacts/new`) in commit `1eabdde`, gaining a stack header, a pinned
footer, keyboard avoidance, scroll-to-first-error, and a deep link.
`CreateGroupModal` and `CreateLocationModal` are still dialogs inside
`CreateModal` — no header, a 240pt-max scroll region for the member list, no
route of their own.

This step brings group and location creation onto the same footing as contact
creation, and extracts the page scaffolding once instead of copying ~90 lines
of `KeyboardAvoidingView` / `ScrollView` / offset-tracking / footer plumbing
into two more screens (and three more again when edit pages follow).

## Order of work

### 1. Extract the page scaffold — `src/components/common/FormScreen.tsx`

A direct lift of `src/pages/MyContacts/CreateContact.tsx:210-285`. No new
behavior.

- [x] `SafeAreaView` with `HEADER_SCREEN_EDGES` (`src/constants/safeAreaEdges.ts`)
- [x] `KeyboardAvoidingView` — `padding` on iOS only, offset by
      `useHeaderHeight()` from `expo-router/react-navigation` (Android resizes
      the window itself)
- [x] `ScrollView` with `keyboardShouldPersistTaps="handled"`
- [x] Pinned Cancel / submit footer
- [x] `leaveForm()` — `router.canGoBack()` guarded, falling back to
      `router.replace()`
- [x] Move scroll-to-first-error in as a context (see below)

Props as built: `handleSubmit` (React Hook Form's own, so the scroll-to-error
pass can be wired in as its `onInvalid`), `onSubmit` (the valid handler),
`submitLabel` / `cancelLabel` (`TTranslationKey`), `fallbackRoute`
(`EAppRoute`), `colors`, `t`, `children`.

`leaveForm` stays private: `FormScreen` calls it once `onSubmit` resolves, so a
screen's submit handler ends at its `showToast` and no screen can ship the
deep-link `canGoBack` bug.

**This is not `CreateFooter`.** The list screens' single-button
`CreateFooter` publishes its height to `footerStore` so `Toast` can clear it.
The form footer is a two-button row and must *not* publish — the toast is
raised as the form pops, so it renders over the list screen underneath, whose
own footer height is already the right offset.

The submit button stays pressable rather than disabled. All three current forms
carry a comment explaining why (`handleSubmit` surfaces the errors inline; a
disabled button hides why nothing is happening, and the group member list has
no blur event to trigger `onTouched` validation). That reasoning still holds.

**Scroll-to-first-error becomes a context.** `FormScreen` owns the `ScrollView`
ref and the offsets map; `FormTextField` registers its own root `View` offset
through a `useFieldLayout(name)` hook that no-ops when no provider is present.
This deletes `fieldOffsets`, `recordFieldOffset`, `scrollToFirstError` and the
per-field `onLayout` wrapper from `CreateContact.tsx`, and every future form
gets the behavior for free.

Only `FormTextField` registers — `FormDropdown` is left alone. `favoriteBarId`
is an unconstrained `z.string()`, so it can never *be* the first error.

**Correction, found while building this.** The per-field wrapper Views *were*
flattened, and the two new forms must do the same. `onLayout` reports `y`
relative to the immediate parent, so a field nested one level down registers its
offset within that wrapper rather than within the form — every field would
report ~0 and the scroll would jump to the top. `CreateContact` now pairs the
phone field and the dropdown in a `<Fragment>`, which adds no layout node;
spacing is unchanged because the deleted `fieldSlot` gap matched the scroll
content's. `useFieldLayout`'s JSDoc carries the constraint, and `measureLayout`
against the content container is the escape hatch if a form ever needs to group
fields into sections.

### 2. Add `src/components/common/FormChecklist.tsx`

Groups are the only form with a non-text control.

- [x] Lift the member checklist out of `CreateGroupModal.tsx:110-147` into a
      `useController`-bound component mirroring `FormDropdown` — same prop
      shape, same error rendering via `translateFieldError`
- [x] Take `options: TDropdownOption[]` (reuse the type from `Dropdown.tsx`) so
      the group screen maps contacts in with `formatContactDisplayName`
- [x] Keep `accessibilityRole="checkbox"` + `accessibilityState={{ checked }}`
      per `.claude/rules/accessibility.md`

Two departures from the lifted markup, both because this now lives on a page
rather than in a dialog:

- **No inner `ScrollView`.** The modal's 240pt-max scroller existed because the
  dialog could not grow; inside `FormScreen`'s `ScrollView` a nested scroller
  would fight for the gesture and fix the list's height for no reason. The rows
  are a plain `View` with the same `gap`.
- **It registers its offset** via `useFieldLayout`, unlike `FormDropdown`. The
  reason dropdowns are skipped is that `favoriteBarId` is unconstrained and so
  can never *be* the first error; a checklist is typically required
  (`contactIds` is `min(1)`), so it can. Its root `View` is a direct child of
  the scroll content, as `useFieldLayout` requires.

`GroupMembersModal.tsx:66-97` holds a near-identical checklist. Leave it alone
this pass — it belongs to the edit flow — but it's what should eventually
collapse into this component.

### 3. Generalize the section stack

- [x] `src/navigation/ContactsLayout.tsx` → `src/navigation/SectionStack.tsx`,
      parameterized on `listTitle` / `newTitle` (`TTranslationKey`). Keeps the
      `DrawerToggleButton` on the list screen and `createHeaderOptions(colors)`
      from `headerOptions.ts` — the piece that keeps a nested stack's header
      visually identical to the drawer's
- [x] `ContactsLayout` / `GroupsLayout` / `LocationsLayout` become three-line
      wrappers around it, preserving the convention that `app/` files are thin
      re-exports of something in `src/`
- [x] `src/navigation/AppLayout.tsx` — add `headerShown: false` to the `GROUPS`
      and `LOCATIONS` drawer screens, with the same reasoning already commented
      on `CONTACTS` (the nested stack draws the header; leaving the drawer's on
      would stack two)

`SectionStack` is a named export — unlike the three layouts, it is not itself an
`app/` route, so nothing imports it as a default.

The `EContactsScreen` → `ESectionScreen` rename listed under step 4 was pulled
forward to here: `SectionStack` names its two screens with it, so the two edits
are one change.

**Groups and Locations have no header between this step and the next.** The
drawer's is now off for both, and the stack that replaces it does not exist
until step 4 creates `app/groups/_layout.tsx` and `app/locations/_layout.tsx`.

### 4. Routes

`app/groups.tsx` and `app/locations.tsx` become directories, mirroring
`app/contacts/`:

```
app/groups/_layout.tsx    → src/navigation/GroupsLayout
app/groups/index.tsx      → src/pages/MyGroups/MyGroups
app/groups/new.tsx        → src/pages/MyGroups/CreateGroup
app/locations/…             (same shape)
```

- [x] Create the six `app/` files — **four of them.** The two `new.tsx`
      re-exports are held until step 5: a route file whose import target does
      not exist yet fails both `tsc` and the Metro bundle, so they land with the
      pages they point at
- [x] Delete `app/groups.tsx`, `app/locations.tsx`

Drawer route names don't change (`EDrawerScreen.GROUPS` is still `groups` — a
directory with an `index` resolves the same as a file), so the `TRoutesInSync`
guard in `navigation.types.ts` is unaffected.

In `src/types/navigation.types.ts`:

- [x] `ENestedRoute` gains `CREATE_GROUP = '/groups/new'` and
      `CREATE_LOCATION = '/locations/new'`. Neither is *used* until step 6, and
      an enum member is only checked against the generated `Href` union at its
      call site — so these typecheck now and are verified for real once
      `MyGroups` / `MyLocations` push them
- [x] `EContactsScreen` generalizes to
      `ESectionScreen { LIST = 'index', NEW = 'new' }` — all three stacks have
      identical screen names, so one enum beats three copies *(done in step 3)*

### 5. The two new screens

`src/pages/MyGroups/CreateGroup.tsx` and
`src/pages/MyLocations/CreateLocation.tsx`, both structured exactly like
`CreateContact.tsx`:

```
useForm({ resolver: zodResolver(<schema>), mode: 'onTouched', defaultValues })
  → fields inside <FormScreen>
  → handleSubmit(handleCreate)
  → store action, showToast(...), leaveForm()
```

- [x] Reuse `groupFormSchema` / `locationFormSchema` from `src/validation/`
      as-is
- [x] Reuse `useGroupsStore.addGroup` / `useLocationsStore.addLocation` and
      `useToastStore.showToast`
- [x] Move `getRandomCoordinates` + the Gotham lat/long ranges verbatim from
      `CreateLocationModal.tsx:36-47` into the location page
- [x] Group submit resolves `contactIds` against `contactsStore` to build the
      `TGroup.contacts` copies, same as `CreateGroupModal.tsx:76-84` — that's
      what keeps the copies built from current contact records
- [x] `app/groups/new.tsx` and `app/locations/new.tsx`, the two step-4 route
      files that were waiting on these pages

Step 8's four i18n keys were pulled forward too — `submitLabel` and `showToast`
both take a `TTranslationKey`, so the pages do not typecheck without them.

**No reset-on-open effect in either.** The route unmounts when popped, so every
push starts from a fresh form. This deletes the `visible`-guarded `reset`
effects both modals currently need (`CreateGroupModal.tsx:60`,
`CreateLocationModal.tsx:57`).

### 6. List screens

- [x] `MyGroups.tsx` — drop `createVisible` state and the `<CreateGroupModal>`
      element; `CreateFooter`'s `onPress` becomes
      `router.push(ENestedRoute.CREATE_GROUP)`, matching `MyContacts.tsx:96-100`
- [x] `MyLocations.tsx` — same

Each list screen also drops its `addGroup` / `addLocation` selector — the create
page calls the store action itself now.

### 7. Delete

- [x] `src/components/MyGroups/CreateGroupModal.tsx`
- [x] `src/components/MyLocations/CreateLocationModal.tsx`
- [x] Their exports from the two `index.ts` barrels

`CreateModal.tsx` stays — `GroupMembersModal` still uses it.

`groupSchema.ts` / `locationSchema.ts` JSDoc updated — both named the deleted
modals as their callers.

### 8. i18n

Four keys in both `src/i18n/locales/en.json` and `es.json`:

- [x] `groupCreated`, `locationCreated` — toasts, matching `contactCreated`
- [x] `addGroup`, `addLocation` — submit buttons, matching `addContact`

*(Both done in step 5 — the new screens don't typecheck without them.)*

Everything else the new screens need already exists: `createGroup`,
`createLocation`, `groupName`, `locationName`, `address`, `selectMembers`,
`cancel`.

## Follow-on: structured location addresses

Landed after the migration, not part of it. `TBarLocation.address` was a single
string; it now carries the same parts a contact does (`addressLine1`,
`addressLine2`, `city`, `state`, `zip`), pulled up into a shared
`TPostalAddress` in `common.types.ts`.

- `CreateLocation` and `LocationDetailModal`'s edit mode render the same six
  fields in the same order as the contact form, ZIP masked with `formatZipInput`
- `addressLine1` stays required (`addressRequired`, the message the old single
  field used) and the rest are "blank or valid", matching `contactFormSchema`.
  Making them all optional would have quietly dropped a rule the app already had
- `formatContactAddress` became `formatAddressLines` in a new
  `utils/addressFormat.ts` — it was never contact-specific. A
  `formatAddressSummary` joins the same parts with commas for the one-line list
  row and the accessibility labels, where a `\n` would not survive
- `MOCK_LOCATIONS` split into parts; the five addresses were already
  `<street>, Gotham City`, so they gained `NJ` and a ZIP to match the contact
  mocks

## Deliberately not changing

- **Detail and edit modals.** `ContactDetailModal`, `GroupDetailModal`,
  `LocationDetailModal` and `GroupMembersModal` keep working as they are. Their
  page migration is a separate step.
- **Unsaved-changes guard.** A form on a route can be abandoned via the header
  back button or the iOS swipe-back gesture — exits a dialog never had. The
  current modals also discard silently, so omitting this preserves today's
  behavior rather than regressing it. When wanted, it's `usePreventRemove`
  paired with RHF's `formState.isDirty`, added once inside `FormScreen`.

  **Import note:** in SDK 57 this comes from `expo-router/react-navigation`,
  **not** `@react-navigation/native` — expo-router 57 no longer depends on
  `@react-navigation/*` and vendors `standard-navigation` instead. Verified
  present at `expo-router/build/react-navigation/core/usePreventRemove.d.ts`,
  re-exported through `native/index.d.ts`.
- **Duplicate-name validation for groups and locations.** Contacts get this via
  `createContactFormSchema(existingContacts)`; the other two schemas have no
  uniqueness rules. Worth matching later, but it needs new copy and a product
  call on what counts as a duplicate.
- **`defaultBarId = locations[0]?.id`** in `CreateContact.tsx:106`, which
  silently makes an arbitrary bar the favorite. Unrelated to this migration.

## Verification

Typed routes are on (`app.json` → `experiments.typedRoutes`), so
`.expo/types/router.d.ts` must regenerate before the new paths typecheck.

- [x] `npx expo start` once to regenerate route types, then `npx tsc --noEmit`.
      `ENestedRoute` values are checked against the generated `Href` union, so a
      wrong path fails here — `router.d.ts` now carries `/groups/new` and
      `/locations/new`, and `tsc` is clean with both enum members in use

Everything below is a device walk-through and is **still open** — none of it has
been run.
- [ ] **Groups**: drawer → Groups → *Create group*. Stack header titled "Create
      Group" with a back button; submit empty and confirm both the name and
      members errors render inline; fill both, submit, confirm the toast appears
      above the list footer and the new row is present
- [ ] **Locations**: same walk-through; confirm the created row shows non-zero
      coordinates
- [ ] **Deep link** both new routes — this is what `leaveForm`'s `canGoBack`
      fallback exists for:
      `npx uri-scheme open barsignal://groups/new --ios`, then press Cancel and
      confirm it lands on the groups list rather than dead-ending
- [ ] **Keyboard**: focus the group name field, confirm the footer sits above
      the keyboard rather than behind it (iOS is the case that matters)
- [ ] **Contacts regression**: `/contacts/new` still creates, and submitting the
      empty form still scrolls to the first invalid field now that offset
      tracking runs through `FormScreen`'s context instead of the screen's local
      ref
- [ ] **Drawer headers**: Groups and Locations show exactly one header, with the
      drawer toggle on the list screen
