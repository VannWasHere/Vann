import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import contentData from '../data/content.json'

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Tie parallax strictly to framer motion for smoother integration here
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })
  
  // Zoom text aggressively while fading out late
  // Map points non-linearly so it stays small/readable for a while, then explodes outwards at the end:
  const scaleText = useTransform(scrollYProgress, [0, 0.5, 0.8, 1], [1, 1.8, 10, 150])
  const opacityText = useTransform(scrollYProgress, [0.7, 1], [1, 0])
  
  // Elements that fade out quickly on early scroll
  const opacityElements = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const blurElements = useTransform(scrollYProgress, [0, 0.2], ["blur(0px)", "blur(10px)"])

  // Generate particle coordinate maps
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }))

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-[150vh] bg-black text-white"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden perspective-[1000px]">
        {/* 1. Deep Background Base */}
        <div className="absolute inset-0 bg-[#0a0000] z-0" />

        {/* 2. Abstract Red Blobs / Nebula */}
        <motion.div 
          className="absolute inset-0 w-full h-full z-0 overflow-hidden mix-blend-screen opacity-50 pointer-events-none"
          style={{ opacity: opacityElements }}
        >
          <motion.div 
            className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-red-600/30 rounded-full blur-[120px]"
            animate={{ x: ["-10%", "10%", "-10%"], y: ["-10%", "10%", "-10%"], scale: [1, 1.2, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-1/2 right-1/4 w-[40vw] h-[40vw] bg-red-800/20 rounded-full blur-[100px]"
            animate={{ x: ["10%", "-10%", "10%"], y: ["10%", "-20%", "10%"], scale: [1, 1.3, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </motion.div>

        {/* 3. Immersive 3D Grid floor */}
        <motion.div className="absolute bottom-0 left-0 right-0 h-[60%] z-[1] select-none pointer-events-none"
             style={{
               opacity: opacityElements,
               background: 'linear-gradient(transparent 0%, rgba(220,38,38,0.05) 100%)',
               transform: 'perspective(500px) rotateX(75deg) scale(2) translateY(50px)',
               backgroundImage: `
                 linear-gradient(to right, rgba(239,68,68,0.05) 1px, transparent 1px),
                 linear-gradient(to bottom, rgba(239,68,68,0.05) 1px, transparent 1px)
               `,
               backgroundSize: '40px 40px'
             }}
        />
        
        {/* 4. Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80 z-[2] pointer-events-none" />

        {/* 5. Floating Ambient Particles */}
        <motion.div className="absolute inset-0 z-[3] overflow-hidden pointer-events-none" style={{ opacity: opacityElements }}>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute bg-white rounded-full opacity-0"
              style={{ 
                width: p.size, height: p.size, 
                left: `${p.x}%`, top: `${p.y}%`,
                boxShadow: '0 0 10px 2px rgba(239,68,68,0.2)' 
              }}
              animate={{ 
                y: ["0vh", "-100vh"], 
                opacity: [0, 0.8, 0],
                x: ["0vw", "5vw", "-5vw"]
              }}
              transition={{
                y: { duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay },
                opacity: { duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay },
                x: { duration: p.duration * 0.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
              }}
            />
          ))}
        </motion.div>

        {/* Hero Typography - Zoom mask target */}
        <motion.div 
          className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center select-none will-change-transform"
          style={{ scale: scaleText, opacity: opacityText }}
        >
          {/* Main Name Zooming Core */}
          <h1 className="text-7xl md:text-9xl lg:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-red-100 to-red-600 pb-4 isolate transform-gpu">
            {contentData.hero.title.toUpperCase()}
          </h1>
        </motion.div>
        
        {/* Subtitle that fades quickly */}
        <motion.div
           className="absolute top-[60%] flex flex-col items-center w-full z-10 pointer-events-none"
           style={{ opacity: opacityElements, filter: blurElements }}
        >
          <div className="h-[1px] w-0 bg-red-500/50 mx-auto mb-8 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          <p 
            className="text-xl md:text-3xl text-zinc-300 font-light tracking-[0.2em] max-w-3xl mx-auto uppercase mt-4 text-center px-4" 
            dangerouslySetInnerHTML={{ __html: contentData.hero.subtitle.replace('Problem Solver', '<span class="text-white font-medium italic filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Problem Solver</span>') }} 
          />
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
          style={{ opacity: opacityElements }}
        >
          <span className="text-[11px] tracking-[0.3em] font-mono uppercase text-zinc-400 font-semibold mb-2 opacity-70">
            {contentData.hero.scrollText}
          </span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-10 h-16 rounded-full border border-zinc-600/50 flex justify-center p-2 backdrop-blur-sm bg-black/20"
          >
            <motion.div 
              animate={{ y: [0, 16, 0], opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,1)]"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
