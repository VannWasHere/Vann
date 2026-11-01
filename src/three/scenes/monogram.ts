import {
  DirectionalLight,
  Euler,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  Quaternion,
  Shape,
  Vector2,
} from 'three'
import monogram from '../../data/monogram.json'
import { Stage, type Controller } from '../Stage'
import { createEnvironment } from '../environment'
import type { SceneContext, SceneHandle } from '../types'

export type MonogramOptions = {
  /** Element whose pointer movement tilts the monogram (the hero section). */
  interactionRoot: () => HTMLElement | null
}

const CANVAS = monogram.canvas
const DEPTH = 7
const FILLET = 1.3

/**
 * The 64-unit canvas spans this share of the stage. The poster SVG in
 * src/sections/Hero.tsx is oversized by the same amount so the two line up.
 */
const FIT = 1.12

const REST = new Euler(0.1, -0.36, 0)
const TILT_YAW = 0.42
const TILT_PITCH = 0.26
const SPIN_SPEED = 2.6 // radians per stage-width of drag

/**
 * Builds a stem with softly rounded corners. Rounding first keeps the extrude
 * bevel from spiking out of the V's acute tips.
 */
function stemShape(points: number[][]) {
  // SVG space (y down) → three.js space (y up), centred on the canvas
  const pts = points.map(([x, y]) => new Vector2(x - CANVAS / 2, CANVAS / 2 - y))
  const shape = new Shape()
  pts.forEach((point, i) => {
    const prev = pts[(i - 1 + pts.length) % pts.length]
    const next = pts[(i + 1) % pts.length]
    const toPrev = prev.clone().sub(point)
    const toNext = next.clone().sub(point)
    const r = Math.min(FILLET, toPrev.length() * 0.45, toNext.length() * 0.45)
    const a = point.clone().add(toPrev.normalize().multiplyScalar(r))
    const b = point.clone().add(toNext.normalize().multiplyScalar(r))
    if (i === 0) shape.moveTo(a.x, a.y)
    else shape.lineTo(a.x, a.y)
    shape.quadraticCurveTo(point.x, point.y, b.x, b.y)
  })
  shape.closePath()
  return shape
}

function stemGeometry(points: number[][]) {
  const geometry = new ExtrudeGeometry(stemShape(points), {
    depth: DEPTH,
    curveSegments: 6,
    bevelEnabled: true,
    bevelThickness: 1.1,
    bevelSize: 0.8,
    // Pulls the bevel inside the outline so the silhouette matches the 2D mark
    bevelOffset: -0.8,
    bevelSegments: 5,
  })
  geometry.translate(0, 0, -DEPTH / 2)
  geometry.computeVertexNormals()
  return geometry
}

/** Exponential smoothing that behaves the same at any frame rate. */
const damp = (current: number, target: number, lambda: number, dt: number) =>
  MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt))

export async function mount(host: HTMLElement, context: SceneContext, options: MonogramOptions): Promise<SceneHandle> {
  const { caps } = context
  const stage = new Stage(host, caps, { fov: 30, cameraZ: 10, onContextLost: context.onContextLost })
  const { scene, renderer } = stage

  scene.environment = createEnvironment(renderer)
  scene.environmentIntensity = 0.9

  const key = new DirectionalLight('#ffffff', 1.9)
  key.position.set(-3, 4, 6)
  const rim = new DirectionalLight('#ff4a3d', 2.2)
  rim.position.set(5, 1.5, -4)
  scene.add(key, rim)

  const ceramic = new MeshPhysicalMaterial({
    color: '#f2efe8',
    roughness: 0.34,
    clearcoat: 1,
    clearcoatRoughness: 0.16,
  })
  // Less clearcoat than the ceramic so the red stays saturated in the highlights
  const lacquer = new MeshPhysicalMaterial({
    color: monogram.thin.color,
    roughness: 0.38,
    clearcoat: 0.5,
    clearcoatRoughness: 0.25,
    envMapIntensity: 0.7,
  })

  // The thick stem's seam is overlapped in the 2D mark to hide anti-aliasing;
  // in 3D the stems simply meet, so pull it back to the shared edge.
  const thickPoints = monogram.thick.points.map(([x, y]) => [Math.min(x, 32), y])
  const thick = new Mesh(stemGeometry(thickPoints), ceramic)
  const thin = new Mesh(stemGeometry(monogram.thin.points), lacquer)

  const pivot = new Group()
  const model = new Group()
  model.add(thick, thin)
  pivot.add(model)
  scene.add(pivot)

  // ── Motion state ─────────────────────────────────────────────────────────
  const restQuat = new Quaternion().setFromEuler(REST)
  const pose = new Quaternion()
  const tmpQuat = new Quaternion()
  const tmpEuler = new Euler()

  const animateIntro = !caps.reducedMotion
  let intro = animateIntro ? 0 : 1 // 0 → 1 blend from flat/front to the rest pose
  let depth = animateIntro ? 0.02 : 1
  let depthVelocity = 0

  const tilt = { x: 0, y: 0, targetX: 0, targetY: 0 }
  const spin = { yaw: 0, pitch: 0, vYaw: 0, vPitch: 0 }
  let dragging = false
  let lastPointer = { x: 0, y: 0, t: 0 }
  let floatClock = 0
  let floatAmp = 0
  let awakeUntil = 0
  let now = 0

  const wake = (seconds = 2.5) => {
    awakeUntil = Math.max(awakeUntil, now + seconds)
    stage.invalidate()
  }

  const controller: Controller = {
    resize() {
      const view = stage.viewSize()
      pivot.scale.setScalar((Math.min(view.width, view.height) * FIT) / CANVAS)
    },

    update(dt, elapsed) {
      now = elapsed
      const awake = dragging || now < awakeUntil

      // Intro: inflate from the flat poster, then turn to the rest pose
      if (intro < 1) intro = Math.min(1, intro + dt / 1.5)
      if (depth !== 1 || depthVelocity !== 0) {
        depthVelocity += (-(depth - 1) * 140 - depthVelocity * 13) * dt
        depth += depthVelocity * dt
        if (Math.abs(depth - 1) < 0.0005 && Math.abs(depthVelocity) < 0.001) {
          depth = 1
          depthVelocity = 0
        }
      }
      model.scale.z = Math.max(0.02, depth)

      // Pointer tilt
      tilt.x = damp(tilt.x, tilt.targetX, 4.5, dt)
      tilt.y = damp(tilt.y, tilt.targetY, 4.5, dt)

      // Drag spin: inertia first, then a spring back to rest
      if (!dragging) {
        spin.yaw += spin.vYaw * dt
        spin.pitch += spin.vPitch * dt
        const friction = Math.exp(-2.6 * dt)
        spin.vYaw *= friction
        spin.vPitch *= friction
        if (Math.hypot(spin.vYaw, spin.vPitch) < 0.35) {
          spin.yaw = damp(spin.yaw, 0, 2.4, dt)
          spin.pitch = damp(spin.pitch, 0, 3, dt)
        }
      }

      // Gentle float while the visitor is around
      if (!caps.reducedMotion) {
        floatAmp = damp(floatAmp, awake ? 1 : 0, awake ? 1.6 : 2.2, dt)
        floatClock += dt
      }
      pivot.position.y = Math.sin(floatClock * 1.25) * 0.07 * floatAmp

      // Compose: rest pose (blended in by the intro) → pointer tilt → drag spin
      const eased = 1 - Math.pow(1 - intro, 3)
      pose.identity().slerp(restQuat, eased)
      tmpEuler.set(tilt.x, tilt.y, 0)
      tmpQuat.setFromEuler(tmpEuler)
      pose.premultiply(tmpQuat)
      tmpEuler.set(spin.pitch, spin.yaw, 0)
      tmpQuat.setFromEuler(tmpEuler)
      pose.premultiply(tmpQuat)
      model.quaternion.copy(pose)

      const settling =
        intro < 1 ||
        depth !== 1 ||
        Math.abs(tilt.x - tilt.targetX) > 0.0005 ||
        Math.abs(tilt.y - tilt.targetY) > 0.0005 ||
        Math.abs(spin.yaw) > 0.0005 ||
        Math.abs(spin.pitch) > 0.0005 ||
        floatAmp > 0.002
      return dragging || settling
    },
  }

  // ── Input ────────────────────────────────────────────────────────────────
  const root = options.interactionRoot() ?? host

  const onHover = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return
    const rect = host.getBoundingClientRect()
    const nx = MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1.5, 1.5)
    const ny = MathUtils.clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1.5, 1.5)
    tilt.targetY = (nx / 1.5) * TILT_YAW
    tilt.targetX = (ny / 1.5) * TILT_PITCH
    wake()
  }

  const onLeave = () => {
    tilt.targetX = 0
    tilt.targetY = 0
    wake(1)
  }

  const onDown = (event: PointerEvent) => {
    dragging = true
    stage.canvas.setPointerCapture(event.pointerId)
    stage.canvas.style.cursor = 'grabbing'
    lastPointer = { x: event.clientX, y: event.clientY, t: event.timeStamp }
    spin.vYaw = 0
    spin.vPitch = 0
    wake()
  }

  const onMove = (event: PointerEvent) => {
    if (!dragging) return
    const dx = event.clientX - lastPointer.x
    const dy = event.clientY - lastPointer.y
    const dt = Math.max(1, event.timeStamp - lastPointer.t) / 1000
    const scale = SPIN_SPEED / Math.max(1, stage.width)
    spin.yaw += dx * scale
    spin.pitch = MathUtils.clamp(spin.pitch + dy * scale, -0.9, 0.9)
    spin.vYaw = MathUtils.lerp(spin.vYaw, (dx * scale) / dt, 0.6)
    spin.vPitch = MathUtils.lerp(spin.vPitch, (dy * scale) / dt, 0.6)
    lastPointer = { x: event.clientX, y: event.clientY, t: event.timeStamp }
    wake()
  }

  const onUp = (event: PointerEvent) => {
    if (!dragging) return
    dragging = false
    stage.canvas.style.cursor = 'grab'
    if (stage.canvas.hasPointerCapture(event.pointerId)) stage.canvas.releasePointerCapture(event.pointerId)
    // A pause before letting go means no throw
    if (event.timeStamp - lastPointer.t > 90) {
      spin.vYaw = 0
      spin.vPitch = 0
    }
    // Spin the shortest way home
    spin.yaw = Math.atan2(Math.sin(spin.yaw), Math.cos(spin.yaw))
    wake()
  }

  root.addEventListener('pointermove', onHover, { passive: true })
  root.addEventListener('pointerleave', onLeave)
  stage.canvas.addEventListener('pointerdown', onDown)
  stage.canvas.addEventListener('pointermove', onMove)
  stage.canvas.addEventListener('pointerup', onUp)
  stage.canvas.addEventListener('pointercancel', onUp)
  stage.canvas.style.cursor = 'grab'
  // Horizontal drags spin; vertical swipes still scroll the page on touch
  stage.canvas.style.touchAction = 'pan-y'

  if (caps.debug) void import('../debug').then(({ attachDebug }) => attachDebug(stage, 'monogram'))

  await stage.start(controller)
  wake(animateIntro ? 3 : 0.5)

  return {
    dispose() {
      root.removeEventListener('pointermove', onHover)
      root.removeEventListener('pointerleave', onLeave)
      stage.dispose()
    },
  }
}
