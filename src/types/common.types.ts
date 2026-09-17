import type en from '../i18n/locales/en.json';
import type { EThemeModeOptions } from '../theme/theme';

export type TLanguage = 'en' | 'es';

export type TTranslationKey = keyof typeof en;

/**
 * Signature of the `t()` helper exposed by `SettingsContext` and threaded down
 * to presentational components as a prop.
 */
export type TTranslate = (
  key: TTranslationKey,
  vars?: Record<string, string | number>,
) => string;

export type TThemeMode = EThemeModeOptions.DARK | EThemeModeOptions.LIGHT;

export type TColorTokens = {
  background: string;
  panel: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentMuted: string;
  onAccent: string;
  border: string;
  stool: string;
  overlay: string;
  white: string;
  danger: string;
};

export type TContact = {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  email: string;
  phone: string;
  address: string;
  favoriteBarId: string;
};

// The editable form shapes (`TContactFormValues`, `TGroupFormValues`,
// `TLocationFormValues`) are inferred from the zod schemas in
// `src/validation/` and stay co-located with them.

export type TGroup = {
  id: string;
  name: string;
  contacts: TContact[];
};

export type TBarLocation = {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  address: string;
};
