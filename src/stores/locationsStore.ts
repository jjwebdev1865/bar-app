import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { TBarLocation } from '../types';
import { useAuthStore } from './authStore';
import { useContactsStore } from './contactsStore';
import { createPersistStorage, persistKey } from './persistStorage';

interface ILocationsStore {
  locations: TBarLocation[];
  addLocation: (location: TBarLocation) => void;
  updateLocation: (location: TBarLocation) => void;
  removeLocation: (locationId: string) => void;
}

/** The only field written to disk — the actions are functions. */
type TPersistedLocations = Pick<ILocationsStore, 'locations'>;

/**
 * Bump when the persisted shape changes in a way old saves cannot satisfy, and
 * add a `migrate` alongside it. Until then a version mismatch drops the save.
 */
const LOCATIONS_PERSIST_VERSION = 1;

/**
 * Single source of truth for bar locations.
 *
 * **Starts empty and persists to the device**, like `contactsStore` and
 * `groupsStore` — a first launch has no domain data at all, and a reload
 * brings the saved bars back. Only `locations` is written (`partialize`); the
 * actions are functions and cannot be JSON. Hydration is async, so the first
 * render after launch still sees `[]`.
 *
 * With no locations, a new contact's `favoriteBarId` is `''` (rendered as
 * "none"); `contactFormSchema` allows that, so contacts can be created before
 * any bar exists.
 *
 * Select atomically (`useLocationsStore((state) => state.locations)`) rather than
 * returning a new object from the selector; zustand v5 no longer shallow-compares
 * selector results, so an object literal would re-render on every store write.
 *
 * `TContact.favoriteBarId` holds a location *id*, not a copy, so `updateLocation`
 * needs no fan-out — renaming a bar is picked up the next time a consumer looks
 * the id up. `removeLocation` does need one, or every contact that favored the
 * bar keeps a dangling id. Same reasoning applies to `authStore.user.favoriteBarId`
 * — the Profile screen's Favorites section. Dependency direction is locations →
 * contacts → groups, and locations → authStore; don't add a reverse edge.
 */
export const useLocationsStore = create<ILocationsStore>()(
  persist(
    (set) => ({
      locations: [],
      addLocation: (location) =>
        set((state) => ({ locations: [...state.locations, location] })),
      updateLocation: (location) =>
        set((state) => ({
          locations: state.locations.map((existing) =>
            existing.id === location.id ? location : existing,
          ),
        })),
      removeLocation: (locationId) => {
        set((state) => ({
          locations: state.locations.filter(
            (existing) => existing.id !== locationId,
          ),
        }));
        useContactsStore.getState().clearFavoriteBar(locationId);
        useAuthStore.getState().clearFavoriteBar(locationId);
      },
    }),
    {
      name: persistKey('locations'),
      version: LOCATIONS_PERSIST_VERSION,
      storage: createPersistStorage<TPersistedLocations>(),
      partialize: (state): TPersistedLocations => ({
        locations: state.locations,
      }),
    },
  ),
);
