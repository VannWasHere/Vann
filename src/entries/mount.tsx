import { StrictMode, type ReactNode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

/**
 * Hydrates the prerendered page in production. The dev server serves the raw
 * template (an empty root with a placeholder comment), so it renders instead.
 */
export function mount(page: ReactNode) {
  const root = document.getElementById('root')
  if (!root) throw new Error('#root is missing from the page template')

  const tree = <StrictMode>{page}</StrictMode>
  if (root.firstElementChild) hydrateRoot(root, tree)
  else createRoot(root).render(tree)
}
