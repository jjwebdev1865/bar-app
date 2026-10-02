import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BARTENDER_BOT_WELCOME_PARAM, EAppRoute } from '../../constants/routes';
import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { useSettings } from '../../context/SettingsContext';
import type { TColorTokens } from '../../types';

export default function BartenderBotScreen() {
  const { colors, t } = useSettings();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { [BARTENDER_BOT_WELCOME_PARAM]: welcomeParam } =
    useLocalSearchParams<{ [BARTENDER_BOT_WELCOME_PARAM]: string }>();
  const isWelcome = welcomeParam === '1';

  function goToProfile() {
    router.push(EAppRoute.PROFILE);
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
      <Pressable
        accessibilityRole="button"
        onPress={goToProfile}
        style={({ pressed }) => [
          styles.profileButton,
          pressed && styles.profileButtonPressed,
        ]}
      >
        <Text style={styles.profileButtonLabel}>
          {t('bartenderBotGoToProfile')}
        </Text>
      </Pressable>
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
    profileButton: {
      minHeight: 48,
      minWidth: 180,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      marginTop: 28,
      backgroundColor: colors.accent,
    },
    profileButtonPressed: {
      opacity: 0.8,
    },
    profileButtonLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.onAccent,
    },
  });
