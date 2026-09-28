import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

import { reportError } from '../utils/errorReporter';

/**
 * Namespaces every key this app writes so the device store stays greppable and
 * a future `signOut` can wipe just our keys instead of calling `clear()` on a
 * store other libraries share.
 */
const STORAGE_KEY_PREFIX = 'bar-signal';

/** `persistKey('contacts')` → `'bar-signal:contacts'`. */
export function persistKey(name: string): string {
  return `${STORAGE_KEY_PREFIX}:${name}`;
}

/**
 * AsyncStorage with the throws swallowed.
 *
 * A disk write failing is not something a screen can recover from — the user
 * already saw the contact land in the list — so a failed read hydrates as
 * "nothing saved" and a failed write is reported and dropped. Letting the
 * rejection escape would surface as an unhandled promise rejection from inside
 * zustand's middleware, far from the action that caused it.
 */
const deviceStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (error) {
      reportError(error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      reportError(error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      reportError(error);
    }
  },
};

/**
 * The `storage` argument for zustand's `persist` middleware, JSON-encoded on
 * top of the device's AsyncStorage.
 *
 * `TPersisted` is the *partialized* slice a store writes, not its whole state —
 * actions are functions and must never reach JSON.
 *
 * Hydration is asynchronous: a persisted store starts at its initial value and
 * re-renders once the read resolves. That is invisible here because the app
 * opens on the login screen, which is several taps away from any domain data.
 */
export function createPersistStorage<TPersisted>() {
  return createJSONStorage<TPersisted>(() => deviceStorage);
}
