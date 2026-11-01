import content from '../data/content.json'
import CountUp from '../components/CountUp'
import SectionHeader from '../components/SectionHeader'
import Stamp from '../components/Stamp'
import { StatusDot } from '../components/Nav'
import { revealDelay } from '../lib/reveal'

const { about, hero } = content
const edu = about.education
const now = about.now

const headlineStyles: Record<string, string> = {
  solid: 'type-display text-ink',
  serif: 'type-serif text-[1.12em] leading-[1] text-signal-700',
  muted: 'type-display text-ink-faint',
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-b border-ink/15 px-5 py-6 md:px-6">
      <dt className="type-label text-ink-muted">{label}</dt>
      <dd className="mt-2 text-base leading-snug font-medium md:text-lg">{value}</dd>
    </div>
  )
}

export default function About() {
  return (
    <section id="about" className="surface-paper relative py-20 md:py-28">
      <div className="container-page">
        <SectionHeader
          index={about.sectionIndex}
          title={about.sectionTitle}
          meta={`${about.meta} · ${hero.location}`}
          className="text-ink-muted"
          indexClassName="text-signal-700"
        />

        <h2 className="mt-12 max-w-6xl text-[clamp(2.75rem,7.4vw,7rem)] md:mt-16">
          {about.headline.map((line, i) => (
            <span
              key={line.text}
              data-reveal="line"
              style={{ ...revealDelay(i * 110), paddingBottom: line.style === 'serif' ? '0.14em' : undefined }}
            >
              <span className={headlineStyles[line.style]}>{line.text}</span>
            </span>
          ))}
        </h2>

        <div className="mt-16 grid gap-12 md:mt-20 md:grid-cols-12 md:gap-16">
          <div className="space-y-6 md:col-span-7" data-reveal>
            <p className="text-xl leading-relaxed md:text-2xl md:leading-relaxed">{about.lead}</p>
            <p className="max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">{about.body}</p>
          </div>

          <div className="md:col-span-5" data-reveal style={revealDelay(140)}>
            <div className="relative border border-ink/20 bg-paper-50/70">
              <div className="type-label flex items-center justify-between border-b border-ink/15 px-5 py-3 text-ink-muted">
                <span className="flex items-center gap-2.5 text-ink">
                  <StatusDot />
                  {now.label}
                </span>
                <span>Form VN-03</span>
              </div>
              <p className="type-display px-5 pt-6 pb-5 text-[2.1rem] md:text-[2.6rem]">{now.role}</p>
              <dl className="divide-y divide-ink/10 border-t border-ink/15">
                {[
                  { label: 'Company', value: now.company },
                  { label: 'Tenure', value: now.since },
                  { label: 'Base', value: now.location },
                ].map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-6 px-5 py-3.5">
                    <dt className="type-label text-ink-muted">{row.label}</dt>
                    <dd className="text-right text-sm font-medium md:text-base">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <Stamp tilt={5} className="absolute -top-4 right-5 bg-paper-100 text-signal-700">
                Received
              </Stamp>
            </div>
          </div>
        </div>

        <div className="mt-20 md:mt-28">
          <p className="type-label text-ink-muted">{about.principlesLabel}</p>
          <ol className="mt-6 border-b border-ink/15">
            {about.principles.map((item, i) => (
              <li
                key={item.index}
                data-reveal
                style={revealDelay(i * 80)}
                className="group relative grid gap-3 border-t border-ink/15 py-7 md:grid-cols-12 md:gap-8 md:py-9"
              >
                <span
                  aria-hidden
                  className="absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-signal-700 transition-transform duration-700 ease-out-expo group-hover:scale-x-100"
                />
                <span className="type-label text-signal-700 md:col-span-1">{item.index}</span>
                <h3 className="type-display text-[2rem] transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5 md:col-span-4 md:text-[2.4rem]">
                  {item.title}
                </h3>
                <p className="max-w-2xl leading-relaxed text-ink-muted md:col-span-7 md:text-lg">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-20 grid grid-cols-2 border-t border-l border-ink/15 md:mt-28 md:grid-cols-4">
          {about.stats.map((stat, i) => (
            <div
              key={stat.label}
              data-reveal
              style={revealDelay(i * 70)}
              className="border-r border-b border-ink/15 px-5 py-8 md:px-8 md:py-10"
            >
              <p className="type-display text-[4rem] md:text-[6.5rem]">
                <CountUp value={stat.value} />
              </p>
              <p className="type-label mt-3 text-ink-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 grid gap-10 md:mt-28 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5" data-reveal>
            <p className="type-label text-ink-muted">{edu.label}</p>
            <p className="type-serif mt-5 text-[1.75rem] leading-snug text-ink md:text-[2.1rem]">{edu.story}</p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {edu.tags.map((tag) => (
                <li
                  key={tag}
                  className="type-label border border-ink/25 px-3 py-1.5 text-ink-muted transition-colors hover:border-signal-700 hover:text-signal-700"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <dl
            className="grid grid-cols-2 self-start border-t border-l border-ink/15 md:col-span-7"
            data-reveal
            style={revealDelay(120)}
          >
            <Field label="University" value={edu.campus} />
            <Field label="Major" value={edu.major} />
            <Field label="Focus" value={edu.focus} />
            <Field label="Graduated" value={edu.graduated} />
          </dl>
        </div>
      </div>
    </section>
  )
}
