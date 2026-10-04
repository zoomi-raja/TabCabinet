import { useCallback, useEffect, useState } from 'react';
import type { Theme } from '../types';
import { THEMES, THEME_KEY, applyTheme, readInitialTheme } from '../lib/theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme); // lazy init: read storage once

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]),
    [],
  );
  return { theme, toggle };
}
