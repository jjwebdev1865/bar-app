import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ErrorBoundary as ReactErrorBoundary,
  type FallbackProps,
} from 'react-error-boundary';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DEFAULT_THEME_MODE, THEMES } from '../../theme/theme';
import { reportError } from '../../utils/errorReporter';

interface IErrorBoundaryProps {
  children: ReactNode;
}

function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>
        The app hit an unexpected error. You can try again below.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Try again"
        onPress={resetErrorBoundary}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonLabel}>Try Again</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export function ErrorBoundary({ children }: IErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => reportError(error, info)}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Rendered above SettingsProvider, so this uses a fixed theme rather than useSettings().
const colors = THEMES[DEFAULT_THEME_MODE];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    color: colors.text,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    color: colors.textMuted,
  },
  button: {
    minHeight: 48,
    minWidth: 160,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.accent,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onAccent,
  },
});
