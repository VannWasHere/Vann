import { useRef, useState, type KeyboardEvent } from 'react'
import content from '../data/content.json'
import {
  CUBE_SLOTS,
  cubeProjects,
  initials,
  projectType,
  projects,
  textureSources,
  trackingCode,
  type Project,
} from '../lib/projects'
import { revealDelay } from '../lib/reveal'
import type { CubeHandle, CubeOptions } from '../three/scenes/projectCube'
import CaseFile from '../components/CaseFile'
import FaceCard, { type Slide } from '../components/FaceCard'
import SectionHeader from '../components/SectionHeader'
import Stamp from '../components/Stamp'
import ThreeStage from '../components/ThreeStage'
import { Arrow } from '../components/Glyphs'
import { cn } from '../utils'

const work = content.work
const ARCHIVE_URL = '/projects/'
const FACES = 6

const pad = (n: number) => String(n).padStart(2, '0')

const loadCube = () => import('../three/scenes/projectCube')

const projectSlides: Slide[] = cubeProjects.map((project, i) => ({
  kind: 'project',
  project,
  face: {
    kind: 'project',
    pkg: `PKG ${pad(i + 1)}/${pad(cubeProjects.length)}`,
    title: project.title,
    type: projectType(project),
    year: project.year,
    tech: project.tech,
    live: Boolean(project.link),
    tracking: trackingCode(project),
    initials: initials(project.title),
    image: textureSources(project.slug),
  },
}))

const archiveSlide: Slide = {
  kind: 'archive',
  face: {
    kind: 'archive',
    title: work.archiveFace.title,
    from: work.archiveFace.from,
    to: work.archiveFace.to,
    contents: `${projects.length} projects`,
    note: work.archiveFace.note,
    cta: work.openArchive,
    tracking: 'VN-ARCHIVE',
  },
}

/** Five projects, then the shipping label; padded if there are fewer projects. */
const SLIDES: Slide[] = [
  ...projectSlides,
  ...Array.from({ length: FACES - projectSlides.length }, () => archiveSlide),
]

const cubeIndexOf = (project: Project) =>
  SLIDES.findIndex((slide) => slide.kind === 'project' && slide.project === project)

/** "PKG 02/05" for projects on the box, "Archive" for the rest */
function referenceFor(project: Project) {
  const slide = SLIDES[cubeIndexOf(project)]
  return slide?.kind === 'project' ? slide.face.pkg : 'Archive'
}

function caption(slide: Slide, index: number) {
  if (slide.kind === 'archive') {
    return {
      kicker: `PKG ${pad(index + 1)}/${pad(FACES)} · Archive`,
      title: slide.face.title,
      body: work.archiveFace.summary,
    }
  }
  const { project } = slide
  return {
    kicker: `${slide.face.pkg} · ${projectType(project)} · ${project.year}`,
    title: project.title,
    body: project.description,
  }
}

function CubePoster({ slide, onOpen }: { slide: Slide; onOpen: () => void }) {
  return (
    <div className="flex h-full items-center justify-center [perspective:1800px]">
      <div
        onClick={onOpen}
        className="w-[46cqmin] cursor-pointer shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] transition-transform duration-700 ease-out-expo [transform:rotateX(16deg)_rotateY(-26deg)] hover:[transform:rotateX(12deg)_rotateY(-18deg)]"
      >
        <FaceCard slide={slide} />
      </div>
    </div>
  )
}

export default function Work() {
  const [active, setActive] = useState(0)
  const [announce, setAnnounce] = useState(false)
  // null until the live box reports in — and under reduced motion, where it never auto-turns
  const [autoTurn, setAutoTurn] = useState<boolean | null>(null)
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const cube = useRef<CubeHandle | null>(null)

  const slide = SLIDES[active]
  const text = caption(slide, active)
  const openProject = projects.find((project) => project.slug === openSlug) ?? null

  // Shared by the 3D box (front-face click) and the page controls
  const openSlide = (index: number) => {
    const target = SLIDES[index]
    if (target.kind === 'archive') window.location.assign(ARCHIVE_URL)
    else setOpenSlug(target.project.slug)
  }

  const cubeOptions: CubeOptions = {
    faces: SLIDES.map((s) => s.face),
    // Read when the box mounts: it starts on the poster's face, and skips
    // autoplay if the visitor has already been clicking through
    initial: active,
    autoplay: !announce,
    onActiveChange: (index, byUser) => {
      setActive(index)
      if (byUser) setAnnounce(true)
    },
    onOpen: openSlide,
    onAutoplayStop: () => setAutoTurn((current) => (current === null ? null : false)),
  }

  // WAI carousel pattern: the toggle always wins, even while focus is inside
  const toggleAutoTurn = () => {
    const next = !autoTurn
    cube.current?.setAutoplay(next)
    if (next) cube.current?.setPaused(false)
    setAutoTurn(next)
  }

  const show = (index: number) => {
    setActive(index)
    setAnnounce(true)
    cube.current?.goTo(index)
  }

  const step = (direction: 1 | -1) => {
    setAnnounce(true)
    // The live box tracks its own face and reports back through onActiveChange;
    // the functional update keeps rapid key presses from reading a stale index
    if (cube.current) cube.current.step(direction)
    else setActive((index) => (index + direction + FACES) % FACES)
  }

  const open = (index: number) => {
    show(index)
    openSlide(index)
  }

  const onStageKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') step(1)
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') step(-1)
    else if (event.key === 'Enter' || event.key === ' ') open(active)
    else return
    event.preventDefault()
  }

  return (
    <section
      id="work"
      className="relative border-t border-paper-100/10 py-20 md:py-28"
      // Keyboard and screen-reader users get a still box while they're in here
      onFocus={() => cube.current?.setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) cube.current?.setPaused(false)
      }}
    >
      <div className="container-page">
        <SectionHeader
          index={work.index}
          title={work.title}
          meta={`${CUBE_SLOTS} / ${projects.length} on display`}
          className="text-graphite-300"
        />

        <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
          <h2 className="type-display text-[clamp(3.5rem,9.4vw,9rem)] md:col-span-8">
            <span data-reveal="line">
              <span>{work.headline[0]}</span>
            </span>
            <span data-reveal="line" style={revealDelay(90)}>
              <span>{work.headline[1]}</span>
            </span>
          </h2>
          <div className="md:col-span-4 md:pb-3" data-reveal style={revealDelay(160)}>
            <p className="type-serif text-[clamp(1.6rem,2.4vw,2.2rem)] leading-tight text-signal">{work.accent}</p>
            <p className="mt-3 leading-relaxed text-graphite-300">{work.intro}</p>
          </div>
        </div>

        {/* ── The box ───────────────────────────────────────────── */}
        <div
          role="group"
          aria-roledescription="3D carousel"
          aria-label={`${work.figure}: ${CUBE_SLOTS} projects, one per face. Arrow keys turn it, Enter opens the front face.`}
          tabIndex={0}
          onKeyDown={onStageKey}
          className="registration relative mt-12 h-[min(118vw,34rem)] bg-[radial-gradient(60%_55%_at_50%_45%,rgb(239_236_228/0.06),transparent)] [container-type:size] md:h-[clamp(25rem,72vh,46rem)]"
        >
          {/* Floor: a pool of light and a soft contact shadow under the box */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[22%] bottom-[7%] h-[16%] bg-[radial-gradient(closest-side,rgb(0_0_0/0.55),transparent)]"
          />

          <ThreeStage
            load={loadCube}
            trigger="near"
            options={cubeOptions}
            onReady={(handle) => {
              cube.current = handle
              setAutoTurn(handle?.canAutoplay ? handle.isAutoplaying() : null)
            }}
            className="absolute inset-0"
            poster={<CubePoster slide={slide} onOpen={() => open(active)} />}
          />

          <div className="absolute top-3 right-3 flex items-center gap-3 md:top-4 md:right-4">
            {autoTurn !== null && (
              <button
                type="button"
                onClick={toggleAutoTurn}
                aria-label={autoTurn ? work.autoPauseLabel : work.autoResumeLabel}
                className="type-label flex items-center gap-2 border border-paper-100/15 bg-graphite-950/80 px-2.5 py-1.5 text-graphite-300 transition-colors hover:border-paper-100/40 hover:text-paper-100"
              >
                <svg viewBox="0 0 10 10" aria-hidden className="h-2.5 w-2.5 fill-current">
                  {autoTurn ? <path d="M1.5 1h2.5v8H1.5zM6 1h2.5v8H6z" /> : <path d="M2 1l7 4-7 4z" />}
                </svg>
                {autoTurn ? work.autoPause : work.autoResume}
              </button>
            )}
            <span aria-hidden className="flex gap-1.5">
              {SLIDES.map((_, i) => (
                <span
                  key={i}
                  className={cn('h-1.5 w-4 transition-colors duration-500', i === active ? 'bg-signal' : 'bg-paper-100/15')}
                />
              ))}
            </span>
          </div>

          <div aria-hidden className="type-label pointer-events-none absolute inset-0 p-4 text-graphite-400 md:p-5">
            <span className="absolute top-4 left-4 md:top-5 md:left-5">{work.figure}</span>
            <span className="absolute bottom-4 left-4 md:bottom-5 md:left-5">{work.hint}</span>
            <span className="absolute right-4 bottom-4 hidden items-center gap-1.5 md:right-5 md:bottom-5 md:flex">
              <Arrow direction="left" />
              <Arrow />
              {work.keys}
            </span>
          </div>
        </div>

        {/* ── Caption ───────────────────────────────────────────── */}
        <div
          className="grid gap-6 border-b border-paper-100/10 py-7 md:grid-cols-12 md:items-end md:gap-8"
          aria-live={announce ? 'polite' : 'off'}
        >
          <div className="min-w-0 md:col-span-8">
            <p className="type-label text-graphite-400">{text.kicker}</p>
            <h3 className="type-display mt-2.5 text-[clamp(2.25rem,4.6vw,4.25rem)]">{text.title}</h3>
            <p className="mt-3 line-clamp-2 max-w-2xl leading-relaxed text-graphite-300">{text.body}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:col-span-4 md:justify-end">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={work.previous}
              className="flex h-12 w-12 items-center justify-center border border-paper-100/20 transition-colors hover:border-paper-100/60"
            >
              <Arrow direction="left" />
            </button>
            <span className="type-label w-[4.5rem] text-center text-graphite-300 tabular-nums">
              {pad(active + 1)} / {pad(FACES)}
            </span>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label={work.next}
              className="flex h-12 w-12 items-center justify-center border border-paper-100/20 transition-colors hover:border-paper-100/60"
            >
              <Arrow />
            </button>
            <button
              type="button"
              onClick={() => open(active)}
              // The visible label is the same for every face; the name says which one
              aria-label={`${slide.kind === 'archive' ? work.openArchive : work.openCase}: ${text.title}`}
              className="type-label group inline-flex h-12 w-full items-center justify-between gap-3 bg-paper-100 px-5 whitespace-nowrap text-ink transition-colors hover:bg-signal sm:ml-2 sm:w-auto"
            >
              {slide.kind === 'archive' ? work.openArchive : work.openCase}
              <Arrow className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* ── Manifest: every project, including the ones not on the box ── */}
        <div className="mt-20 md:mt-28">
          <div className="type-label flex items-baseline justify-between gap-6 border-b border-paper-100/20 pb-3">
            <h3 className="text-paper-100">{work.manifestTitle}</h3>
            <span className="text-graphite-400">{work.manifestMeta}</span>
          </div>
          <ol>
            {projects.map((project, i) => {
              const onBox = cubeIndexOf(project) >= 0
              return (
                <li key={project.slug} data-reveal style={revealDelay(i * 40)}>
                  <button
                    type="button"
                    onClick={() => {
                      const index = cubeIndexOf(project)
                      if (index >= 0) show(index)
                      setOpenSlug(project.slug)
                    }}
                    className="group relative grid w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-b border-paper-100/10 py-5 text-left transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-signal after:transition-transform after:duration-500 after:ease-out-expo hover:bg-paper-100/[0.025] hover:after:scale-x-100 md:grid-cols-[3.5rem_minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,1.4fr)_3.5rem_8rem] md:py-6"
                  >
                    <span className="type-label text-graphite-400 tabular-nums">{pad(i + 1)}</span>
                    <span className="type-display text-[1.75rem] transition-colors group-hover:text-signal md:truncate md:text-[2.15rem]">
                      {project.title}
                    </span>
                    <span className="type-label text-graphite-300 tabular-nums md:hidden">
                      {project.year}
                    </span>
                    <span className="type-label col-start-2 text-graphite-400 md:col-start-auto">
                      {projectType(project)}
                      {onBox && <span className="text-signal"> · on the box</span>}
                    </span>
                    <span className="type-label hidden truncate text-graphite-400 md:block">
                      {project.tech.join(' · ')}
                    </span>
                    <span className="type-label hidden text-graphite-300 tabular-nums md:block">{project.year}</span>
                    <span className="hidden justify-end md:flex">
                      {project.link ? (
                        <Stamp className="text-signal">Live</Stamp>
                      ) : (
                        <span className="type-label text-graphite-500">Private</span>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
          <a
            href={ARCHIVE_URL}
            className="type-label group mt-8 inline-flex items-center gap-3 border-b border-paper-100/40 pb-1.5 text-paper-100 transition-colors hover:border-signal hover:text-signal"
          >
            {work.archiveCta} ({projects.length})
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      <CaseFile project={openProject} referenceFor={referenceFor} onClose={() => setOpenSlug(null)} />
    </section>
  )
}
