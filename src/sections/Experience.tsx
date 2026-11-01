import content from '../data/content.json'
import experience from '../data/experience.json'
import SectionHeader from '../components/SectionHeader'
import { StatusDot } from '../components/Nav'
import { revealDelay } from '../lib/reveal'
import { cn } from '../utils'

const section = content.experienceSection
const [current] = experience

/** First stop is where the parcel is now, the last is where it started. */
function stopLabel(index: number) {
  const [now, transit, checkpoint, origin] = section.stops
  if (index === 0) return now
  if (index === experience.length - 1) return origin
  return index % 2 === 1 ? transit : checkpoint
}

export default function Experience() {
  return (
    <section id="experience" className="relative border-t border-paper-100/10 py-20 md:py-28">
      <div className="container-page">
        <SectionHeader
          index={section.sectionIndex}
          title={section.sectionTitle}
          meta={`Tracking no. ${content.hero.tracking}`}
          className="text-graphite-300"
        />

        <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
          <h2 className="type-display text-[clamp(3.25rem,8.6vw,8.25rem)] md:col-span-8">
            <span data-reveal="line">
              <span>{section.headline}</span>
            </span>
          </h2>
          <div className="md:col-span-4 md:pb-2" data-reveal style={revealDelay(120)}>
            <p className="type-serif text-[clamp(1.6rem,2.4vw,2.2rem)] leading-tight text-signal">{section.accent}</p>
            <p className="mt-3 leading-relaxed text-graphite-300">{section.intro}</p>
          </div>
        </div>

        <div
          className="mt-12 grid gap-3 border border-paper-100/15 px-5 py-4 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8"
          data-reveal
        >
          <span className="type-label text-graphite-400">{section.statusLabel}</span>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-paper-100">
            <StatusDot />
            <span className="type-label">{section.status}</span>
            <span className="text-graphite-300">
              {current.role} — {current.company}
            </span>
          </p>
          <span className="type-label text-graphite-400">{experience.length} scans</span>
        </div>

        <ol className="relative mt-14">
          {/* Route line: grey track, red progress drawn by scroll where supported */}
          <span aria-hidden className="absolute top-3 bottom-3 left-[7px] w-px bg-paper-100/15" />
          <span aria-hidden className="route-progress absolute top-3 bottom-3 left-[7px] w-px bg-signal" />

          {experience.map((stop, i) => (
            <li
              key={`${stop.role}-${stop.year}`}
              data-reveal
              style={revealDelay(i * 60)}
              className="relative grid gap-3 pb-14 pl-12 last:pb-0 md:grid-cols-[15rem_minmax(0,1fr)] md:gap-10 md:pl-16"
            >
              <span
                aria-hidden
                className={cn(
                  'absolute top-[0.35rem] left-0 flex h-[15px] w-[15px] items-center justify-center rounded-full border-2',
                  i === 0 ? 'border-signal bg-signal' : 'border-paper-100/40 bg-graphite-950'
                )}
              >
                {i === 0 && <span className="status-ping absolute inset-0 rounded-full bg-signal" />}
              </span>

              <div className="space-y-1.5">
                <p className={cn('type-label', i === 0 ? 'text-signal' : 'text-graphite-400')}>{stopLabel(i)}</p>
                <p className="type-label text-paper-100 tabular-nums">{stop.year}</p>
              </div>

              <div>
                <h3 className="type-display text-[2.1rem] md:text-[2.75rem]">{stop.role}</h3>
                <p className="mt-2 text-graphite-300">{stop.company}</p>
                <p className="mt-4 max-w-2xl leading-relaxed text-graphite-400 md:text-lg">{stop.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
