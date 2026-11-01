import type { CSSProperties } from 'react'
import { Asterisk } from './Glyphs'
import { cn } from '../utils'

type MarqueeProps = {
  items: string[]
  className?: string
  /** Seconds per loop */
  duration?: number
  /** Copies of the list per half, so each half is wider than the screen */
  repeat?: number
}

const edgeFade = 'linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)'

/** CSS-only ticker: two identical halves sliding by -50%, paused on hover. */
export default function Marquee({ items, className, duration = 46, repeat = 3 }: MarqueeProps) {
  const half = Array.from({ length: repeat }, () => items).flat()

  return (
    <div className={cn('marquee min-w-0 flex-1 overflow-hidden', className)} style={{ maskImage: edgeFade, WebkitMaskImage: edgeFade }}>
      <div className="marquee-track flex w-max" style={{ '--marquee-duration': `${duration}s` } as CSSProperties}>
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1 || undefined}>
            {half.map((item, i) => (
              <li key={`${item}-${i}`} className="flex items-center whitespace-nowrap">
                <span className="px-5">{item}</span>
                <Asterisk className="h-2.5 w-2.5 text-signal" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
