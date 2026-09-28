import { useMemo, type ReactNode } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

import { IDLE_TIMEOUT_MS } from '../../constants/idleTimeout';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';

interface IIdleTimeoutBoundaryProps {
  children: ReactNode;
}

/**
 * Signs the user out after `IDLE_TIMEOUT_MS` without a touch.
 *
 * Wraps the whole app rather than living on a screen, because idleness is a
 * property of the session and not of whatever happens to be rendered. Sign-out
 * goes through `authStore`, so the redirect to login is the same
 * `Drawer.Protected` flip a manual sign-out uses — this component never
 * navigates.
 *
 * **Activity is observed, never intercepted.** Both capture handlers return
 * `false`, which is what makes this a listener instead of a gesture: the
 * responder system asks on the way down the tree, we say no, and the touch
 * carries on to the button or scroll view that actually wanted it.
 *
 * The one gap is typing — keystrokes into a focused `TextInput` are not touch
 * events, so a long enough pause mid-form still counts as idle. The initial tap
 * on the field registers, and every form in this app is short, so it has not
 * been worth listening for keyboard events to close.
 */
export function IdleTimeoutBoundary({ children }: IIdleTimeoutBoundaryProps) {
  const isSignedIn = useAuthStore((state) => state.user !== null);
  const signOut = useAuthStore((state) => state.signOut);
  const showToast = useToastStore((state) => state.showToast);

  function handleIdle() {
    signOut();
    // A session that ends by itself has to say so — otherwise the user is
    // dropped back on a login form with no account of what happened. `Toast` is
    // mounted above the drawer, so the banner survives the screens being
    // swapped out underneath it.
    showToast('signedOutIdle');
  }

  // Not wrapped in `useCallback`: `useIdleTimeout` holds `onIdle` in a
  // latest-ref precisely so an unstable function cannot restart the countdown.
  const registerActivity = useIdleTimeout({
    timeoutMs: IDLE_TIMEOUT_MS,
    enabled: isSignedIn,
    onIdle: handleIdle,
  });

  const panHandlers = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: () => {
          registerActivity();
          return false;
        },
        // Scrolling and dragging are activity too, and neither begins a new
        // touch. This fires often, but the handler is a single ref write.
        onMoveShouldSetPanResponderCapture: () => {
          registerActivity();
          return false;
        },
      }).panHandlers,
    [registerActivity],
  );

  return (
    <View style={styles.root} {...panHandlers}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
