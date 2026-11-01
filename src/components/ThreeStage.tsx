import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { detectCapabilities } from '../three/capabilities'
import type { SceneHandle, SceneModule } from '../three/types'
import { onFirstInteraction, whenEngagedAndNear } from '../lib/schedule'

type ThreeStageProps<TOptions, THandle extends SceneHandle> = {
  /** Dynamic import of the scene module — keeps three.js out of the page bundle */
  load: () => Promise<SceneModule<TOptions, THandle>>
  /** Read once, when the scene mounts */
  options: TOptions
  /** 'interaction' for above-the-fold scenes, 'near' for ones further down */
  trigger: 'interaction' | 'near'
  /** Prerendered stand-in, shown until the first frame and kept as the fallback */
  poster: ReactNode
  onReady?: (handle: THandle | null) => void
  /** Must position the stage (relative or absolute) — poster and canvas fill it */
  className: string
  children?: ReactNode
}

/**
 * Lazy WebGL mount point. Renders the poster on the server and on devices that
 * get no 3D (see capabilities.ts); otherwise loads the scene when it's needed
 * and cross-fades to it once the first frame is ready.
 */
export default function ThreeStage<TOptions, THandle extends SceneHandle>({
  load,
  options,
  trigger,
  poster,
  onReady,
  className,
  children,
}: ThreeStageProps<TOptions, THandle>) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [live, setLive] = useState(false)

  const readOptions = useEffectEvent(() => options)
  const notify = useEffectEvent((handle: THandle | null) => onReady?.(handle))

  useEffect(() => {
    if (import.meta.env.SSR) return
    const host = hostRef.current
    if (!host) return

    const caps = detectCapabilities()
    if (caps.tier === 'off') return

    let handle: THandle | null = null
    let cancelled = false

    const start = async () => {
      try {
        const scene = await load()
        if (cancelled) return
        const mounted = await scene.mount(
          host,
          {
            caps,
            onContextLost: () => {
              setLive(false)
              notify(null)
              // Tear the scene down (timers, observers, listeners) so nothing
              // keeps running headless behind the poster
              handle?.dispose()
              handle = null
            },
          },
          readOptions()
        )
        if (cancelled) {
          mounted.dispose()
          return
        }
        handle = mounted
        setLive(true)
        notify(mounted)
      } catch (error) {
        // The poster stays up; the page works the same without the 3D layer
        console.warn('[3d] scene failed to start', error)
      }
    }

    const cancelTrigger = trigger === 'near' ? whenEngagedAndNear(host, start) : onFirstInteraction(start)

    return () => {
      cancelled = true
      cancelTrigger()
      handle?.dispose()
      notify(null)
    }
  }, [load, trigger])

  return (
    <div className={className} data-stage={live ? 'live' : 'poster'}>
      <div
        className="stage-poster absolute inset-0"
        style={{ opacity: live ? 0 : 1, pointerEvents: live ? 'none' : undefined }}
        aria-hidden={live || undefined}
      >
        {poster}
      </div>
      <div
        ref={hostRef}
        aria-hidden="true"
        className="stage-canvas absolute inset-0"
        style={{ opacity: live ? 1 : 0, pointerEvents: live ? undefined : 'none' }}
      />
      {children}
    </div>
  )
}
