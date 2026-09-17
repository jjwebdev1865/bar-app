import { StyleSheet } from 'react-native';

import type { TColorTokens } from '../types/common.types';

/**
 * Header appearance shared by the drawer and by any stack nested inside it.
 *
 * A pushed screen renders its own navigator's header, so without a shared
 * source the drawer's header and a nested stack's header drift apart — same
 * app, two different bars. Callers memoise on `colors`.
 */
export function createHeaderOptions(colors: TColorTokens) {
  const styles = createStyles(colors);

  return {
    headerStyle: styles.header,
    headerTintColor: colors.accent,
    headerTitleStyle: styles.headerTitle,
    headerShadowVisible: false,
  };
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    header: {
      backgroundColor: colors.background,
    },
    headerTitle: {
      color: colors.accent,
      fontWeight: '800',
    },
  });
