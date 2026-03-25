import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import skillsData from '../data/skills.json'

import { FaReact, FaNodeJs } from 'react-icons/fa'
import { SiTypescript, SiJavascript, SiTailwindcss, SiFramer, SiGreensock, SiPython } from 'react-icons/si'

const iconMap: Record<string, React.ReactNode> = {
  "FaReact": <FaReact />,
  "SiTypescript": <SiTypescript />,
  "SiJavascript": <SiJavascript />,
  "SiTailwindcss": <SiTailwindcss />,
  "SiFramer": <SiFramer />,
  "SiGreensock": <SiGreensock />,
  "FaNodeJs": <FaNodeJs />,
  "SiPython": <SiPython />
}

export default function Skills() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const items = gsap.utils.toArray('.skill-item')
    
    gsap.fromTo(items,
      { y: 50, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: 0.05,
        duration: 0.8,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      }
    )
  }, [])

  return (
    <section ref={containerRef} className="py-32 bg-black text-white px-6 md:px-12 lg:px-24 min-h-[80vh] flex flex-col justify-center">
      <div className="max-w-6xl mx-auto w-full">
        <h2 className="text-zinc-500 font-mono tracking-widest uppercase text-sm mb-12 text-center">
          [ 04 ] Tech Arsenal
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8">
          {skillsData.map((skill, index) => (
            <motion.div 
              key={index}
              className="skill-item relative flex flex-col items-center justify-center p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 group overflow-hidden cursor-default"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="text-4xl md:text-5xl mb-4 text-zinc-400 group-hover:text-blue-400 transition-colors duration-300 drop-shadow-[0_0_15px_rgba(59,130,246,0)] group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                {iconMap[skill.icon] || <FaReact />}
              </div>
              
              <h3 className="text-lg font-medium text-zinc-200 tracking-wide">{skill.name}</h3>
              
              <div className="mt-2 text-sm text-zinc-500 font-mono font-light">
                {skill.years} YOE
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
