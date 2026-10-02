/**
 * Single source of truth for the app's routes.
 *
 * Expo Router identifies a route two different ways, so both are modelled here:
 *
 * - `EAppRoute` — the URL path, used for navigation (`router.push`, `<Link
 *   href>`). These values are checked against the generated types in
 *   `.expo/types/router.d.ts`, so a typo fails at compile time.
 * - `EDrawerScreen` — the file-route name, used for the `name` prop on
 *   `<Drawer.Screen>`. This is the filename in `app/` without its extension,
 *   which is why Home is `index` here but `/` above — the two identifiers can't
 *   be collapsed into one enum.
 *
 * Adding a route means adding a member to both, plus the matching file in
 * `app/`. `TRoutesInSync` in `src/types/navigation.types.ts` catches a half-done
 * edit.
 *
 * These are runtime values, so they live here rather than in `src/types/`,
 * which is type-only.
 */

/** Navigation targets. Assignable to expo-router's `Href` type. */
export enum EAppRoute {
  HOME = '/',
  CONTACTS = '/contacts',
  GROUPS = '/groups',
  LOCATIONS = '/locations',
  PROFILE = '/profile',
  SETTINGS = '/settings',
  /**
   * Belongs here rather than in `ENestedRoute`: `app/login.tsx` sits directly
   * in `app/`, so it is a drawer-level file route even though `AppLayout` hides
   * it from the menu.
   */
  LOGIN = '/login',
  /** Same reasoning as `LOGIN` — reachable while signed out, hidden from the menu. */
  CREATE_ACCOUNT = '/create-account',
  /** Reachable only from Home's floating button, not from the drawer menu. */
  BARTENDER_BOT = '/bartender-bot',
}

/** File-route names, matching the filenames in `app/`. */
export enum EDrawerScreen {
  HOME = 'index',
  CONTACTS = 'contacts',
  GROUPS = 'groups',
  LOCATIONS = 'locations',
  PROFILE = 'profile',
  SETTINGS = 'settings',
  LOGIN = 'login',
  CREATE_ACCOUNT = 'create-account',
  BARTENDER_BOT = 'bartender-bot',
}

/**
 * Routes pushed onto a section's stack rather than reached from the drawer.
 *
 * Kept out of `EAppRoute` deliberately: that enum pairs with `EDrawerScreen`
 * under `TRoutesInSync`, and a route with no drawer item would break the pair.
 */
export enum ENestedRoute {
  CREATE_CONTACT = '/contacts/new',
  CREATE_GROUP = '/groups/new',
  CREATE_LOCATION = '/locations/new',
}

/**
 * File-route names inside a section stack (`app/contacts/`, `app/groups/`,
 * `app/locations/`). All three stacks have identical screen names, so one enum
 * serves `SectionStack` rather than three copies.
 */
export enum ESectionScreen {
  LIST = 'index',
  NEW = 'new',
}

/**
 * Query param naming the screen a pushed form should return to when it closes.
 *
 * A form route is reachable from more than one place — `/contacts/new` opens
 * from the contacts list *and* from the Home bar-signal button — and popping
 * the stack only ever lands on the list. Whoever pushes from outside the
 * section says where the user came from, and `FormScreen` honours it.
 */
export const RETURN_TO_PARAM = 'returnTo';

/**
 * Query param marking a `/bartender-bot` push as the one-time new-account
 * greeting rather than the plain "Hello World" the floating button opens.
 * `CreateAccount` sets it; the screen reads it to switch copy and show the
 * "Go to Profile" button.
 */
export const BARTENDER_BOT_WELCOME_PARAM = 'welcome';

/**
 * Narrows a raw `returnTo` param to a known route. Search params are strings
 * off a URL and can say anything, so an unrecognised value is discarded rather
 * than navigated to.
 */
export function toAppRoute(
  value: string | string[] | undefined,
): EAppRoute | null {
  if (typeof value !== 'string') {
    return null;
  }

  return Object.values(EAppRoute).find((route) => route === value) ?? null;
}
