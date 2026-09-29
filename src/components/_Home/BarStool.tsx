import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Line, Path, Rect } from 'react-native-svg';

import type { TColorTokens, THomeSignalStage, TTranslate } from '../../types';

const SIGNAL_SIZE = 220;
const ART_WIDTH = 92;
const ART_HEIGHT = 129;
/** Stroke weight in the shared 100x140 art viewBox units. */
const STROKE = 4;

type TBarStoolStyles = ReturnType<typeof createStyles>;

interface IStoolProps {
  styles: TBarStoolStyles;
}

interface IOutlineArtProps {
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
function BourbonBottleOutline({ colors }: IOutlineArtProps) {
  return (
    <Svg width={ART_WIDTH} height={ART_HEIGHT} viewBox="0 0 100 140">
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

/**
 * Outline draft-beer tap handle — shown once there are contacts but nothing to
 * signal to. A draft is poured into a round and shared, which is the group the
 * button asks the user to create.
 *
 * Same 100x140 viewBox and stroke weight as the bottle, so the two read as one
 * set when the button swaps between them.
 */
function DraftHandleOutline({ colors }: IOutlineArtProps) {
  return (
    <Svg width={ART_WIDTH} height={ART_HEIGHT} viewBox="0 0 100 140">
      {/* Badge — the branded paddle at the top of the handle. */}
      <Path
        d="M 50 6 C 33 6 27 19 27 33 L 27 60 C 27 72 37 79 50 79 C 63 79 73 72 73 60 L 73 33 C 73 19 67 6 50 6 Z"
        fill="none"
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      {/* Badge lettering, echoing the bottle's label lines. */}
      <Line
        x1={37}
        y1={36}
        x2={63}
        y2={36}
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <Line
        x1={42}
        y1={50}
        x2={58}
        y2={50}
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      {/* Shaft joining the badge to the faucet. */}
      <Path
        d="M 44 79 L 44 95 M 56 79 L 56 95"
        fill="none"
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      {/* Faucet body and the spout dropping out of it. */}
      <Rect
        x={26}
        y={95}
        width={48}
        height={18}
        rx={6}
        fill="none"
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Path
        d="M 42 113 L 42 124 Q 42 130 50 130 Q 58 130 58 124 L 58 113"
        fill="none"
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Outline keg — shown once there is a group but no bar to send it to. A keg is
 * the one thing you cannot keep at home, so it stands for the place the group
 * has to go on a moment's notice.
 *
 * Same 100x140 viewBox and stroke weight as the bottle and the tap handle.
 */
function KegOutline({ colors }: IOutlineArtProps) {
  return (
    <Svg width={ART_WIDTH} height={ART_HEIGHT} viewBox="0 0 100 140">
      {/* Coupler neck on the crown, where the tap line would lock in. */}
      <Rect
        x={43}
        y={4}
        width={14}
        height={12}
        rx={3}
        fill="none"
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      {/* Top and bottom chimes — the rolled rims the keg stands and rolls on. */}
      <Rect
        x={22}
        y={16}
        width={56}
        height={14}
        rx={7}
        fill="none"
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Rect
        x={22}
        y={120}
        width={56}
        height={14}
        rx={7}
        fill="none"
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      {/* Barrel walls, bellying out between the two chimes. */}
      <Path
        d="M 28 30 C 16 56 16 94 28 120 M 72 30 C 84 56 84 94 72 120"
        fill="none"
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      {/* Hoops, set at the heights where the walls have bulged to x=20 / x=80. */}
      <Line
        x1={20}
        y1={56}
        x2={80}
        y2={56}
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <Line
        x1={20}
        y1={94}
        x2={80}
        y2={94}
        stroke={colors.stool}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </Svg>
  );
}

interface IBarStoolProps {
  /** Runs on press once the stool is showing. */
  activateSignal: () => void;
  /** Runs instead of `activateSignal` while the bottle is showing. */
  addFirstContact: () => void;
  /** Runs instead of `activateSignal` while the tap handle is showing. */
  addFirstGroup: () => void;
  /** Runs instead of `activateSignal` while the keg is showing. */
  addFirstLocation: () => void;
  t: TTranslate;
  colors: TColorTokens;
  /** Picks both the art and what pressing the button does. */
  stage: THomeSignalStage;
}

export const BarStool = ({
  activateSignal,
  addFirstContact,
  addFirstGroup,
  addFirstLocation,
  t,
  colors,
  stage,
}: IBarStoolProps) => {
  const styles = useMemo(() => createStyles(colors), [colors]);

  const accessibilityLabel = {
    contacts: t('homeAddFirstContactA11y'),
    groups: t('homeAddFirstGroupA11y'),
    locations: t('homeAddFirstLocationA11y'),
    ready: t('activateBarSignal'),
  }[stage];

  const onPress = {
    contacts: addFirstContact,
    groups: addFirstGroup,
    locations: addFirstLocation,
    ready: activateSignal,
  }[stage];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.signalButton,
        stage !== 'ready' && styles.signalButtonIdle,
        pressed && styles.signalButtonPressed,
      ]}
    >
      {stage === 'ready' ? <Stool styles={styles} /> : null}
      {stage === 'contacts' ? <BourbonBottleOutline colors={colors} /> : null}
      {stage === 'groups' ? <DraftHandleOutline colors={colors} /> : null}
      {stage === 'locations' ? <KegOutline colors={colors} /> : null}
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
