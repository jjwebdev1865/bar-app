import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { TContact, TGroup } from '../types';
import { createPersistStorage, persistKey } from './persistStorage';

interface IGroupsStore {
  groups: TGroup[];
  addGroup: (group: TGroup) => void;
  updateGroup: (group: TGroup) => void;
  removeGroup: (groupId: string) => void;
  applyContactUpdate: (contact: TContact) => void;
  removeContactFromGroups: (contactId: string) => void;
}

/** The only field written to disk — the actions are functions. */
type TPersistedGroups = Pick<IGroupsStore, 'groups'>;

/**
 * Bump when the persisted shape changes in a way old saves cannot satisfy, and
 * add a `migrate` alongside it. Until then a version mismatch drops the save.
 */
const GROUPS_PERSIST_VERSION = 1;

/**
 * Single source of truth for groups.
 *
 * **Starts empty and persists to the device**, like `contactsStore` and
 * `locationsStore` — a first launch has no domain data at all, and after that
 * everything on screen is something the signed-in user made and kept. Only
 * `groups` is written (`partialize`); the actions are functions and cannot be
 * JSON. Hydration is async, so the first render after launch still sees `[]`.
 *
 * A group needs at least one member (`groupFormSchema`), so with no contacts
 * yet there is nothing to create a group from — contacts come first.
 *
 * `TGroup.contacts` holds full contact copies rather than IDs, so those copies
 * go stale whenever a contact changes. `applyContactUpdate` /
 * `removeContactFromGroups` exist to re-sync them and are called by
 * `contactsStore`, never directly from a screen — keeping the fan-out in one
 * place is what stops the two stores from drifting apart. Persistence does not
 * weaken that: the fan-out runs through `set()` here, so the re-synced copies
 * are what gets written, and the two saves can never disagree.
 */
export const useGroupsStore = create<IGroupsStore>()(
  persist(
    (set) => ({
      groups: [],
      addGroup: (group) =>
        set((state) => ({ groups: [...state.groups, group] })),
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
    }),
    {
      name: persistKey('groups'),
      version: GROUPS_PERSIST_VERSION,
      storage: createPersistStorage<TPersistedGroups>(),
      partialize: (state): TPersistedGroups => ({ groups: state.groups }),
    },
  ),
);
