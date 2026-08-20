import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import i18n, { DEFAULT_LANGUAGE, translate } from '../i18n';
import { DEFAULT_THEME_MODE, THEMES } from '../theme/theme';
import type {
  TColorTokens,
  TLanguage,
  TThemeMode,
  TTranslate,
} from '../types/common.types';

interface ISettingsContextValue {
  themeMode: TThemeMode;
  setThemeMode: (mode: TThemeMode) => void;
  language: TLanguage;
  setLanguage: (language: TLanguage) => void;
  colors: TColorTokens;
  t: TTranslate;
}

interface ISettingsProviderProps {
  children: ReactNode;
}

const SettingsContext = createContext<ISettingsContextValue | null>(null);

export function SettingsProvider({ children }: ISettingsProviderProps) {
  const [themeMode, setThemeMode] = useState<TThemeMode>(DEFAULT_THEME_MODE);
  const [language, setLanguage] = useState<TLanguage>(DEFAULT_LANGUAGE);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const value = useMemo<ISettingsContextValue>(
    () => ({
      themeMode,
      setThemeMode,
      language,
      setLanguage,
      colors: THEMES[themeMode],
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
