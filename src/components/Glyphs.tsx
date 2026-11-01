import monogram from '../data/monogram.json'
import { cn } from '../utils'

// Arrows and the asterisk aren't in the self-hosted font subsets, and the
// system fallback can render ✳ as a colour emoji — so they're drawn here.

const ROTATION = { right: 0, down: 90, left: 180, up: -90, 'up-right': -45 } as const

type GlyphProps = { className?: string }

export function Arrow({ direction = 'right', className }: GlyphProps & { direction?: keyof typeof ROTATION }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className={cn('inline-block h-[0.95em] w-[0.95em] shrink-0', className)}
      style={{ transform: `rotate(${ROTATION[direction]}deg)` }}
    >
      <path d="M2 8h11.5M8.5 3 13.5 8l-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  )
}

export function Asterisk({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={cn('inline-block shrink-0', className)}>
      <path
        d="M8 1v14M1 8h14M3.05 3.05l9.9 9.9M12.95 3.05l-9.9 9.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

const toPath = (points: number[][]) => `M${points.map(([x, y]) => `${x} ${y}`).join('L')}Z`

/** The V monogram, flat — same geometry as the favicon and the 3D model. */
export function MonogramMark({ className, thickClassName = 'fill-paper-100' }: GlyphProps & { thickClassName?: string }) {
  return (
    <svg viewBox={`0 0 ${monogram.canvas} ${monogram.canvas}`} aria-hidden="true" focusable="false" className={className}>
      <path d={toPath(monogram.thick.points)} className={thickClassName} />
      <path d={toPath(monogram.thin.points)} className="fill-signal" />
    </svg>
  )
}
