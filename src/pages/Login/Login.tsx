import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
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
import { useForm } from 'react-hook-form';

import { FormTextField } from '../../components/common';
import { useSettings } from '../../context/SettingsContext';
import { MOCK_USER } from '../../data/user';
import { useAuthStore } from '../../stores/authStore';
import type { TColorTokens } from '../../types/common.types';
import { msg, translateFieldError } from '../../validation/messages';
import {
  loginFormSchema,
  type TLoginFormValues,
} from '../../validation/loginSchema';

const emptyValues = (): TLoginFormValues => ({
  username: '',
  password: '',
});

/**
 * Credential entry, and the only screen that exists while signed out —
 * `AppLayout` guards every other one behind `authStore`.
 *
 * Unlike the create/edit forms this does **not** use `FormScreen`: that
 * scaffold pins a Cancel / submit row and pops the route once a submit
 * resolves. Login has nothing to cancel to, and it does not navigate on
 * success at all — it writes to the store and lets the guards move the user.
 * It renders its own page chrome instead.
 *
 * Its drawer header is hidden (`AppLayout`), so this is the one screen that
 * takes `SafeAreaView`'s default edges rather than `HEADER_SCREEN_EDGES` —
 * that constant drops the top inset precisely because a header consumed it,
 * and here nothing did.
 */
export default function LoginScreen() {
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const signIn = useAuthStore((state) => state.signIn);

  const { control, handleSubmit, setError, clearErrors, formState } =
    useForm<TLoginFormValues>({
      resolver: zodResolver(loginFormSchema),
      // Errors appear once a field has been left, then keep up as it is
      // retyped.
      mode: 'onTouched',
      defaultValues: emptyValues(),
    });

  // A rejected pair is a form-level failure, not a field one — the schema
  // cannot know it, and blaming either input would say which half was wrong.
  const credentialsError = translateFieldError(
    t,
    formState.errors.root?.message,
  );

  function handleLogin(values: TLoginFormValues) {
    // Cleared explicitly rather than relying on `handleSubmit` to drop root
    // errors, so a second attempt never renders the first one's message.
    clearErrors('root');

    // TODO (see `src/features/mvp/04_event_creation_api.md`): exchange these
    // for a real session. `signIn` only compares against `MOCK_USER`.
    //
    // Logged without the password — not its value and not its length. A
    // throwaway log in a stub is how a credential reaches a device log.
    const accepted = signIn(values);
    console.log('Login attempt', values.username, accepted ? 'ok' : 'rejected');

    if (!accepted) {
      setError('root', { message: msg('credentialsInvalid') });
      return;
    }

    // No `router` call on success. Setting the user flips `AppLayout`'s guards,
    // which removes this screen and redirects to the drawer's anchor route
    // (Home), clearing login's history entries on the way — an explicit
    // `replace` here would race that and duplicate the decision.
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        // Android resizes the window itself. No `keyboardVerticalOffset` here,
        // unlike `FormScreen` — this screen has no header eating into the space
        // the keyboard pushes against.
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoider}
      >
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          // Without this, the first tap on Sign in while the keyboard is up
          // only dismisses the keyboard.
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.brand}>{t('appName')}</Text>
            <Text style={styles.title}>{t('signIn')}</Text>
          </View>

          <FormTextField
            control={control}
            name="username"
            label="username"
            autoCapitalize="none"
            autoComplete="username"
            colors={colors}
            t={t}
          />

          <FormTextField
            control={control}
            name="password"
            label="password"
            autoCapitalize="none"
            autoComplete="password"
            secureTextEntry
            colors={colors}
            t={t}
          />

          {credentialsError ? (
            <Text accessibilityLiveRegion="polite" style={styles.formError}>
              {credentialsError}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            // Stays pressable rather than disabled, matching `FormScreen`:
            // `handleSubmit` renders each failure inline, where a dead button
            // would hide why nothing happened.
            onPress={handleSubmit(handleLogin)}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
            ]}
          >
            <Text style={styles.submitLabel}>{t('signIn')}</Text>
          </Pressable>

          {/*
            Reads the credentials out of `MOCK_USER` rather than repeating them
            in the copy, so the fixture stays the single source of truth — and
            so this line dies with it when real accounts land.
          */}
          <Text style={styles.hint}>
            {t('signInHint', {
              username: MOCK_USER.username,
              password: MOCK_USER.password,
            })}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
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
    // `flexGrow` rather than `flex` so the form centres on a tall screen but
    // still scrolls once the keyboard has taken half of it.
    bodyContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 24,
      gap: 14,
    },
    header: {
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    brand: {
      fontSize: 30,
      fontWeight: '800',
      letterSpacing: 1,
      textAlign: 'center',
      color: colors.accent,
    },
    title: {
      fontSize: 15,
      letterSpacing: 4,
      textTransform: 'uppercase',
      color: colors.accentMuted,
    },
    formError: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
      color: colors.danger,
    },
    submitButton: {
      minHeight: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
      backgroundColor: colors.accent,
    },
    submitButtonPressed: {
      opacity: 0.8,
    },
    submitLabel: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.onAccent,
    },
    hint: {
      fontSize: 13,
      textAlign: 'center',
      color: colors.textMuted,
    },
  });
