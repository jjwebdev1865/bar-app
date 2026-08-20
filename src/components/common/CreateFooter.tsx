import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ColorTokens } from '../../theme/theme';

type CreateFooterProps = {
  label: string;
  onPress: () => void;
  colors: ColorTokens;
};

const MIN_FOOTER_BOTTOM_PADDING = 12;

const getFooterInsetStyle = (bottomInset: number) => ({
  paddingBottom: Math.max(bottomInset, MIN_FOOTER_BOTTOM_PADDING),
});

export function CreateFooter({ label, onPress, colors }: CreateFooterProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.footer, getFooterInsetStyle(insets.bottom)]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonLabel}>{label}</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: colors.panel,
      borderTopColor: colors.border,
    },
    button: {
      minHeight: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
    },
    buttonPressed: {
      opacity: 0.85,
    },
    buttonLabel: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.onAccent,
    },
  });
