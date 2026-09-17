import type { TColorTokens, TThemeMode } from '../types/common.types';

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
