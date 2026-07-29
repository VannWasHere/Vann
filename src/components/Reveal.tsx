import { useRef, type ReactNode } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { cn } from '../utils'

const EASE = [0.16, 1, 0.3, 1] as const

type RevealProps = {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  /** Trigger when scrolled into view instead of on mount */
  onScroll?: boolean
  as?: 'span' | 'div'
}

/**
 * Masked line reveal — the line slides up from behind its own baseline.
 * Keep one line of text per Reveal, since the wrapper clips.
 *
 * The wrapper is what gets observed for scroll triggering: the inner element
 * starts translated outside the clip region, so an IntersectionObserver placed
 * on it would never report it as visible.
 */
export default function Reveal({
  children,
  delay = 0,
  duration,
  className,
  onScroll = false,
  as = 'span',
}: RevealProps) {
  const reduced = useReducedMotion()
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(wrapperRef, { once: true, margin: '0px 0px -12% 0px' })
  const show = onScroll ? inView : true

  const Wrapper = as === 'div' ? motion.div : motion.span

  const hidden = reduced ? { opacity: 0 } : { y: '115%' }
  const visible = reduced ? { opacity: 1 } : { y: '0%' }

  return (
    <span ref={wrapperRef} className={cn('block overflow-hidden pb-[0.08em]', className)}>
      <Wrapper
        className="block will-change-transform"
        initial={hidden}
        animate={show ? visible : hidden}
        transition={{ duration: duration ?? (reduced ? 0.5 : 1.15), delay, ease: EASE }}
      >
        {children}
      </Wrapper>
    </span>
  )
}
