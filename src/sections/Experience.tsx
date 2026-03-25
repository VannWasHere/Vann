import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const experiences = [
  {
    role: "Senior Frontend Engineer",
    company: "Acme Corp",
    year: "2023 - Present",
    desc: "Led the core UI architecture redesign, cutting load times by 40% and deploying a generic design system.",
  },
  {
    role: "Fullstack Developer",
    company: "Globex React",
    year: "2021 - 2023",
    desc: "Built high-performance financial dashboards handling thousands of real-time datapoints with optimized renders.",
  },
  {
    role: "Web Developer Intern",
    company: "Initech",
    year: "2020 - 2021",
    desc: "Maintained legacy codebases while migrating core components to React and modernizing the tech stack.",
  }
]

export default function Experience() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const items = gsap.utils.toArray('.exp-item')
    
    const ctx = gsap.context(() => {
      items.forEach((item: any) => {
        gsap.fromTo(item, 
          { opacity: 0, y: 50 },
          {
            opacity: 1, 
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        )
      })

      // Timeline line animation
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
  }, [])

  return (
    <section ref={containerRef} className="relative min-h-screen py-32 bg-zinc-950 text-white px-6 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto space-y-24">
        
        <div className="space-y-4">
          <h2 className="text-zinc-500 font-mono tracking-widest uppercase text-sm">
            [ 03 ] Chronicle
          </h2>
          <h3 className="text-4xl md:text-6xl font-light">Experience</h3>
        </div>

        <div className="relative border-l border-zinc-800 ml-4 md:ml-8 pl-8 md:pl-16 space-y-24">
          <div className="timeline-line absolute top-0 left-[-1px] w-[2px] h-full bg-blue-500 origin-top" />
          
          {experiences.map((exp, i) => (
            <div key={i} className="exp-item relative group">
              <div className="absolute top-2 -left-[45px] md:-left-[77px] w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 group-hover:border-blue-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 z-10" />
              
              <div className="flex flex-col md:flex-row gap-4 md:gap-12 items-start md:items-center justify-between mb-4">
                <h4 className="text-3xl md:text-4xl font-bold text-zinc-100">{exp.role}</h4>
                <div className="text-blue-400 font-mono text-lg tracking-wider bg-blue-500/10 px-4 py-1 rounded border border-blue-500/20">
                  {exp.year}
                </div>
              </div>
              
              <h5 className="text-2xl text-zinc-500 font-medium italic mb-6">{exp.company}</h5>
              
              <p className="text-xl text-zinc-400 font-light max-w-2xl leading-relaxed">
                {exp.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
