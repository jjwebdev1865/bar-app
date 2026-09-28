import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { TContact } from '../types/common.types';
import { useGroupsStore } from './groupsStore';
import { createPersistStorage, persistKey } from './persistStorage';

interface IContactsStore {
  contacts: TContact[];
  addContact: (contact: TContact) => void;
  updateContact: (contact: TContact) => void;
  removeContact: (contactId: string) => void;
  clearFavoriteBar: (locationId: string) => void;
}

/** The only field written to disk — the actions are functions. */
type TPersistedContacts = Pick<IContactsStore, 'contacts'>;

/**
 * Bump when the persisted shape changes in a way old saves cannot satisfy, and
 * add a `migrate` alongside it. Until then a version mismatch drops the save.
 */
const CONTACTS_PERSIST_VERSION = 1;

/**
 * Single source of truth for the contact list.
 *
 * **Starts empty.** There is no `MOCK_CONTACTS` seed any more — the roster is
 * whatever the signed-in user creates on the Contacts screen, so a fresh launch
 * shows the `noContacts` empty state until they add someone. Contacts are the
 * first domain to become per-account (phone-number matching is the V1 plan), and
 * a shared fixture that every account sees would have to be unlearned the moment
 * real data lands.
 *
 * **Persisted to the device**, like `groupsStore` and `locationsStore`. Every
 * `set()` below writes the roster to AsyncStorage through `persist`, and a
 * relaunch hydrates it back — so a contact the user typed survives a reload
 * even though nothing is signed in yet. Only `contacts` is written
 * (`partialize`); the actions are functions and cannot be JSON.
 *
 * Hydration is async, so the first render after launch still sees `[]`. Nothing
 * gates on that: the app opens on the login screen, and the read has long
 * resolved by the time the Contacts screen mounts.
 *
 * Select atomically (`useContactsStore((state) => state.contacts)`) rather than
 * returning a new object from the selector; zustand v5 no longer shallow-compares
 * selector results, so an object literal would re-render on every store write.
 *
 * Edits and deletes fan out to `groupsStore`, which holds contact copies inside
 * each group and would otherwise show stale names.
 */
export const useContactsStore = create<IContactsStore>()(
  persist(
    (set, get) => ({
      contacts: [],
      addContact: (contact) =>
        set((state) => ({ contacts: [...state.contacts, contact] })),
      updateContact: (contact) => {
        set((state) => ({
          contacts: state.contacts.map((existing) =>
            existing.id === contact.id ? contact : existing,
          ),
        }));
        useGroupsStore.getState().applyContactUpdate(contact);
      },
      removeContact: (contactId) => {
        set((state) => ({
          contacts: state.contacts.filter(
            (existing) => existing.id !== contactId,
          ),
        }));
        useGroupsStore.getState().removeContactFromGroups(contactId);
      },
      /**
       * Drops `favoriteBarId` on every contact that pointed at a now-deleted
       * location, leaving `''` (rendered as "none"). Called by
       * `locationsStore.removeLocation`, never from a screen — the same fan-out
       * rule as `updateContact`.
       */
      clearFavoriteBar: (locationId) => {
        const affected = get().contacts.filter(
          (contact) => contact.favoriteBarId === locationId,
        );

        if (affected.length === 0) {
          return;
        }

        set((state) => ({
          contacts: state.contacts.map((contact) =>
            contact.favoriteBarId === locationId
              ? { ...contact, favoriteBarId: '' }
              : contact,
          ),
        }));

        // The group copies hold the same stale `favoriteBarId`, so re-sync them
        // too.
        for (const contact of affected) {
          useGroupsStore
            .getState()
            .applyContactUpdate({ ...contact, favoriteBarId: '' });
        }
      },
    }),
    {
      name: persistKey('contacts'),
      version: CONTACTS_PERSIST_VERSION,
      storage: createPersistStorage<TPersistedContacts>(),
      partialize: (state): TPersistedContacts => ({ contacts: state.contacts }),
    },
  ),
);
