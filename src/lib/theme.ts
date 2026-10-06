import type { Theme } from '../types';

export const THEME_KEY = 'tabcabinet:theme';

export const THEMES: readonly Theme[] = ['light', 'dark', 'mac', 'fluent'];

export function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme);
}

export function readInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    // storage unavailable: fall through to the system preference
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}
