import { create } from 'zustand';

import type { TBarLocation } from '../types/common.types';
import { useContactsStore } from './contactsStore';

interface ILocationsStore {
  locations: TBarLocation[];
  addLocation: (location: TBarLocation) => void;
  updateLocation: (location: TBarLocation) => void;
  removeLocation: (locationId: string) => void;
}

/**
 * Single source of truth for bar locations.
 *
 * **Starts empty**, like `contactsStore` and `groupsStore` — the app now opens
 * with no domain data at all. Still in-memory, so a reload empties it again.
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
 * bar keeps a dangling id. Dependency direction is locations → contacts →
 * groups; don't add a reverse edge.
 */
export const useLocationsStore = create<ILocationsStore>((set) => ({
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
  },
}));
