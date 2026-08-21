import { create } from 'zustand';

import { MOCK_CONTACTS } from '../data/contacts';
import type { TContact } from '../types/common.types';
import { useGroupsStore } from './groupsStore';

interface IContactsStore {
  contacts: TContact[];
  addContact: (contact: TContact) => void;
  updateContact: (contact: TContact) => void;
  removeContact: (contactId: string) => void;
  clearFavoriteBar: (locationId: string) => void;
}

/**
 * Single source of truth for the contact list. Seeded from `MOCK_CONTACTS`
 * until real persistence exists — state still resets on app reload.
 *
 * Select atomically (`useContactsStore((state) => state.contacts)`) rather than
 * returning a new object from the selector; zustand v5 no longer shallow-compares
 * selector results, so an object literal would re-render on every store write.
 *
 * Edits and deletes fan out to `groupsStore`, which holds contact copies inside
 * each group and would otherwise show stale names.
 */
export const useContactsStore = create<IContactsStore>((set, get) => ({
  contacts: [...MOCK_CONTACTS],
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
      contacts: state.contacts.filter((existing) => existing.id !== contactId),
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

    // The group copies hold the same stale `favoriteBarId`, so re-sync them too.
    for (const contact of affected) {
      useGroupsStore
        .getState()
        .applyContactUpdate({ ...contact, favoriteBarId: '' });
    }
  },
}));
