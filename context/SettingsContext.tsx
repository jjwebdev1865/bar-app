import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  defaultLanguage,
  translate,
  type Language,
  type TranslationKey,
} from '../constants/i18n';
import {
  defaultThemeMode,
  themes,
  type ColorTokens,
  type ThemeMode,
} from '../constants/theme';

type SettingsContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  colors: ColorTokens;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(defaultThemeMode);
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  const value = useMemo<SettingsContextValue>(
    () => ({
      themeMode,
      setThemeMode,
      language,
      setLanguage,
      colors: themes[themeMode],
      t: (key, vars) => translate(language, key, vars),
    }),
    [themeMode, language],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }

  return context;
}
