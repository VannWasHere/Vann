import { useSyncExternalStore } from 'react'

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatTime(timeZone: string) {
  try {
    let formatter = formatters.get(timeZone)
    if (!formatter) {
      formatter = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' })
      formatters.set(timeZone, formatter)
    }
    return formatter.format(new Date())
  } catch {
    return null
  }
}

const subscribe = (onChange: () => void) => {
  const id = window.setInterval(onChange, 15_000)
  return () => window.clearInterval(id)
}

/**
 * Live local time — a small human detail. The prerendered HTML (and the
 * hydration pass) render null, then the client fills it in, so the build-time
 * clock never leaks into the page.
 */
export function useLocalTime(timeZone: string) {
  return useSyncExternalStore(
    subscribe,
    () => formatTime(timeZone),
    () => null
  )
}
