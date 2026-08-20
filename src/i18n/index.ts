import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { TLanguage, TTranslationKey } from '../types/common.types';
import en from './locales/en.json';
import es from './locales/es.json';
// Side-effect import: applies the `i18next` module augmentation that types
// translation keys against the English resource.
import './resources';

export const DEFAULT_LANGUAGE: TLanguage = 'en';

export const LANGUAGE_OPTIONS: { value: TLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
];

const RESOURCES = {
  en: { translation: en },
  es: { translation: es },
} as const;

i18next.use(initReactI18next).init({
  resources: RESOURCES,
  lng: DEFAULT_LANGUAGE,
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
  language: TLanguage,
  key: TTranslationKey,
  vars?: Record<string, string | number>,
) {
  return i18next.t(key, { ...vars, lng: language });
}

export default i18next;
