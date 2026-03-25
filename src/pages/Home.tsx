import { useEffect } from 'react'
import { useSmoothScroll } from '../hooks/useSmoothScroll'
import { initScrollTrigger } from '../lib/animations'

import CustomCursor from '../components/CustomCursor'
import Hero from '../sections/Hero'
import About from '../sections/About'
import Projects from '../sections/Projects'
import Experience from '../sections/Experience'
import Skills from '../sections/Skills'
import Contact from '../sections/Contact'
import contentData from '../data/content.json'

export default function Home() {
  // Initialize Lenis smooth scroll
  useSmoothScroll()

  // Initialize GSAP ScrollTrigger
  useEffect(() => {
    initScrollTrigger()
  }, [])

  return (
    <main className="bg-black min-h-screen font-sans selection:bg-red-500/30 selection:text-white relative">
      <CustomCursor />
      
      {/* Sections structure with snapping */}
      <div id="smooth-wrapper" className="relative">
        <div id="smooth-content" className="relative">
          <Hero />
          <About />
          <Projects />
          <Experience />
          <Skills />
          <Contact />
          
          {/* Footer - Snapped as block */}
          <footer className="snap-start py-12 border-t border-zinc-900 bg-black flex justify-center text-zinc-500 font-mono text-sm min-h-[10vh]">
            <p className="flex items-center gap-2">
              &copy; {new Date().getFullYear()} {contentData.footer.text}
            </p>
          </footer>
        </div>
      </div>
    </main>
  )
}
