import { createContext, useContext } from 'react'
import themeConfig from '../data/theme.json'

export type ThemeId = 'standard' | 'terminal'

export type ThemeOption = {
    id: ThemeId
    label: string
    short: string
    hint: string
}

export const STORAGE_KEY = 'vann-theme'
export const THEMES = themeConfig.themes as ThemeOption[]
export const REMEMBER_CHOICE = themeConfig.rememberUserChoice
export const SHORTCUT_KEY = themeConfig.shortcutKey ?? ''

const VALID_IDS = THEMES.map((t) => t.id)

/** Hardcoded default from src/data/theme.json, validated against the theme list. */
export const FILE_DEFAULT = (VALID_IDS.includes(themeConfig.defaultTheme as ThemeId)
    ? themeConfig.defaultTheme
    : 'standard') as ThemeId

function isThemeId(value: unknown): value is ThemeId {
    return typeof value === 'string' && VALID_IDS.includes(value as ThemeId)
}

/** The file default wins unless the visitor has picked a theme before. */
function resolveInitialTheme(): ThemeId {
    if (typeof window === 'undefined') return FILE_DEFAULT
    if (!REMEMBER_CHOICE) return FILE_DEFAULT
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        if (isThemeId(stored)) return stored
    } catch {
        // localStorage can throw in private modes — fall through to the file default
    }
    return FILE_DEFAULT
}

export function applyTheme(theme: ThemeId) {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = 'dark'
}

// Resolved and applied at module evaluation, before React paints, so the page
// never flashes the wrong palette on load.
export const INITIAL_THEME = resolveInitialTheme()
applyTheme(INITIAL_THEME)

export type ThemeContextValue = {
    theme: ThemeId
    themes: ThemeOption[]
    isTerminal: boolean
    setTheme: (theme: ThemeId) => void
    toggleTheme: () => void
    shortcutKey: string
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) throw new Error('useTheme must be used inside a ThemeProvider')
    return context
}
