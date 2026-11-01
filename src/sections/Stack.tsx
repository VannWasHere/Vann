import content from '../data/content.json'
import skills from '../data/skills.json'
import SectionHeader from '../components/SectionHeader'
import { SkillIcon } from '../components/Icon'
import { revealDelay } from '../lib/reveal'

const section = content.skillsSection
const total = skills.categories.reduce((sum, category) => sum + category.skills.length, 0)

const pad = (n: number) => String(n).padStart(2, '0')

export default function Stack() {
  return (
    <section id="stack" className="surface-paper relative py-20 md:py-28">
      <div className="container-page">
        <SectionHeader
          index={section.sectionIndex}
          title={section.sectionTitle}
          meta={`${total} tools · ${skills.categories.length} drawers`}
          className="text-ink-muted"
          indexClassName="text-signal-700"
        />

        <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
          <h2 className="type-display text-[clamp(3.25rem,8.6vw,8.25rem)] md:col-span-8">
            <span data-reveal="line">
              <span>{section.headline}</span>
            </span>
          </h2>
          <div className="md:col-span-4 md:pb-2" data-reveal style={revealDelay(120)}>
            <p className="type-serif text-[clamp(1.6rem,2.4vw,2.2rem)] leading-tight text-signal-700">{section.accent}</p>
            <p className="mt-3 leading-relaxed text-ink-muted">{section.intro}</p>
          </div>
        </div>

        <div className="mt-14 space-y-10 md:mt-20">
          {skills.categories.map((category, i) => (
            <div
              key={category.name}
              data-reveal
              style={revealDelay(i * 90)}
              className="grid gap-6 border-t border-ink/15 pt-6 md:grid-cols-12 md:gap-8 md:pt-8"
            >
              <div className="md:col-span-3">
                <p className="type-label text-ink-muted">Drawer {pad(i + 1)}</p>
                <h3 className="type-display mt-2 text-[2.25rem]">{category.name}</h3>
                <p className="type-label mt-2 text-ink-muted">{category.skills.length} tools</p>
              </div>
              <ul className="flex flex-wrap content-start gap-x-3 gap-y-4 md:col-span-9">
                {category.skills.map((skill) => (
                  <li
                    key={skill.name}
                    className="group inline-flex items-center gap-2.5 rounded-[6px] border border-ink/25 bg-paper-50 px-3.5 py-2.5 shadow-[0_4px_0_0_rgb(14_14_12/0.9),0_10px_18px_-10px_rgb(14_14_12/0.5)] transition-[transform,box-shadow] duration-150 ease-out select-none hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_0_0_0_rgb(14_14_12/0.9),0_2px_6px_-4px_rgb(14_14_12/0.5)]"
                  >
                    <SkillIcon
                      icon={skill.icon}
                      className="h-[1.1rem] w-[1.1rem] text-ink transition-colors group-hover:text-signal-700"
                    />
                    <span className="text-[0.95rem] font-medium">{skill.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
