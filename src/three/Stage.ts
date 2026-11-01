import {
  Mesh,
  NeutralToneMapping,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Texture,
  Vector2,
  WebGLRenderer,
  type Material,
} from 'three'
import type { Capabilities } from './capabilities'

export type Controller = {
  /** Advance the scene. Return true while anything is still moving. */
  update(dt: number, elapsed: number): boolean
  resize?(width: number, height: number): void
}

export type FrameStats = {
  dt: number
  moving: boolean
  pixelRatio: number
  calls: number
  triangles: number
}

type StageOptions = {
  fov: number
  cameraZ: number
  onContextLost: () => void
}

// Frames slower than ~24 fps count against the GPU. A steady 30 Hz cap (iOS Low
// Power Mode, Chrome Energy Saver) stays above this, so it never costs sharpness.
const SLOW_FRAME = 1 / 24
const SLOW_STREAK = 40
// A long run of fast frames wins the resolution back
const FAST_FRAME = 1 / 50
const RECOVER_STREAK = 240
const MIN_DPR_SCALE = 0.6

/**
 * One WebGL canvas with a render-on-demand loop.
 *
 * The loop only runs while the canvas is on screen, the tab is visible, and the
 * controller reports motion (or something called invalidate()). When a scene
 * comes to rest the loop stops completely: no requestAnimationFrame, no GPU work.
 */
export class Stage {
  readonly renderer: WebGLRenderer
  readonly scene = new Scene()
  readonly camera: PerspectiveCamera
  readonly canvas: HTMLCanvasElement

  width = 1
  height = 1
  /** Debug hook — set by src/three/debug.ts */
  onFrame: ((stats: FrameStats) => void) | null = null
  /** Fires when the canvas scrolls in or out of view. */
  onVisibility: ((visible: boolean) => void) | null = null

  private controller: Controller | null = null
  private frame = 0
  private last = 0
  private elapsed = 0
  private visible = false
  /** Shaders are compiled and the first frame is drawn; rendering is allowed. */
  private started = false
  private lost = false
  private disposed = false
  private dprScale = 1
  private slowFrames = 0
  private fastFrames = 0
  private readonly caps: Capabilities
  private readonly whenLost: Promise<void>
  private readonly resizeObserver: ResizeObserver
  private readonly intersectionObserver: IntersectionObserver

  constructor(host: HTMLElement, caps: Capabilities, options: StageOptions) {
    this.caps = caps

    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.outputColorSpace = SRGBColorSpace
    this.renderer.toneMapping = NeutralToneMapping
    this.renderer.setClearColor(0x000000, 0)
    // Reading shader logs stalls the GPU pipeline; only worth it while developing
    this.renderer.debug.checkShaderErrors = import.meta.env.DEV

    this.canvas = this.renderer.domElement
    this.whenLost = new Promise((resolve) => {
      this.canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault()
        // dispose() drops the context on purpose; there is nothing to report then
        if (this.disposed) return
        this.lost = true
        this.stop()
        resolve()
        options.onContextLost()
      })
    })
    host.appendChild(this.canvas)

    this.camera = new PerspectiveCamera(options.fov, 1, 0.1, 100)
    this.camera.position.set(0, 0, options.cameraZ)

    this.resizeObserver = new ResizeObserver(([entry]) => {
      this.resize(entry.contentRect.width, entry.contentRect.height)
    })
    this.resizeObserver.observe(host)

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        // Entries can queue up during a fast scroll; only the newest one is current
        const entry = entries[entries.length - 1]
        this.visible = entry.isIntersecting
        this.onVisibility?.(this.visible)
        if (this.visible) this.invalidate()
      },
      { rootMargin: '64px' }
    )
    this.intersectionObserver.observe(host)

    document.addEventListener('visibilitychange', this.onPageVisibility)

    const rect = host.getBoundingClientRect()
    this.resize(rect.width, rect.height)
  }

  get isVisible() {
    return this.visible
  }

  /**
   * Compiles every shader before the first frame (so the fade-in never hitches),
   * renders once, then hands control to the loop.
   */
  async start(controller: Controller) {
    this.controller = controller
    controller.resize?.(this.width, this.height)
    // Resize/visibility/pointer events can't render before this resolves, so a
    // half-compiled program never blocks the main thread
    await Promise.race([this.renderer.compileAsync(this.scene, this.camera), this.whenLost])
    if (this.lost) throw new Error('WebGL context lost while compiling shaders')
    if (this.disposed) return
    this.started = true
    controller.update(0, 0)
    this.renderer.render(this.scene, this.camera)
    this.invalidate()
  }

  /** Request at least one more frame. */
  invalidate() {
    if (this.frame || this.disposed || !this.started) return
    this.frame = requestAnimationFrame(this.tick)
  }

  /** Pointer position in normalised device coordinates (-1..1). */
  toNdc(event: { clientX: number; clientY: number }, target = new Vector2()) {
    const rect = this.canvas.getBoundingClientRect()
    return target.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    )
  }

  /** Visible height/width of the plane z = 0, in world units. */
  viewSize() {
    const height = 2 * this.camera.position.z * Math.tan((this.camera.fov * Math.PI) / 360)
    return { width: height * this.camera.aspect, height }
  }

  dispose() {
    this.disposed = true
    this.stop()
    this.resizeObserver.disconnect()
    this.intersectionObserver.disconnect()
    document.removeEventListener('visibilitychange', this.onPageVisibility)

    this.scene.traverse((object) => {
      if (!(object instanceof Mesh)) return
      object.geometry.dispose()
      const materials: Material[] = Array.isArray(object.material) ? object.material : [object.material]
      for (const material of materials) {
        for (const value of Object.values(material)) {
          if (value instanceof Texture) value.dispose()
        }
        material.dispose()
      }
    })
    this.scene.environment?.dispose()
    this.renderer.dispose()
    // Hand the GL context back now rather than whenever GC gets to it
    this.renderer.forceContextLoss()
    this.canvas.remove()
  }

  private stop() {
    cancelAnimationFrame(this.frame)
    this.frame = 0
    this.last = 0
  }

  private readonly onPageVisibility = () => {
    if (document.hidden) this.stop()
    else this.invalidate()
  }

  private pixelRatio() {
    return Math.min(window.devicePixelRatio || 1, this.caps.maxDpr) * this.dprScale
  }

  private resize(width: number, height: number) {
    this.width = Math.max(1, Math.round(width))
    this.height = Math.max(1, Math.round(height))
    this.renderer.setPixelRatio(this.pixelRatio())
    this.renderer.setSize(this.width, this.height, false)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
    this.controller?.resize?.(this.width, this.height)
    // setSize() clears the drawing buffer; redraw right away so a resize (or the
    // scrollbar toggling) never shows a blank frame
    if (this.started && !this.disposed && !this.lost) this.renderer.render(this.scene, this.camera)
    this.invalidate()
  }

  /** Adaptive resolution: trade sharpness for frame rate on slow GPUs, and back. */
  private adapt(dt: number, moving: boolean) {
    if (!moving) return
    this.slowFrames = dt > SLOW_FRAME ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 1)
    this.fastFrames = dt < FAST_FRAME ? this.fastFrames + 1 : 0

    if (this.slowFrames >= SLOW_STREAK && this.dprScale > MIN_DPR_SCALE) {
      this.slowFrames = 0
      this.dprScale = Math.max(MIN_DPR_SCALE, this.dprScale - 0.15)
      this.resize(this.width, this.height)
    } else if (this.fastFrames >= RECOVER_STREAK && this.dprScale < 1) {
      this.fastFrames = 0
      this.dprScale = Math.min(1, this.dprScale + 0.15)
      this.resize(this.width, this.height)
    }
  }

  private readonly tick = (now: number) => {
    this.frame = 0
    if (this.disposed || !this.started || !this.controller) return
    if (!this.visible || document.hidden) {
      this.last = 0
      return
    }

    // Clamp so a long pause (tab switch, breakpoint) never fast-forwards the scene
    const dt = this.last ? Math.min((now - this.last) / 1000, 0.05) : 1 / 60
    this.last = now
    this.elapsed += dt

    const moving = this.controller.update(dt, this.elapsed)
    this.renderer.render(this.scene, this.camera)
    this.adapt(dt, moving)

    this.onFrame?.({
      dt,
      moving,
      pixelRatio: this.renderer.getPixelRatio(),
      calls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
    })

    // invalidate() guards against double-scheduling (adapt() may already have queued a frame)
    if (moving) this.invalidate()
    else this.last = 0
  }
}
