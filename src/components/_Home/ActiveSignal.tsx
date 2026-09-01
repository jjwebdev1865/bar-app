import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SignalMembersCard } from './SignalMembersCard';
import type {
  TBarLocation,
  TColorTokens,
  TGroup,
  TTranslate,
} from '../../types/common.types';

interface IActiveSignalProps {
  requestCancelSignal: () => void;
  selectedGroup: TGroup | null;
  selectedLocation: TBarLocation | null;
  colors: TColorTokens;
  elapsedLabel: string;
  t: TTranslate;
}

export const ActiveSignal = ({
  requestCancelSignal,
  selectedGroup,
  selectedLocation,
  colors,
  elapsedLabel,
  t,
}: IActiveSignalProps) => {
  const styles = useMemo(() => createStyles(colors), [colors]);

  const headingToLabel =
    selectedGroup && selectedLocation
      ? t('headingTo', {
          group: selectedGroup.name,
          location: selectedLocation.name,
        })
      : null;

  const timerAccessibilityLabel = [
    headingToLabel,
    `${t('travelTimer')}: ${elapsedLabel}`,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <View style={styles.activeSignal}>
      <View
        accessible
        accessibilityLabel={timerAccessibilityLabel}
        style={styles.timerBlock}
      >
        {headingToLabel ? (
          <Text style={styles.headingTo}>{headingToLabel}</Text>
        ) : null}
        <Text style={styles.timerLabel}>{t('travelTimer')}</Text>
        <Text style={styles.timerValue}>{elapsedLabel}</Text>
      </View>

      {selectedGroup ? (
        <SignalMembersCard
          contacts={selectedGroup.contacts}
          colors={colors}
          t={t}
        />
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('cancel')}
        onPress={requestCancelSignal}
        style={({ pressed }) => [
          styles.cancelButton,
          pressed && styles.cancelButtonPressed,
        ]}
      >
        <Text style={styles.cancelLabel}>{t('cancel')}</Text>
      </Pressable>
    </View>
  );
};

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    activeSignal: {
      width: '100%',
      maxWidth: 360,
      alignItems: 'center',
      gap: 20,
    },
    timerBlock: {
      width: '100%',
      alignItems: 'center',
      gap: 8,
    },
    headingTo: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 4,
      color: colors.accentMuted,
    },
    timerLabel: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: colors.accentMuted,
    },
    timerValue: {
      fontSize: 32,
      fontWeight: '800',
      textAlign: 'center',
      color: colors.accent,
    },
    cancelButton: {
      minHeight: 48,
      minWidth: 180,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      backgroundColor: colors.panel,
      borderColor: colors.border,
    },
    cancelButtonPressed: {
      opacity: 0.8,
    },
    cancelLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
  });
