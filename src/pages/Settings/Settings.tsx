import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LANGUAGE_OPTIONS } from '../../i18n';
import { useSettings } from '../../context/SettingsContext';
import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { useAuthStore } from '../../stores/authStore';
import { EThemeModeOptions, HERO_OPTIONS } from '../../theme/theme';
import type { THero } from '../../theme/theme';
import type { TColorTokens, TLanguage } from '../../types';
import { Dropdown } from '../../components/common';

export default function SettingsScreen() {
  const {
    colors,
    themeMode,
    setThemeMode,
    hero,
    setHero,
    language,
    setLanguage,
    t,
  } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [heroOpen, setHeroOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  // This screen only exists inside `AppLayout`'s signed-in guard, so `user` is
  // never null while it renders. Selected defensively anyway — the fallback is
  // cheaper than an assertion that has to stay true.
  const username = useAuthStore((state) => state.user?.username ?? '');
  const signOut = useAuthStore((state) => state.signOut);

  const isDark = themeMode === EThemeModeOptions.DARK;

  function selectHero(next: string) {
    setHero(next as THero);
    setHeroOpen(false);
  }

  function selectLanguage(next: string) {
    setLanguage(next as TLanguage);
    setLanguageOpen(false);
  }

  return (
    <SafeAreaView edges={HEADER_SCREEN_EDGES} style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('appearance')}</Text>

        <View style={styles.row}>
          <View style={styles.rowCopy}>
            <Text style={styles.rowLabel}>
              {isDark ? t('darkMode') : t('lightMode')}
            </Text>
            <Text style={styles.hint}>{t('themeHint')}</Text>
          </View>
          <Switch
            accessibilityLabel={t('darkMode')}
            value={isDark}
            onValueChange={(value) =>
              setThemeMode(
                value ? EThemeModeOptions.DARK : EThemeModeOptions.LIGHT,
              )
            }
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.border}
          />
        </View>

        <View style={styles.heroDropdown}>
          <Dropdown
            label={t('favoriteHero')}
            placeholder={t('favoriteHero')}
            options={HERO_OPTIONS}
            value={hero}
            open={heroOpen}
            onOpenChange={setHeroOpen}
            onChange={selectHero}
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Dropdown
          label={t('language')}
          placeholder={t('language')}
          options={LANGUAGE_OPTIONS}
          value={language}
          open={languageOpen}
          onOpenChange={setLanguageOpen}
          onChange={selectLanguage}
          colors={colors}
        />

        <Text style={[styles.hint, styles.languageHint]}>
          {t('languageHint')}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('account')}</Text>

        <View style={styles.row}>
          <View style={styles.rowCopy}>
            <Text style={styles.rowLabel}>{username}</Text>
            <Text style={styles.hint}>{t('signOutHint')}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            // Clearing the user flips `AppLayout`'s guards, which unmounts this
            // screen and lands on login. Nothing to navigate to by hand.
            onPress={signOut}
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.signOutButtonPressed,
            ]}
          >
            <Text style={styles.signOutLabel}>{t('signOut')}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 16,
      gap: 16,
      backgroundColor: colors.background,
    },
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 12,
      padding: 16,
      backgroundColor: colors.panel,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginBottom: 14,
      color: colors.accent,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    rowCopy: {
      flex: 1,
    },
    rowLabel: {
      fontSize: 17,
      fontWeight: '600',
      marginBottom: 4,
      color: colors.text,
    },
    hint: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textMuted,
    },
    heroDropdown: {
      marginTop: 16,
    },
    languageHint: {
      marginTop: 12,
    },
    signOutButton: {
      minHeight: 44,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      borderColor: colors.danger,
      backgroundColor: colors.background,
    },
    signOutButtonPressed: {
      opacity: 0.8,
    },
    signOutLabel: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.danger,
    },
  });
