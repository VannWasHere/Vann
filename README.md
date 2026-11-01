# Vann — portfolio

Personal site of Justine Donovan (Vann). Industrial-editorial design ("Shipped"),
prerendered static pages, and two real-time 3D pieces built with three.js: the
extruded **V monogram** in the hero and **the box** — a shipping carton with a
project on each face that you can drag, spin and open.

Built performance-first:

- **Static HTML for every page.** A build-time prerender step (React
  `renderToString`) writes the markup, so content paints before any JavaScript
  runs; the client then hydrates. The 404 page ships no JS at all.
- **No animation libraries.** Reveals are one IntersectionObserver plus CSS
  transitions; marquees and the experience route line are pure CSS.
- **3D loads last and idles at zero.** three.js is a separate lazy chunk that is
  only fetched after the visitor first interacts. Each scene renders on demand:
  when nothing moves, or the canvas is off-screen, no frames are drawn.
- **Small assets.** Self-hosted variable fonts (one preloaded), AVIF/WebP
  screenshots with intrinsic sizes, and icons served from a single SVG sprite
  instead of JavaScript.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at http://localhost:5173 (pages render client-side) |
| `npm run build` | Icon sprite → type-check → client build → SSR build → prerender into `dist/` |
| `npm run preview` | Serves `dist/` like Vercel does (redirects, 404 page) |
| `npm run check:budget` | Fails if any bundle, image or font grows past its budget |
| `npm run images` | Optimises screenshots in `assets/projects/` (see below) |
| `npm run sprite` | Rebuilds the icon sprite from `src/data/icons.json` |
| `npm run icons` | Regenerates the favicons from `src/data/monogram.json` |
| `npm run lint` | ESLint |

## Editing content

All copy lives in `src/data/`:

- `content.json` — every heading, label and paragraph, plus page titles and
  descriptions (`meta`). Set `meta.siteUrl` once the domain is final to emit
  canonical and Open Graph URLs.
- `projects.json` — the projects. The first five with `"featured": true` go on
  the faces of the 3D box (topped up from the rest); the sixth face is the
  archive label. Every project is listed on `/projects/`.
- `experience.json`, `skills.json` — the tracking history and the toolbox.
- `icons.json` — which icon each tech name or skill uses (react-icons names).

### Adding a project screenshot

1. Save it as `assets/projects/<slug>.png` (or `.jpg`/`.webp`), where `<slug>`
   matches the project's `slug` in `projects.json`.
2. Run `npm run images`. This writes AVIF + WebP files to `public/img/projects/`
   and updates `src/data/images.json`; commit both.

Projects without a screenshot get a typographic placeholder — `hr-kpi` currently
has none.

## 3D notes

- `src/three/Stage.ts` — renderer, render-on-demand loop, adaptive resolution.
- `src/three/capabilities.ts` — picks a tier per device (`off` / `low` / `high`).
  Devices without hardware WebGL2, with Save-Data on, or with very little memory
  get the static poster instead, which works the same way (← → buttons, case files).
- `src/three/scenes/monogram.ts`, `src/three/scenes/projectCube.ts` — the scenes.
  Box face textures are drawn on a canvas at runtime (`src/three/textures/`).

URL flags for testing: `?debug3d` (fps / draw-call overlay; a scene at rest
should read 0 fps), `?no3d` (force the fallback), `?force3d`, `?motion=reduce`.

## Deploys and CI

- **Deploys** come from Vercel's Git integration: every push gets a Preview
  deployment, and pushes to `main` deploy to Production. No secrets are needed
  in GitHub.
- **CI** (`.github/workflows/ci.yml`) runs on every push: `npm ci`,
  `npm run build` and `npm run check:budget`. A red check means the site no
  longer builds or has grown past its performance budget.
