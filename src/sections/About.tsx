import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { gsap } from 'gsap'

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-20%" })

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
      className="relative min-h-[90vh] py-32 flex items-center justify-center overflow-hidden bg-zinc-950 px-6 md:px-12"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-zinc-900 pointer-events-none" />

      <motion.div 
        ref={textRef}
        className="max-w-4xl mx-auto z-10 space-y-10"
      >
        <h2 className="text-zinc-500 font-mono tracking-widest uppercase text-sm mb-4">
          [ 01 ] The Origin
        </h2>
        
        <p className="text-3xl md:text-5xl lg:text-6xl text-white font-medium leading-tight">
          Crafting digital experiences that merge <span className="text-zinc-500 italic">aesthetics</span> with <span className="text-blue-500">performance</span>.
        </p>
        
        <p className="text-lg md:text-2xl text-zinc-400 font-light max-w-2xl">
          I'm Vann, a passionate developer who brings complex ideas to life. I believe in writing modular, highly performant code wrapped in stunning immersive interfaces.
        </p>
        
        <motion.div 
          className="mt-12 flex gap-4"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
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
