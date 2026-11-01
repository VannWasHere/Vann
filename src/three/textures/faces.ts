import {
  BOX,
  GRAPHITE,
  INK,
  LABEL,
  MUTED,
  RED,
  RED_DEEP,
  createCanvas,
  display,
  drawArrow,
  drawBarcode,
  drawCover,
  drawStamp,
  ellipsize,
  fitLines,
  mono,
  setTracking,
} from './canvas'

export type ProjectFace = {
  kind: 'project'
  pkg: string
  title: string
  type: string
  year: string
  tech: string[]
  live: boolean
  tracking: string
  initials: string
  image?: { small: string; large: string }
}

export type ArchiveFace = {
  kind: 'archive'
  title: string
  from: string
  to: string
  contents: string
  note: string
  cta: string
  tracking: string
}

export type CubeFace = ProjectFace | ArchiveFace

/** Where the packing tape crosses a face. */
export type Tape = 'none' | 'tab' | 'full'

// Layout is designed on a 1000-unit square and scaled to the texture size.
// The outer ~30 units wrap around the rounded edge of the box.
const TAPE_LEFT = 418
const TAPE_RIGHT = 582
const TAB_LENGTH = 168

function drawTape(ctx: CanvasRenderingContext2D, u: number, tape: Tape) {
  if (tape === 'none') return
  const left = TAPE_LEFT * u
  const width = (TAPE_RIGHT - TAPE_LEFT) * u
  const end = tape === 'full' ? 1000 * u : TAB_LENGTH * u

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(left, 0)
  ctx.lineTo(left + width, 0)
  if (tape === 'full') {
    ctx.lineTo(left + width, end)
    ctx.lineTo(left, end)
  } else {
    // Torn end, as if cut on a dispenser's teeth
    const teeth = 9
    ctx.lineTo(left + width, end)
    for (let i = teeth; i >= 0; i--) {
      const x = left + (width / teeth) * i
      ctx.lineTo(x, end + (i % 2 === 0 ? 0 : 9 * u))
    }
  }
  ctx.closePath()
  ctx.fillStyle = RED
  ctx.fill()
  ctx.clip()

  // Slightly deeper edges where the tape folds over the box
  ctx.fillStyle = RED_DEEP
  ctx.fillRect(left, 0, 4 * u, end + 10 * u)
  ctx.fillRect(left + width - 4 * u, 0, 4 * u, end + 10 * u)

  // Branded print running along the tape
  ctx.translate(left + width / 2, 0)
  ctx.rotate(Math.PI / 2)
  ctx.fillStyle = 'rgb(251 250 246 / 0.92)'
  ctx.font = mono(22 * u, 700)
  setTracking(ctx, `${7 * u}px`)
  ctx.textBaseline = 'middle'
  for (let x = 18 * u; x < end; x += 210 * u) ctx.fillText('VANN · SHIPPED', x, 0)
  ctx.restore()
}

/** Grayscale roughness: matte paper, glossy tape (read from the green channel). */
export function drawRoughness(size: number, tape: Tape) {
  const { canvas, ctx } = createCanvas(size)
  const u = size / 1000
  ctx.fillStyle = 'rgb(214 214 214)'
  ctx.fillRect(0, 0, size, size)
  if (tape !== 'none') {
    ctx.fillStyle = 'rgb(70 70 70)'
    const end = tape === 'full' ? size : (TAB_LENGTH + 6) * u
    ctx.fillRect(TAPE_LEFT * u, 0, (TAPE_RIGHT - TAPE_LEFT) * u, end)
  }
  return canvas
}

/** Paper fibre noise for the bump map, tiled across every face. */
export function drawPaperGrain(size = 256) {
  const { canvas, ctx } = createCanvas(size)
  const image = ctx.createImageData(size, size)
  for (let i = 0; i < image.data.length; i += 4) {
    const value = 128 + (Math.random() - 0.5) * 70
    image.data[i] = image.data[i + 1] = image.data[i + 2] = value
    image.data[i + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  // Soften into fibres rather than pixel noise
  ctx.globalAlpha = 0.5
  ctx.filter = 'blur(1px)'
  ctx.drawImage(canvas, 0, 0)
  return canvas
}

/**
 * No screenshot yet: a blueprint-style wireframe of an app screen, so the face
 * still reads as a finished design rather than a gap. Mirrors the SVG in
 * src/components/ProjectImage.tsx (viewBox 320 × 180).
 */
function drawFallbackShot(ctx: CanvasRenderingContext2D, u: number, x: number, y: number, w: number, h: number, initials: string) {
  ctx.fillStyle = GRAPHITE
  ctx.fillRect(x, y, w, h)

  // Blueprint grid
  ctx.strokeStyle = 'rgb(239 236 228 / 0.06)'
  ctx.lineWidth = Math.max(1, u)
  for (let gx = x + 24 * u; gx < x + w; gx += 24 * u) {
    ctx.beginPath()
    ctx.moveTo(gx, y)
    ctx.lineTo(gx, y + h)
    ctx.stroke()
  }
  for (let gy = y + 24 * u; gy < y + h; gy += 24 * u) {
    ctx.beginPath()
    ctx.moveTo(x, gy)
    ctx.lineTo(x + w, gy)
    ctx.stroke()
  }

  // Wireframe, laid out on the same 320 × 180 grid as the DOM version
  const sx = w / 320
  const sy = h / 180
  const box = (bx: number, by: number, bw: number, bh: number) =>
    ctx.strokeRect(x + bx * sx, y + by * sy, bw * sx, bh * sy)

  ctx.strokeStyle = 'rgb(239 236 228 / 0.42)'
  ctx.lineWidth = Math.max(1.5, 2.2 * u)
  box(14, 12, 292, 18) // top bar
  box(14, 38, 58, 130) // sidebar
  for (const cx of [82, 158, 234]) box(cx, 38, 70, 40) // KPI tiles
  box(82, 88, 222, 80) // chart panel

  // Chart: bars and a trend line
  ctx.fillStyle = 'rgb(239 68 68 / 0.85)'
  const bars = [0.35, 0.55, 0.42, 0.7, 0.5, 0.82, 0.64, 0.9]
  bars.forEach((value, i) => {
    const barHeight = 58 * value
    ctx.fillRect(x + (96 + i * 25) * sx, y + (160 - barHeight) * sy, 12 * sx, barHeight * sy)
  })
  ctx.fillStyle = 'rgb(239 236 228 / 0.42)'
  for (const cx of [82, 158, 234]) ctx.fillRect(x + (cx + 8) * sx, y + 50 * sy, 30 * sx, 8 * sy)
  for (let i = 0; i < 5; i++) ctx.fillRect(x + 22 * sx, y + (48 + i * 14) * sy, 40 * sx, 4 * sy)

  ctx.fillStyle = 'rgb(239 236 228 / 0.55)'
  ctx.font = mono(17 * u, 600)
  setTracking(ctx, `${3.5 * u}px`)
  ctx.fillText(`${initials} · PREVIEW SOON`, x + 20 * u, y + 28 * u)
}

export function drawProjectFace(size: number, face: ProjectFace, shot: ImageBitmap | null, tape: Tape) {
  const { canvas, ctx } = createCanvas(size)
  const u = size / 1000

  ctx.fillStyle = BOX
  ctx.fillRect(0, 0, size, size)

  // Sticker
  const s = { x: 70 * u, y: 70 * u, w: 860 * u, h: 860 * u }
  ctx.fillStyle = LABEL
  ctx.fillRect(s.x, s.y, s.w, s.h)
  ctx.strokeStyle = INK
  ctx.lineWidth = 3 * u
  ctx.strokeRect(s.x, s.y, s.w, s.h)

  const left = 112 * u
  const right = 888 * u
  const width = right - left

  // Header — the centre stays clear for the tape tab
  ctx.fillStyle = INK
  ctx.font = mono(27 * u, 650)
  setTracking(ctx, `${4 * u}px`)
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(face.pkg, left, 140 * u)
  ctx.textAlign = 'right'
  ctx.fillText(face.year, right, 140 * u)
  ctx.textAlign = 'left'

  ctx.fillRect(left, 170 * u, width, 3 * u)

  ctx.fillStyle = MUTED
  ctx.font = mono(21 * u)
  setTracking(ctx, `${3.5 * u}px`)
  ctx.fillText(face.type.toUpperCase(), left, 214 * u)
  ctx.textAlign = 'right'
  ctx.fillText(face.tracking, right, 214 * u)
  ctx.textAlign = 'left'

  // Screenshot
  const shotBox = { x: left, y: 240 * u, w: width, h: 350 * u }
  if (shot) drawCover(ctx, shot, shotBox.x, shotBox.y, shotBox.w, shotBox.h)
  else drawFallbackShot(ctx, u, shotBox.x, shotBox.y, shotBox.w, shotBox.h, face.initials)
  ctx.strokeStyle = INK
  ctx.lineWidth = 3 * u
  ctx.strokeRect(shotBox.x, shotBox.y, shotBox.w, shotBox.h)

  // Title
  ctx.fillStyle = INK
  setTracking(ctx, '0px')
  const title = fitLines(ctx, face.title.toUpperCase(), display, width, { start: 124 * u, min: 70 * u, maxLines: 2 })
  ctx.font = display(title.size)
  const lineHeight = title.size * 0.9
  let y = 618 * u + title.size * 0.8
  for (const line of title.lines) {
    ctx.fillText(line, left - 2 * u, y)
    y += lineHeight
  }

  // Stack
  ctx.fillStyle = MUTED
  ctx.font = mono(21 * u)
  setTracking(ctx, `${2.5 * u}px`)
  ctx.fillText(ellipsize(ctx, face.tech.join(' · ').toUpperCase(), width), left, 836 * u)

  // Barcode + stamp
  drawBarcode(ctx, face.tracking, left, 858 * u, 330 * u, 46 * u)
  drawStamp(ctx, face.live ? 'LIVE' : 'PRIVATE BUILD', 744 * u, 878 * u, 24 * u)

  drawTape(ctx, u, tape)
  return canvas
}

function drawThisSideUp(ctx: CanvasRenderingContext2D, u: number, cx: number, top: number) {
  ctx.save()
  ctx.strokeStyle = INK
  ctx.lineWidth = 9 * u
  ctx.lineCap = 'square'
  for (const offset of [-34, 34]) {
    const x = cx + offset * u
    ctx.beginPath()
    ctx.moveTo(x, top + 120 * u)
    ctx.lineTo(x, top + 20 * u)
    ctx.moveTo(x - 22 * u, top + 42 * u)
    ctx.lineTo(x, top + 18 * u)
    ctx.lineTo(x + 22 * u, top + 42 * u)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(cx - 70 * u, top + 140 * u)
  ctx.lineTo(cx + 70 * u, top + 140 * u)
  ctx.stroke()
  ctx.restore()
}

function drawFragileGlass(ctx: CanvasRenderingContext2D, u: number, cx: number, top: number) {
  ctx.save()
  ctx.strokeStyle = RED
  ctx.lineWidth = 8 * u
  ctx.lineJoin = 'round'
  ctx.beginPath()
  // Bowl
  ctx.moveTo(cx - 44 * u, top)
  ctx.lineTo(cx + 44 * u, top)
  ctx.quadraticCurveTo(cx + 46 * u, top + 92 * u, cx, top + 100 * u)
  ctx.quadraticCurveTo(cx - 46 * u, top + 92 * u, cx - 44 * u, top)
  // Stem and foot
  ctx.moveTo(cx, top + 100 * u)
  ctx.lineTo(cx, top + 150 * u)
  ctx.moveTo(cx - 32 * u, top + 152 * u)
  ctx.lineTo(cx + 32 * u, top + 152 * u)
  ctx.stroke()
  // Crack
  ctx.lineWidth = 5 * u
  ctx.beginPath()
  ctx.moveTo(cx - 8 * u, top + 4 * u)
  ctx.lineTo(cx + 6 * u, top + 26 * u)
  ctx.lineTo(cx - 6 * u, top + 42 * u)
  ctx.lineTo(cx + 8 * u, top + 62 * u)
  ctx.stroke()
  ctx.restore()
}

/** The box's top: shipping label on one flap, handling marks on the other. */
export function drawArchiveFace(size: number, face: ArchiveFace, tape: Tape) {
  const { canvas, ctx } = createCanvas(size)
  const u = size / 1000

  ctx.fillStyle = BOX
  ctx.fillRect(0, 0, size, size)

  // Shipping label on the left flap
  const s = { x: 70 * u, y: 90 * u, w: 320 * u, h: 820 * u }
  ctx.fillStyle = LABEL
  ctx.fillRect(s.x, s.y, s.w, s.h)
  ctx.strokeStyle = INK
  ctx.lineWidth = 3 * u
  ctx.strokeRect(s.x, s.y, s.w, s.h)

  const left = s.x + 30 * u
  const width = s.w - 60 * u
  ctx.fillStyle = INK
  const title = fitLines(ctx, face.title.toUpperCase(), display, width, { start: 96 * u, min: 52 * u, maxLines: 3 })
  ctx.font = display(title.size)
  let y = s.y + 40 * u + title.size * 0.8
  for (const line of title.lines) {
    ctx.fillText(line, left, y)
    y += title.size * 0.9
  }

  y += 10 * u
  ctx.fillRect(left, y, width, 3 * u)
  y += 52 * u

  const field = (label: string, value: string) => {
    ctx.fillStyle = MUTED
    ctx.font = mono(19 * u)
    setTracking(ctx, `${3 * u}px`)
    ctx.fillText(label, left, y)
    y += 40 * u
    ctx.fillStyle = INK
    ctx.font = mono(25 * u, 650)
    setTracking(ctx, `${1 * u}px`)
    ctx.fillText(ellipsize(ctx, value.toUpperCase(), width), left, y)
    y += 58 * u
  }
  field('FROM', face.from)
  field('TO', face.to)
  field('CONTENTS', face.contents)

  drawBarcode(ctx, face.tracking, left, s.y + s.h - 150 * u, width, 84 * u)
  ctx.fillStyle = INK
  ctx.font = mono(20 * u, 600)
  setTracking(ctx, `${4 * u}px`)
  ctx.fillText(face.tracking, left, s.y + s.h - 36 * u)

  // Handling marks printed on the right flap
  const cx = 772 * u
  drawThisSideUp(ctx, u, cx, 96 * u)
  ctx.fillStyle = INK
  ctx.font = mono(19 * u, 650)
  setTracking(ctx, `${3 * u}px`)
  ctx.textAlign = 'center'
  ctx.fillText('THIS SIDE UP', cx, 290 * u)

  drawFragileGlass(ctx, u, cx, 360 * u)
  ctx.fillStyle = RED
  ctx.font = display(84 * u)
  setTracking(ctx, '0px')
  ctx.fillText('FRAGILE', cx, 616 * u)
  ctx.font = mono(17 * u, 650)
  setTracking(ctx, `${3 * u}px`)
  ctx.fillText(face.note.toUpperCase().replace(/^FRAGILE\s*[—-]\s*/, ''), cx, 660 * u)

  // Call to action
  ctx.fillStyle = INK
  ctx.font = mono(21 * u, 700)
  setTracking(ctx, `${3.5 * u}px`)
  const cta = face.cta.toUpperCase()
  const ctaWidth = ctx.measureText(cta).width
  ctx.fillText(cta, cx - 26 * u, 836 * u)
  ctx.strokeStyle = INK
  drawArrow(ctx, cx - 26 * u + ctaWidth / 2 + 14 * u, 829 * u, 40 * u, 4 * u)
  ctx.textAlign = 'left'
  ctx.fillRect(cx - ctaWidth / 2 - 26 * u, 856 * u, ctaWidth + 80 * u, 3 * u)

  drawTape(ctx, u, tape)
  return canvas
}
