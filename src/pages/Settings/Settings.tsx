import { useMemo, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LANGUAGE_OPTIONS } from '../../i18n';
import { useSettings } from '../../context/SettingsContext';
import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { EThemeModeOptions } from '../../theme/theme';
import type { TColorTokens, TLanguage } from '../../types/common.types';
import { Dropdown } from '../../components/common';

export default function SettingsScreen() {
  const { colors, themeMode, setThemeMode, language, setLanguage, t } =
    useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [languageOpen, setLanguageOpen] = useState(false);

  const isDark = themeMode === EThemeModeOptions.DARK;

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
    languageHint: {
      marginTop: 12,
    },
  });
