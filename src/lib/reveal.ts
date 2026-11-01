import { useEffect, type CSSProperties } from 'react'

/** Stagger for a [data-reveal] element: style={revealDelay(120)} */
export const revealDelay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties

/**
 * Scroll reveals for every [data-reveal] element on the page.
 *
 * Only elements that start below the fold get hidden (.reveal-pending), and only
 * after hydration — so the prerendered page is fully visible without JS and the
 * hero never waits on a script to paint. One observer serves the whole page.
 */
export function useReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    // Anything already peeking into the viewport stays put — hiding it would flicker
    const fold = window.innerHeight

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.remove('reveal-pending')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    )

    for (const element of elements) {
      if (element.getBoundingClientRect().top < fold) continue
      element.classList.add('reveal-pending')
      observer.observe(element)
    }

    return () => {
      observer.disconnect()
      for (const element of elements) element.classList.remove('reveal-pending')
    }
  }, [])
}
