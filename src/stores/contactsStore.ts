import { create } from 'zustand';

import { MOCK_CONTACTS } from '../data/contacts';
import type { TContact } from '../types/common.types';
import { useGroupsStore } from './groupsStore';

interface IContactsStore {
  contacts: TContact[];
  addContact: (contact: TContact) => void;
  updateContact: (contact: TContact) => void;
  removeContact: (contactId: string) => void;
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
export const useContactsStore = create<IContactsStore>((set) => ({
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
}));
