import {
  DirectionalLight,
  Euler,
  Group,
  MathUtils,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Raycaster,
  Vector2,
  Vector3,
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { Stage, type Controller } from '../Stage'
import { createEnvironment } from '../environment'
import {
  colorTexture,
  dataTexture,
  loadBitmap,
  loadCanvasFonts,
  uploadAndRelease,
  yieldToMain,
} from '../textures/canvas'
import {
  drawArchiveFace,
  drawPaperGrain,
  drawProjectFace,
  drawRoughness,
  type CubeFace,
  type Tape,
} from '../textures/faces'
import type { Capabilities } from '../capabilities'
import type { SceneContext, SceneHandle } from '../types'

export type { CubeFace, ProjectFace, ArchiveFace } from '../textures/faces'

export type CubeOptions = {
  /** Six faces, in visiting order. */
  faces: CubeFace[]
  /** Face shown first — whatever the poster was on when the scene mounted */
  initial: number
  /** Turn to the next face every few seconds until the visitor takes over */
  autoplay: boolean
  /** The face pointing at the viewer changed; `byUser` is false for autoplay. */
  onActiveChange: (index: number, byUser: boolean) => void
  /** The front face was clicked. */
  onOpen: (index: number) => void
  /** Autoplay stopped because the visitor dragged, clicked or stepped the box */
  onAutoplayStop: () => void
}

export type CubeHandle = SceneHandle & {
  goTo: (index: number) => void
  step: (direction: 1 | -1) => void
  /** False under reduced motion, where the box never turns on its own */
  readonly canAutoplay: boolean
  isAutoplaying: () => boolean
  setAutoplay: (enabled: boolean) => void
  /** Hold autoplay while focus is inside the section, without turning it off */
  setPaused: (paused: boolean) => void
}

// BoxGeometry material groups: 0 +x, 1 -x, 2 +y, 3 -y, 4 +z, 5 -z.
// Visiting order turns the box like a book (front → right → back → left),
// then shows the bottom and finally the taped top, where the shipping label is.
const VISIT = [4, 0, 5, 1, 3, 2]

// Each face's texture axes, from RoundedBoxGeometry's UV layout: [u → right, v → up, normal]
const BASIS: Record<number, [Vector3, Vector3, Vector3]> = {
  0: [new Vector3(0, 0, -1), new Vector3(0, 1, 0), new Vector3(1, 0, 0)],
  1: [new Vector3(0, 0, 1), new Vector3(0, 1, 0), new Vector3(-1, 0, 0)],
  2: [new Vector3(1, 0, 0), new Vector3(0, 0, -1), new Vector3(0, 1, 0)],
  3: [new Vector3(1, 0, 0), new Vector3(0, 0, 1), new Vector3(0, -1, 0)],
  4: [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)],
  5: [new Vector3(-1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, -1)],
}

// Packing tape runs over the top and folds down onto the front and back
const TAPE: Record<number, Tape> = { 0: 'none', 1: 'none', 2: 'full', 3: 'none', 4: 'tab', 5: 'tab' }

/** Three-quarter product-shot angle, so the taped top and a side always show. */
const PRESENT = new Quaternion().setFromEuler(new Euler(0.34, -0.5, 0, 'XYZ'))
const PRESENT_INVERSE = PRESENT.clone().invert()

const EDGE = 2
// Cube edge as a share of the stage's shorter side; portrait (phone) stages are
// width-bound, so the box can take a little more of it
const EDGE_FRACTION = 0.46
const EDGE_FRACTION_PORTRAIT = 0.54
const DRAG_SPEED = Math.PI * 1.15 // radians per stage-size of drag
const CLICK_SLOP = 6 // px
const AUTOPLAY_MS = 5200

/** Orientation that shows a face upright, square to the camera, then presented. */
function faceQuaternion(materialIndex: number) {
  const [right, up, normal] = BASIS[materialIndex]
  const toFace = new Matrix4().makeBasis(right, up, normal).transpose()
  return new Quaternion().setFromRotationMatrix(toFace).premultiply(PRESENT)
}

const damp = (current: number, target: number, lambda: number, dt: number) =>
  MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt))

async function buildMaterials(stage: Stage, faces: CubeFace[], size: number, anisotropy: number) {
  const { renderer } = stage
  await loadCanvasFonts()

  // Screenshots decode in parallel, off the main thread
  const shots = faces.map((face) =>
    face.kind === 'project' && face.image ? loadBitmap(size > 700 ? face.image.large : face.image.small) : null
  )

  const grain = dataTexture(drawPaperGrain(256), 3)
  uploadAndRelease(renderer, grain)

  const materials: MeshStandardMaterial[] = []
  for (const [index, face] of faces.entries()) {
    const materialIndex = VISIT[index]
    const tape = TAPE[materialIndex]
    const shot = await shots[index]
    const canvas =
      face.kind === 'project' ? drawProjectFace(size, face, shot ?? null, tape) : drawArchiveFace(size, face, tape)
    shot?.close()

    const map = colorTexture(canvas, renderer, anisotropy)
    uploadAndRelease(renderer, map)

    const material = new MeshStandardMaterial({
      map,
      metalness: 0,
      roughness: 0.84,
      bumpMap: grain,
      bumpScale: 0.45,
    })
    if (tape !== 'none') {
      const roughness = dataTexture(drawRoughness(size / 2, tape))
      uploadAndRelease(renderer, roughness)
      material.roughnessMap = roughness
      material.roughness = 1
    }
    materials[materialIndex] = material
    await yieldToMain()
  }
  return materials
}

export async function mount(host: HTMLElement, context: SceneContext, options: CubeOptions): Promise<CubeHandle> {
  if (options.faces.length !== VISIT.length) {
    throw new Error(`The box needs ${VISIT.length} faces, got ${options.faces.length}`)
  }
  const stage = new Stage(host, context.caps, { fov: 26, cameraZ: 10, onContextLost: context.onContextLost })
  try {
    return await build(stage, context.caps, options)
  } catch (error) {
    // Never leave a half-built canvas (and its GL context) behind
    stage.dispose()
    throw error
  }
}

async function build(stage: Stage, caps: Capabilities, options: CubeOptions): Promise<CubeHandle> {
  const { faces } = options
  const { scene, camera } = stage

  scene.environment = createEnvironment(stage.renderer)
  scene.environmentIntensity = 0.78

  const key = new DirectionalLight('#ffffff', 2.1)
  key.position.set(-4, 6, 7)
  const fill = new DirectionalLight('#fff1e2', 0.55)
  fill.position.set(5, -2, 4)
  scene.add(key, fill)

  const materials = await buildMaterials(stage, faces, caps.textureSize, caps.anisotropy)
  const cube = new Mesh(new RoundedBoxGeometry(EDGE, EDGE, EDGE, 5, 0.075), materials)
  const pivot = new Group()
  pivot.add(cube)
  scene.add(pivot)

  // ── Motion state ─────────────────────────────────────────────────────────
  let active = MathUtils.clamp(options.initial, 0, faces.length - 1)
  let target = faceQuaternion(VISIT[active])
  cube.quaternion.copy(target)

  let mode: 'idle' | 'drag' | 'inertia' | 'snap' = 'idle'
  let snapRate = 6
  const omega = new Vector3() // angular velocity, world space (axis × rad/s)
  const axis = new Vector3()
  const turn = new Quaternion()
  const local = new Quaternion()
  const normal = new Vector3()

  const parallax = { x: 0, y: 0, targetX: 0, targetY: 0 }
  let press = 1
  let pressVelocity = 0
  let floatClock = 0
  let floatAmp = 0
  let awakeUntil = 0
  let now = 0

  const canAutoplay = !caps.reducedMotion
  let autoplay = canAutoplay && options.autoplay
  let paused = false
  let ready = false
  let autoTimer = 0
  let hovering = false

  const wake = (seconds = 2.5) => {
    awakeUntil = Math.max(awakeUntil, now + seconds)
    stage.invalidate()
  }

  /** The visitor took over: autoplay is off for good, and the page is told. */
  const stopAutoplay = () => {
    window.clearTimeout(autoTimer)
    if (!autoplay) return
    autoplay = false
    options.onAutoplayStop()
  }

  const scheduleAutoplay = () => {
    window.clearTimeout(autoTimer)
    if (!ready || !autoplay || paused || hovering || !stage.isVisible || mode !== 'idle') return
    autoTimer = window.setTimeout(() => goTo((active + 1) % faces.length, false), AUTOPLAY_MS)
  }

  function goTo(index: number, byUser = true) {
    if (byUser) stopAutoplay()
    active = ((index % faces.length) + faces.length) % faces.length
    target = faceQuaternion(VISIT[active])
    omega.set(0, 0, 0)
    mode = 'snap'
    snapRate = byUser ? 5.4 : 3.6
    options.onActiveChange(active, byUser)
    wake()
  }

  /** After a free spin, settle on whichever face ended up nearest the viewer. */
  function settleOnNearest() {
    local.copy(PRESENT_INVERSE).multiply(cube.quaternion)
    let best = active
    let bestDot = -Infinity
    VISIT.forEach((materialIndex, index) => {
      const facing = normal.copy(BASIS[materialIndex][2]).applyQuaternion(local).z
      if (facing > bestDot) {
        bestDot = facing
        best = index
      }
    })
    active = best
    target = faceQuaternion(VISIT[active])
    mode = 'snap'
    snapRate = 6.5
    options.onActiveChange(active, true)
  }

  const controller: Controller = {
    resize() {
      const view = stage.viewSize()
      const fraction = view.width < view.height ? EDGE_FRACTION_PORTRAIT : EDGE_FRACTION
      pivot.scale.setScalar((Math.min(view.width, view.height) * fraction) / EDGE)
    },

    update(dt, elapsed) {
      now = elapsed

      if (mode === 'inertia') {
        const speed = omega.length()
        if (speed > 1e-4) {
          turn.setFromAxisAngle(axis.copy(omega).divideScalar(speed), speed * dt)
          cube.quaternion.premultiply(turn)
        }
        omega.multiplyScalar(Math.exp(-3.4 * dt))
        if (speed < 1.5) settleOnNearest()
      }

      if (mode === 'snap') {
        cube.quaternion.slerp(target, 1 - Math.exp(-snapRate * dt))
        if (cube.quaternion.angleTo(target) < 0.0015) {
          cube.quaternion.copy(target)
          mode = 'idle'
          scheduleAutoplay()
        }
      }

      // A small press when the front face is clicked
      if (press !== 1 || pressVelocity !== 0) {
        pressVelocity += (-(press - 1) * 320 - pressVelocity * 22) * dt
        press += pressVelocity * dt
        if (Math.abs(press - 1) < 0.0004 && Math.abs(pressVelocity) < 0.002) {
          press = 1
          pressVelocity = 0
        }
      }

      parallax.x = damp(parallax.x, parallax.targetX, 5, dt)
      parallax.y = damp(parallax.y, parallax.targetY, 5, dt)

      const awake = mode !== 'idle' || now < awakeUntil
      if (!caps.reducedMotion) {
        floatAmp = damp(floatAmp, awake ? 1 : 0, awake ? 1.8 : 2.4, dt)
        floatClock += dt
      }

      pivot.rotation.set(parallax.x, parallax.y, 0)
      pivot.position.y = Math.sin(floatClock * 1.15) * 0.06 * floatAmp
      cube.scale.setScalar(press)

      return (
        mode !== 'idle' ||
        press !== 1 ||
        Math.abs(parallax.x - parallax.targetX) > 0.0004 ||
        Math.abs(parallax.y - parallax.targetY) > 0.0004 ||
        floatAmp > 0.002
      )
    },
  }

  // ── Input ────────────────────────────────────────────────────────────────
  const raycaster = new Raycaster()
  const ndc = new Vector2()
  const { canvas } = stage
  let downAt = { x: 0, y: 0, t: 0 }
  let last = { x: 0, y: 0, t: 0 }
  // A press only becomes a drag once it travels past CLICK_SLOP, so taps and
  // scrolls that merely start on the box don't disturb it
  let pressed = false
  let moved = false
  let pointerId = -1

  function faceAt(event: PointerEvent) {
    stage.toNdc(event, ndc)
    raycaster.setFromCamera(ndc, camera)
    const hit = raycaster.intersectObject(cube, false)[0]
    return hit?.face ? VISIT.indexOf(hit.face.materialIndex) : -1
  }

  const onDown = (event: PointerEvent) => {
    if (event.button !== 0 || pressed) return
    pressed = true
    moved = false
    pointerId = event.pointerId
    canvas.setPointerCapture(pointerId)
    downAt = last = { x: event.clientX, y: event.clientY, t: event.timeStamp }
  }

  const onMove = (event: PointerEvent) => {
    if (!pressed || event.pointerId !== pointerId) {
      // Hover: lean towards the pointer, show a grab cursor over the box
      if (event.pointerType === 'mouse' && !pressed) {
        stage.toNdc(event, ndc)
        parallax.targetX = -ndc.y * 0.07
        parallax.targetY = ndc.x * 0.1
        canvas.style.cursor = faceAt(event) >= 0 ? 'grab' : 'default'
        wake()
      }
      return
    }

    if (!moved) {
      if (Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y) <= CLICK_SLOP) return
      // A real drag: take over from whatever the box was doing
      moved = true
      mode = 'drag'
      omega.set(0, 0, 0)
      stopAutoplay()
      canvas.style.cursor = 'grabbing'
    }

    const dx = event.clientX - last.x
    const dy = event.clientY - last.y
    const distance = Math.hypot(dx, dy)
    if (distance > 0) {
      const angle = (distance / Math.min(stage.width, stage.height)) * DRAG_SPEED
      axis.set(dy, dx, 0).normalize()
      turn.setFromAxisAngle(axis, angle)
      cube.quaternion.premultiply(turn)

      const dt = Math.max(8, event.timeStamp - last.t) / 1000
      omega.lerp(axis.multiplyScalar(angle / dt), 0.55)
    }
    last = { x: event.clientX, y: event.clientY, t: event.timeStamp }
    wake()
  }

  const endPress = () => {
    pressed = false
    if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId)
    pointerId = -1
    canvas.style.cursor = 'grab'
  }

  const onUp = (event: PointerEvent) => {
    if (!pressed || event.pointerId !== pointerId) return
    endPress()

    if (moved) {
      // Holding still before letting go means no throw
      if (event.timeStamp - last.t > 90) omega.set(0, 0, 0)
      mode = 'inertia'
      wake()
      return
    }

    // A tap or click
    const index = faceAt(event)
    if (index < 0) return
    // Opening needs the face squarely presented; mid-turn clicks just finish the turn
    if (index === active && cube.quaternion.angleTo(target) < 0.05) {
      stopAutoplay()
      press = 0.965
      options.onOpen(index)
    } else goTo(index)
    wake()
  }

  // The browser took the gesture (a scroll that started on the box) or capture
  // was lost: a bare press changes nothing, a drag in progress just settles
  const onCancel = (event: PointerEvent) => {
    if (!pressed || event.pointerId !== pointerId) return
    endPress()
    if (!moved) return
    mode = 'inertia'
    wake()
  }

  const onEnter = () => {
    hovering = true
    window.clearTimeout(autoTimer)
  }

  const onLeave = () => {
    hovering = false
    parallax.targetX = 0
    parallax.targetY = 0
    scheduleAutoplay()
    wake(1)
  }

  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onCancel)
  canvas.addEventListener('lostpointercapture', onCancel)
  canvas.addEventListener('pointerenter', onEnter)
  canvas.addEventListener('pointerleave', onLeave)
  // Horizontal swipes spin the box; vertical swipes and pinch-zoom stay with the page
  canvas.style.touchAction = 'pan-y pinch-zoom'

  stage.onVisibility = (visible) => {
    if (visible) scheduleAutoplay()
    else window.clearTimeout(autoTimer)
  }

  if (caps.debug) void import('../debug').then(({ attachDebug }) => attachDebug(stage, 'cube'))

  await stage.start(controller)
  ready = true
  wake(1.5)
  scheduleAutoplay()

  return {
    goTo: (index) => goTo(index),
    step: (direction) => goTo(active + direction),
    canAutoplay,
    isAutoplaying: () => autoplay,
    setAutoplay(enabled) {
      autoplay = canAutoplay && enabled
      if (autoplay) scheduleAutoplay()
      else window.clearTimeout(autoTimer)
    },
    setPaused(next) {
      paused = next
      if (paused) window.clearTimeout(autoTimer)
      else scheduleAutoplay()
    },
    dispose() {
      window.clearTimeout(autoTimer)
      stage.dispose()
    },
  }
}
