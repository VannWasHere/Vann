import { useRef } from 'react'
import content from '../data/content.json'
import Barcode from '../components/Barcode'
import Marquee from '../components/Marquee'
import ThreeStage from '../components/ThreeStage'
import { Arrow, Asterisk, MonogramMark } from '../components/Glyphs'
import { StatusDot } from '../components/Nav'
import { revealDelay } from '../lib/reveal'

const hero = content.hero

const loadMonogram = () => import('../three/scenes/monogram')

function ShippingLabel() {
  const rows = [
    { label: 'From', value: hero.label.from },
    { label: 'Ship to', value: hero.label.shipTo },
    { label: 'Service', value: hero.label.service },
  ]

  return (
    <div className="border border-paper-100/20 bg-graphite-900/60">
      <div className="type-label flex items-center justify-between border-b border-paper-100/20 px-4 py-2.5 text-graphite-400">
        <span>{hero.label.title}</span>
        <span className="text-signal">Priority</span>
      </div>
      <div className="grid sm:grid-cols-[1fr_auto]">
        <dl className="divide-y divide-paper-100/10">
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 px-4 py-3">
              <dt className="type-label text-graphite-400">{row.label}</dt>
              <dd className="text-[0.95rem] text-paper-100">{row.value}</dd>
            </div>
          ))}
          <div className="grid grid-cols-[6.5rem_1fr] items-center gap-4 px-4 py-3">
            <dt className="type-label text-graphite-400">Status</dt>
            <dd className="flex items-center gap-2.5 text-[0.95rem] text-paper-100">
              <StatusDot />
              {hero.status}
            </dd>
          </div>
        </dl>
        <div className="flex flex-col justify-between gap-3 border-t border-paper-100/10 px-4 py-4 sm:w-56 sm:border-t-0 sm:border-l">
          <Barcode value={hero.tracking} className="h-16 w-full text-paper-100" />
          <div className="type-label flex justify-between text-graphite-400">
            <span className="text-paper-100">{hero.tracking}</span>
            <span>{hero.label.route}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section id="top" ref={sectionRef} className="guides relative overflow-hidden">
      <div className="container-page">
        <div className="type-label flex items-center justify-between gap-6 border-b border-paper-100/10 py-4 text-graphite-400">
          <span>{hero.edition}</span>
          <span className="hidden md:inline">
            {hero.name} — {hero.role}
          </span>
          <span className="tabular-nums">No. {hero.tracking}</span>
        </div>

        <div className="grid items-center gap-y-8 pt-10 pb-12 md:grid-cols-12 md:gap-x-8 md:pt-14 lg:pb-16">
          <div className="md:col-span-7">
            {/* The LCP element: painted straight from the prerendered HTML, never animated in */}
            <h1 className="type-display text-[21.5vw] text-paper-100 md:text-[clamp(5rem,11.4vw,12rem)]">
              <span className="block whitespace-nowrap">{hero.lineOne}</span>
              <span className="block whitespace-nowrap">
                {hero.lineTwo}
                <span className="text-signal">.</span>
              </span>
            </h1>
            <p className="type-serif mt-6 flex items-center gap-3 text-[clamp(1.65rem,3.1vw,2.9rem)] leading-none text-graphite-300">
              <Asterisk className="h-[0.45em] w-[0.45em] text-signal" />
              {hero.accent}
            </p>
          </div>

          <figure className="md:col-span-5">
            <ThreeStage
              load={loadMonogram}
              trigger="interaction"
              options={{ interactionRoot: () => sectionRef.current }}
              className="registration relative mx-auto aspect-square w-[82%] max-w-[32rem] bg-[radial-gradient(closest-side,rgb(239_68_68/0.13),transparent)] md:w-full"
              // Oversized by the same factor as FIT in the 3D scene, so the swap is seamless
              poster={<MonogramMark className="absolute -inset-[6%] h-[112%] w-[112%]" />}
            />
            <figcaption className="type-label mt-4 text-center text-graphite-400">{hero.figure}</figcaption>
          </figure>
        </div>

        <div className="grid gap-8 border-t border-paper-100/10 py-10 md:grid-cols-12 md:gap-8 lg:py-12">
          <div className="md:col-span-7" data-reveal>
            <ShippingLabel />
          </div>
          <div className="flex flex-col justify-between gap-8 md:col-span-5" data-reveal style={revealDelay(120)}>
            <p className="text-lg leading-relaxed text-graphite-300 md:text-xl">{hero.intro}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#work"
                className="type-label group inline-flex items-center gap-3 bg-paper-100 px-5 py-3.5 text-ink transition-colors duration-300 hover:bg-signal"
              >
                {hero.primaryCta}
                <Arrow direction="down" className="transition-transform duration-300 group-hover:translate-y-0.5" />
              </a>
              <a
                href="#contact"
                className="type-label inline-flex items-center border border-paper-100/25 px-5 py-3.5 text-paper-100 transition-colors duration-300 hover:border-paper-100/60"
              >
                {hero.secondaryCta}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-y border-paper-100/10">
        <div className="container-page type-label flex items-center gap-6 py-3.5">
          <span className="shrink-0 text-graphite-400">{hero.industriesLabel}</span>
          <Marquee items={hero.industries} className="text-paper-100" />
        </div>
      </div>
    </section>
  )
}
