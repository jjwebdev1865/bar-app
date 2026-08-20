import type { Edge } from 'react-native-safe-area-context';

/**
 * Edges for screens rendered under a visible drawer header.
 *
 * The navigator's header already consumes the top inset, so a screen below it
 * must not apply the top inset again — doing so double-pads the top and leaves
 * a visible gap under the header.
 *
 * Screens with `headerTransparent: true` (currently only Home) render behind
 * the header, so they also skip the top inset — but must add their own
 * `useHeaderHeight()` padding, which already includes that inset.
 */
export const HEADER_SCREEN_EDGES: readonly Edge[] = ['left', 'right', 'bottom'];
