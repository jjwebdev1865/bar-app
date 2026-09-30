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
  inputBackground: string;
  inputBorder: string;
  stool: string;
  overlay: string;
  white: string;
  danger: string;
  success: string;
  onSuccess: string;
};

/**
 * Mailing-address parts, held by both contacts and bar locations. Every part is
 * a plain string rather than optional: they are edited through controlled
 * `TextInput`s, so `''` is the empty state. `utils/addressFormat.ts` is what
 * drops the blanks at render time.
 */
export type TPostalAddress = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
};

export type TContact = TPostalAddress & {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  email: string;
  phone: string;
  favoriteBarId: string;
};

// The editable form shapes (`TContactFormValues`, `TGroupFormValues`,
// `TLocationFormValues`) are inferred from the zod schemas in
// `src/validation/` and stay co-located with them.

/**
 * The signed-in user.
 *
 * `firstName`/`lastName` are required here because every account behind
 * `signIn`/`signUp` — the `MOCK_USERS` fixtures and anything added through
 * `CreateAccount` — is a `TNamedCredentials`, so there is no path that signs a
 * session in without a name to attach. Never holds a password: `TContact` is
 * deliberately *not* reused here either — a contact is somebody in your
 * address book, not the account holding the session.
 */
export type TAuthUser = {
  username: string;
  firstName: string;
  lastName: string;
};

/**
 * A username/password pair, as typed on the login form and as held by the mock
 * account in `src/data/user.ts`.
 *
 * Kept separate from `TAuthUser` on purpose: the session user must never carry
 * a password field, or it becomes something a screen can render by accident.
 */
export type TCredentials = {
  username: string;
  password: string;
};

/**
 * A `TCredentials` pair plus the name behind it — every `MOCK_USERS` fixture
 * account and everything `CreateAccount` adds to `authStore.createdUsers` is
 * one of these, so `signIn` never has to fall back to a nameless session.
 */
export type TNamedCredentials = TCredentials & {
  firstName: string;
  lastName: string;
};

export type TGroup = {
  id: string;
  name: string;
  contacts: TContact[];
};

export type TBarLocation = TPostalAddress & {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
};
