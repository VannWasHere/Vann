/**
 * Decides how much 3D a device gets. Imported by the page bundle, so it must
 * never import three.js itself.
 *
 * URL overrides (handy for QA): ?no3d  ?force3d  ?motion=reduce  ?debug3d
 */
export type Tier = 'off' | 'low' | 'high'

export type Capabilities = {
  tier: Tier
  reducedMotion: boolean
  coarsePointer: boolean
  maxDpr: number
  textureSize: number
  anisotropy: number
  debug: boolean
}

type DeviceHints = Navigator & {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

let cached: Capabilities | null = null

/** True when a hardware-accelerated WebGL2 context is available. */
function supportsWebGL2() {
  try {
    const gl = document
      .createElement('canvas')
      .getContext('webgl2', { failIfMajorPerformanceCaveat: true })
    if (!gl) return false
    // Free the probe context right away; browsers cap how many can be alive
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

export function detectCapabilities(): Capabilities {
  if (cached) return cached

  const params = new URLSearchParams(window.location.search)
  const device = navigator as DeviceHints
  const memory = device.deviceMemory ?? 8
  const cores = device.hardwareConcurrency || 8
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const reducedMotion =
    params.get('motion') === 'reduce' || window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let tier: Tier
  if (params.has('no3d')) tier = 'off'
  else if (params.has('force3d')) tier = 'high'
  else if (device.connection?.saveData || memory < 2 || !supportsWebGL2()) tier = 'off'
  else if (coarsePointer || cores <= 4 || memory <= 4) tier = 'low'
  else tier = 'high'

  cached = {
    tier,
    reducedMotion,
    coarsePointer,
    maxDpr: tier === 'high' ? 2 : 1.5,
    textureSize: tier === 'high' ? 1024 : 640,
    anisotropy: tier === 'high' ? 8 : 4,
    debug: params.has('debug3d'),
  }
  return cached
}
