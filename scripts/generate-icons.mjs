/**
 * Generates public/favicon.ico and public/apple-touch-icon.png from the same
 * geometry as public/favicon.svg. No image dependencies — the monogram is
 * rasterised analytically with 4x4 supersampling, then encoded as PNG (zlib)
 * and packed into an ICO container.
 *
 * Run: node scripts/generate-icons.mjs
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = resolve(ROOT, 'public')

/* ── Design (64x64 canvas, matches favicon.svg) ─────────────────────────── */

const CANVAS = 64
const PLATE_RADIUS = 14
const PLATE_TOP = [0x16, 0x16, 0x16]
const PLATE_BOTTOM = [0x06, 0x06, 0x06]
const HAIRLINE = [0xff, 0xff, 0xff]
const HAIRLINE_ALPHA = 0.1
const WHITE = [0xff, 0xff, 0xff]
const RED = [0xef, 0x44, 0x44]

// Thick stem (white) and thin stem (red) — the seam at x=32 is overlapped by
// the red path so no anti-aliasing gap shows between them.
const STEM_THICK = [
  [13, 15],
  [24, 15],
  [32.4, 37],
  [32.4, 49],
]
const STEM_THIN = [
  [51, 15],
  [43, 15],
  [32, 37],
  [32, 49],
]

const SUPERSAMPLE = 4

/* ── Geometry helpers ───────────────────────────────────────────────────── */

function pointInPolygon(x, y, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

/** Signed distance to a rounded rectangle. Negative inside. */
function roundedRectSDF(x, y, cx, cy, halfW, halfH, radius) {
  const dx = Math.abs(x - cx) - (halfW - radius)
  const dy = Math.abs(y - cy) - (halfH - radius)
  const outside = Math.hypot(Math.max(dx, 0), Math.max(dy, 0))
  return outside + Math.min(Math.max(dx, dy), 0) - radius
}

function over(dst, srcRGB, srcAlpha) {
  if (srcAlpha <= 0) return dst
  const a = srcAlpha + dst[3] * (1 - srcAlpha)
  if (a <= 0) return [0, 0, 0, 0]
  const blend = (i) => (srcRGB[i] * srcAlpha + dst[i] * dst[3] * (1 - srcAlpha)) / a
  return [blend(0), blend(1), blend(2), a]
}

function lerp(a, b, t) {
  return a.map((v, i) => v + (b[i] - v) * t)
}

/* ── Rasteriser ─────────────────────────────────────────────────────────── */

/**
 * @param {number} size output pixel size
 * @param {boolean} opaque full-bleed square plate (iOS masks its own corners)
 */
function render(size, opaque = false) {
  const rgba = Buffer.alloc(size * size * 4)
  const scale = CANVAS / size
  const step = 1 / SUPERSAMPLE
  const samples = SUPERSAMPLE * SUPERSAMPLE

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let plate = 0
      let hairline = 0
      let thick = 0
      let thin = 0

      for (let sy = 0; sy < SUPERSAMPLE; sy++) {
        for (let sx = 0; sx < SUPERSAMPLE; sx++) {
          const x = (px + (sx + 0.5) * step) * scale
          const y = (py + (sy + 0.5) * step) * scale

          const insidePlate = opaque || roundedRectSDF(x, y, 32, 32, 32, 32, PLATE_RADIUS) <= 0
          if (!insidePlate) continue
          plate++

          if (!opaque) {
            const edge = roundedRectSDF(x, y, 32, 32, 31.25, 31.25, PLATE_RADIUS - 0.75)
            if (Math.abs(edge) <= 0.75) hairline++
          }

          // Sampled independently: the stems overlap at the seam and the thin
          // stem is painted last, which hides the anti-aliasing join
          if (pointInPolygon(x, y, STEM_THICK)) thick++
          if (pointInPolygon(x, y, STEM_THIN)) thin++
        }
      }

      const centerY = (py + 0.5) * scale
      const plateColor = lerp(PLATE_TOP, PLATE_BOTTOM, Math.min(1, Math.max(0, centerY / CANVAS)))

      let px4 = [0, 0, 0, 0]
      px4 = over(px4, plateColor, plate / samples)
      px4 = over(px4, HAIRLINE, (hairline / samples) * HAIRLINE_ALPHA)
      px4 = over(px4, WHITE, thick / samples)
      px4 = over(px4, RED, thin / samples)

      const o = (py * size + px) * 4
      rgba[o] = Math.round(px4[0])
      rgba[o + 1] = Math.round(px4[1])
      rgba[o + 2] = Math.round(px4[2])
      rgba[o + 3] = Math.round(px4[3] * 255)
    }
  }

  return rgba
}

/* ── PNG encoder ────────────────────────────────────────────────────────── */

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePNG(size, rgba) {
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type: RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

/* ── ICO container ──────────────────────────────────────────────────────── */

function encodeICO(entries) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(entries.length, 4)

  const dir = Buffer.alloc(16 * entries.length)
  let offset = header.length + dir.length

  entries.forEach((entry, i) => {
    const o = i * 16
    dir[o] = entry.size >= 256 ? 0 : entry.size
    dir[o + 1] = entry.size >= 256 ? 0 : entry.size
    dir[o + 2] = 0 // palette
    dir[o + 3] = 0 // reserved
    dir.writeUInt16LE(1, o + 4) // colour planes
    dir.writeUInt16LE(32, o + 6) // bits per pixel
    dir.writeUInt32LE(entry.png.length, o + 8)
    dir.writeUInt32LE(offset, o + 12)
    offset += entry.png.length
  })

  return Buffer.concat([header, dir, ...entries.map((e) => e.png)])
}

/* ── Build ──────────────────────────────────────────────────────────────── */

mkdirSync(PUBLIC, { recursive: true })

const icoSizes = [16, 32, 48, 64]
const ico = encodeICO(
  icoSizes.map((size) => ({ size, png: encodePNG(size, render(size)) }))
)
writeFileSync(resolve(PUBLIC, 'favicon.ico'), ico)

const touch = encodePNG(180, render(180, true))
writeFileSync(resolve(PUBLIC, 'apple-touch-icon.png'), touch)

console.log(`favicon.ico          ${icoSizes.join('/')}px  ${ico.length} bytes`)
console.log(`apple-touch-icon.png 180px        ${touch.length} bytes`)
