import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import skillsData from '../data/skills.json'
import contentData from '../data/content.json'

import { FaReact, FaNodeJs, FaHtml5, FaCss3Alt, FaGitAlt, FaDocker, FaLinux } from 'react-icons/fa'
import {
  SiTypescript, SiJavascript, SiTailwindcss, SiFramer, SiGreensock, SiPython,
  SiNextdotjs, SiAngular, SiVuedotjs, SiFastapi, SiExpress, SiGo, SiLaravel,
  SiPostgresql, SiMysql
} from 'react-icons/si'

const iconMap: Record<string, React.ReactNode> = {
  "FaReact": <FaReact />,
  "SiTypescript": <SiTypescript />,
  "SiJavascript": <SiJavascript />,
  "SiTailwindcss": <SiTailwindcss />,
  "SiFramer": <SiFramer />,
  "SiGreensock": <SiGreensock />,
  "FaNodeJs": <FaNodeJs />,
  "SiPython": <SiPython />,
  "SiNextdotjs": <SiNextdotjs />,
  "SiAngular": <SiAngular />,
  "SiVuedotjs": <SiVuedotjs />,
  "FaHtml5": <FaHtml5 />,
  "FaCss3Alt": <FaCss3Alt />,
  "SiFastapi": <SiFastapi />,
  "SiExpress": <SiExpress />,
  "SiGo": <SiGo />,
  "SiLaravel": <SiLaravel />,
  "SiPostgresql": <SiPostgresql />,
  "SiMysql": <SiMysql />,
  "FaGitAlt": <FaGitAlt />,
  "FaDocker": <FaDocker />,
  "FaLinux": <FaLinux />
}

export default function Skills() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const items = gsap.utils.toArray('.skill-item')

    gsap.fromTo(items,
      { y: 40, opacity: 0, scale: 0.92 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: 0.04,
        duration: 0.7,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      }
    )
  }, [])

  return (
    <section ref={containerRef} className="relative py-32 bg-black text-white px-6 md:px-12 lg:px-24 min-h-[80vh] flex flex-col justify-center overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-500/[0.03] rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-zinc-500 font-mono tracking-widest uppercase text-sm">
            {contentData.skillsSection.sectionSubtitle}
          </h2>
          <p className="text-zinc-600 text-base font-light max-w-md mx-auto">Technologies I use to bring ideas to life — from pixel to production.</p>
        </div>

        <div className="space-y-12">
          {skillsData.categories.map((category, catIdx) => (
            <div key={catIdx}>
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-sm font-mono tracking-widest uppercase text-zinc-600 shrink-0">{category.name}</h3>
                <div className="h-px flex-1 bg-zinc-800/50" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {category.skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    className="skill-item relative flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-red-500/30 group overflow-hidden cursor-default"
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="relative text-2xl text-zinc-500 group-hover:text-red-400 transition-colors duration-300 shrink-0">
                      {iconMap[skill.icon] || <FaReact />}
                    </div>

                    <span className="relative text-sm font-medium text-zinc-300 tracking-wide">{skill.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Scrolling Marquee */}
        <div className="mt-20 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex gap-8 shrink-0">
                {skillsData.categories.flatMap(c => c.skills).map((skill, i) => (
                  <span key={`${setIdx}-${i}`} className="text-zinc-800 font-mono text-lg tracking-wider uppercase">
                    {skill.name}
                  </span>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
