import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TChatOption, TColorTokens } from '../../types';

interface IChatMultiSelectProps {
  options: TChatOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onDone: () => void;
  isDoneDisabled: boolean;
  doneLabel: string;
  colors: TColorTokens;
}

/** Bottom-docked toggle chips + a Done button — used to pick a group's members. */
export function ChatMultiSelect({
  options,
  selectedIds,
  onToggle,
  onDone,
  isDoneDisabled,
  doneLabel,
  colors,
}: IChatMultiSelectProps) {
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.chipRow}>
        {options.map((option) => {
          const isSelected = selectedIds.includes(option.id);
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              key={option.id}
              onPress={() => onToggle(option.id)}
              style={({ pressed }) => [
                styles.chip,
                isSelected && styles.chipSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={isSelected ? styles.chipLabelSelected : styles.chipLabel}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDoneDisabled }}
        disabled={isDoneDisabled}
        onPress={onDone}
        style={({ pressed }) => [
          styles.doneButton,
          isDoneDisabled && styles.doneButtonDisabled,
          pressed && !isDoneDisabled && styles.pressed,
        ]}
      >
        <Text style={styles.doneButtonLabel}>{doneLabel}</Text>
      </Pressable>
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
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    chip: {
      minHeight: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: 'transparent',
    },
    chipSelected: {
      backgroundColor: colors.accent,
    },
    chipLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.accent,
    },
    chipLabelSelected: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.onAccent,
    },
    doneButton: {
      minHeight: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      marginTop: 12,
      backgroundColor: colors.accent,
    },
    doneButtonDisabled: {
      backgroundColor: colors.accentMuted,
      opacity: 0.6,
    },
    doneButtonLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.onAccent,
    },
    pressed: {
      opacity: 0.8,
    },
  });
