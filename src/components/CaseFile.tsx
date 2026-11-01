import { useEffect, useRef, useState } from 'react'
import content from '../data/content.json'
import { projectType, trackingCode, type Project } from '../lib/projects'
import Barcode from './Barcode'
import ProjectImage from './ProjectImage'
import Stamp from './Stamp'
import TechChip from './TechChip'
import { Arrow } from './Glyphs'

type CaseFileProps = {
  project: Project | null
  /** "PKG 02/05" for projects on the box, otherwise the archive */
  referenceFor: (project: Project) => string
  onClose: () => void
}

const work = content.work

/**
 * Project details in a native modal <dialog>: focus trap, Esc to close and
 * focus return come from the browser. Styled as a paper case file.
 */
export default function CaseFile({ project, referenceFor, onClose }: CaseFileProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  // Keep the last project on screen while the dialog animates closed
  const [shown, setShown] = useState(project)
  if (project && project !== shown) setShown(project)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (project && !dialog.open) dialog.showModal()
    if (!project && dialog.open) dialog.close()
  }, [project])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="case-file-title"
      onClose={onClose}
      onClick={(event) => {
        // Clicks on the backdrop land on the <dialog> itself
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
      className="case-file m-auto max-h-[calc(100dvh-2rem)] w-[min(56rem,calc(100vw-2rem))] max-w-none overflow-y-auto bg-transparent p-0 text-ink"
    >
      {shown && (
        <article className="surface-paper border border-ink/20">
          <header className="type-label flex items-center gap-4 border-b border-ink/15 px-5 py-3.5 md:px-7">
            <span className="text-signal-700">Case file</span>
            {/* From `shown`, so the label holds steady while the dialog animates closed */}
            <span className="text-ink-muted">{referenceFor(shown)}</span>
            <span className="ml-auto hidden text-ink-muted tabular-nums sm:inline">{trackingCode(shown)}</span>
            <form method="dialog" className="ml-auto sm:ml-0">
              <button
                type="submit"
                aria-label="Close case file"
                className="-mr-2 flex h-9 w-9 items-center justify-center text-xl leading-none transition-colors hover:text-signal-700"
              >
                ×
              </button>
            </form>
          </header>

          <div className="border-b border-ink/15 p-3 md:p-4">
            <ProjectImage
              project={shown}
              sizes="(min-width: 56rem) 54rem, calc(100vw - 2rem)"
              className="aspect-[16/9] w-full object-cover"
            />
          </div>

          <div className="grid gap-8 px-5 py-7 md:grid-cols-12 md:px-7 md:py-9">
            <div className="md:col-span-8">
              <p className="type-label text-ink-muted">
                {projectType(shown)} · {shown.year}
              </p>
              <h2 id="case-file-title" className="type-display mt-3 text-[clamp(2.5rem,6vw,4.5rem)]">
                {shown.title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/80 md:text-lg">{shown.description}</p>
            </div>

            <div className="flex flex-col gap-6 md:col-span-4 md:items-end md:text-right">
              <Stamp className={shown.link ? 'text-signal-700' : 'text-ink-muted'}>
                {shown.link ? 'Live' : 'Private build'}
              </Stamp>
              <Barcode value={trackingCode(shown)} className="h-12 w-40" />
            </div>

            <div className="md:col-span-12">
              <p className="type-label mb-3 text-ink-muted">Stack</p>
              <div className="flex flex-wrap gap-2">
                {shown.tech.map((tech) => (
                  <TechChip key={tech} name={tech} />
                ))}
              </div>
            </div>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/15 px-5 py-5 md:px-7">
            {shown.link ? (
              <a
                href={shown.link}
                target="_blank"
                rel="noopener noreferrer"
                className="type-label group inline-flex items-center gap-3 bg-ink px-5 py-3.5 text-paper-100 transition-colors hover:bg-signal-700"
              >
                {work.visit}
                <Arrow direction="up-right" className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
            ) : (
              <span className="type-label text-ink-muted">{work.private}</span>
            )}
            <span className="type-serif text-xl text-ink-muted">{content.contact.signoff}</span>
          </footer>
        </article>
      )}
    </dialog>
  )
}
