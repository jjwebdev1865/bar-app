import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
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
import { EAppRoute } from '../../constants/routes';
import { useSettings } from '../../context/SettingsContext';
import { useAuthStore } from '../../stores/authStore';
import type { TColorTokens } from '../../types';
import { msg } from '../../validation/messages';
import {
  registerFormSchema,
  type TRegisterFormValues,
} from '../../validation/registerSchema';

const emptyValues = (): TRegisterFormValues => ({
  username: '',
  password: '',
  confirmPassword: '',
});

/**
 * Account creation, reachable from `Login`'s "create one" link and nowhere
 * else — like `Login`, it renders while signed out and is hidden from the
 * drawer (`AppLayout`).
 *
 * Shares `Login`'s page chrome (no `FormScreen`: nothing to cancel to, and
 * success is a store write rather than a navigation) rather than the schema:
 * `registerFormSchema` adds a minimum length, a complexity rule and a
 * confirm-password check that login deliberately omits.
 */
export default function CreateAccountScreen() {
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const signUp = useAuthStore((state) => state.signUp);

  const { control, handleSubmit, setError, clearErrors } =
    useForm<TRegisterFormValues>({
      resolver: zodResolver(registerFormSchema),
      mode: 'onTouched',
      defaultValues: emptyValues(),
    });

  function handleCreateAccount(values: TRegisterFormValues) {
    clearErrors('username');

    // Unlike a rejected sign-in, a taken username is safe to name on the
    // field itself — the person is choosing it, not guessing at someone
    // else's account.
    const accepted = signUp({
      username: values.username,
      password: values.password,
    });

    if (!accepted) {
      setError('username', { message: msg('usernameTaken') });
      return;
    }

    // No `router` call on success, matching `Login`: `signUp` sets `user`,
    // which flips `AppLayout`'s guards and redirects to Home on its own.
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoider}
      >
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.brand}>{t('appName')}</Text>
            <Text style={styles.title}>{t('createAccount')}</Text>
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
            autoComplete="new-password"
            secureTextEntry
            colors={colors}
            t={t}
          />

          <FormTextField
            control={control}
            name="confirmPassword"
            label="confirmPassword"
            autoCapitalize="none"
            autoComplete="new-password"
            secureTextEntry
            colors={colors}
            t={t}
          />

          <Pressable
            accessibilityRole="button"
            onPress={handleSubmit(handleCreateAccount)}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
            ]}
          >
            <Text style={styles.submitLabel}>{t('createAccount')}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="link"
            onPress={() => router.replace(EAppRoute.LOGIN)}
            style={styles.backLink}
          >
            <Text style={styles.backLinkLabel}>{t('backToSignIn')}</Text>
          </Pressable>
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
    backLink: {
      marginTop: 4,
      alignItems: 'center',
    },
    backLinkLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.accentMuted,
    },
  });
