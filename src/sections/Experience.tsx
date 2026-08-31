import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import experienceData from '../data/experience.json'
import contentData from '../data/content.json'
import { useTheme } from '../theme/themeContext'

export default function Experience() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!containerRef.current) return
    const items = gsap.utils.toArray<HTMLElement>('.exp-item')

    // Timeline colours come from the theme so the dots follow the palette
    const styles = getComputedStyle(document.documentElement)
    const readVar = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback
    const accent = readVar('--js-accent', '#ef4444')
    const dotIdle = readVar('--js-dot-idle', '#18181b')
    const dotBorder = readVar('--js-dot-border', '#3f3f46')

    const ctx = gsap.context(() => {
      items.forEach((item) => {
        gsap.fromTo(item,
          { opacity: 0, x: -40, scale: 0.97 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        )

        const dot = item.querySelector('.timeline-dot')
        if (dot) {
          gsap.fromTo(dot,
            { backgroundColor: dotIdle, borderColor: dotBorder, boxShadow: "none" },
            {
              backgroundColor: accent,
              borderColor: accent,
              boxShadow: `0 0 18px ${accent}`,
              duration: 0.3,
              ease: "power2.out",
              scrollTrigger: {
                trigger: item,
                start: "top center",
                toggleActions: "play none none reverse"
              }
            }
          )
        }
      })

      gsap.fromTo('.timeline-line',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top left",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom center",
            scrub: true,
          }
        }
      )
    })

    return () => ctx.revert()
  }, [theme])

  return (
    <section ref={containerRef} className="relative min-h-screen py-32 bg-zinc-950 text-white px-6 md:px-12 lg:px-24 overflow-hidden">
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-red-500/[0.03] rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-20">

        <div className="space-y-4">
          <h2 className="text-zinc-500 font-mono tracking-widest uppercase text-sm">
            {contentData.experienceSection.sectionSubtitle}
          </h2>
          <h3 className="text-4xl md:text-6xl font-light">{contentData.experienceSection.title}</h3>
          <p className="text-zinc-500 text-lg font-light max-w-lg">A timeline of roles that shaped my craft — from teaching fundamentals to architecting enterprise solutions.</p>
        </div>

        <div className="relative border-l-2 border-zinc-800/50 ml-4 md:ml-8 pl-8 md:pl-16 space-y-16">
          <div className="timeline-line absolute top-0 left-[-1px] w-[2px] h-full bg-gradient-to-b from-red-500 via-red-500 to-red-500/20 origin-top z-0" />

          {experienceData.map((exp, i) => (
            <div key={i} className="exp-item relative group">
              <div className="timeline-dot absolute top-6 -left-[45px] md:-left-[77px] w-5 h-5 rounded-full bg-zinc-900 border-2 border-zinc-700 z-10 ring-4 ring-zinc-950" />

              <motion.div
                className="relative p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-red-500/20 transition-all duration-500 group overflow-hidden"
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative">
                  <div className="flex flex-col md:flex-row gap-3 md:gap-6 items-start md:items-center justify-between mb-4">
                    <h4 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">{exp.role}</h4>
                    <div className="text-red-400 font-mono text-sm tracking-wider bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20 whitespace-nowrap shrink-0">
                      {exp.year}
                    </div>
                  </div>

                  <h5 className="text-lg text-zinc-500 font-medium mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/50 inline-block" />
                    {exp.company}
                  </h5>

                  <p className="text-base md:text-lg text-zinc-400 font-light max-w-2xl leading-relaxed">
                    {exp.desc}
                  </p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
