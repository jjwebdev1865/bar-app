import { create } from 'zustand';

import { MOCK_USER } from '../data/user';
import type { TAuthUser, TCredentials } from '../types/common.types';

interface IAuthStore {
  user: TAuthUser | null;
  /** True when the credentials matched and `user` was set. */
  signIn: (credentials: TCredentials) => boolean;
  signOut: () => void;
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
 * **Starts `null`, so the app opens on the login screen.** Like every other
 * store here it is in-memory, so a reload signs the user out — the same
 * "no persistence yet" caveat that applies to contacts, groups and theme,
 * except that here it is visible on launch rather than after a save.
 *
 * **`signIn` checks against `MOCK_USER`, and that is all it checks.** A plain
 * `===` against a pair sitting in the bundle is a fixture, not authentication —
 * it makes the gate demonstrable, not secure. Real credentials are step 04
 * (`src/features/mvp/04_event_creation_api.md`), and `src/data/user.ts` gets
 * deleted rather than improved when they land.
 *
 * It returns a boolean instead of storing an error. A rejected sign-in is a
 * fact about one submit, not app state — it belongs in the form that can
 * render it next to the fields, and it must not outlive the screen. Keeping it
 * here would mean remembering to clear it on unmount.
 *
 * No `isSignedIn` field: derive it at the call site with
 * `useAuthStore((state) => state.user !== null)`. A stored boolean would be a
 * second source of truth that can disagree with `user`, and the selector
 * returns a primitive, so it compares cleanly under zustand v5.
 *
 * No cross-store fan-out either. Unlike contacts → groups → locations, nothing
 * else keys off the user yet — the domain stores still hold shared mock data
 * rather than per-account data. When they become per-account, clearing them is
 * what `signOut` grows.
 */
export const useAuthStore = create<IAuthStore>((set) => ({
  user: null,
  signIn: ({ username, password }) => {
    // Both halves are compared, and the caller is told only that the pair
    // failed — never which half. Reporting "no such user" separately from
    // "wrong password" turns a login form into a way to enumerate accounts.
    if (username !== MOCK_USER.username || password !== MOCK_USER.password) {
      return false;
    }

    // `user` holds no password. What the form collected stops here.
    set({ user: { username } });
    return true;
  },
  signOut: () => set({ user: null }),
}));
