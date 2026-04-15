import { useEffect, useRef } from 'react'
import { motion, type Variants } from 'framer-motion'
import { gsap } from 'gsap'
import { FaGraduationCap, FaDatabase, FaCalendarAlt, FaUniversity } from 'react-icons/fa'
import contentData from '../data/content.json'

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } }
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } }
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !textRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(textRef.current,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            end: "top 30%",
            scrub: 1,
          }
        }
      )
    })
    return () => ctx.revert()
  }, [])

  const edu = contentData.about.education
  const stats = contentData.about.stats

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen py-20 md:py-28 flex items-center overflow-hidden bg-zinc-950 px-6 md:px-12 lg:px-24"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-zinc-900 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-red-500/[0.03] rounded-full blur-[150px] pointer-events-none" />

      <div ref={textRef} className="relative z-10 w-full max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.h2
            className="text-zinc-500 font-mono tracking-widest uppercase text-sm mb-6"
            variants={fadeUp}
          >
            {contentData.about.sectionSubtitle}
          </motion.h2>

          <motion.p
            className="text-3xl md:text-5xl lg:text-6xl text-white font-medium leading-tight tracking-tight max-w-4xl"
            variants={fadeUp}
            dangerouslySetInnerHTML={{
              __html: contentData.about.headline
                .replace('aesthetics', '<span class="text-zinc-500 italic">aesthetics</span>')
                .replace('performance', '<span class="text-red-500">performance</span>')
            }}
          />

          <motion.p
            className="mt-8 text-lg md:text-2xl text-zinc-400 font-light max-w-3xl leading-relaxed"
            variants={fadeUp}
          >
            {contentData.about.description}
          </motion.p>

          {/* Stats Row */}
          <motion.div
            className="mt-14 grid grid-cols-3 gap-4 md:gap-6 max-w-xl"
            variants={fadeUp}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="relative group text-center md:text-left p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-red-500/30 transition-colors duration-500"
                whileHover={{ y: -3 }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="text-3xl md:text-4xl font-bold text-white tracking-tight">{stat.value}</div>
                  <div className="text-xs md:text-sm text-zinc-500 font-mono tracking-wider uppercase mt-1">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Education Bento Card */}
          <motion.div
            className="mt-20"
            variants={scaleIn}
          >
            <div className="relative rounded-3xl border border-white/[0.06] bg-gradient-to-br from-zinc-900/80 via-zinc-900/50 to-black/80 backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-red-500/[0.04] rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-red-500/[0.03] rounded-full blur-[80px] pointer-events-none" />

              <div className="relative p-8 md:p-12">
                {/* Card Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <FaGraduationCap className="text-red-400 text-lg" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Academic Background</h3>
                    <p className="text-zinc-500 text-xs font-mono tracking-wider uppercase">Where It All Started</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10 md:gap-16">
                  {/* Story Side */}
                  <div className="space-y-6">
                    <p className="text-zinc-300 text-base md:text-lg leading-relaxed font-light">
                      {edu.story}
                    </p>
                  </div>

                  {/* Details Side */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4">
                      <DetailRow
                        icon={<FaUniversity />}
                        label="Campus"
                        value={edu.campus}
                      />
                      <DetailRow
                        icon={<FaGraduationCap />}
                        label="Major"
                        value={edu.major}
                      />
                      <DetailRow
                        icon={<FaDatabase />}
                        label="Focus"
                        value={edu.focus}
                      />
                      <DetailRow
                        icon={<FaCalendarAlt />}
                        label="Graduated"
                        value={edu.graduated}
                      />
                    </div>

                    {/* Focus Tags */}
                    <div className="flex flex-wrap gap-2 pt-3">
                      {['Database Design', 'ERP Systems', 'System Analysis', 'Data Modeling'].map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 text-xs font-mono tracking-wide text-red-300/80 bg-red-500/[0.08] border border-red-500/15 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
      <div className="text-red-400/70 text-sm mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">{label}</div>
        <div className="text-zinc-200 text-sm font-medium mt-0.5">{value}</div>
      </div>
    </div>
  )
}
