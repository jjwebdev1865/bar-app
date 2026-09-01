import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { TColorTokens, TTranslate } from '../../types/common.types';

const SIGNAL_SIZE = 220;

type TBarStoolStyles = ReturnType<typeof createStyles>;

interface IStoolProps {
  styles: TBarStoolStyles;
}

/** Decorative stool built from stacked Views — the button's only content. */
function Stool({ styles }: IStoolProps) {
  return (
    <View style={styles.stool}>
      <View style={styles.seatTop} />
      <View style={styles.seat} />
      <View style={styles.pole} />
      <View style={styles.footrest} />
      <View style={styles.base} />
    </View>
  );
}

interface IBarStoolProps {
  activateSignal: () => void;
  t: TTranslate;
  colors: TColorTokens;
}

export const BarStool = ({ activateSignal, t, colors }: IBarStoolProps) => {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('activateBarSignal')}
      onPress={activateSignal}
      style={({ pressed }) => [
        styles.signalButton,
        pressed && styles.signalButtonPressed,
      ]}
    >
      <Stool styles={styles} />
    </Pressable>
  );
};

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    signalButton: {
      width: SIGNAL_SIZE,
      height: SIGNAL_SIZE,
      borderRadius: SIGNAL_SIZE / 2,
      borderWidth: 6,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: colors.white,
      backgroundColor: colors.accent,
    },
    signalButtonPressed: {
      opacity: 0.75,
      transform: [{ scale: 0.97 }],
    },
    stool: {
      width: 88,
      height: 128,
      alignItems: 'center',
    },
    seatTop: {
      width: 64,
      height: 10,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      backgroundColor: colors.stool,
    },
    seat: {
      width: 72,
      height: 14,
      borderRadius: 6,
      marginTop: -2,
      backgroundColor: colors.stool,
    },
    pole: {
      width: 10,
      flex: 1,
      marginTop: -1,
      marginBottom: -1,
      backgroundColor: colors.stool,
    },
    footrest: {
      position: 'absolute',
      top: 70,
      width: 52,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.stool,
    },
    base: {
      width: 64,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.stool,
    },
  });
