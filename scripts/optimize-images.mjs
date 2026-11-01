/**
 * Turns the source screenshots in assets/projects/ into responsive AVIF + WebP
 * files in public/img/projects/, and writes src/data/images.json with each
 * image's intrinsic size, file names and a tiny blurred placeholder.
 *
 * Name the source file after the project's slug (assets/projects/<slug>.png),
 * then run: npm run images
 *
 * Output names carry a content hash, so they can be cached forever.
 */
import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, extname, basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = resolve(ROOT, 'assets/projects')
const OUTPUT = resolve(ROOT, 'public/img/projects')
const MANIFEST = resolve(ROOT, 'src/data/images.json')

const WIDTHS = [640, 1280]
const AVIF = { quality: 52, effort: 6 }
const WEBP = { quality: 76, effort: 5 }
const PLACEHOLDER_WIDTH = 24
const INPUT_TYPES = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif'])

// Bump when the encoder settings above change, so every hash changes with them
const PIPELINE_VERSION = 1

await mkdir(OUTPUT, { recursive: true })

const files = (await readdir(SOURCE)).filter((file) => INPUT_TYPES.has(extname(file).toLowerCase())).sort()
const manifest = {}
const written = new Set()

for (const file of files) {
  const slug = basename(file, extname(file))
  const input = await readFile(resolve(SOURCE, file))
  const hash = createHash('sha1')
    .update(input)
    .update(JSON.stringify({ WIDTHS, AVIF, WEBP, PIPELINE_VERSION }))
    .digest('hex')
    .slice(0, 8)

  const image = sharp(input)
  const { width, height } = await image.metadata()
  // Screenshots often carry an unused alpha channel; dropping it shrinks every output
  const { isOpaque } = await image.stats()
  const base = () => (isOpaque ? sharp(input).removeAlpha() : sharp(input))

  const entry = { width, height, avif: {}, webp: {}, placeholder: '' }

  // Never upscale: a 1080px source yields 640 + 1080, keyed by the real width for srcset
  const widths = [...new Set(WIDTHS.map((target) => Math.min(target, width)))]

  for (const w of widths) {
    for (const format of ['avif', 'webp']) {
      const name = `${slug}-${w}.${hash}.${format}`
      const pipeline = base().resize({ width: w })
      const buffer = format === 'avif' ? await pipeline.avif(AVIF).toBuffer() : await pipeline.webp(WEBP).toBuffer()
      await writeFile(resolve(OUTPUT, name), buffer)
      written.add(name)
      entry[format][w] = name
      console.log(`${name.padEnd(48)} ${(buffer.length / 1024).toFixed(1).padStart(7)} kB`)
    }
  }

  const tiny = await base().resize({ width: PLACEHOLDER_WIDTH }).webp({ quality: 40 }).toBuffer()
  entry.placeholder = `data:image/webp;base64,${tiny.toString('base64')}`
  manifest[slug] = entry
}

// Remove outputs from earlier runs that no longer match a source file
for (const file of await readdir(OUTPUT)) {
  if (!written.has(file)) await rm(resolve(OUTPUT, file))
}

await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 4)}\n`)
console.log(`\n${files.length} source images → ${written.size} files, manifest at src/data/images.json`)
