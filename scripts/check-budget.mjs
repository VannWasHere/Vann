/**
 * Performance budget for the production build. Fails (exit 1) when any asset
 * grows past its budget, so regressions are caught before they deploy.
 *
 * Sizes are gzip -9 unless noted (woff2/avif are already compressed).
 *
 * Run: npm run build && npm run check:budget
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = resolve(ROOT, 'dist')
const KB = 1024

const BUDGET = {
  criticalJs: 95 * KB, // everything a page needs before it can hydrate
  staticPageJs: 1 * KB, // the 404 ships no JS
  css: 16 * KB,
  html: 30 * KB,
  threeShared: 175 * KB, // three.js + shared 3D helpers, loaded lazily
  scene: 15 * KB, // each 3D scene module
  displayFont: 75 * KB, // the preloaded woff2 (raw)
  image: 120 * KB, // largest AVIF per screenshot (raw)
  sprite: 30 * KB,
}

const manifestPath = join(DIST, '.vite/manifest.json')
if (!existsSync(manifestPath)) {
  console.error('No build found — run `npm run build` first.')
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const gz = (file) => gzipSync(readFileSync(join(DIST, file)), { level: 9 }).length
const raw = (file) => statSync(join(DIST, file)).size
const fmt = (bytes) => `${(bytes / KB).toFixed(1)} kB`

/** A chunk plus everything it statically imports. */
function closure(key, seen = new Set()) {
  if (seen.has(key)) return seen
  seen.add(key)
  for (const imported of manifest[key].imports ?? []) closure(imported, seen)
  return seen
}

const rows = []
const check = (label, size, budget) => rows.push({ label, size, budget, ok: size <= budget })

// ── Pages ──────────────────────────────────────────────────────────────────
const pages = Object.entries(manifest).filter(([key, chunk]) => chunk.isEntry && key.endsWith('.html'))
let homeCritical = new Set()

for (const [key] of pages) {
  const keys = closure(key)
  if (key === 'index.html') homeCritical = keys

  const html = readFileSync(join(DIST, key), 'utf8')
  const shipsJs = /<script type="module"/.test(html)
  const js = [...keys].map((k) => manifest[k].file).filter((file) => file.endsWith('.js'))
  const css = new Set([...keys].flatMap((k) => manifest[k].css ?? []))

  check(`${key} — critical JS`, shipsJs ? js.reduce((sum, file) => sum + gz(file), 0) : 0, shipsJs ? BUDGET.criticalJs : BUDGET.staticPageJs)
  check(`${key} — CSS`, [...css].reduce((sum, file) => sum + gz(file), 0), BUDGET.css)
  check(`${key} — HTML`, gzipSync(html, { level: 9 }).length, BUDGET.html)
}

// ── Lazy 3D ────────────────────────────────────────────────────────────────
const scenes = Object.entries(manifest).filter(([key, chunk]) => chunk.isDynamicEntry && key.startsWith('src/three/scenes/'))
const shared = new Set()
for (const [key, chunk] of scenes) {
  check(`${key.replace('src/three/scenes/', 'scene: ')}`, gz(chunk.file), BUDGET.scene)
  for (const k of closure(key)) if (k !== key && !homeCritical.has(k)) shared.add(manifest[k].file)
}
check('three.js + shared 3D (lazy)', [...shared].reduce((sum, file) => sum + gz(file), 0), BUDGET.threeShared)

// ── Fonts, images, sprite ─────────────────────────────────────────────────
const assets = readdirSync(join(DIST, 'assets'))
const font = assets.find((file) => /^instrument-sans-latin-standard-normal-.*\.woff2$/.test(file))
if (font) check('preloaded display font (woff2)', raw(`assets/${font}`), BUDGET.displayFont)

const imageDir = join(DIST, 'img/projects')
if (existsSync(imageDir)) {
  const largest = new Map()
  for (const file of readdirSync(imageDir).filter((f) => f.endsWith('.avif'))) {
    const [, slug, width] = file.match(/^(.*)-(\d+)\.[0-9a-f]+\.avif$/) ?? []
    if (!slug) continue
    if (!largest.has(slug) || Number(width) > largest.get(slug).width) largest.set(slug, { width: Number(width), file })
  }
  for (const [slug, { width, file }] of largest) check(`image: ${slug} @${width}w (avif)`, raw(`img/projects/${file}`), BUDGET.image)
}

const sprite = readdirSync(join(DIST, 'img')).find((file) => /^icons\.[0-9a-f]+\.svg$/.test(file))
if (sprite) check('icon sprite', gz(`img/${sprite}`), BUDGET.sprite)

// ── Report ─────────────────────────────────────────────────────────────────
const width = Math.max(...rows.map((row) => row.label.length))
for (const row of rows) {
  const mark = row.ok ? 'ok  ' : 'OVER'
  console.log(`${mark}  ${row.label.padEnd(width)}  ${fmt(row.size).padStart(9)}  / ${fmt(row.budget)}`)
}

const failed = rows.filter((row) => !row.ok)
if (failed.length) {
  console.error(`\n${failed.length} budget(s) exceeded.`)
  process.exit(1)
}
console.log('\nAll budgets met.')
