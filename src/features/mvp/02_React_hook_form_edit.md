# React Hook Form — Edit Forms as Pages

Written 2026-09-18. Scope: the three **edit** surfaces (contact, group,
location), which step 01 explicitly deferred. Nothing here is implemented yet —
every box is unchecked.

## Context

Step 01 moved all three *create* forms onto real routes behind a shared
`FormScreen`, and closed with:

> **Detail and edit modals.** `ContactDetailModal`, `GroupDetailModal`,
> `LocationDetailModal` and `GroupMembersModal` keep working as they are. Their
> page migration is a separate step.

This is that step. Today a row tap sets `selectedContactId` on the list screen,
which renders a `<Modal>` holding *two* views — a read-only `InfoRow` stack and
a `useForm`-backed edit stack — toggled by an `isEditing` boolean, plus its own
`reset`-on-open effect and its own Cancel/Save/Delete footer. That is ~530 lines
per entity, three times over, for a form the create route already renders in 95.

After this step, tapping a row pushes a pre-populated form page. The read-only
view is dropped: the form *is* the read view, since every editable value is
already on screen in a labelled field. The handful of values that aren't
editable (a location's coordinates and favorite count) render as static rows
inside the same page.

```
Contacts list
  └─ tap row ──> /contacts/[id]      (edit form, pre-filled)
                   [ Cancel ] [ Save ]
                   [ Delete contact ]
```

Deleted at the end: `ContactDetailModal`, `GroupDetailModal`,
`LocationDetailModal`, `GroupMembersModal`, and `CreateModal` (whose last
consumer was `GroupMembersModal`).

## Order of work

### 1. `src/types/navigation.types.ts` — the dynamic routes

Edit routes carry a path parameter, so they can't join `ENestedRoute`, whose
members are complete hrefs passed straight to `router.push`. Add a sibling enum
holding the *pattern* instead:

- [ ] `EEditRoute { EDIT_CONTACT = '/contacts/[id]', EDIT_GROUP = '/groups/[id]',
      EDIT_LOCATION = '/locations/[id]' }`
- [ ] `ESectionScreen` gains `EDIT = '[id]'`, matching the filename the same way
      `LIST` and `NEW` do

Navigation uses the object form, never string concatenation:

```tsx
router.push({ pathname: EEditRoute.EDIT_CONTACT, params: { id: item.id } })
```

With `experiments.typedRoutes` on, this is what gets checked — the pathname is
validated against the generated route patterns in `.expo/types/router.d.ts` *and*
`params` is required to supply `id`. A hand-built `` `/contacts/${id}` `` would
typecheck as a bare string and silently break on a rename.

`TRoutesInSync` is unaffected: it pairs `EAppRoute` with `EDrawerScreen`, and
neither gains a member.

**Static beats dynamic in Expo Router's ranking**, so `/contacts/new` keeps
resolving to `new.tsx` rather than `[id].tsx` with `id === 'new'`. Worth knowing
because nothing fails loudly if that assumption is wrong — the create route would
just start rendering an edit form for a contact that doesn't exist.

### 2. `SectionStack` — a third screen

- [ ] `ISectionStackProps` gains `editTitle: TTranslationKey`
- [ ] A third `<Stack.Screen name={ESectionScreen.EDIT} options={{ title: t(editTitle) }} />`
- [ ] The three layout wrappers pass `editContact` / `editGroup` / `editLocation`
      — all three keys already exist, since the modals used them as their header
      text

### 3. `src/hooks/useLastKnownRecord.ts` — surviving the delete

An edit page derives its record from the store by id. That read returns
`undefined` in two very different situations:

1. **Never existed** — a deep link to `/contacts/bogus-id`. The page has nothing
   to render and should bounce to the list.
2. **Just deleted by this very screen** — Delete calls `removeContact`, the store
   write re-renders the still-mounted page, and the lookup goes empty for the one
   frame before the pop lands.

Treating both as "not found" makes case 2 fire a redirect that races the pop. A
one-value latch tells them apart:

```ts
/**
 * Holds the last non-null record so a delete doesn't blank the screen during
 * the frame between the store write and the pop. `undefined` means the record
 * was never there — a bad deep link, not a deletion.
 */
export function useLastKnownRecord<T>(record: T | undefined) {
  const lastKnown = useRef<T | undefined>(undefined);

  if (record) {
    lastKnown.current = record;
  }

  return lastKnown.current;
}
```

Writing a ref during render is deliberate and safe here — the assignment is
idempotent, so StrictMode's double-render produces the same value. `useEffect`
would be a frame late, which is exactly the frame that matters.

Each edit page then opens with:

```tsx
const { id } = useLocalSearchParams<{ id: string }>();
const contact = useContactsStore((state) =>
  state.contacts.find((existing) => existing.id === id),
);
const record = useLastKnownRecord(contact);

if (!record) {
  return <Redirect href={EAppRoute.CONTACTS} />;
}
```

`<Redirect>` rather than `router.replace` — navigating during render is what
`Redirect` exists for, and calling the imperative API there would warn.

### 4. `FormScreen` — a destructive action

The create pages have Cancel / Save. The edit pages need Delete too, without
disturbing that two-button row.

- [ ] Optional prop
      `destructiveAction?: { label: TTranslationKey; onPress: () => void }`
- [ ] Rendered as a full-width danger button at the **end of the scroll
      content**, not in the pinned footer. Keeping it inside the scroller means
      Delete has to be scrolled to rather than sitting a thumb-width from Save,
      and the footer's geometry stays byte-identical between create and edit
- [ ] It runs `onPress`, then `leaveForm()` — the same act-then-leave ordering
      `handleSubmit` already uses, so no screen owns the `canGoBack` fallback
- [ ] Danger styling lifts from the modals' `dangerActionButton` /
      `dangerActionLabel` (`colors.danger` / `colors.white`)

It renders after `children`, so it is the last child of the scroll content —
which also keeps every `useFieldLayout` consumer a direct child, as that hook
requires.

**No confirmation dialog**, matching today's modals, which delete on the first
tap. Flagged under "Deliberately not changing" — a page-level delete is a worse
mis-tap than a modal one, and this is the natural place to add one later.

### 5. `src/components/common/FormInfoRow.tsx`

The `InfoRow` that all three detail modals define identically (label above
value, one composite `accessibilityLabel` so a screen reader reads
`"Coordinates: 40.7128, -74.0060"`).

- [ ] Lift it once, taking `label: string` / `value: string` / `colors`
- [ ] Style from the modals' `fieldLabel` + `infoValue` — the same uppercase
      label treatment `FormTextField` uses, so a read-only row sits flush in a
      column of inputs
- [ ] Export from `src/components/common/index.ts`
- [ ] No `useFieldLayout` registration — a read-only row can never be an error

Only `EditLocation` needs it (coordinates, favorite count). It goes in `common`
anyway because it is the generic half of what three modals were each redefining.

### 6. Contacts

#### 6a. Duplicate checks that understand editing

`createContactFormSchema(existingContacts)` powers the create screen's
uniqueness rules; the detail modal used the plain `contactFormSchema`, so today
**you can rename a contact onto another contact's name** and nothing stops you.
Reusing the create schema as-is would be worse — a contact would collide with
its own stored name the moment you touched any field.

- [ ] `createContactFormSchema(existingContacts, excludeId?: string)` — filter
      `existingContacts` by `contact.id !== excludeId` before building the
      `takenNames` / `takenEmails` / `takenPhones` sets
- [ ] `CreateContact` calls it unchanged; `EditContact` passes `record.id`
- [ ] JSDoc: drop "Shared by the `CreateContact` screen and
      `ContactDetailModal`" from `contactFormSchema`, which now names a deleted
      file

#### 6b. `src/hooks/useContactForm.ts`

Create and edit would otherwise duplicate the memoised resolver, the `useForm`
config, the two `useWatch` calls, the cross-field revalidation effect, and the
`barOptions` memo — roughly 60 lines of genuinely subtle code, including the
comment explaining why correcting a first name has to retrigger the last name.

- [ ] `useContactForm(contact?: TContact)` returns `{ control, handleSubmit, barOptions }`
- [ ] Resolver memoised on `[existingContacts, contact?.id]` — the exclusion has
      to participate, or an edit would keep validating against a stale roster
- [ ] `defaultValues` built from `contact` when present, otherwise the empty
      shape seeded with `locations[0]?.id`
- [ ] The `toFormValues` mapping moves here from `ContactDetailModal`, **keeping
      the `formatPhoneDisplay(contact.phone)` seed** — that's what makes the
      phone field open showing the same text as the list row instead of
      reformatting on the first keystroke
- [ ] The `hasNameConflict` → `trigger(['firstName', 'lastName'])` effect moves
      here verbatim

**No `reset` effect anywhere.** The modal needed one because it mounted before a
contact was selected; a route mounts *with* its param, so the record is known on
the first render and `defaultValues` is enough. That also means a store change
from elsewhere won't clobber what the user is typing, which is the behavior an
edit form wants.

#### 6c. `src/components/MyContacts/ContactFormFields.tsx`

- [ ] `CONTACT_FIELDS` + `FAVORITE_BAR_AFTER` + the `Fragment`-wrapped render
      loop, lifted from `CreateContact.tsx:53-198`, taking
      `control` / `barOptions` / `colors` / `t`
- [ ] It returns a `Fragment` of `Fragment`s — **no wrapper `View`**. Each field
      must stay a direct child of `FormScreen`'s scroll content or
      `useFieldLayout` measures offsets against the wrapper and every scroll-to-
      error lands at the top. The constraint is already documented on
      `useFieldLayout`; repeat it in this component's JSDoc, since it is now one
      indirection further from the `ScrollView`

#### 6d. `src/pages/MyContacts/EditContact.tsx` + `app/contacts/[id].tsx`

- [ ] Param → store lookup → `useLastKnownRecord` → `Redirect` guard (step 3)
- [ ] `useContactForm(record)` → `<ContactFormFields>` inside `<FormScreen>`
- [ ] `handleSave` spreads `{ ...record, ...values }` with
      `nickname: values.nickname || undefined`, then `showToast('contactUpdated')`.
      Going through `updateContact` is what fans the change out to the group
      copies — the same rule as before, just from a page
- [ ] `destructiveAction` → `removeContact(record.id)` +
      `showToast('contactDeleted')`
- [ ] `submitLabel="save"`, `fallbackRoute={EAppRoute.CONTACTS}`

`CreateContact.tsx` shrinks to the same shape: `useContactForm()` with no
argument, `<ContactFormFields>`, `addContact`.

#### 6e. `MyContacts.tsx`

- [ ] Row `onPress` → `router.push({ pathname: EEditRoute.EDIT_CONTACT, params: { id: item.id } })`
- [ ] Delete `selectedContactId` state, the `selectedContact` lookup, the
      `updateContact` / `removeContact` selectors, `handleDelete`, and the
      `<ContactDetailModal>` element — all of it now lives on the edit page
- [ ] Add `accessibilityHint` to the row saying it opens the contact for editing;
      the tap target's destination changed and the label alone no longer says so

### 7. Locations

Same shape, minus the duplicate-name work (no uniqueness rules exist for
locations) and minus the hook (there's no resolver logic to share).

- [ ] `src/components/MyLocations/LocationFormFields.tsx` — `LOCATION_FIELDS` and
      its render loop from `CreateLocation.tsx:37-121`
- [ ] `src/pages/MyLocations/EditLocation.tsx` + `app/locations/[id].tsx`
- [ ] `defaultValues` from the record directly — `locationFormSchema` covers
      exactly the editable fields, so it is a plain pick, no mapping helper
- [ ] Save is `updateLocation({ ...record, ...values })`. **Coordinates carry
      through untouched**, exactly as `LocationDetailModal.handleSave` did — the
      create flow assigns them and nothing edits them
- [ ] Delete → `removeLocation(record.id)`, which fans out to
      `contactsStore.clearFavoriteBar` and on to the group copies. Unchanged
      behavior; worth a comment since the call site moved
- [ ] Two `<FormInfoRow>`s after the fields: coordinates, and
      `formatFavoriteOfLabel(countFavoriteContacts(record, contacts), t)`. Both
      helpers already exist in `utils/locationFormat.ts`
- [ ] Move `formatCoordinates` out of `LocationDetailModal` into
      `utils/locationFormat.ts` beside them, rather than re-typing the `toFixed(4)`
      pair a third time (`MyLocations.tsx` inlines it too, and should use it)
- [ ] `MyLocations.tsx` — same trim as 6e

### 8. Groups

- [ ] `src/pages/MyGroups/EditGroup.tsx` + `app/groups/[id].tsx`
- [ ] `defaultValues: { name: record.name, contactIds: record.contacts.map((c) => c.id) }`
      — the `toFormValues` from `GroupDetailModal:59-64`
- [ ] Members render through **`FormChecklist`**, inline, identical to
      `CreateGroup`. This is the piece 01 predicted: "`GroupMembersModal` holds a
      near-identical checklist… it's what should eventually collapse into this
      component." Editing membership becomes scroll-and-tap instead of a modal
      inside a modal
- [ ] Save resolves ids against `contactsStore` the same way `CreateGroup` does,
      so `TGroup.contacts` is rebuilt from current records rather than carrying
      stale copies forward
- [ ] Delete → `removeGroup(record.id)`; no fan-out, nothing points at a group
- [ ] `MyGroups.tsx` — same trim as 6e

No fields component here: it's one `FormTextField` and one `FormChecklist`, and
the `memberOptions` memo is four lines. Extracting that would cost more than it
saves.

### 9. Delete

- [ ] `src/components/MyContacts/ContactDetailModal.tsx`
- [ ] `src/components/MyGroups/GroupDetailModal.tsx`
- [ ] `src/components/MyGroups/GroupMembersModal.tsx` — and the whole
      `src/components/MyGroups/` directory with its barrel, now empty
- [ ] `src/components/MyLocations/LocationDetailModal.tsx`
- [ ] `src/components/common/CreateModal.tsx` and its barrel line —
      `GroupMembersModal` was its last consumer, the fact 01 recorded when it
      kept the file alive
- [ ] The three barrels' stale exports; `MyContacts/index.ts` and
      `MyLocations/index.ts` survive re-pointed at the new fields components

`initial_setup.md:195` carries an open TODO to break up
`ContactDetailModal.tsx` — deleting it closes that item rather than doing it.

### 10. i18n

Six keys in both `en.json` and `es.json`:

- [ ] `contactUpdated`, `groupUpdated`, `locationUpdated` — save toasts, matching
      `contactCreated`
- [ ] `contactDeleted`, `groupDeleted`, `locationDeleted` — delete toasts

The deletes are genuinely new copy. Deleting from a modal left the list visibly
one row shorter with the modal gone; deleting from a page pops you back to a
list that just looks slightly different, so the confirmation has to say what
happened.

Everything else exists: `editContact`, `editGroup`, `editLocation` (headers and
delete-button stems), `deleteContact`, `deleteGroup`, `deleteLocation`, `save`,
`cancel`, `coordinates`, `favoriteBar`, `favoriteOf`, `selectMembers`.

## Deliberately not changing

- **Unsaved-changes guard.** Still absent, and it matters more here than it did
  for create — abandoning a half-typed edit via the header back button or the
  iOS swipe-back silently discards it. The fix is unchanged from 01:
  `usePreventRemove` paired with `formState.isDirty`, added once inside
  `FormScreen` so all six forms get it. **Import from
  `expo-router/react-navigation`, not `@react-navigation/native`** — expo-router
  57 vendors `standard-navigation` and no longer depends on `@react-navigation/*`.
- **Delete confirmation.** Kept as a one-tap delete to match today's modals,
  which is the smaller change, but noted as the weakest point of this design.
  `CancelSignalModal` is the in-repo pattern to copy when it's wanted.
- **Duplicate-name rules for groups and locations.** Contacts get uniqueness via
  `createContactFormSchema`; the other two schemas have none, on either create or
  edit. Still needs new copy and a product call on what counts as a duplicate.
- **`TGroup.contacts` holding full copies.** The fan-out keeps them in sync and
  this step doesn't touch it. Storing ids would delete
  `applyContactUpdate` / `removeContactFromGroups` outright, but that's a store
  change, not a forms change.
- **`defaultBarId = locations[0]?.id`** on create, which makes an arbitrary bar
  the favorite. Untouched, and the edit path doesn't inherit it — an edit seeds
  from the contact's own `favoriteBarId`, blank included.

## Verification

Typed routes are on, so `.expo/types/router.d.ts` must regenerate before the
three `[id]` patterns typecheck.

- [ ] `npx expo start` once to regenerate route types, then `npx tsc --noEmit`.
      `EEditRoute` members are checked at their `router.push` call sites, so a
      wrong pattern fails here
- [ ] **Contacts**: tap a row → header reads "Edit contact", every field is
      pre-filled, phone shows `(555) 100-0001` rather than raw digits. Change the
      last name, Save, confirm the toast and the updated row
- [ ] **Self-collision**: open a contact, change nothing, Save. It must succeed —
      this is what `excludeId` buys. Then rename it onto *another* contact's
      name and confirm the duplicate error appears under both name fields
- [ ] **Group fan-out**: rename a contact who belongs to a group, then open that
      group and confirm the member list shows the new name
- [ ] **Groups**: tap a row, confirm the checklist opens with exactly the current
      members ticked; untick all, Save, confirm the members error renders inline
      rather than saving an empty group
- [ ] **Locations**: edit the address, Save, confirm coordinates are unchanged on
      the list row. Delete a location that is some contact's favorite bar, then
      open that contact and confirm Favorite bar reads "None"
- [ ] **Delete then redirect**: delete from each edit page and confirm it lands
      back on the list with a toast and **no flash of a redirect** — this is what
      `useLastKnownRecord` exists for
- [ ] **Bad deep link**: `npx uri-scheme open barsignal://contacts/does-not-exist --ios`
      must land on the contacts list, not a blank screen
- [ ] **Deep link to a real edit route**: `barsignal://contacts/contact-1 --ios`,
      then press Cancel — `leaveForm`'s `canGoBack` fallback should reach the
      list rather than dead-ending
- [ ] **Static beats dynamic**: `/contacts/new` still opens the create form, not
      an edit form for a contact named "new"
- [ ] **Keyboard**: focus a mid-form field on iOS and confirm the footer sits
      above the keyboard, and that the Delete button scrolls with the content
      rather than tracking it
- [ ] **Create regression**: all three create routes still work after
      `CreateContact` and `CreateLocation` were rewired through the new shared
      hook and fields components, including scroll-to-first-error on an empty
      submit
