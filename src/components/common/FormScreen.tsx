import { useRouter } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useCallback, useMemo, useRef, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type {
  FieldErrors,
  FieldValues,
  SubmitHandler,
  UseFormHandleSubmit,
} from 'react-hook-form';

import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import {
  FieldLayoutContext,
  type IFieldLayoutContextValue,
} from '../../hooks/useFieldLayout';
import type {
  TColorTokens,
  TTranslate,
  TTranslationKey,
} from '../../types/common.types';
import type { EAppRoute } from '../../types/navigation.types';

interface IFormScreenProps<TValues extends FieldValues> {
  /**
   * React Hook Form's own `handleSubmit`, not an already-composed handler — the
   * scroll-to-first-error pass is wired in here as its `onInvalid`.
   */
  handleSubmit: UseFormHandleSubmit<TValues>;
  /** Runs on a valid submit. The screen is left once it resolves. */
  onSubmit: SubmitHandler<TValues>;
  submitLabel: TTranslationKey;
  cancelLabel: TTranslationKey;
  /** Where Cancel lands when there is nothing to go back to. */
  fallbackRoute: EAppRoute;
  colors: TColorTokens;
  t: TTranslate;
  children: ReactNode;
}

/**
 * Page scaffolding for a form on its own route: safe area, keyboard avoidance,
 * a scrolling body and a pinned Cancel / submit footer. Leaving the screen is
 * owned here rather than by each form, so no screen can ship the deep-link
 * `canGoBack` bug.
 *
 * Satisfies `.claude/rules/safe-area-wrapper.md` on behalf of the screens that
 * use it — they render this as their outermost element instead of their own
 * `SafeAreaView`.
 *
 * **This is not `CreateFooter`.** That footer publishes its height to
 * `footerStore` so `Toast` can clear it. This one must not: the toast is raised
 * as the form pops, so it renders over the list screen underneath, whose own
 * footer height is already the right offset.
 */
export function FormScreen<TValues extends FieldValues>({
  handleSubmit,
  onSubmit,
  submitLabel,
  cancelLabel,
  fallbackRoute,
  colors,
  t,
  children,
}: IFormScreenProps<TValues>) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  // The stack header sits above this screen, so the keyboard has that much less
  // room to push into.
  const headerHeight = useHeaderHeight();

  const scrollRef = useRef<ScrollView>(null);
  // Filled by each field through `useFieldLayout` so an invalid submit can
  // scroll to the offending field. The footer is pinned, so without this a
  // validation failure further up the form reads as a button that does nothing.
  const fieldOffsets = useRef<Record<string, number>>({});

  const registerFieldOffset = useCallback((name: string, y: number) => {
    fieldOffsets.current[name] = y;
  }, []);

  const fieldLayout = useMemo<IFieldLayoutContextValue>(
    () => ({ registerFieldOffset }),
    [registerFieldOffset],
  );

  // `router.back()` alone would strand the user here when this screen is the
  // first in the stack — reachable via the `barsignal://` scheme, since these
  // forms are real deep-linkable routes.
  function leaveForm() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackRoute);
  }

  /**
   * Scrolls to the highest invalid field rather than the first one declared —
   * only fields that registered an offset are candidates, and screen order is
   * what the user is looking for. Dropdowns never register, so they are skipped.
   */
  function scrollToFirstError(formErrors: FieldErrors<TValues>) {
    let targetY: number | undefined;

    for (const name of Object.keys(formErrors)) {
      const offset = fieldOffsets.current[name];

      if (offset !== undefined && (targetY === undefined || offset < targetY)) {
        targetY = offset;
      }
    }

    if (targetY !== undefined) {
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
    }
  }

  const submit = handleSubmit(async (values) => {
    // Awaited so a slow store write can't race the pop.
    await onSubmit(values);
    leaveForm();
  }, scrollToFirstError);

  return (
    <SafeAreaView edges={HEADER_SCREEN_EDGES} style={styles.screen}>
      <KeyboardAvoidingView
        // Android resizes the window itself; iOS needs the padding, offset by
        // the header so the footer clears the keyboard rather than hiding
        // behind it.
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
        style={styles.keyboardAvoider}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
        >
          <FieldLayoutContext.Provider value={fieldLayout}>
            {children}
          </FieldLayoutContext.Provider>
        </ScrollView>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={leaveForm}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.secondaryLabel}>{t(cancelLabel)}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            // Stays pressable: `handleSubmit` renders each failure inline and
            // scrolls to the first one, rather than leaving a dead button.
            onPress={submit}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryLabel}>{t(submitLabel)}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: TColorTokens) => {
  const actionButton = {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderColor: colors.border,
  } as const;

  const actionLabel = {
    fontSize: 16,
    fontWeight: '800',
  } as const;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoider: {
      flex: 1,
    },
    body: {
      flex: 1,
    },
    bodyContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 24,
      gap: 14,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      backgroundColor: colors.panel,
      borderTopColor: colors.border,
    },
    secondaryButton: {
      ...actionButton,
      backgroundColor: colors.background,
    },
    primaryButton: {
      ...actionButton,
      backgroundColor: colors.accent,
    },
    buttonPressed: {
      opacity: 0.8,
    },
    secondaryLabel: {
      ...actionLabel,
      color: colors.text,
    },
    primaryLabel: {
      ...actionLabel,
      color: colors.onAccent,
    },
  });
};
