import { useEffect, useState } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'
import Reveal from '../components/Reveal'
import contentData from '../data/content.json'
import { cn } from '../utils'

const EASE = [0.16, 1, 0.3, 1] as const
const hero = contentData.hero
const COPIES = 6

/** Keeps a value looping inside [min, max) so the track never shows a seam. */
function wrap(min: number, max: number, value: number) {
  const range = max - min
  return ((((value - min) % range) + range) % range) + min
}

/**
 * One row of kinetic display type. Drifts at `baseVelocity` (negative = left,
 * positive = right) and speeds up with scroll velocity, so the band reacts to
 * the reader instead of looping on autopilot.
 */
function KineticRow({ word, baseVelocity }: { word: string; baseVelocity: number }) {
  const reduced = useReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 60, stiffness: 300, mass: 0.6 })
  // Magnitude only — the row keeps its direction, it just accelerates
  const velocityBoost = useTransform(smoothVelocity, [-2200, 0, 2200], [2.6, 0, 2.6], {
    clamp: true,
  })
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`)

  useAnimationFrame((_, delta) => {
    if (reduced) return
    const boost = 1 + velocityBoost.get()
    baseX.set(baseX.get() + (baseVelocity * boost * delta) / 1000)
  })

  const half = Array.from({ length: COPIES })

  return (
    <motion.div
      style={reduced ? undefined : { x }}
      className="flex w-max flex-nowrap will-change-transform"
    >
      {[0, 1].map((copy) => (
        <div key={copy} className="flex flex-nowrap" aria-hidden={copy === 1}>
          {half.map((_, i) => (
            <span key={i} className="flex items-center">
              <span className={cn('inline-block', i % 2 === 0 ? 'word-solid' : 'word-outline')}>
                {word}
              </span>
              <span className="mx-[0.18em] text-[0.16em] align-middle text-red-500/80">✳</span>
            </span>
          ))}
        </div>
      ))}
    </motion.div>
  )
}

function formatTime(timeZone: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date())
  } catch {
    return ''
  }
}

/** Live local time — small human detail instead of a decorative widget. */
function useLocalTime(timeZone: string) {
  const [time, setTime] = useState(() => formatTime(timeZone))

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(timeZone)), 15_000)
    return () => clearInterval(id)
  }, [timeZone])

  return time
}

export default function Hero() {
  const reduced = useReducedMotion()
  const time = useLocalTime(hero.timezone)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 60, stiffness: 300, mass: 0.6 })

  // The whole band leans into the scroll direction — subtle, never gimmicky
  const skewX = useTransform(smoothVelocity, [-3000, 0, 3000], [-2.5, 0, 2.5], { clamp: true })

  // Restrained parallax: content drifts up and dims as the next section covers it
  const y = useTransform(scrollY, [0, 900], ['0%', '-12%'])
  const opacity = useTransform(scrollY, [0, 620], [1, 0.12])

  const edgeFade =
    'linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%)'

  return (
    <section
      id="hero"
      className="sticky top-0 h-[100svh] min-h-[600px] w-full overflow-hidden bg-[#080808] text-white"
    >
      {/* Column guides — structure you can feel, not decoration you notice */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden grid-cols-4 md:grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-l border-white/[0.04]" />
        ))}
      </div>

      {/* Film grain */}
      <div
        aria-hidden
        className="grain pointer-events-none absolute inset-0 z-[2] overflow-hidden mix-blend-soft-light"
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* ── Masthead ─────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: 'easeOut' }}
          className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4 font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-500 md:px-10 md:text-[11px]"
        >
          <span className="truncate text-zinc-300">
            {hero.name}
            <span className="mx-1.5 text-red-500">/</span>
            <span className="text-zinc-500">{hero.alias}</span>
          </span>

          <span className="hidden md:block">{hero.role}</span>

          <span className="flex shrink-0 items-center gap-2.5">
            <span className="hidden sm:inline">{hero.location}</span>
            <span className="hidden text-zinc-700 sm:inline">—</span>
            <span className="tabular-nums text-zinc-300">{time || '--:--'}</span>
          </span>
        </motion.header>

        <motion.main
          style={reduced ? undefined : { y, opacity }}
          className="flex flex-1 flex-col justify-center gap-8 py-6 md:gap-12 md:py-10"
        >
          {/* ── Kinetic type band ──────────────────────────────── */}
          <motion.div
            style={reduced ? undefined : { skewX }}
            className="relative select-none"
          >
            <div
              className="font-display text-[clamp(2.9rem,10.5vw,9rem)] leading-[0.9] font-extrabold tracking-[-0.04em] uppercase"
              style={{ maskImage: edgeFade, WebkitMaskImage: edgeFade }}
            >
              <motion.div
                initial={reduced ? { opacity: 0 } : { y: '110%' }}
                animate={reduced ? { opacity: 1 } : { y: '0%' }}
                transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
                className="overflow-hidden"
              >
                <KineticRow word={hero.lineOne} baseVelocity={-2.2} />
              </motion.div>

              <motion.div
                initial={reduced ? { opacity: 0 } : { y: '110%' }}
                animate={reduced ? { opacity: 1 } : { y: '0%' }}
                transition={{ duration: 1.2, delay: 0.34, ease: EASE }}
                className="overflow-hidden text-zinc-100"
              >
                <KineticRow word={hero.lineTwo} baseVelocity={1.6} />
              </motion.div>
            </div>
          </motion.div>

          {/* ── Meta ───────────────────────────────────────────── */}
          <div className="px-5 md:px-10">
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4 border-b border-white/10 pb-5 md:pb-6">
              <Reveal delay={0.55}>
                <p className="font-editorial text-[clamp(1.25rem,2.8vw,2.1rem)] leading-none text-zinc-400 italic">
                  <span className="mr-3 align-middle text-xs text-red-500 not-italic">✳</span>
                  {hero.accent}
                </p>
              </Reveal>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                </span>
                {hero.status}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7, ease: EASE }}
              className="grid gap-6 pt-5 md:grid-cols-12 md:gap-10 md:pt-6"
            >
              <p className="max-w-xl text-sm leading-relaxed font-light text-zinc-400 md:col-span-7 md:text-base">
                {hero.intro}
              </p>

              <div className="flex flex-wrap items-start gap-3 md:col-span-5 md:justify-end">
                <a
                  href="#projects"
                  className="group inline-flex items-center gap-3 bg-white px-5 py-3 font-mono text-[11px] tracking-[0.18em] uppercase text-black transition-colors duration-300 hover:bg-red-500 hover:text-white"
                >
                  {hero.primaryCta}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center border border-white/15 px-5 py-3 font-mono text-[11px] tracking-[0.18em] uppercase text-zinc-400 transition-colors duration-300 hover:border-white/40 hover:text-white"
                >
                  {hero.secondaryCta}
                </a>
              </div>
            </motion.div>
          </div>
        </motion.main>

        {/* ── Footer bar ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.95 }}
          className="flex shrink-0 items-stretch border-t border-white/10"
        >
          <div className="flex min-w-0 flex-1 items-center gap-5 overflow-hidden px-5 py-3 md:px-10">
            <span className="hidden shrink-0 font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-600 lg:inline">
              Built for
            </span>
            <ul className="flex min-w-0 items-center gap-5 overflow-hidden">
              {hero.industries.map((item) => (
                <li
                  key={item}
                  className="font-mono text-[10px] tracking-[0.2em] whitespace-nowrap uppercase text-zinc-500"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden shrink-0 items-center gap-3 border-l border-white/10 px-5 md:flex">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-500">
              {hero.scrollText}
            </span>
            <motion.span
              animate={reduced ? undefined : { y: [-3, 3, -3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-xs text-red-500"
            >
              &darr;
            </motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
