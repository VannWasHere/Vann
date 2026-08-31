import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import contentData from '../data/content.json'
import { scrollToSection } from '../hooks/useSmoothScroll'
import { useTheme } from '../theme/themeContext'
import { cn } from '../utils'

const hero = contentData.hero
const term = hero.terminal

/** figlet "ANSI Shadow" — 37 columns wide, one string per row */
const ASCII_BANNER = [
  '██╗   ██╗ █████╗ ███╗   ██╗███╗   ██╗',
  '██║   ██║██╔══██╗████╗  ██║████╗  ██║',
  '██║   ██║███████║██╔██╗ ██║██╔██╗ ██║',
  '╚██╗ ██╔╝██╔══██║██║╚██╗██║██║╚██╗██║',
  ' ╚████╔╝ ██║  ██║██║ ╚████║██║ ╚████║',
  '  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝',
]

const DOT_WIDTH = 34

/** Pads each task with dots so every result lands on the same column. */
function buildBootLines() {
  return term.boot.map((step, i) => {
    const stamp = (0.08 + i * 0.19).toFixed(2).padStart(5, '0')
    const dots = '.'.repeat(Math.max(3, DOT_WIDTH - step.task.length))
    return {
      text: `[ ${stamp}s ] ${step.task} ${dots} ${step.result}`,
      result: step.result,
    }
  })
}

/**
 * Types a script one character at a time. One timer at a time, so it stays
 * cheap, and it resolves instantly when reduced motion is requested.
 */
function useBootSequence(lines: string[]) {
  const reduced = useReducedMotion()
  const [cursor, setCursor] = useState({ line: 0, char: 0 })

  useEffect(() => {
    if (reduced) return
    if (cursor.line >= lines.length) return

    const current = lines[cursor.line]
    const isTyping = cursor.char < current.length
    // Two characters per frame keeps the render count near 60/s while still
    // finishing the whole boot log in about three seconds
    const timer = setTimeout(
      () => {
        setCursor((prev) =>
          prev.char < lines[prev.line].length
            ? { line: prev.line, char: Math.min(prev.char + 2, lines[prev.line].length) }
            : { line: prev.line + 1, char: 0 }
        )
      },
      isTyping ? 16 : 190
    )

    return () => clearTimeout(timer)
  }, [cursor, lines, reduced])

  if (reduced) {
    return { visible: lines, done: true }
  }

  const visible = lines
    .slice(0, cursor.line)
    .concat(cursor.line < lines.length ? [lines[cursor.line].slice(0, cursor.char)] : [])

  return { visible, done: cursor.line >= lines.length }
}

/** Fake-but-plausible runtime telemetry. Updates slowly, costs nothing. */
function useTelemetry(active: boolean) {
  const [state, setState] = useState({ tokens: 1024, latency: 42 })

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      setState((prev) => ({
        tokens: prev.tokens >= 4096 ? 1024 : prev.tokens + Math.floor(Math.random() * 180 + 40),
        latency: 28 + Math.floor(Math.random() * 34),
      }))
    }, 1600)
    return () => clearInterval(id)
  }, [active])

  return state
}

export default function HeroTerminal() {
  const reduced = useReducedMotion()
  const { toggleTheme, shortcutKey } = useTheme()

  const bootLines = useMemo(() => buildBootLines(), [])
  const script = useMemo(
    () => [`${term.prompt} ${term.command}`, ...bootLines.map((l) => l.text)],
    [bootLines]
  )
  const { visible, done } = useBootSequence(script)
  const telemetry = useTelemetry(done)

  // Number keys jump to sections, like a proper menu
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const match = term.keys.find((k) => k.key === event.key)
      if (!match) return
      event.preventDefault()
      scrollToSection(match.target)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const resultTone = (result: string) =>
    result === 'OK' || result === 'OPEN' ? 'text-[#00ff9c]' : 'text-red-400'

  return (
    <section
      id="hero"
      className="sticky top-0 h-[100svh] min-h-[600px] w-full overflow-hidden bg-black px-3 py-3 text-zinc-300 md:px-6 md:py-6"
    >
      {/* Window shell */}
      <div className="relative flex h-full flex-col border border-[#00ff9c]/25 bg-[#020806]/90 shadow-[0_0_80px_rgba(0,255,156,0.06)_inset]">
        {/* Title bar */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#00ff9c]/25 bg-[#00ff9c]/[0.04] px-3 py-2 font-mono text-[10px] tracking-[0.14em] uppercase md:text-[11px]">
          <span className="flex min-w-0 items-center gap-2.5 text-zinc-300">
            <span className="h-2 w-2 shrink-0 bg-[#00ff9c]" />
            <span className="truncate">{term.windowTitle}</span>
          </span>
          <span className="hidden items-center gap-2 text-zinc-600 sm:flex">
            {['_', '□', '×'].map((glyph) => (
              <span key={glyph} className="border border-zinc-700 px-1.5 leading-none">
                {glyph}
              </span>
            ))}
          </span>
        </div>

        {/* Shell body */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 py-4 font-mono md:gap-6 md:px-8 md:py-7">
          <div className="hidden shrink-0 text-[11px] leading-relaxed text-zinc-600 sm:block">
            {term.banner.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>

          {/* Boot log */}
          <div className="shrink-0 space-y-0.5 text-[10.5px] leading-relaxed sm:text-xs md:text-[13px]">
            {visible.map((line, i) => {
              const isCommand = i === 0
              const isLast = i === visible.length - 1
              // Results are only coloured once the line has finished typing
              const result = isCommand ? null : bootLines[i - 1].result
              const hasResult = Boolean(result && line.endsWith(result))
              const head = hasResult ? line.slice(0, line.length - result!.length) : line

              return (
                <div
                  key={i}
                  className={cn(
                    'whitespace-pre-wrap break-words',
                    isCommand ? 'text-zinc-200' : 'text-zinc-500'
                  )}
                >
                  {isCommand ? (
                    <>
                      <span className="text-[#00ff9c]">{term.prompt}</span>
                      {line.slice(term.prompt.length)}
                    </>
                  ) : (
                    <>
                      {head}
                      {hasResult && <span className={resultTone(result!)}>{result}</span>}
                    </>
                  )}
                  {isLast && !done && (
                    <span className="ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-[#00ff9c]" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Banner + prompt, revealed once the boot log finishes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: done ? 1 : 0 }}
            transition={{ duration: reduced ? 0 : 0.5, ease: 'easeOut' }}
            className="flex min-h-0 flex-1 flex-col justify-center gap-5 md:gap-7"
          >
            <motion.pre
              initial={reduced ? undefined : { x: -6, filter: 'blur(4px)' }}
              animate={done ? { x: 0, filter: 'blur(0px)' } : undefined}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              aria-label="VANN"
              className="overflow-hidden text-[min(2vw,0.95rem)] leading-[1.08] text-[#00ff9c] select-none"
              style={{ textShadow: '0 0 12px rgba(0,255,156,0.45)' }}
            >
              {ASCII_BANNER.join('\n')}
            </motion.pre>

            <div className="space-y-2 text-[11px] sm:text-xs md:text-sm">
              <div className="text-zinc-500">
                <span className="text-[#00ff9c]">{term.prompt}</span> whoami
              </div>
              <div className="text-zinc-200">{term.whoami}</div>
            </div>

            <p className="max-w-2xl text-[11px] leading-relaxed text-zinc-500 sm:text-xs md:text-sm">
              {hero.intro}
            </p>

            {/* Menu */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:gap-3 sm:text-xs">
              {term.keys.map((item) => (
                <button
                  key={item.key}
                  onClick={() => scrollToSection(item.target)}
                  className="group flex items-center gap-2.5 border border-[#00ff9c]/30 px-3 py-2 text-zinc-300 transition-colors duration-200 hover:border-[#00ff9c] hover:bg-[#00ff9c]/10 hover:text-white"
                >
                  <span className="text-[#00ff9c]">[{item.key}]</span>
                  {item.label}
                </button>
              ))}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2.5 border border-zinc-800 px-3 py-2 text-zinc-500 transition-colors duration-200 hover:border-red-500/60 hover:text-red-400"
              >
                <span className="text-red-500">[{shortcutKey.toUpperCase()}]</span>
                exit cmd mode
              </button>
            </div>

            <div className="text-[11px] text-zinc-600 sm:text-xs">
              <span className="text-[#00ff9c]">{term.prompt}</span>
              <span className="terminal-cursor ml-2 text-[#00ff9c]" />
            </div>
          </motion.div>
        </div>

        {/* Status bar */}
        <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#00ff9c]/25 bg-[#00ff9c]/[0.04] px-3 py-2 font-mono text-[9.5px] tracking-[0.12em] uppercase text-zinc-600 md:text-[10px]">
          <span>
            model <span className="text-zinc-300">{term.telemetry.model}</span>
          </span>
          <span>
            temp <span className="text-zinc-300">{term.telemetry.temp}</span>
          </span>
          <span className="hidden sm:inline">
            ctx{' '}
            <span className="tabular-nums text-zinc-300">
              {telemetry.tokens.toLocaleString()}/{term.telemetry.context}
            </span>
          </span>
          <span>
            lat <span className="tabular-nums text-zinc-300">{telemetry.latency}ms</span>
          </span>
          <span className="ml-auto flex items-center gap-2 text-[#00ff9c]">
            <span className="h-1.5 w-1.5 animate-pulse bg-[#00ff9c]" />
            {hero.status}
          </span>
        </div>
      </div>
    </section>
  )
}
