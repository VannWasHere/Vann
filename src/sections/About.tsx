import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import contentData from '../data/content.json'

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Parallax background transition utilizing GSAP
    if (!sectionRef.current || !textRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(textRef.current, 
        { y: 100, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "center center",
            scrub: 1,
          }
        }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen py-32 flex items-center justify-center overflow-hidden bg-zinc-950 px-6 md:px-12"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-zinc-900 pointer-events-none" />

      <motion.div 
        ref={textRef}
        className="max-w-4xl mx-auto z-10 space-y-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
        }}
      >
        <motion.h2 
          className="text-zinc-500 font-mono tracking-widest uppercase text-sm mb-4"
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
        >
          {contentData.about.sectionSubtitle}
        </motion.h2>
        
        <motion.p 
          className="text-4xl md:text-6xl lg:text-7xl text-white font-medium leading-tight tracking-tight"
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }}
          dangerouslySetInnerHTML={{ __html: contentData.about.headline.replace('aesthetics', '<span class="text-zinc-500 italic">aesthetics</span>').replace('performance', '<span class="text-red-500">performance</span>') }} 
        />
        
        <motion.p 
          className="text-xl md:text-3xl text-zinc-400 font-light max-w-3xl leading-relaxed"
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }}
        >
          {contentData.about.description}
        </motion.p>
        
        <motion.div 
          className="mt-12 flex gap-4"
          variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 1 } } }}
        >
          {/* Decorative floating dots */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-zinc-700"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
