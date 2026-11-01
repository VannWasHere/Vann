/**
 * Static site generation. Runs after the client and SSR builds:
 *   1. renders every page with the SSR bundle (dist-ssr/entry-server.js)
 *   2. injects the markup into the built HTML templates in dist/
 *   3. preloads the display font that the hero headline (the LCP) uses
 *   4. strips JS from pages that are fully static (the 404)
 *
 * Run: npm run build (this is its last step)
 */
import { readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = resolve(ROOT, 'dist')
const SSR_DIR = resolve(ROOT, 'dist-ssr')

const PAGES = [
  { id: 'home', file: 'index.html' },
  { id: 'projects', file: 'projects/index.html' },
  { id: 'notFound', file: '404.html', staticOnly: true },
]

// Latin subset of Instrument Sans with both axes (wdth + wght)
const DISPLAY_FONT = /^instrument-sans-latin-standard-normal-[\w-]+\.woff2$/

const { render } = await import(pathToFileURL(resolve(SSR_DIR, 'entry-server.js')).href)

const assets = await readdir(resolve(DIST, 'assets'))
const font = assets.find((file) => DISPLAY_FONT.test(file))
if (!font) throw new Error('[prerender] display font not found in dist/assets')
const preload = `<link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin />`

for (const page of PAGES) {
  const path = resolve(DIST, page.file)
  let html = await readFile(path, 'utf8')

  if (!html.includes('<!--app-html-->')) throw new Error(`[prerender] ${page.file} has no <!--app-html--> marker`)

  html = html
    .replace('<!--app-html-->', render(page.id))
    .replace('<!--preload-->', preload)

  if (page.staticOnly) {
    html = html
      .replace(/<script type="module"[^>]*><\/script>\s*/g, '')
      .replace(/<link rel="modulepreload"[^>]*>\s*/g, '')
      .replace(/<!-- Only pulls in the stylesheet[^>]*-->\s*/g, '')
  }

  await writeFile(path, html)
  console.log(`prerendered  ${page.file.padEnd(22)} ${(html.length / 1024).toFixed(1)} kB`)
}

await rm(SSR_DIR, { recursive: true, force: true })
