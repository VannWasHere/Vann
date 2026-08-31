import { motion } from 'framer-motion'
import { useTheme, type ThemeId } from '../theme/themeContext'
import { cn } from '../utils'

/**
 * Fixed segmented control. Reads as an editorial toggle in the standard theme
 * and as a shell flag in the terminal theme, since the palette and radius come
 * from the theme tokens.
 */
export default function ThemeSwitch() {
  const { theme, themes, setTheme, isTerminal, shortcutKey } = useTheme()
  const active = themes.find((t) => t.id === theme)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className="fixed right-4 bottom-4 z-[95] md:right-6 md:bottom-6"
    >
      <div
        role="group"
        aria-label="Colour theme"
        className="flex items-stretch gap-px border border-white/15 bg-black/70 p-1 backdrop-blur-md"
      >
        <span className="hidden items-center px-2.5 font-mono text-[9px] tracking-[0.2em] uppercase text-zinc-600 sm:flex">
          {isTerminal ? '--theme' : 'Theme'}
        </span>

        {themes.map((option) => {
          const selected = option.id === theme
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id as ThemeId)}
              aria-pressed={selected}
              title={`${option.label} — ${option.hint}`}
              className={cn(
                'px-3 py-2 font-mono text-[10px] tracking-[0.18em] uppercase transition-colors duration-300 focus-visible:ring-1 focus-visible:ring-red-500 focus-visible:outline-none',
                selected
                  ? 'bg-white text-black'
                  : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
              )}
            >
              {option.short}
            </button>
          )
        })}
      </div>

      <p className="mt-2 text-right font-mono text-[9px] tracking-[0.18em] uppercase text-zinc-600">
        <span className="sr-only">Current theme: </span>
        press {shortcutKey.toUpperCase()} · {active?.short}
      </p>
    </motion.div>
  )
}
