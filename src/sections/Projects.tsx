import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import projectData from '../data/projects.json'
import contentData from '../data/content.json'
import { FaReact, FaArrowRight, FaCode } from 'react-icons/fa'
import { HiSpeakerphone } from 'react-icons/hi'
import { 
  SiNextdotjs, SiTailwindcss, SiPython, SiLaravel, SiMariadb,
  SiFastapi, SiPostgresql, SiPocketbase, SiVuedotjs, SiDotnet,
  SiMysql, SiFlask, SiFirebase
} from 'react-icons/si'

const iconMap: Record<string, React.ReactNode> = {
  "React": <FaReact />,
  "React Native": <FaReact />,
  "Next.js": <SiNextdotjs />,
  "Tailwind CSS": <SiTailwindcss />,
  "Python": <SiPython />,
  "Laravel": <SiLaravel />,
  "MariaDB": <SiMariadb />,
  "FastAPI": <SiFastapi />,
  "Ollama": <SiPython />,
  "PostgreSQL": <SiPostgresql />,
  "Pocketbase": <SiPocketbase />,
  "Vue": <SiVuedotjs />,
  ".NET": <SiDotnet />,
  "OCP": <SiDotnet />,
  "CKEditor": <FaCode />,
  "MySQL": <SiMysql />,
  "Flask": <SiFlask />,
  "Metro": <FaReact />,
  "Insider": <HiSpeakerphone />,
  "Firebase": <SiFirebase />,
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
          end: () => "+=" + containerRef.current!.offsetWidth * 1.5,
        }
      })
      
      panels.forEach((panel: any) => {
        const img = panel.querySelector('.project-img');
        if (img) {
          gsap.fromTo(img, 
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
        }
      })
    }, containerRef)
    
    return () => ctx.revert()
  }, [])

  const featuredProjects = projectData.filter(p => p.featured)

  return (
    <section 
      id="projects" 
      ref={containerRef} 
      className="relative h-screen flex flex-nowrap overflow-hidden bg-zinc-900 text-white"
    >
      <div className="absolute top-10 left-10 z-20">
        <h2 className="text-zinc-500 font-mono tracking-widest uppercase text-sm mb-4">
          {contentData.projectsSection.sectionSubtitle}
        </h2>
      </div>

      {featuredProjects.map((project, index) => (
        <div 
          key={index} 
          className="project-panel relative w-screen h-screen flex-shrink-0 flex items-center justify-center p-8 md:p-24"
        >
          {/* Background image container */}
          <div className="absolute inset-0 overflow-hidden opacity-30 z-0">
             {project.image ? (
               <img 
                 src={project.image} 
                 alt={`${project.title} Background`} 
                 className="project-img w-full h-full object-cover blur-sm"
               />
             ) : (
               <div className="project-img w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950" aria-hidden />
             )}
             <div className="absolute inset-0 bg-black/60 mix-blend-multiply" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 w-full relative group">
               <div className="overflow-hidden rounded-xl border border-white/10 shadow-2xl">
                 {project.image ? (
                   <img 
                     src={project.image} 
                     alt={project.title}
                     className="w-full h-[40vh] md:h-[60vh] object-cover transition-transform duration-700 group-hover:scale-105"
                   />
                 ) : (
                   <div className="w-full h-[40vh] md:h-[60vh] bg-gradient-to-br from-zinc-800 to-zinc-950" aria-hidden />
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
               </div>
            </div>

            <div className="flex-1 flex flex-col gap-6">
               <div className="text-zinc-400 font-mono text-xl">{project.year}</div>
               <h3 className="text-5xl md:text-7xl font-bold tracking-tight">{project.title}</h3>
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 1, ease: 'easeOut' }}
                 viewport={{ once: true, margin: '-20%' }}>
                 <p className="text-xl text-zinc-300 font-light leading-relaxed">
                   {project.description}
                 </p>
               </motion.div>
               
               <div className="flex flex-wrap gap-4 mt-4">
                 {project.tech.map((t, i) => (
                   <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                     <span className="text-xl text-zinc-200">
                       {iconMap[t] || <FaCode />}
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
                 className="mt-8 text-xl font-medium inline-flex items-center gap-4 text-red-400 hover:text-red-300 w-fit"
               >
                 View Project 
                 <span className="h-0.5 w-12 bg-current block" />
               </motion.a>
            </div>
          </div>
        </div>
      ))}
      
      {/* View All Projects Extra Slide */}
      <div className="project-panel relative w-screen h-screen flex-shrink-0 flex items-center justify-center bg-zinc-950 p-8">
        <motion.a 
          href="/projects" 
          whileHover={{ scale: 1.05 }}
          className="group flex flex-col items-center gap-6"
        >
          <div className="w-32 h-32 rounded-full border border-zinc-700 group-hover:border-red-500 flex items-center justify-center transition-colors shadow-2xl group-hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]">
             <FaArrowRight className="text-4xl text-zinc-300 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-4xl md:text-5xl font-light tracking-wide text-white group-hover:text-red-400 transition-colors">
            See All Projects
          </h3>
          <p className="text-zinc-500 uppercase tracking-widest font-mono text-sm max-w-sm text-center">
            Discover the full archive of modern web applications and components.
          </p>
        </motion.a>
      </div>
    </section>
  )
}
