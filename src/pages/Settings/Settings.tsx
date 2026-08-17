import { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { languageOptions, type Language } from "../../i18n";
import { useSettings } from "../../context/SettingsContext";
import { EThemeModeOptions } from "../../theme/theme";
import { Dropdown } from "../../components/common";

export default function SettingsScreen() {
  const { colors, themeMode, setThemeMode, language, setLanguage, t } =
    useSettings();
  const [languageOpen, setLanguageOpen] = useState(false);

  const isDark = themeMode === EThemeModeOptions.DARK;

  function selectLanguage(next: string) {
    setLanguage(next as Language);
    setLanguageOpen(false);
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.panel, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.accent }]}>
          {t("appearance")}
        </Text>

        <View style={styles.row}>
          <View style={styles.rowCopy}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {isDark ? t("darkMode") : t("lightMode")}
            </Text>
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              {t("themeHint")}
            </Text>
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

      <View
        style={[
          styles.card,
          { backgroundColor: colors.panel, borderColor: colors.border },
        ]}
      >
        <Dropdown
          label={t("language")}
          placeholder={t("language")}
          options={languageOptions}
          value={language}
          open={languageOpen}
          onOpenChange={setLanguageOpen}
          onChange={selectLanguage}
          colors={colors}
        />

        <Text
          style={[
            styles.hint,
            styles.languageHint,
            { color: colors.textMuted },
          ]}
        >
          {t("languageHint")}
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
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  rowCopy: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  languageHint: {
    marginTop: 12,
  },
});
