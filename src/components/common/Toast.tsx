import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFooterStore } from '../../stores/footerStore';
import { useToastStore } from '../../stores/toastStore';
import type { TColorTokens, TTranslate } from '../../types/common.types';

interface IToastProps {
  colors: TColorTokens;
  t: TTranslate;
}

/** How long a toast stays on screen before dismissing itself. */
const TOAST_DURATION_MS = 5000;

const MIN_TOAST_BOTTOM_OFFSET = 16;

/** Grows the close button's touch target to 48pt without inflating the row. */
const CLOSE_HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

/**
 * Stacks the banner on top of whatever the screen has pinned to its bottom.
 *
 * `footerHeight` excludes the safe-area padding its screen's `SafeAreaView`
 * applies underneath it, so both terms are needed; with no footer the height is
 * 0 and this collapses to the inset alone.
 */
const getToastOffsetStyle = (bottomInset: number, footerHeight: number) => ({
  bottom: bottomInset + footerHeight + MIN_TOAST_BOTTOM_OFFSET,
});

/**
 * App-wide confirmation banner, mounted once in `AppLayout` so it can outlast
 * the screen that raised it.
 *
 * Dismisses itself after `TOAST_DURATION_MS` or when closed, whichever lands
 * first. The wrapper is `box-none` so the banner and its close button take
 * touches while the empty space around them stays transparent to taps meant for
 * the screen underneath.
 */
export function Toast({ colors, t }: IToastProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const footerHeight = useFooterStore((state) => state.footerHeight);
  const messageKey = useToastStore((state) => state.messageKey);
  const showCount = useToastStore((state) => state.showCount);
  const hideToast = useToastStore((state) => state.hideToast);

  // `showCount` is unused in the body but belongs in the dependencies: it is
  // what restarts the timer when the same message is raised twice running.
  useEffect(() => {
    if (!messageKey) {
      return;
    }

    const timer = setTimeout(hideToast, TOAST_DURATION_MS);

    return () => clearTimeout(timer);
  }, [messageKey, showCount, hideToast]);

  if (!messageKey) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        getToastOffsetStyle(insets.bottom, footerHeight),
      ]}
    >
      <View style={styles.toast}>
        {/* The live region sits on the message rather than the row, so the
            close button stays a separately focusable control. */}
        <Text
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={styles.message}
        >
          {t(messageKey)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('close')}
          hitSlop={CLOSE_HIT_SLOP}
          onPress={hideToast}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.closeButtonPressed,
          ]}
        >
          <Text style={styles.closeGlyph}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      left: 20,
      right: 20,
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderRadius: 12,
      paddingLeft: 16,
      paddingRight: 12,
      paddingVertical: 14,
      backgroundColor: colors.success,
    },
    message: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: colors.onSuccess,
    },
    closeButton: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonPressed: {
      opacity: 0.6,
    },
    closeGlyph: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.onSuccess,
    },
  });
