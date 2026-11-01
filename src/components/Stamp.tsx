import type { ReactNode } from 'react'
import { cn } from '../utils'

type StampProps = {
  children: ReactNode
  className?: string
  /** Rotation in degrees */
  tilt?: number
}

/** Rubber-stamp label: outlined, slightly rotated. Colour comes from the text colour. */
export default function Stamp({ children, className, tilt = -6 }: StampProps) {
  return (
    <span
      style={{ rotate: `${tilt}deg` }}
      className={cn(
        'type-label inline-flex items-center gap-1.5 border-2 border-current px-2 py-0.5 font-semibold whitespace-nowrap outline outline-1 -outline-offset-[5px] outline-current/40',
        className
      )}
    >
      {children}
    </span>
  )
}
