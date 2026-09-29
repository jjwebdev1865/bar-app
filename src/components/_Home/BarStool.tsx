import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Line, Path, Rect } from 'react-native-svg';

import type { TColorTokens, TTranslate } from '../../types';

const SIGNAL_SIZE = 220;
const BOTTLE_WIDTH = 92;
const BOTTLE_HEIGHT = 129;
/** Stroke weight in bottle viewBox units. */
const STROKE = 4;

type TBarStoolStyles = ReturnType<typeof createStyles>;

interface IStoolProps {
  styles: TBarStoolStyles;
}

interface IBottleProps {
  colors: TColorTokens;
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

/**
 * Outline bourbon bottle — shown when there are no contacts yet. Drawn as SVG
 * so the shoulder can curve from neck to body as one continuous stroke.
 */
function BourbonBottleOutline({ colors }: IBottleProps) {
  return (
    <Svg width={BOTTLE_WIDTH} height={BOTTLE_HEIGHT} viewBox="0 0 100 140">
      {/* Cap — sits wider than the neck, its bottom edge closing the neck off. */}
      <Rect
        x={37}
        y={4}
        width={26}
        height={20}
        rx={4}
        fill="none"
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      {/* Neck, shoulders, body and heel as one open path under the cap. */}
      <Path
        d="M 42 24 L 42 54 C 42 68 20 72 20 84 L 20 126 Q 20 136 30 136 L 70 136 Q 80 136 80 126 L 80 84 C 80 72 58 68 58 54 L 58 24"
        fill="none"
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Label */}
      <Rect
        x={29}
        y={97}
        width={42}
        height={24}
        rx={3}
        fill="none"
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Line
        x1={36}
        y1={105}
        x2={64}
        y2={105}
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <Line
        x1={42}
        y1={113}
        x2={58}
        y2={113}
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </Svg>
  );
}

interface IBarStoolProps {
  activateSignal: () => void;
  /** Runs instead of `activateSignal` while the bottle is showing. */
  addFirstContact: () => void;
  t: TTranslate;
  colors: TColorTokens;
  /** When false, the button shows the bourbon bottle and routes to contacts. */
  contactsReady: boolean;
}

export const BarStool = ({
  activateSignal,
  addFirstContact,
  t,
  colors,
  contactsReady,
}: IBarStoolProps) => {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        contactsReady ? t('activateBarSignal') : t('homeAddFirstContactA11y')
      }
      onPress={contactsReady ? activateSignal : addFirstContact}
      style={({ pressed }) => [
        styles.signalButton,
        !contactsReady && styles.signalButtonIdle,
        pressed && styles.signalButtonPressed,
      ]}
    >
      {contactsReady ? (
        <Stool styles={styles} />
      ) : (
        <BourbonBottleOutline colors={colors} />
      )}
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
    signalButtonIdle: {
      opacity: 0.92,
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
