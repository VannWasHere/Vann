/**
 * Load-timing helpers for the heavy, optional parts of the page (the 3D scenes).
 * Each returns a cancel function so effects can clean up.
 */

/** Runs when the main thread is idle, so the work never competes with input. */
export function whenIdle(callback: () => void, timeout = 1500) {
  // Older Safari has no requestIdleCallback
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(() => callback(), { timeout })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(callback, 1)
  return () => clearTimeout(id)
}

const INTERACTIONS = ['pointermove', 'pointerdown', 'touchstart', 'wheel', 'keydown', 'scroll'] as const

/**
 * Import-on-interaction: fires on the visitor's first input, or once the page
 * has been loaded and quiet for `fallbackMs`, whichever comes first. The
 * fallback sits past the ~5 s quiet window that load-time metrics measure, so
 * heavy work never lands on a visitor who hasn't touched the page yet.
 */
export function onFirstInteraction(callback: () => void, fallbackMs = 6000) {
  let cancelIdle: (() => void) | null = null
  let timer = 0
  let done = false

  const cleanup = () => {
    for (const type of INTERACTIONS) window.removeEventListener(type, fire)
    window.removeEventListener('load', arm)
    window.clearTimeout(timer)
  }

  function fire() {
    if (done) return
    done = true
    cleanup()
    cancelIdle = whenIdle(callback)
  }

  function arm() {
    timer = window.setTimeout(fire, fallbackMs)
  }

  for (const type of INTERACTIONS) window.addEventListener(type, fire, { passive: true, once: true })
  if (document.readyState === 'complete') arm()
  else window.addEventListener('load', arm, { once: true })

  return () => {
    done = true
    cleanup()
    cancelIdle?.()
  }
}

/**
 * Fires once the visitor has interacted (or the fallback passed) *and*
 * `element` is within `margin` of the viewport.
 */
export function whenEngagedAndNear(element: Element, callback: () => void, margin = '100% 0px') {
  let cancelNear: (() => void) | null = null
  const cancelInteraction = onFirstInteraction(() => {
    cancelNear = whenNear(element, callback, margin)
  })
  return () => {
    cancelInteraction()
    cancelNear?.()
  }
}

/** Fires once `element` comes within `margin` of the viewport. */
export function whenNear(element: Element, callback: () => void, margin = '100% 0px') {
  let cancelIdle: (() => void) | null = null
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer.disconnect()
      cancelIdle = whenIdle(callback)
    },
    { rootMargin: margin }
  )
  observer.observe(element)

  return () => {
    observer.disconnect()
    cancelIdle?.()
  }
}
