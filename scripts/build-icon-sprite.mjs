/**
 * Builds public/img/icons.<hash>.svg — one SVG sprite with every icon listed in
 * src/data/icons.json — and records its URL in src/data/icon-sprite.json.
 *
 * Icons render as <svg><use href="sprite#SiReact"/></svg>, so react-icons is a
 * build-time dependency only and no icon path data ships in the JS bundle.
 *
 * Run: npm run sprite (also the first step of npm run build)
 */
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as fa from 'react-icons/fa'
import * as hi from 'react-icons/hi'
import * as si from 'react-icons/si'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT = resolve(ROOT, 'public/img')
const MANIFEST = resolve(ROOT, 'src/data/icon-sprite.json')

const PACKS = { Fa: fa, Hi: hi, Si: si }
// Presentation attributes worth keeping on each <symbol>
const KEEP = ['viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin']

const config = JSON.parse(readFileSync(resolve(ROOT, 'src/data/icons.json'), 'utf8'))
const names = [
  ...new Set([config.fallback, ...Object.values(config.tech), ...Object.values(config.skill), ...Object.values(config.ui)]),
].sort()

const symbols = names.map((name) => {
  const Icon = PACKS[name.slice(0, 2)]?.[name]
  if (!Icon) throw new Error(`[sprite] unknown icon "${name}" — check src/data/icons.json`)

  const markup = renderToStaticMarkup(createElement(Icon))
  const match = markup.match(/^<svg([^>]*)>([\s\S]*)<\/svg>$/)
  if (!match) throw new Error(`[sprite] could not parse ${name}`)

  const attributes = [...match[1].matchAll(/([\w-]+)="([^"]*)"/g)]
    .filter(([, key]) => KEEP.includes(key))
    .map(([, key, value]) => `${key}="${value}"`)
    .join(' ')

  return `<symbol id="${name}" ${attributes}>${match[2]}</symbol>`
})

const sprite = `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>\n`
const hash = createHash('sha1').update(sprite).digest('hex').slice(0, 8)
const file = `icons.${hash}.svg`

mkdirSync(OUTPUT, { recursive: true })
for (const old of readdirSync(OUTPUT)) {
  if (/^icons\.[0-9a-f]{8}\.svg$/.test(old) && old !== file) rmSync(resolve(OUTPUT, old))
}
writeFileSync(resolve(OUTPUT, file), sprite)
writeFileSync(MANIFEST, `${JSON.stringify({ url: `/img/${file}` }, null, 4)}\n`)

console.log(`sprite       ${names.length} icons → public/img/${file} (${(sprite.length / 1024).toFixed(1)} kB)`)
