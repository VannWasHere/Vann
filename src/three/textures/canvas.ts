import { CanvasTexture, NoColorSpace, RepeatWrapping, SRGBColorSpace, type WebGLRenderer } from 'three'
import { barcodeBars } from '../../lib/barcode'

export const INK = '#0e0e0c'
export const MUTED = '#5c5a53'
export const FAINT = '#a29f96'
export const RED = '#ef4444'
export const RED_DEEP = '#c42b2b'
export const BOX = '#f2efe7'
export const LABEL = '#fbfaf6'
export const GRAPHITE = '#171715'

export const display = (px: number) => `640 condensed ${px}px "Instrument Sans Variable", "Arial Narrow", sans-serif`
export const mono = (px: number, weight = 500) => `${weight} ${px}px "JetBrains Mono Variable", ui-monospace, monospace`
export const serif = (px: number) => `italic 400 ${px}px "Instrument Serif", Georgia, serif`

/** Resolves once the web fonts used on the canvases are available. */
export function loadCanvasFonts() {
  return Promise.all([
    document.fonts.load(display(64), 'VANN'),
    document.fonts.load(mono(24), 'PKG 01'),
    document.fonts.load(serif(40), 'Vann'),
  ]).catch(() => undefined)
}

export function createCanvas(size: number) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')
  return { canvas, ctx }
}

/** Decodes off the main thread; null when the image is missing or broken. */
export async function loadBitmap(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    return await createImageBitmap(await response.blob())
  } catch {
    return null
  }
}

/** object-fit: cover, for canvas. */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  image: ImageBitmap,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.max(width / image.width, height / image.height)
  const sw = width / scale
  const sh = height / scale
  ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, x, y, width, height)
}

export function setTracking(ctx: CanvasRenderingContext2D, value: string) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = value
}

/**
 * Greedy word wrap that shrinks the font until the text fits in `maxLines`.
 * Returns the lines and the size it settled on.
 */
export function fitLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: (px: number) => string,
  maxWidth: number,
  { start, min, maxLines }: { start: number; min: number; maxLines: number }
) {
  const words = text.split(/\s+/).filter(Boolean)
  for (let size = start; size >= min; size -= 2) {
    ctx.font = font(size)
    const lines: string[] = []
    let line = ''
    for (const word of words) {
      const next = line ? `${line} ${word}` : word
      if (ctx.measureText(next).width <= maxWidth || !line) line = next
      else {
        lines.push(line)
        line = word
      }
    }
    if (line) lines.push(line)
    const fits = lines.every((l) => ctx.measureText(l).width <= maxWidth)
    if (lines.length <= maxLines && fits) return { lines, size }
  }
  ctx.font = font(min)
  return { lines: [ellipsize(ctx, text, maxWidth)], size: min }
}

export function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let cut = text
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) cut = cut.slice(0, -1)
  return `${cut.trimEnd()}…`
}

/** Real Code 128 bars, snapped to whole pixels so they stay crisp. */
export function drawBarcode(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color = INK
) {
  const { bars, modules } = barcodeBars(value, 0)
  const unit = width / modules
  ctx.fillStyle = color
  for (const bar of bars) {
    const left = Math.round(x + bar.x * unit)
    const right = Math.round(x + (bar.x + bar.width) * unit)
    ctx.fillRect(left, y, Math.max(1, right - left), height)
  }
}

/** → drawn as a path; the arrow glyph is not in the font subsets. */
export function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, length: number, weight: number) {
  const head = length * 0.32
  ctx.save()
  ctx.lineWidth = weight
  ctx.lineCap = 'square'
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + length, y)
  ctx.moveTo(x + length - head, y - head)
  ctx.lineTo(x + length, y)
  ctx.lineTo(x + length - head, y + head)
  ctx.stroke()
  ctx.restore()
}

/** Rubber stamp: outlined, slightly rotated label. */
export function drawStamp(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  px: number,
  color = RED
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(-0.11)
  ctx.font = mono(px, 700)
  setTracking(ctx, `${px * 0.14}px`)
  const width = ctx.measureText(text).width + px * 1.4
  const height = px * 2
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = px * 0.14
  ctx.strokeRect(-width / 2, -height / 2, width, height)
  ctx.lineWidth = px * 0.05
  ctx.strokeRect(-width / 2 + px * 0.22, -height / 2 + px * 0.22, width - px * 0.44, height - px * 0.44)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, px * 0.07, px * 0.06)
  ctx.restore()
}

export function colorTexture(canvas: HTMLCanvasElement, renderer: WebGLRenderer, anisotropy: number) {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = Math.min(anisotropy, renderer.capabilities.getMaxAnisotropy())
  return texture
}

export function dataTexture(canvas: HTMLCanvasElement, repeat = 1) {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = NoColorSpace
  if (repeat !== 1) {
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(repeat, repeat)
  }
  return texture
}

/**
 * Uploads a texture now (instead of on first render), then releases the
 * canvas backing store — the GPU copy is all three.js needs from here on.
 */
export function uploadAndRelease(renderer: WebGLRenderer, texture: CanvasTexture) {
  renderer.initTexture(texture)
  const canvas = texture.image as HTMLCanvasElement
  canvas.width = 1
  canvas.height = 1
}

/** Lets the browser breathe between expensive steps so no task runs long. */
export const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 0))
