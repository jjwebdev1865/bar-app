import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import type { TranslationKey } from './resources';

export type Language = 'en' | 'es';

export const defaultLanguage: Language = 'en';

export const languageOptions: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
];

export type { TranslationKey };

const resources = {
  en: { translation: en },
  es: { translation: es },
} as const;

i18next.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: 'en',
  interpolation: {
    // React (and React Native) already escape values when rendering text.
    escapeValue: false,
  },
  returnNull: false,
});

/**
 * Translate a key for a given language, with `{{var}}` interpolation.
 * Kept as a plain function (rather than requiring components to call
 * `useTranslation()` directly) so `SettingsContext` can keep exposing a
 * single `t(key, vars)` on its context value.
 */
export function translate(
  language: Language,
  key: TranslationKey,
  vars?: Record<string, string | number>,
) {
  return i18next.t(key, { ...vars, lng: language });
}

export default i18next;
