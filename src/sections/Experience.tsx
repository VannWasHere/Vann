import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import experienceData from '../data/experience.json'
import contentData from '../data/content.json'

export default function Experience() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const items = gsap.utils.toArray('.exp-item')
    
    const ctx = gsap.context(() => {
      items.forEach((item: any) => {
        gsap.fromTo(item, 
          { opacity: 0, x: -50, scale: 0.95 },
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

        // Animate dot fill as the line passes it (top center)
        const dot = item.querySelector('.timeline-dot')
        if (dot) {
          gsap.fromTo(dot, 
            { backgroundColor: "#18181b", borderColor: "#3f3f46", boxShadow: "none" }, // zinc-900 & zinc-700
            {
              backgroundColor: "#ef4444", // red-500
              borderColor: "#ef4444",
              boxShadow: "0 0 15px rgba(239,68,68,0.5)",
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
            {contentData.experienceSection.sectionSubtitle}
          </h2>
          <h3 className="text-4xl md:text-6xl font-light">{contentData.experienceSection.title}</h3>
        </div>

        <div className="relative border-l border-zinc-800 ml-4 md:ml-8 pl-8 md:pl-16 space-y-24">
          <div className="timeline-line absolute top-0 left-[-1px] w-[2px] h-full bg-red-500 origin-top z-0 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          
          {experienceData.map((exp, i) => (
            <div key={i} className="exp-item relative group">
              {/* Removed transition-colors so GSAP natively controls the rendering frames cleanly */}
              <div className="timeline-dot absolute top-2 -left-[45px] md:-left-[77px] w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 z-10" />
              
              <div className="flex flex-col md:flex-row gap-4 md:gap-12 items-start md:items-center justify-between mb-4">
                <h4 className="text-3xl md:text-4xl font-bold text-zinc-100">{exp.role}</h4>
                <div className="text-red-400 font-mono text-lg tracking-wider bg-red-500/10 px-4 py-1 rounded border border-red-500/20">
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
