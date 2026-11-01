import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

const root = import.meta.dirname

type PageMeta = { path: string; title: string; description: string }
type Content = {
  meta: { siteName: string; siteUrl: string; locale: string; pages: Record<string, PageMeta> }
  hero: { name: string; alias: string; role: string; location: string }
  footer: { github: string; linkedin: string }
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function renderMeta(content: Content, pageId: string) {
  const { meta, hero, footer } = content
  const page = meta.pages[pageId]
  if (!page) throw new Error(`[site-meta] no meta.pages.${pageId} in content.json`)

  const url = meta.siteUrl ? new URL(page.path, meta.siteUrl).href : ''
  const tags = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(meta.siteName)}" />`,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    `<meta property="og:locale" content="${escapeHtml(meta.locale)}" />`,
    `<meta name="twitter:card" content="summary" />`,
  ]
  if (url) tags.push(`<link rel="canonical" href="${url}" />`, `<meta property="og:url" content="${url}" />`)
  if (pageId === 'notFound') tags.push(`<meta name="robots" content="noindex" />`)

  if (pageId === 'home') {
    const [city, country] = hero.location.split(',').map((part) => part.trim())
    const person = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: hero.name,
      alternateName: hero.alias,
      jobTitle: hero.role,
      address: { '@type': 'PostalAddress', addressLocality: city, addressCountry: country },
      sameAs: [footer.github, footer.linkedin],
      ...(meta.siteUrl ? { url: meta.siteUrl } : {}),
    }
    // Escaping "<" keeps a stray "</script>" in the copy from closing the tag early
    tags.push(`<script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>`)
  }

  return tags.join('\n    ')
}

/**
 * Fills each page's <!--meta:pageId--> marker from src/data/content.json, so
 * titles, descriptions, Open Graph and JSON-LD live next to the rest of the copy.
 */
function siteMeta(): Plugin {
  return {
    name: 'vann:site-meta',
    transformIndexHtml(html) {
      const content = JSON.parse(readFileSync(resolve(root, 'src/data/content.json'), 'utf8')) as Content
      return html.replace(/<!--meta:(\w+)-->/, (_, pageId: string) => renderMeta(content, pageId))
    },
  }
}

/**
 * Makes `vite preview` behave like the Vercel deployment: /projects redirects
 * to /projects/, and unknown URLs get the prerendered 404 page.
 */
function previewLikeVercel(): Plugin {
  return {
    name: 'vann:preview-like-vercel',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/projects') {
          res.writeHead(308, { Location: '/projects/' }).end()
          return
        }
        next()
      })
      // Runs after static files and Vite's HTML fallback (which has already
      // rewritten /projects/ to /projects/index.html), so it only sees misses
      return () => {
        const outDir = resolve(server.config.root, server.config.build.outDir)
        server.middlewares.use((req, res, next) => {
          const path = new URL(req.url ?? '/', 'http://localhost').pathname
          if (path.endsWith('.html') && existsSync(resolve(outDir, `.${path}`))) {
            next()
            return
          }
          res.statusCode = 404
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(readFileSync(resolve(outDir, '404.html')))
        })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  // Real multi-page site: unknown URLs 404 instead of falling back to index.html
  appType: 'mpa',
  build: {
    // The lazily loaded three.js chunk is the only one near this size
    chunkSizeWarningLimit: 700,
    manifest: !isSsrBuild,
    rolldownOptions: isSsrBuild
      ? undefined
      : {
          input: {
            home: resolve(root, 'index.html'),
            projects: resolve(root, 'projects/index.html'),
            notFound: resolve(root, '404.html'),
          },
        },
  },
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    siteMeta(),
    previewLikeVercel(),
  ],
}))
