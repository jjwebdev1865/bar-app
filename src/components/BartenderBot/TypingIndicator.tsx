import { StyleSheet, Text, View } from 'react-native';

import type { TColorTokens } from '../../types';

interface ITypingIndicatorProps {
  label: string;
  colors: TColorTokens;
}

/** Bot-styled bubble shown while the next question is "being typed." */
export function TypingIndicator({ label, colors }: ITypingIndicatorProps) {
  const styles = createStyles(colors);

  return (
    <View style={styles.row}>
      <View accessibilityLabel={label} style={styles.bubble}>
        <Text style={styles.dots}>•••</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    row: {
      width: '100%',
      flexDirection: 'row',
      marginVertical: 4,
    },
    bubble: {
      borderRadius: 16,
      borderBottomLeftRadius: 4,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: colors.panel,
    },
    dots: {
      fontSize: 16,
      letterSpacing: 2,
      color: colors.textMuted,
    },
  });
