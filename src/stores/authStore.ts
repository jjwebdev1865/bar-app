import { create } from 'zustand';

import { MOCK_USERS } from '../data/user';
import type { TAuthUser, TCredentials, TNamedCredentials } from '../types';

interface IAuthStore {
  user: TAuthUser | null;
  /**
   * Accounts created through the `CreateAccount` screen this session. Held
   * here rather than pushed into `MOCK_USERS` — that array is a bundled
   * fixture, not something a running app can write back to.
   */
  createdUsers: TNamedCredentials[];
  /** True when the credentials matched and `user` was set. */
  signIn: (credentials: TCredentials) => boolean;
  /** True when the username was free and the account was created + signed in. */
  signUp: (details: TNamedCredentials) => boolean;
  signOut: () => void;
  /** No-op when nobody is signed in. Set from the Profile screen's Favorites section. */
  setFavoriteBar: (locationId: string) => void;
  /**
   * Drops `favoriteBarId` when it points at a now-deleted location, leaving
   * `''` (rendered as "none"). Called by `locationsStore.removeLocation`,
   * never from a screen — the same fan-out rule as
   * `contactsStore.clearFavoriteBar`.
   */
  clearFavoriteBar: (locationId: string) => void;
  /** No-op when nobody is signed in. Set from the Profile screen's Favorites section. */
  setFavoriteDrink: (favoriteDrink: string) => void;
  /** No-op when nobody is signed in. Set from the Profile screen's Favorites section. */
  setFavoriteShot: (favoriteShot: string) => void;
}

/**
 * Who is signed in, or `null` for nobody.
 *
 * This is the value `AppLayout`'s `Drawer.Protected` guards read, which makes
 * it the only store whose state decides which screens exist. Flipping `user`
 * is therefore a navigation event: expo-router removes the guarded screens and
 * redirects to whatever is left, dropping their history entries as it goes.
 * Nothing needs to call `router` alongside a `signIn` / `signOut`.
 *
 * **Starts `null`, so the app opens on the login screen.** This store is not
 * persisted — a reload signs the user out, while the domain stores (contacts,
 * groups, locations) now hydrate from AsyncStorage and keep their data. That
 * asymmetry is deliberate: a session behind a `MOCK_USERS` `===` check is not
 * something to write to disk and trust on the next launch. Persisting the
 * session is part of real auth (step 04), not of saving the user's data.
 *
 * **`signIn` checks against `MOCK_USERS` plus `createdUsers`, and that is all
 * it checks.** A plain `===` against arrays sitting in memory is a fixture,
 * not authentication — it makes the gate demonstrable, not secure. Real
 * credentials are step 04 (`src/features/mvp/04_event_creation_api.md`), and
 * both `src/data/user.ts` and `createdUsers` get deleted rather than improved
 * when they land.
 *
 * **`createdUsers` is not persisted, same as `user`.** A `CreateAccount`
 * submit only ever lives for the current app session — a reload loses it
 * exactly as it loses the signed-in session, so the two disappearing together
 * reads as one rule rather than a surprise.
 *
 * Both `signIn` and `signUp` return a boolean instead of storing an error. A
 * rejected attempt is a fact about one submit, not app state — it belongs in
 * the form that can render it next to the fields, and it must not outlive the
 * screen. Keeping it here would mean remembering to clear it on unmount.
 *
 * No `isSignedIn` field: derive it at the call site with
 * `useAuthStore((state) => state.user !== null)`. A stored boolean would be a
 * second source of truth that can disagree with `user`, and the selector
 * returns a primitive, so it compares cleanly under zustand v5.
 *
 * No cross-store fan-out either. Unlike contacts → groups → locations, nothing
 * else keys off the user yet — the saved data belongs to the device, not to an
 * account, so `signOut` leaves it on disk and the next sign-in finds it again,
 * and every account in `MOCK_USERS` currently sees the same saved contacts,
 * groups and locations. That is still wrong now that a second (and third)
 * account exists, and this is where it gets fixed: `signOut` grows a clear,
 * and the persist keys grow a per-account namespace (`persistKey` in
 * `persistStorage.ts` is the one place that builds them) — tracked as a
 * follow-up rather than done here, since it touches every persisted store.
 */
export const useAuthStore = create<IAuthStore>((set, get) => ({
  user: null,
  createdUsers: [],
  signIn: ({ username, password }) => {
    // Both halves are compared, and the caller is told only that the pair
    // failed — never which half, and never which account was closest.
    // Reporting "no such user" separately from "wrong password" turns a login
    // form into a way to enumerate accounts.
    const match = [...MOCK_USERS, ...get().createdUsers].find(
      (candidate) =>
        candidate.username === username && candidate.password === password,
    );
    if (!match) {
      return false;
    }

    // `user` holds no password. What the form collected stops here.
    set({
      user: {
        username,
        firstName: match.firstName,
        lastName: match.lastName,
        email: match.email,
        phone: match.phone,
        address: match.address,
        favoriteDrink: match.favoriteDrink,
        favoriteShot: match.favoriteShot,
      },
    });
    return true;
  },
  signUp: ({ username, password, firstName, lastName }) => {
    // Unlike `signIn`, a taken username *is* safe to name specifically — the
    // person submitting the form is choosing it, not guessing at someone
    // else's, so there is nothing to enumerate.
    const taken = [...MOCK_USERS, ...get().createdUsers].some(
      (candidate) => candidate.username === username,
    );
    if (taken) {
      return false;
    }

    set((state) => ({
      createdUsers: [
        ...state.createdUsers,
        { username, password, firstName, lastName },
      ],
      user: { username, firstName, lastName },
    }));
    return true;
  },
  signOut: () => set({ user: null }),
  setFavoriteBar: (locationId) =>
    set((state) =>
      state.user ? { user: { ...state.user, favoriteBarId: locationId } } : state,
    ),
  clearFavoriteBar: (locationId) =>
    set((state) =>
      state.user?.favoriteBarId === locationId
        ? { user: { ...state.user, favoriteBarId: '' } }
        : state,
    ),
  setFavoriteDrink: (favoriteDrink) =>
    set((state) => (state.user ? { user: { ...state.user, favoriteDrink } } : state)),
  setFavoriteShot: (favoriteShot) =>
    set((state) => (state.user ? { user: { ...state.user, favoriteShot } } : state)),
}));
