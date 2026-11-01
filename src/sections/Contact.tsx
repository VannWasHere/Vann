import content from '../data/content.json'
import Barcode from '../components/Barcode'
import CopyEmail from '../components/CopyEmail'
import SectionHeader from '../components/SectionHeader'
import { Arrow, MonogramMark } from '../components/Glyphs'
import { UiIcon } from '../components/Icon'
import { revealDelay } from '../lib/reveal'

const { contact, footer, hero } = content

// "Ready to innovate?" → last word on its own line
const words = contact.title.split(' ')
const titleLines = [words.slice(0, -1).join(' '), words.at(-1) ?? '']

function PostageStamp() {
  return (
    <div className="drop-shadow-[0_1px_1.5px_rgb(14_14_12/0.35)]">
      <div className="perforated w-32 bg-paper-50">
        <div className="flex aspect-[4/5] flex-col items-center justify-between bg-graphite-900 px-2 py-3 text-paper-100">
          <span className="type-label text-[0.6rem] text-graphite-400">{hero.location}</span>
          <MonogramMark className="h-14 w-14" />
          <span className="type-label text-[0.6rem] text-signal">{contact.stamp}</span>
        </div>
      </div>
    </div>
  )
}

function Postmark() {
  return (
    <svg viewBox="0 0 200 120" aria-hidden className="w-40 text-ink/70 sm:w-48">
      <defs>
        <path id="postmark-ring" d="M 60 60 m -38 0 a 38 38 0 1 1 76 0 a 38 38 0 1 1 -76 0" />
      </defs>
      <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="60" cy="60" r="29" fill="none" stroke="currentColor" strokeWidth="1" />
      <text className="font-mono" fontSize="9" letterSpacing="2.4" fill="currentColor">
        <textPath href="#postmark-ring">{`${contact.postmark.toUpperCase()} · VANN SHIPPING CO ·`}</textPath>
      </text>
      <text
        x="60"
        y="64"
        textAnchor="middle"
        className="font-mono"
        fontSize="11"
        fontWeight="700"
        fill="currentColor"
        suppressHydrationWarning
      >
        {new Date().getFullYear()}
      </text>
      {/* Cancellation waves */}
      {[44, 56, 68, 80].map((y) => (
        <path
          key={y}
          d={`M 112 ${y} q 11 -7 22 0 t 22 0 t 22 0 t 22 0`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      ))}
    </svg>
  )
}

export default function Contact() {
  const rows = [
    {
      label: 'WhatsApp',
      icon: <UiIcon name="whatsapp" />,
      href: contact.phoneLink,
      text: contact.phoneLabel,
    },
    {
      label: 'GitHub',
      icon: <UiIcon name="github" />,
      href: footer.github,
      text: footer.github.replace(/^https?:\/\//, ''),
    },
    {
      label: 'LinkedIn',
      icon: <UiIcon name="linkedin" />,
      href: footer.linkedin,
      text: footer.linkedin.replace(/^https?:\/\//, ''),
    },
  ]

  return (
    <section id="contact" className="relative overflow-hidden bg-signal py-20 text-ink md:py-28">
      <div className="container-page">
        <SectionHeader
          index={contact.sectionIndex}
          title={contact.sectionTitle}
          meta={contact.meta}
          className="text-ink"
          indexClassName="text-ink"
        />

        <h2 className="type-display mt-10 text-[clamp(4rem,13.5vw,13.5rem)] md:mt-14">
          {titleLines.map((line, i) => (
            <span key={line} data-reveal="line" style={revealDelay(i * 100)}>
              <span>{line}</span>
            </span>
          ))}
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-10 md:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4" data-reveal>
            <p className="text-xl leading-relaxed md:text-2xl md:leading-relaxed">{contact.description}</p>
            <p className="type-serif mt-6 text-3xl">{contact.signoff}</p>
          </div>

          {/* Postcard */}
          <div
            className="surface-paper shadow-[0_30px_60px_-30px_rgb(14_14_12/0.55)] lg:col-span-8"
            data-reveal
            style={revealDelay(120)}
          >
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0 p-6 md:p-8">
                <p className="type-label text-ink-muted">{contact.meta}</p>

                <div className="mt-5 border-b border-ink/15 pb-5">
                  <p className="type-label mb-2 text-ink-muted">Email</p>
                  <CopyEmail email={contact.emailValue} copyLabel={contact.copy} copiedLabel={contact.copied} />
                </div>

                <ul className="divide-y divide-ink/10">
                  {rows.map((row) => (
                    <li key={row.label}>
                      <a
                        href={row.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 py-3.5"
                      >
                        <span className="type-label w-20 shrink-0 text-ink-muted">{row.label}</span>
                        <span className="text-lg">{row.icon}</span>
                        <span className="min-w-0 truncate font-medium">{row.text}</span>
                        <Arrow
                          direction="up-right"
                          className="ml-auto shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </a>
                    </li>
                  ))}
                </ul>

                <Barcode value={contact.emailValue} className="mt-6 h-12 w-full max-w-sm text-ink" />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 border-t border-ink/15 p-6 xl:flex-col xl:flex-nowrap xl:justify-start xl:gap-6 xl:border-t-0 xl:border-l xl:p-8">
                <PostageStamp />
                <Postmark />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
