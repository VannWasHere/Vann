import { useEffect, useState } from 'react'
import content from '../data/content.json'
import { useLocalTime } from '../lib/time'
import { MonogramMark } from './Glyphs'
import { cn } from '../utils'

const { nav, hero } = content

// Section ids, plus the hero so nothing is highlighted while it's on screen
const TRACKED = ['top', ...nav.items.map((item) => item.href.slice(1))]

function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    const sections = TRACKED.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    // A thin band across the middle of the viewport decides which section is "current"
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    for (const section of sections) observer.observe(section)
    return () => observer.disconnect()
  }, [enabled])

  return active
}

export function StatusDot({ className }: { className?: string }) {
  return (
    <span className={cn('relative flex h-1.5 w-1.5', className)} aria-hidden>
      <span className="status-ping absolute inset-0 rounded-full bg-signal" />
      <span className="relative h-1.5 w-1.5 rounded-full bg-signal" />
    </span>
  )
}

const closeMenu = () => document.getElementById('site-menu')?.hidePopover()

/**
 * Sticky top bar. On the home page links are in-page anchors with a live
 * "current section" marker; elsewhere they point back to the home page.
 */
export default function Nav({ home = true }: { home?: boolean }) {
  const time = useLocalTime(hero.timezone)
  const active = useActiveSection(home)
  const base = home ? '' : '/'

  return (
    <>
      <a
        href="#main"
        className="type-label sr-only z-[60] bg-signal px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {nav.skip}
      </a>

      <header className="sticky top-0 z-50 border-b border-paper-100/10 bg-graphite-950">
        <div className="container-page flex h-14 items-center justify-between gap-6">
          <a href={home ? '#top' : '/'} className="group flex items-center gap-2.5" aria-label={`${hero.alias} — home`}>
            <MonogramMark className="h-6 w-6 transition-transform duration-500 ease-out-expo group-hover:-rotate-12" />
            <span className="type-display text-[1.45rem] leading-none">{hero.alias}</span>
            <span className="type-label hidden text-graphite-400 lg:inline">/ {hero.name}</span>
          </a>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center">
              {nav.items.map((item) => {
                const current = active === item.href.slice(1)
                return (
                  <li key={item.href}>
                    <a
                      href={`${base}${item.href}`}
                      aria-current={current ? 'location' : undefined}
                      className={cn(
                        'type-label flex items-baseline gap-1.5 px-3 py-2 transition-colors hover:text-paper-100',
                        current ? 'text-paper-100' : 'text-graphite-400'
                      )}
                    >
                      <span className={cn('tabular-nums', current ? 'text-signal' : 'text-graphite-500')}>
                        {item.index}
                      </span>
                      {item.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-5">
            <span className="type-label hidden tabular-nums text-graphite-400 sm:inline">
              JKT <span className="text-paper-100">{time ?? '--:--'}</span>
            </span>
            <span className="type-label hidden items-center gap-2 text-paper-100 lg:flex">
              <StatusDot />
              {hero.status}
            </span>
            <button
              type="button"
              popoverTarget="site-menu"
              className="type-label border border-paper-100/20 px-3 py-2 text-paper-100 transition-colors hover:border-paper-100/50 md:hidden"
            >
              {nav.menu}
            </button>
          </div>
        </div>
      </header>

      <div
        id="site-menu"
        popover="auto"
        className="menu-sheet fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-graphite-950 p-0 text-paper-100"
      >
        <div className="container-page flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b border-paper-100/10">
            <span className="type-label text-graphite-400">{hero.edition}</span>
            <button
              type="button"
              popoverTarget="site-menu"
              popoverTargetAction="hide"
              className="type-label border border-paper-100/20 px-3 py-2"
            >
              {nav.close}
            </button>
          </div>
          <nav aria-label="Menu" className="flex-1 py-8">
            <ul className="space-y-1">
              {nav.items.map((item) => (
                <li key={item.href}>
                  <a
                    href={`${base}${item.href}`}
                    onClick={closeMenu}
                    className="flex items-baseline gap-4 border-b border-paper-100/10 py-3"
                  >
                    <span className="type-label text-signal tabular-nums">{item.index}</span>
                    <span className="type-display text-[3.25rem]">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="type-label flex items-center gap-2 pb-8 text-paper-100">
            <StatusDot />
            {hero.status} · JKT {time ?? '--:--'}
          </p>
        </div>
      </div>
    </>
  )
}
