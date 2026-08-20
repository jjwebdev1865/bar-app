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
    stool: '#1A1A1A',
    overlay: 'rgba(0, 0, 0, 0.65)',
    white: '#FFFFFF',
    danger: '#8B1E1E',
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
    stool: '#1A1A1A',
    overlay: 'rgba(0, 0, 0, 0.35)',
    white: '#FFFFFF',
    danger: '#8B1E1E',
  },
};

export const DEFAULT_THEME_MODE: TThemeMode = EThemeModeOptions.DARK;
