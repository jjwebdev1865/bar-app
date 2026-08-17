import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import i18n, {
  defaultLanguage,
  translate,
  type Language,
  type TranslationKey,
} from '../src/i18n';
import {
  defaultThemeMode,
  themes,
  type ColorTokens,
  type ThemeMode,
} from '../src/theme/theme';

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

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

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
