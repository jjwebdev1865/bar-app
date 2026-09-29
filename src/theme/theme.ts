import type { TColorTokens, TThemeMode } from '../types';

export enum EThemeModeOptions {
  DARK = 'dark',
  LIGHT = 'light',
}

export const THEMES: Record<TThemeMode, TColorTokens> = {
  dark: {
    background: '#0B0B0D',
    panel: '#141418',
    text: '#FFFFFF',
    textSecondary: '#C4A000',
    textMuted: '#6B6B75',
    accent: '#F5D000',
    accentMuted: '#C4A000',
    onAccent: '#0B0B0D',
    border: '#2A2A30',
    inputBackground: '#1C1C22',
    inputBorder: '#6B6B75',
    stool: '#1A1A1A',
    overlay: 'rgba(0, 0, 0, 0.65)',
    white: '#FFFFFF',
    danger: '#8B1E1E',
    // 8.63:1 against both `onSuccess` and the page — a bright green reads as
    // success on a near-black background, where a deep one would not.
    success: '#22C55E',
    onSuccess: '#0B0B0D',
  },
  light: {
    background: '#F7F5F0',
    panel: '#FFFFFF',
    text: '#121214',
    textSecondary: '#8A7000',
    textMuted: '#6B6B75',
    accent: '#C4A000',
    accentMuted: '#8A7000',
    onAccent: '#FFFFFF',
    border: '#D8D4CB',
    inputBackground: '#FFFFFF',
    inputBorder: '#6B6B75',
    stool: '#1A1A1A',
    overlay: 'rgba(0, 0, 0, 0.35)',
    white: '#FFFFFF',
    danger: '#8B1E1E',
    // Inverted for light: a deep green carries white text at 5.02:1 and still
    // separates from the warm page at 4.60:1.
    success: '#15803D',
    onSuccess: '#FFFFFF',
  },
};

export const DEFAULT_THEME_MODE: TThemeMode = EThemeModeOptions.DARK;

export enum EHeroOptions {
  BATMAN = 'batman',
  ROBIN = 'robin',
  BATGIRL = 'batgirl',
  NIGHTWING = 'nightwing',
}

export type THero =
  | EHeroOptions.BATMAN
  | EHeroOptions.ROBIN
  | EHeroOptions.BATGIRL
  | EHeroOptions.NIGHTWING;

export const DEFAULT_HERO: THero = EHeroOptions.BATMAN;

export const HERO_OPTIONS: { value: THero; label: string }[] = [
  { value: EHeroOptions.BATMAN, label: 'Batman' },
  { value: EHeroOptions.ROBIN, label: 'Robin' },
  { value: EHeroOptions.BATGIRL, label: 'Batgirl' },
  { value: EHeroOptions.NIGHTWING, label: 'Nightwing' },
];

/** Red, yellow, green, and black — dark mode sits on deep green; light mode on warm yellow. */
const ROBIN_THEMES: Record<TThemeMode, TColorTokens> = {
  dark: {
    background: '#0F1F17',
    panel: '#1A2E24',
    text: '#FFFFFF',
    textSecondary: '#F5D000',
    textMuted: '#8FAF96',
    accent: '#E31937',
    accentMuted: '#F5D000',
    onAccent: '#FFFFFF',
    border: '#2E7D4F',
    inputBackground: '#15271C',
    inputBorder: '#0B0B0D',
    stool: '#0B0B0D',
    overlay: 'rgba(8, 20, 14, 0.78)',
    white: '#FFFFFF',
    danger: '#B5122A',
    success: '#4ADE80',
    onSuccess: '#0F1F17',
  },
  light: {
    background: '#FFF8E1',
    panel: '#FFFFFF',
    text: '#0B0B0D',
    textSecondary: '#15803D',
    textMuted: '#4A4A4A',
    accent: '#C41E3A',
    accentMuted: '#8A7000',
    onAccent: '#FFFFFF',
    border: '#E6C200',
    inputBackground: '#FFFFFF',
    inputBorder: '#0B0B0D',
    stool: '#0B0B0D',
    overlay: 'rgba(11, 11, 13, 0.4)',
    white: '#FFFFFF',
    danger: '#991B1B',
    success: '#15803D',
    onSuccess: '#FFFFFF',
  },
};

/** Purple, gold, and black — dark mode on deep purple; light mode on soft violet. */
const BATGIRL_THEMES: Record<TThemeMode, TColorTokens> = {
  dark: {
    background: '#181022',
    panel: '#241833',
    text: '#FFFFFF',
    textSecondary: '#F5D000',
    textMuted: '#9B8AB0',
    accent: '#C084FC',
    accentMuted: '#F5D000',
    onAccent: '#0B0B0D',
    border: '#5B21B6',
    inputBackground: '#20142E',
    inputBorder: '#0B0B0D',
    stool: '#0B0B0D',
    overlay: 'rgba(16, 8, 28, 0.78)',
    white: '#FFFFFF',
    danger: '#8B1E1E',
    success: '#22C55E',
    onSuccess: '#181022',
  },
  light: {
    background: '#F3EEF9',
    panel: '#FFFFFF',
    text: '#0B0B0D',
    textSecondary: '#6B21A8',
    textMuted: '#5C5470',
    accent: '#7C3AED',
    accentMuted: '#C4A000',
    onAccent: '#FFFFFF',
    border: '#E9D5FF',
    inputBackground: '#FFFFFF',
    inputBorder: '#0B0B0D',
    stool: '#0B0B0D',
    overlay: 'rgba(11, 11, 13, 0.4)',
    white: '#FFFFFF',
    danger: '#991B1B',
    success: '#15803D',
    onSuccess: '#FFFFFF',
  },
};

/** Blue and black — dark mode on deep navy; light mode on ice blue. */
const NIGHTWING_THEMES: Record<TThemeMode, TColorTokens> = {
  dark: {
    background: '#0A1628',
    panel: '#122038',
    text: '#FFFFFF',
    textSecondary: '#38BDF8',
    textMuted: '#7C8FA8',
    accent: '#0EA5E9',
    accentMuted: '#38BDF8',
    onAccent: '#0B0B0D',
    border: '#1E40AF',
    inputBackground: '#0F1D32',
    inputBorder: '#0B0B0D',
    stool: '#0B0B0D',
    overlay: 'rgba(6, 14, 28, 0.78)',
    white: '#FFFFFF',
    danger: '#8B1E1E',
    success: '#22C55E',
    onSuccess: '#0A1628',
  },
  light: {
    background: '#EEF6FF',
    panel: '#FFFFFF',
    text: '#0B0B0D',
    textSecondary: '#1D4ED8',
    textMuted: '#475569',
    accent: '#0284C7',
    accentMuted: '#0369A1',
    onAccent: '#FFFFFF',
    border: '#BAE6FD',
    inputBackground: '#FFFFFF',
    inputBorder: '#0B0B0D',
    stool: '#0B0B0D',
    overlay: 'rgba(11, 11, 13, 0.4)',
    white: '#FFFFFF',
    danger: '#991B1B',
    success: '#15803D',
    onSuccess: '#FFFFFF',
  },
};

export const HERO_THEMES: Record<THero, Record<TThemeMode, TColorTokens>> = {
  [EHeroOptions.BATMAN]: THEMES,
  [EHeroOptions.ROBIN]: ROBIN_THEMES,
  [EHeroOptions.BATGIRL]: BATGIRL_THEMES,
  [EHeroOptions.NIGHTWING]: NIGHTWING_THEMES,
};
