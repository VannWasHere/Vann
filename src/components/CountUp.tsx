import { useEffect, useRef } from 'react'

/**
 * A stat that counts up the first time it scrolls into view. The final value
 * is what gets prerendered, so no-JS visitors and crawlers see real numbers;
 * values already on screen at load, or under reduced motion, never animate.
 */
export default function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = ref.current
    const match = value.match(/^(\d+)(.*)$/)
    if (!element || !match) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (element.getBoundingClientRect().top < window.innerHeight) return

    const target = Number.parseInt(match[1], 10)
    const suffix = match[2]
    let frame = 0
    element.textContent = `0${suffix}`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1200)
          const eased = 1 - Math.pow(1 - t, 4)
          element.textContent = `${Math.round(target * eased)}${suffix}`
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { rootMargin: '0px 0px -10% 0px' }
    )
    observer.observe(element)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      element.textContent = value
    }
  }, [value])

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  )
}
