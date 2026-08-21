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
 * `app/`. `TRoutesInSync` below catches a half-done edit.
 */

/** Navigation targets. Assignable to expo-router's `Href` type. */
export enum EAppRoute {
  HOME = '/',
  CONTACTS = '/contacts',
  GROUPS = '/groups',
  LOCATIONS = '/locations',
  SETTINGS = '/settings',
}

/** File-route names, matching the filenames in `app/`. */
export enum EDrawerScreen {
  HOME = 'index',
  CONTACTS = 'contacts',
  GROUPS = 'groups',
  LOCATIONS = 'locations',
  SETTINGS = 'settings',
}

type TSameMembers<A, B> = keyof A extends keyof B
  ? keyof B extends keyof A
    ? true
    : false
  : false;

type TAssertTrue<T extends true> = T;

/**
 * Compile-time guard that both enums describe the same set of routes — adding a
 * member to one and forgetting the other is a type error here rather than a
 * dead drawer item at runtime. Type-only, so it costs nothing in the bundle.
 */
export type TRoutesInSync = TAssertTrue<
  TSameMembers<typeof EAppRoute, typeof EDrawerScreen>
>;
