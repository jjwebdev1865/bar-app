import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { languageOptions, type Language } from '../constants/i18n';
import { useSettings } from '../context/SettingsContext';

export default function SettingsScreen() {
  const { colors, themeMode, setThemeMode, language, setLanguage, t } =
    useSettings();
  const [languageOpen, setLanguageOpen] = useState(false);

  const isDark = themeMode === 'dark';
  const selectedLanguage =
    languageOptions.find((option) => option.value === language)?.label ??
    'English';

  function selectLanguage(next: Language) {
    setLanguage(next);
    setLanguageOpen(false);
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.panel, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.accent }]}>
          {t('appearance')}
        </Text>

        <View style={styles.row}>
          <View style={styles.rowCopy}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {isDark ? t('darkMode') : t('lightMode')}
            </Text>
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              {t('themeHint')}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.border}
          />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.panel, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.accent }]}>
          {t('language')}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('language')}
          onPress={() => setLanguageOpen((open) => !open)}
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.dropdownValue, { color: colors.text }]}>
            {selectedLanguage}
          </Text>
          <Text style={[styles.dropdownChevron, { color: colors.accentMuted }]}>
            {languageOpen ? '▴' : '▾'}
          </Text>
        </Pressable>

        {languageOpen ? (
          <View
            style={[
              styles.dropdownMenu,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            {languageOptions.map((option, index) => {
              const selected = option.value === language;
              const isLast = index === languageOptions.length - 1;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => selectLanguage(option.value)}
                  style={[
                    styles.dropdownOption,
                    !isLast && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dropdownOptionLabel,
                      {
                        color: selected ? colors.accent : colors.text,
                        fontWeight: selected ? '700' : '500',
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <Text style={[styles.hint, styles.languageHint, { color: colors.textMuted }]}>
          {t('languageHint')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 14,
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
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  languageHint: {
    marginTop: 12,
  },
  dropdown: {
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownChevron: {
    fontSize: 16,
  },
  dropdownMenu: {
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dropdownOptionLabel: {
    fontSize: 16,
  },
});
