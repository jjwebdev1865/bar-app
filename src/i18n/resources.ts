import en from './locales/en.json';

export type TranslationKey = keyof typeof en;

// Module augmentation so `i18next.t()` / `useTranslation().t()` are typed and
// autocompleted against the English resource, and a missing/mistyped key in
// `es.json` fails `tsc` instead of silently falling back at runtime.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
    };
  }
}

export default en;
