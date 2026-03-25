import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

import projectData from '../data/projects.json'
import { FaReact, FaChrome } from 'react-icons/fa'
import { SiNextdotjs, SiVite, SiTailwindcss, SiTypescript, SiFramer, SiThreedotjs, SiPython } from 'react-icons/si'

const iconMap: Record<string, React.ReactNode> = {
  "React": <FaReact />,
  "Next.js": <SiNextdotjs />,
  "Vite": <SiVite />,
  "Tailwind": <SiTailwindcss />,
  "TypeScript": <SiTypescript />,
  "Framer Motion": <SiFramer />,
  "Three.js": <SiThreedotjs />,
  "Python": <SiPython />,
}

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!containerRef.current) return
    const panels = gsap.utils.toArray('.project-panel')
    
    const ctx = gsap.context(() => {
      const horizontalAnimation = gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          snap: {
            snapTo: 1 / (panels.length - 1),
            duration: { min: 0.2, max: 1 },
            delay: 0.1,
          },
          end: () => "+=" + containerRef.current!.offsetWidth,
        }
      })
      
      panels.forEach((panel: any) => {
        gsap.fromTo(panel.querySelector('.project-img'), 
          { scale: 1.2, xPercent: -10 },
          { 
            scale: 1, 
            xPercent: 10,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: horizontalAnimation,
              start: "left center",
              end: "right center",
              scrub: true,
            }
          }
        )
      })
    }, containerRef)
    
    return () => ctx.revert()
  }, [])

  return (
    <section 
      id="projects" 
      ref={containerRef} 
      className="relative h-screen flex flex-nowrap overflow-hidden bg-zinc-900 text-white"
    >
      <div className="absolute top-10 left-10 z-20">
        <h2 className="text-zinc-500 font-mono tracking-widest uppercase text-sm mb-4">
          [ 02 ] Selected Works
        </h2>
      </div>

      {projectData.map((project, index) => (
        <div 
          key={index} 
          className="project-panel relative w-screen h-screen flex-shrink-0 flex items-center justify-center p-8 md:p-24"
        >
          {/* Background image container */}
          <div className="absolute inset-0 overflow-hidden opacity-30 z-0">
             <img 
               src={project.image} 
               alt={`${project.title} Background`} 
               className="project-img w-full h-full object-cover blur-sm"
             />
             <div className="absolute inset-0 bg-black/60 mix-blend-multiply" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 w-full relative group">
               <div className="overflow-hidden rounded-xl border border-white/10 shadow-2xl">
                 <img 
                   src={project.image} 
                   alt={project.title}
                   className="w-full h-[40vh] md:h-[60vh] object-cover transition-transform duration-700 group-hover:scale-105"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
               </div>
            </div>

            <div className="flex-1 flex flex-col gap-6">
               <div className="text-zinc-400 font-mono text-xl">{project.year}</div>
               <h3 className="text-5xl md:text-7xl font-bold tracking-tight">{project.title}</h3>
               <p className="text-xl text-zinc-300 font-light leading-relaxed">
                 {project.description}
               </p>
               
               <div className="flex flex-wrap gap-4 mt-4">
                 {project.tech.map((t, i) => (
                   <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                     <span className="text-xl text-zinc-200">
                       {iconMap[t] || <FaChrome />}
                     </span>
                     <span className="text-sm tracking-wide text-zinc-200">{t}</span>
                   </div>
                 ))}
               </div>

               <motion.a 
                 href={project.link} 
                 target="_blank"
                 rel="noopener noreferrer"
                 whileHover={{ x: 10 }}
                 className="mt-8 text-xl font-medium inline-flex items-center gap-4 text-blue-400 hover:text-blue-300 w-fit"
               >
                 View Project 
                 <span className="h-0.5 w-12 bg-current block" />
               </motion.a>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
