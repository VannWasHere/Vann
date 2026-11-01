import { useState } from 'react'
import content from '../data/content.json'
import Barcode from '../components/Barcode'
import Footer from '../components/Footer'
import Nav from '../components/Nav'
import ProjectImage from '../components/ProjectImage'
import SectionHeader from '../components/SectionHeader'
import Stamp from '../components/Stamp'
import TechChip from '../components/TechChip'
import { Arrow } from '../components/Glyphs'
import { projectType, projectTypes, projects, trackingCode, type Project } from '../lib/projects'
import { revealDelay, useReveal } from '../lib/reveal'
import { cn } from '../utils'

const { archive, work } = content
const ALL = archive.all
const years = projects.map((project) => Number(project.year))

function ArchiveCard({ project }: { project: Project }) {
  return (
    <article className="surface-paper flex h-full flex-col border border-ink/20">
      <header className="type-label flex items-center justify-between border-b border-ink/15 px-5 py-3 text-ink-muted">
        <span className="tabular-nums">{trackingCode(project)}</span>
        <span className="tabular-nums">{project.year}</span>
      </header>
      <div className="border-b border-ink/15 p-3">
        <ProjectImage
          project={project}
          sizes="(min-width: 1280px) 28rem, (min-width: 768px) 46vw, calc(100vw - 2.5rem)"
          className="aspect-[16/10] w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col px-5 pt-5 pb-6">
        <p className="type-label text-ink-muted">{projectType(project)}</p>
        <h2 className="type-display mt-2 text-[2.4rem]">{project.title}</h2>
        <p className="mt-3 leading-relaxed text-ink/80">{project.description}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.tech.map((tech) => (
            <TechChip key={tech} name={tech} className="text-ink" />
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between gap-4 pt-7">
          {project.link ? (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="type-label group inline-flex items-center gap-2.5 bg-ink px-4 py-3 text-paper-100 transition-colors hover:bg-signal-700"
            >
              {work.visit}
              <Arrow direction="up-right" className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
          ) : (
            <Stamp className="text-ink-muted">Private build</Stamp>
          )}
          <Barcode value={trackingCode(project)} className="h-9 w-28 shrink-0 text-ink" />
        </div>
      </div>
    </article>
  )
}

export default function Archive() {
  useReveal()
  const [filter, setFilter] = useState(ALL)
  const visible = filter === ALL ? projects : projects.filter((project) => projectType(project) === filter)

  return (
    <>
      <Nav home={false} />
      <main id="main">
        <section id="top" className="container-page pt-10 pb-12 md:pt-14 md:pb-16">
          <a
            href="/#work"
            className="type-label group inline-flex items-center gap-2.5 text-graphite-300 transition-colors hover:text-paper-100"
          >
            <Arrow direction="left" className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            {archive.back}
          </a>

          <SectionHeader
            index={archive.sectionIndex}
            title={archive.sectionTitle}
            meta={`${projects.length} projects · ${Math.min(...years)}–${Math.max(...years)}`}
            className="mt-10 text-graphite-300"
          />

          <h1 className="type-display mt-10 text-[clamp(3.5rem,10.5vw,10.5rem)]">{archive.title}</h1>

          <div className="mt-8 grid gap-6 md:grid-cols-12 md:gap-10">
            <p className="type-serif text-[clamp(1.6rem,2.6vw,2.4rem)] leading-tight text-signal md:col-span-5">
              {archive.accent}
            </p>
            <p className="leading-relaxed text-graphite-300 md:col-span-7 md:text-lg">{archive.intro}</p>
          </div>

          <div role="group" aria-label="Filter projects by type" className="mt-10 flex flex-wrap gap-2">
            {[ALL, ...projectTypes].map((type) => {
              const count = type === ALL ? projects.length : projects.filter((p) => projectType(p) === type).length
              const selected = filter === type
              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFilter(type)}
                  className={cn(
                    'type-label border px-4 py-2.5 transition-colors',
                    selected
                      ? 'border-paper-100 bg-paper-100 text-ink'
                      : 'border-paper-100/20 text-graphite-300 hover:border-paper-100/50 hover:text-paper-100'
                  )}
                >
                  {type} <span className="opacity-60">({count})</span>
                </button>
              )
            })}
          </div>
        </section>

        <section aria-label={archive.title} className="container-page pb-24 md:pb-32">
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((project, i) => (
              <li key={project.slug} id={project.slug} data-reveal style={revealDelay((i % 3) * 80)} className="scroll-mt-20">
                <ArchiveCard project={project} />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  )
}
