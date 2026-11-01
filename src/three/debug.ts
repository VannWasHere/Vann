import type { Stage } from './Stage'

let panel: HTMLDivElement | null = null

/**
 * ?debug3d overlay: frames actually rendered per second, draw calls, triangles,
 * pixel ratio and whether the loop is running. A stage at rest should read 0 fps.
 * Lazy-loaded, so it costs nothing unless the flag is in the URL.
 */
export function attachDebug(stage: Stage, name: string) {
  // Reachable from the console as __vann3d.cube / __vann3d.monogram
  const registry = window as unknown as { __vann3d?: Record<string, Stage> }
  registry.__vann3d = { ...registry.__vann3d, [name]: stage }

  if (!panel) {
    panel = document.createElement('div')
    panel.style.cssText =
      'position:fixed;left:8px;bottom:8px;z-index:9999;display:grid;gap:4px;font:11px/1.4 ui-monospace,monospace;color:#efece4;pointer-events:none'
    document.body.appendChild(panel)
  }

  const row = document.createElement('div')
  row.style.cssText = 'background:rgb(11 11 10 / .85);border:1px solid #3d3c37;padding:4px 8px;white-space:pre'
  panel.appendChild(row)

  let frames = 0
  let last = { moving: false, pixelRatio: 0, calls: 0, triangles: 0 }
  stage.onFrame = (stats) => {
    frames++
    last = stats
  }

  const timer = window.setInterval(() => {
    const state = frames ? (last.moving ? 'running' : 'settling') : 'idle'
    row.textContent = `${name.padEnd(9)} ${String(frames).padStart(3)} fps  ${state.padEnd(8)}  calls ${last.calls}  tris ${last.triangles}  dpr ${last.pixelRatio.toFixed(2)}  ${stage.isVisible ? 'in view' : 'off-screen'}`
    frames = 0
  }, 1000)

  return () => {
    window.clearInterval(timer)
    row.remove()
    stage.onFrame = null
  }
}
