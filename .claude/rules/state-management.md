---
paths:
  - "src/stores/**/*.ts"
  - "src/pages/**/*.tsx"
  - "src/components/**/*.tsx"
---

# State Management

## Stack
- **zustand 5** for shared domain state (not Redux, not Context)
- **React Context** only for cross-cutting app config — `src/context/SettingsContext.tsx` (theme mode, language, `t()`)
- **No persistence yet** — every store is in-memory and resets on app reload

## Stores
- Stores live in `src/stores/` as `<domain>Store.ts` (`contactsStore.ts`, `groupsStore.ts`)
- Plain module-level `create()` — no provider wrapper. The data is app-global and
  singular, so per-subtree store instances would be ceremony.
- Seed initial state from `src/data/*.ts` mocks with a copy (`[...MOCK_CONTACTS]`),
  never the imported array itself
- Type the store with an `I<Domain>Store` interface holding state fields first,
  then actions
- All mutations go through store actions — never mutate state outside a `set()`

## Selecting State
**Select atomically — one hook call per value:**

```tsx
// GOOD
const contacts = useContactsStore((state) => state.contacts);
const addContact = useContactsStore((state) => state.addContact);

// BAD — object literal from the selector re-renders on every store write
const { contacts, addContact } = useContactsStore((state) => ({
  contacts: state.contacts,
  addContact: state.addContact,
}));
```

zustand v5 dropped the automatic shallow-compare on selector results. If a
multi-value selector is genuinely needed, wrap it in `useShallow` from
`zustand/react/shallow`.

## Screen vs. Store State
- Domain data more than one screen touches → a zustand store
- UI-only state (open modal, selected row, form draft) → screen-level `useState`
- No prop drilling of domain data — components in `src/components/` subscribe to
  the store directly, even though `colors` and `t` still arrive as props

The line is whether the component could have looked the value up itself:

```tsx
// BAD — a plain store read, drilled through the parent
<GroupDetailModal availableContacts={contacts} ... />
<LocationDetailModal favoriteCount={countFavoriteContacts(loc, contacts)} ... />

// GOOD — the component reads what it needs
const availableContacts = useContactsStore((state) => state.contacts);

// GOOD — a *selection* is not a store read. The modal cannot know which row was
// tapped, so the entity and its save/delete callbacks stay props.
<GroupDetailModal group={selectedGroup} onSave={updateGroup} ... />
```

## Cross-Store Sync
`TGroup.contacts` holds full `TContact` copies rather than IDs, so those copies go
stale when a contact changes.

- `contactsStore.updateContact` / `removeContact` fan out to
  `groupsStore.applyContactUpdate` / `removeContactFromGroups` via
  `useGroupsStore.getState()`
- **Keep the fan-out inside the store action.** A screen that calls only
  `updateContact` must not be able to skip the sync — never call
  `applyContactUpdate` / `removeContactFromGroups` from a component
- Dependency direction is contacts → groups. Don't add the reverse edge.

## Adding New State
1. Add the field and action to the `I<Domain>Store` interface
2. Implement the action inside `create<I...Store>((set) => ({ ... }))`
3. Document any cross-store fan-out in the store's JSDoc block
4. Subscribe with an atomic selector in the consuming component
