import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { BARTENDER_BOT_WELCOME_PARAM, EAppRoute } from '../../constants/routes';
import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { useSettings } from '../../context/SettingsContext';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import type { TColorTokens } from '../../types';
import { formatPhoneInput, phoneDigits, PHONE_DIGIT_COUNT } from '../../utils/phoneFormat';

/** Steps of the welcome questionnaire, asked one at a time, in order. */
type TWelcomeStep = 'email' | 'phone' | 'drink' | 'shot';

const EMAIL_SCHEMA = z.email();

export default function BartenderBotScreen() {
  const { colors, t } = useSettings();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { [BARTENDER_BOT_WELCOME_PARAM]: welcomeParam } =
    useLocalSearchParams<{ [BARTENDER_BOT_WELCOME_PARAM]: string }>();
  const isWelcome = welcomeParam === '1';
  const setEmail = useAuthStore((state) => state.setEmail);
  const setPhone = useAuthStore((state) => state.setPhone);
  const setFavoriteDrink = useAuthStore((state) => state.setFavoriteDrink);
  const setFavoriteShot = useAuthStore((state) => state.setFavoriteShot);
  const showToast = useToastStore((state) => state.showToast);
  const [step, setStep] = useState<TWelcomeStep>('email');
  const [draftEmail, setDraftEmail] = useState('');
  const [draftPhone, setDraftPhone] = useState('');
  const [draftDrink, setDraftDrink] = useState('');
  const [draftShot, setDraftShot] = useState('');
  const isEmailValid = EMAIL_SCHEMA.safeParse(draftEmail.trim()).success;
  const isPhoneValid = phoneDigits(draftPhone).length === PHONE_DIGIT_COUNT;
  const isDrinkValid = draftDrink.trim().length > 0;
  const isShotValid = draftShot.trim().length > 0;

  function skipEmail() {
    setStep('phone');
  }

  function submitEmail() {
    if (!isEmailValid) {
      return;
    }

    setEmail(draftEmail.trim());
    showToast('emailSaved');
    setStep('phone');
  }

  function skipPhone() {
    setStep('drink');
  }

  function submitPhone() {
    if (!isPhoneValid) {
      return;
    }

    setPhone(draftPhone);
    showToast('phoneSaved');
    setStep('drink');
  }

  function submitFavoriteDrink() {
    if (!isDrinkValid) {
      return;
    }

    setFavoriteDrink(draftDrink.trim());
    showToast('favoriteDrinkSaved');
    setStep('shot');
  }

  function skipFavoriteDrink() {
    setStep('shot');
  }

  function submitFavoriteShot() {
    if (!isShotValid) {
      return;
    }

    setFavoriteShot(draftShot.trim());
    showToast('favoriteShotSaved');
    router.push(EAppRoute.HOME);
  }

  function skipFavoriteShot() {
    router.push(EAppRoute.HOME);
  }

  if (!isWelcome) {
    return (
      <SafeAreaView edges={HEADER_SCREEN_EDGES} style={styles.container}>
        <Text style={styles.message}>{t('bartenderBotHello')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={HEADER_SCREEN_EDGES} style={styles.container}>
      <Text style={styles.message}>{t('bartenderBotWelcomeGreeting')}</Text>
      <Text style={styles.intro}>{t('bartenderBotWelcomeIntro')}</Text>
      {step === 'email' ? (
        <>
          <Text style={styles.fieldLabel}>{t('bartenderBotAskEmail')}</Text>
          <TextInput
            accessibilityLabel={t('email')}
            autoCapitalize="none"
            keyboardType="email-address"
            value={draftEmail}
            onChangeText={setDraftEmail}
            placeholder={t('email')}
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
          />
          <View style={styles.buttonRow}>
            <Pressable
              accessibilityRole="button"
              onPress={skipEmail}
              style={({ pressed }) => [
                styles.secondaryButton,
                styles.rowButton,
                pressed && styles.profileButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonLabel}>{t('skip')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !isEmailValid }}
              disabled={!isEmailValid}
              onPress={submitEmail}
              style={({ pressed }) => [
                styles.profileButton,
                styles.rowButton,
                !isEmailValid && styles.profileButtonDisabled,
                pressed && isEmailValid && styles.profileButtonPressed,
              ]}
            >
              <Text style={styles.profileButtonLabel}>{t('submit')}</Text>
            </Pressable>
          </View>
        </>
      ) : step === 'phone' ? (
        <>
          <Text style={styles.fieldLabel}>{t('bartenderBotAskPhone')}</Text>
          <TextInput
            accessibilityLabel={t('phone')}
            keyboardType="phone-pad"
            value={draftPhone}
            onChangeText={(value) => setDraftPhone(formatPhoneInput(value))}
            placeholder={t('phone')}
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
          />
          <View style={styles.buttonRow}>
            <Pressable
              accessibilityRole="button"
              onPress={skipPhone}
              style={({ pressed }) => [
                styles.secondaryButton,
                styles.rowButton,
                pressed && styles.profileButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonLabel}>{t('skip')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !isPhoneValid }}
              disabled={!isPhoneValid}
              onPress={submitPhone}
              style={({ pressed }) => [
                styles.profileButton,
                styles.rowButton,
                !isPhoneValid && styles.profileButtonDisabled,
                pressed && isPhoneValid && styles.profileButtonPressed,
              ]}
            >
              <Text style={styles.profileButtonLabel}>{t('submit')}</Text>
            </Pressable>
          </View>
        </>
      ) : step === 'drink' ? (
        <>
          <Text style={styles.fieldLabel}>
            {t('bartenderBotAskFavoriteDrink')}
          </Text>
          <TextInput
            accessibilityLabel={t('favoriteDrink')}
            value={draftDrink}
            onChangeText={setDraftDrink}
            placeholder={t('favoriteDrink')}
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
          />
          <View style={styles.buttonRow}>
            <Pressable
              accessibilityRole="button"
              onPress={skipFavoriteDrink}
              style={({ pressed }) => [
                styles.secondaryButton,
                styles.rowButton,
                pressed && styles.profileButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonLabel}>{t('skip')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !isDrinkValid }}
              disabled={!isDrinkValid}
              onPress={submitFavoriteDrink}
              style={({ pressed }) => [
                styles.profileButton,
                styles.rowButton,
                !isDrinkValid && styles.profileButtonDisabled,
                pressed && isDrinkValid && styles.profileButtonPressed,
              ]}
            >
              <Text style={styles.profileButtonLabel}>{t('submit')}</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.fieldLabel}>
            {t('bartenderBotAskFavoriteShot')}
          </Text>
          <TextInput
            accessibilityLabel={t('favoriteShot')}
            value={draftShot}
            onChangeText={setDraftShot}
            placeholder={t('favoriteShot')}
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
          />
          <View style={styles.buttonRow}>
            <Pressable
              accessibilityRole="button"
              onPress={skipFavoriteShot}
              style={({ pressed }) => [
                styles.secondaryButton,
                styles.rowButton,
                pressed && styles.profileButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonLabel}>{t('skip')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !isShotValid }}
              disabled={!isShotValid}
              onPress={submitFavoriteShot}
              style={({ pressed }) => [
                styles.profileButton,
                styles.rowButton,
                !isShotValid && styles.profileButtonDisabled,
                pressed && isShotValid && styles.profileButtonPressed,
              ]}
            >
              <Text style={styles.profileButtonLabel}>{t('submit')}</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      backgroundColor: colors.background,
    },
    message: {
      fontSize: 24,
      fontWeight: '800',
      textAlign: 'center',
      color: colors.accent,
    },
    intro: {
      marginTop: 16,
      fontSize: 16,
      textAlign: 'center',
      color: colors.text,
    },
    fieldLabel: {
      marginTop: 24,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      textAlign: 'center',
      color: colors.accent,
    },
    textInput: {
      marginTop: 8,
      minHeight: 44,
      width: '100%',
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.inputBackground,
      borderColor: colors.inputBorder,
    },
    profileButton: {
      minHeight: 48,
      minWidth: 180,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.accent,
    },
    profileButtonDisabled: {
      backgroundColor: colors.accentMuted,
      opacity: 0.6,
    },
    profileButtonPressed: {
      opacity: 0.8,
    },
    profileButtonLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.onAccent,
    },
    secondaryButton: {
      minHeight: 48,
      minWidth: 180,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: 'transparent',
    },
    secondaryButtonLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accent,
    },
    buttonRow: {
      flexDirection: 'row',
      width: '100%',
      marginTop: 16,
      gap: 12,
    },
    rowButton: {
      flex: 1,
      minWidth: 0,
      marginTop: 0,
    },
  });
