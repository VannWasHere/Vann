import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  applyTheme,
  INITIAL_THEME,
  REMEMBER_CHOICE,
  SHORTCUT_KEY,
  STORAGE_KEY,
  ThemeContext,
  THEMES,
  type ThemeContextValue,
  type ThemeId,
} from './themeContext'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(INITIAL_THEME)

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next)
    applyTheme(next)
    if (!REMEMBER_CHOICE) return
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore write failures — the theme still applies for this session
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'terminal' ? 'standard' : 'terminal')
  }, [setTheme, theme])

  // Keyboard shortcut for the people who never touch their mouse
  useEffect(() => {
    const key = SHORTCUT_KEY.toLowerCase()
    if (!key) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.isContentEditable) return
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (event.key.toLowerCase() !== key) return
      event.preventDefault()
      toggleTheme()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggleTheme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      themes: THEMES,
      isTerminal: theme === 'terminal',
      setTheme,
      toggleTheme,
      shortcutKey: SHORTCUT_KEY,
    }),
    [theme, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
