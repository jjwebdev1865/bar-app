import { Pressable, StyleSheet, Text } from 'react-native';

import type { TColorTokens } from '../../types';

interface IBartenderBotButtonProps {
  onPress: () => void;
  label: string;
  colors: TColorTokens;
}

export function BartenderBotButton({
  onPress,
  label,
  colors,
}: IBartenderBotButtonProps) {
  const styles = createStyles(colors);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <Text style={styles.icon}>🍸</Text>
    </Pressable>
  );
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    button: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      shadowColor: colors.white,
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    buttonPressed: {
      opacity: 0.8,
    },
    icon: {
      fontSize: 24,
    },
  });
