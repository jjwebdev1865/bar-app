import type { EAppRoute, EDrawerScreen } from '../constants/routes';

type TSameMembers<A, B> = keyof A extends keyof B
  ? keyof B extends keyof A
    ? true
    : false
  : false;

type TAssertTrue<T extends true> = T;

/**
 * Compile-time guard that `EAppRoute` and `EDrawerScreen` describe the same set
 * of routes — adding a member to one and forgetting the other is a type error
 * here rather than a dead drawer item at runtime. Type-only, so it costs
 * nothing in the bundle.
 */
export type TRoutesInSync = TAssertTrue<
  TSameMembers<typeof EAppRoute, typeof EDrawerScreen>
>;
