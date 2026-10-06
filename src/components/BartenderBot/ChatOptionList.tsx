import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TChatOption, TColorTokens } from '../../types';

interface IChatOptionListProps {
  options: TChatOption[];
  onSelect: (id: string) => void;
  colors: TColorTokens;
}

/** Bottom-docked vertical list of tappable options — the bot's main menu and its sub-menus. */
export function ChatOptionList({ options, onSelect, colors }: IChatOptionListProps) {
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <Pressable
          accessibilityRole="button"
          key={option.id}
          onPress={() => onSelect(option.id)}
          style={({ pressed }) => [styles.option, pressed && styles.pressed]}
        >
          <Text style={styles.optionLabel}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    container: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      gap: 10,
    },
    option: {
      minHeight: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: 'transparent',
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accent,
    },
    pressed: {
      opacity: 0.8,
    },
  });
