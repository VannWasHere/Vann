import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useReducedMotion } from 'framer-motion'
import Reveal from '../components/Reveal'
import contentData from '../data/content.json'
import { cn } from '../utils'

const EASE = [0.16, 1, 0.3, 1] as const
const about = contentData.about

const headlineStyles: Record<string, string> = {
  solid: 'font-display font-semibold text-ink',
  serif: 'font-editorial italic text-red-600',
  muted: 'font-display font-semibold text-ink/30',
}

/** Counts up once the strip scrolls into view. */
function StatValue({ value }: { value: string }) {
  const match = value.match(/^(\d+)(.*)$/)
  const target = match ? Number.parseInt(match[1], 10) : 0
  const suffix = match ? match[2] : value

  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-12%' })
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, target, {
      duration: reduced ? 0 : 1.3,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, target, reduced])

  return (
    <span ref={ref} className="tabular-nums">
      {match ? display : ''}
      {suffix}
    </span>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper px-5 py-6 md:px-6 md:py-7">
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/40">
        {label}
      </div>
      <div className="mt-2 text-sm leading-snug font-medium text-ink md:text-base">
        {value}
      </div>
    </div>
  )
}

export default function About() {
  const edu = about.education
  const now = about.now

  return (
    <section
      id="about"
      className="relative z-10 overflow-hidden bg-paper px-6 py-24 text-ink md:px-12 md:py-32 lg:px-20"
    >
      {/* Paper texture — keeps the flat light panel from feeling like a blank div */}
      <div
        aria-hidden
        className="grain pointer-events-none absolute inset-0 overflow-hidden opacity-70 mix-blend-multiply"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* ── Section head ─────────────────────────────────────── */}
        <div className="flex items-baseline justify-between gap-6 border-b border-ink/15 pb-5">
          <div className="flex items-baseline gap-4 font-mono text-[10px] tracking-[0.22em] uppercase md:text-[11px]">
            <span className="text-red-600">{about.sectionIndex}</span>
            <span className="text-ink/60">{about.sectionTitle}</span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/40">
            {contentData.hero.location}
          </span>
        </div>

        {/* ── Statement ────────────────────────────────────────── */}
        <div className="pt-12 md:pt-16">
          <h2 className="max-w-5xl text-[clamp(2rem,6vw,5rem)] leading-[1.04] tracking-[-0.03em] text-ink">
            {about.headline.map((line, i) => (
              <Reveal key={i} onScroll delay={i * 0.12} className="block">
                <span className={cn('block', headlineStyles[line.style])}>{line.text}</span>
              </Reveal>
            ))}
          </h2>
        </div>

        {/* ── Copy + current role ──────────────────────────────── */}
        <div className="grid gap-12 pt-16 md:grid-cols-12 md:gap-16 md:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-12%' }}
            transition={{ duration: 0.9, ease: EASE }}
            className="space-y-6 md:col-span-7"
          >
            <p className="text-lg leading-relaxed text-ink md:text-2xl md:leading-relaxed">
              {about.lead}
            </p>
            <p className="max-w-2xl text-base leading-relaxed text-ink/60 md:text-lg">
              {about.body}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-12%' }}
            transition={{ duration: 0.9, delay: 0.12, ease: EASE }}
            className="md:col-span-5 md:pl-10 lg:border-l lg:border-ink/15"
          >
            <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-600" />
              </span>
              {now.label}
            </div>

            <h3 className="font-display mt-5 text-2xl leading-tight font-semibold tracking-tight md:text-3xl">
              {now.role}
            </h3>

            <div className="mt-6 space-y-0 border-t border-ink/15">
              {[
                { label: 'Company', value: now.company },
                { label: 'Tenure', value: now.since },
                { label: 'Base', value: now.location },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-6 border-b border-ink/15 py-3.5 transition-colors hover:border-ink/40"
                >
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink/40">
                    {row.label}
                  </span>
                  <span className="text-right text-sm font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Principles ───────────────────────────────────────── */}
        <div className="pt-20 md:pt-28">
          <div className="mb-8 font-mono text-[10px] tracking-[0.22em] uppercase text-ink/40">
            {about.principlesLabel}
          </div>

          <div className="border-b border-ink/15">
            {about.principles.map((item, i) => (
              <motion.div
                key={item.index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
                className="group relative grid gap-3 border-t border-ink/15 py-7 md:grid-cols-12 md:gap-8 md:py-9"
              >
                {/* Hairline that draws itself on hover */}
                <span
                  aria-hidden
                  className="absolute bottom-0 left-0 h-px w-0 bg-red-600 transition-all duration-700 ease-out group-hover:w-full"
                />

                <span className="font-mono text-[11px] text-red-600 md:col-span-1">
                  {item.index}
                </span>

                <h3 className="font-display text-xl font-medium tracking-tight transition-transform duration-500 ease-out group-hover:translate-x-1.5 md:col-span-4 md:text-2xl">
                  {item.title}
                </h3>

                <p className="max-w-2xl text-sm leading-relaxed text-ink/55 md:col-span-7 md:text-base">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────────── */}
        <div className="mt-20 grid grid-cols-2 gap-px border border-ink/15 bg-ink/15 md:mt-28 md:grid-cols-4">
          {about.stats.map((stat) => (
            <div key={stat.label} className="bg-paper px-5 py-8 md:px-8 md:py-10">
              <div className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
                <StatValue value={stat.value} />
              </div>
              <div className="mt-2 font-mono text-[10px] tracking-[0.18em] uppercase text-ink/45">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Education record ─────────────────────────────────── */}
        <div className="grid gap-10 pt-20 md:grid-cols-12 md:gap-16 md:pt-28">
          <div className="md:col-span-5">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink/40">
              {edu.label}
            </div>
            <p className="font-editorial mt-5 text-2xl leading-snug text-ink/80 italic md:text-3xl">
              {edu.story}
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {edu.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-ink/20 px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase text-ink/60 transition-colors hover:border-red-600/50 hover:text-red-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px self-start border border-ink/15 bg-ink/15 md:col-span-7">
            <Field label="University" value={edu.campus} />
            <Field label="Major" value={edu.major} />
            <Field label="Focus" value={edu.focus} />
            <Field label="Graduated" value={edu.graduated} />
          </div>
        </div>
      </div>
    </section>
  )
}
