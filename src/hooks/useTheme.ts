import { useCallback, useEffect, useState } from 'react'
import type { Theme } from '../types'
import { THEME_KEY, applyTheme, readInitialTheme } from '../lib/theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme) // lazy init: read storage once

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // ignore
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  return { theme, toggle }
}
