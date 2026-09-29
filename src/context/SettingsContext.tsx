import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import i18n, { DEFAULT_LANGUAGE, translate } from '../i18n';
import {
  DEFAULT_HERO,
  DEFAULT_THEME_MODE,
  HERO_THEMES,
} from '../theme/theme';
import type { THero } from '../theme/theme';
import type {
  TColorTokens,
  TLanguage,
  TThemeMode,
  TTranslate,
} from '../types';

interface ISettingsContextValue {
  themeMode: TThemeMode;
  setThemeMode: (mode: TThemeMode) => void;
  hero: THero;
  setHero: (hero: THero) => void;
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
  const [hero, setHero] = useState<THero>(DEFAULT_HERO);
  const [language, setLanguage] = useState<TLanguage>(DEFAULT_LANGUAGE);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const value = useMemo<ISettingsContextValue>(
    () => ({
      themeMode,
      setThemeMode,
      hero,
      setHero,
      language,
      setLanguage,
      colors: HERO_THEMES[hero][themeMode],
      t: (key, vars) => translate(language, key, vars),
    }),
    [themeMode, hero, language],
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
