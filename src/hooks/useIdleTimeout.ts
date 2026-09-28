import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

interface IUseIdleTimeoutOptions {
  /** Idle time, in milliseconds, before `onIdle` fires. */
  timeoutMs: number;
  /** While false the timer is torn down entirely — nothing runs signed out. */
  enabled: boolean;
  onIdle: () => void;
}

/**
 * Fires `onIdle` once the app has gone `timeoutMs` without activity, and
 * returns the `registerActivity` callback a caller reports activity through.
 *
 * **Idleness is measured against the wall clock, not against elapsed timer
 * time.** A `setTimeout` alone would be wrong in the most ordinary case there
 * is: JS is suspended while the app sits in the background, so a timer armed
 * for ten minutes does not fire during a twenty-minute detour into another app,
 * and the user would come back still signed in. Instead every check recomputes
 * `Date.now() - lastActivity`, and the `AppState` listener re-runs that check
 * on every return to the foreground — where a long enough absence signs the
 * user out immediately.
 *
 * The timer reschedules itself rather than being reset on each touch, so
 * activity costs one ref write and never any timer churn: when it fires early
 * it simply re-arms for whatever is left of the window.
 */
export function useIdleTimeout({
  timeoutMs,
  enabled,
  onIdle,
}: IUseIdleTimeoutOptions) {
  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest-ref, so a caller passing an inline function cannot restart the timer
  // on every render — which would postpone the deadline forever.
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const registerActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Becoming enabled counts as activity. Without this, a timestamp left over
    // from a previous session would make the next sign-in expire at once.
    lastActivityRef.current = Date.now();

    function clearTimer() {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    function scheduleCheck() {
      clearTimer();

      const remaining = timeoutMs - (Date.now() - lastActivityRef.current);

      if (remaining <= 0) {
        onIdleRef.current();
        return;
      }

      timerRef.current = setTimeout(scheduleCheck, remaining);
    }

    scheduleCheck();

    // Re-checking only on `active` is the point: time spent in the background
    // is not activity, so returning is when the verdict has to be recomputed.
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        scheduleCheck();
      }
    });

    return () => {
      clearTimer();
      subscription.remove();
    };
  }, [enabled, timeoutMs]);

  return registerActivity;
}
