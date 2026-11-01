import '../index.css'

// Production ships the prerendered 404 as static HTML + CSS. The dev server
// has no prerendered markup, so render it there to keep the page previewable.
if (import.meta.env.DEV) {
  void Promise.all([import('./mount'), import('../pages/NotFound')]).then(
    ([{ mount }, { default: NotFound }]) => mount(<NotFound />)
  )
}
