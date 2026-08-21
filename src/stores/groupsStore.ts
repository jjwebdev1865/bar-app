import { create } from 'zustand';

import { MOCK_GROUPS } from '../data/groups';
import type { TContact, TGroup } from '../types/common.types';

interface IGroupsStore {
  groups: TGroup[];
  addGroup: (group: TGroup) => void;
  updateGroup: (group: TGroup) => void;
  removeGroup: (groupId: string) => void;
  applyContactUpdate: (contact: TContact) => void;
  removeContactFromGroups: (contactId: string) => void;
}

/**
 * Single source of truth for groups. Seeded from `MOCK_GROUPS` until real
 * persistence exists — state still resets on app reload.
 *
 * `TGroup.contacts` holds full contact copies rather than IDs, so those copies
 * go stale whenever a contact changes. `applyContactUpdate` /
 * `removeContactFromGroups` exist to re-sync them and are called by
 * `contactsStore`, never directly from a screen — keeping the fan-out in one
 * place is what stops the two stores from drifting apart.
 */
export const useGroupsStore = create<IGroupsStore>((set) => ({
  groups: [...MOCK_GROUPS],
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  updateGroup: (group) =>
    set((state) => ({
      groups: state.groups.map((existing) =>
        existing.id === group.id ? group : existing,
      ),
    })),
  removeGroup: (groupId) =>
    set((state) => ({
      groups: state.groups.filter((existing) => existing.id !== groupId),
    })),
  applyContactUpdate: (contact) =>
    set((state) => ({
      groups: state.groups.map((group) =>
        group.contacts.some((member) => member.id === contact.id)
          ? {
              ...group,
              contacts: group.contacts.map((member) =>
                member.id === contact.id ? contact : member,
              ),
            }
          : group,
      ),
    })),
  removeContactFromGroups: (contactId) =>
    set((state) => ({
      groups: state.groups.map((group) =>
        group.contacts.some((member) => member.id === contactId)
          ? {
              ...group,
              contacts: group.contacts.filter(
                (member) => member.id !== contactId,
              ),
            }
          : group,
      ),
    })),
}));
