import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import Home from './pages/Home'
import Archive from './pages/Archive'
import NotFound from './pages/NotFound'

/** Used only at build time by scripts/prerender.mjs. */
const pages = {
  home: Home,
  projects: Archive,
  notFound: NotFound,
}

export type PageId = keyof typeof pages

export function render(pageId: PageId) {
  const Page = pages[pageId]
  return renderToString(
    <StrictMode>
      <Page />
    </StrictMode>
  )
}
