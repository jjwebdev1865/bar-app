// Swap this for Firebase Crashlytics once a backend exists (see V1_goals.md).
export function reportError(
  error: unknown,
  info?: { componentStack?: string | null },
): void {
  console.error('[bar-app]', error, info?.componentStack ?? '');
}
