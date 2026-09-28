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
- **AsyncStorage** (`@react-native-async-storage/async-storage`) behind
  zustand's `persist` middleware, for the stores that survive a reload. All
  three domain stores (contacts, groups, locations) are persisted; `authStore`
  and `SettingsContext` are still in-memory and reset on reload

## Stores
- Stores live in `src/stores/` as `<domain>Store.ts` (`contactsStore.ts`, `groupsStore.ts`)
- Plain module-level `create()` — no provider wrapper. The data is app-global and
  singular, so per-subtree store instances would be ceremony.
- Domain stores start empty (`contacts: []`, `groups: []`, `locations: []`).
  There is no mock seed data left — if you ever reintroduce a fixture, copy it
  (`[...MOCK_X]`) rather than using the imported array itself
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

## Persistence
Device storage goes through `src/stores/persistStorage.ts` — never import
AsyncStorage into a store or a screen directly. It exports `persistKey()` (key
namespacing) and `createPersistStorage<T>()` (JSON storage with read/write
failures reported instead of thrown).

```ts
export const useContactsStore = create<IContactsStore>()(
  persist(
    (set, get) => ({ ... }),
    {
      name: persistKey('contacts'),
      version: CONTACTS_PERSIST_VERSION,
      storage: createPersistStorage<TPersistedContacts>(),
      partialize: (state): TPersistedContacts => ({ contacts: state.contacts }),
    },
  ),
);
```

- `create<I...Store>()(persist(...))` — the curried `create` form is required
  for the middleware to type-check
- **Always `partialize`** down to the data fields. Actions are functions and
  cannot be JSON-encoded; a `TPersisted<Domain>` alias
  (`Pick<IStore, 'contacts'>`) names the slice
- Bump `version` and add a `migrate` when the persisted shape changes in a way
  old saves can't satisfy — a version mismatch drops the save otherwise
- Hydration is **asynchronous**: the store renders its initial value first and
  re-renders when the read resolves. Don't assume data is present on mount

## Adding New State
1. Add the field and action to the `I<Domain>Store` interface
2. Implement the action inside `create<I...Store>((set) => ({ ... }))`
3. Document any cross-store fan-out in the store's JSDoc block
4. Subscribe with an atomic selector in the consuming component
5. If the store is persisted, make sure the new field belongs in `partialize`
   (data) or deliberately stays out of it (transient UI state)
