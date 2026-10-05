import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TColorTokens } from '../../types';

interface IFinishActionsProps {
  homeLabel: string;
  profileLabel: string;
  onHome: () => void;
  onProfile: () => void;
  colors: TColorTokens;
}

/** Docked below the transcript once the questionnaire ends — where to next. */
export function FinishActions({
  homeLabel,
  profileLabel,
  onHome,
  onProfile,
  colors,
}: IFinishActionsProps) {
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <Pressable
          accessibilityRole="button"
          onPress={onHome}
          style={({ pressed }) => [
            styles.secondaryButton,
            styles.rowButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.secondaryButtonLabel}>{homeLabel}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onProfile}
          style={({ pressed }) => [
            styles.primaryButton,
            styles.rowButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonLabel}>{profileLabel}</Text>
        </Pressable>
      </View>
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
    buttonRow: {
      flexDirection: 'row',
      width: '100%',
      gap: 12,
    },
    rowButton: {
      flex: 1,
      minWidth: 0,
    },
    primaryButton: {
      minHeight: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      backgroundColor: colors.accent,
    },
    primaryButtonLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.onAccent,
    },
    secondaryButton: {
      minHeight: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: 'transparent',
    },
    secondaryButtonLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accent,
    },
    pressed: {
      opacity: 0.8,
    },
  });
