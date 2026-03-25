import { useEffect } from 'react'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { initScrollTrigger } from './lib/animations'

import CustomCursor from './components/CustomCursor'
import Hero from './sections/Hero'
import About from './sections/About'
import Projects from './sections/Projects'
import Experience from './sections/Experience'
import Skills from './sections/Skills'
import Contact from './sections/Contact'

function App() {
  // Initialize Lenis smooth scroll
  useSmoothScroll()

  // Initialize GSAP ScrollTrigger
  useEffect(() => {
    initScrollTrigger()
  }, [])

  return (
    <main className="bg-black min-h-screen font-sans selection:bg-blue-500/30 selection:text-white relative">
      <CustomCursor />
      
      {/* Sections */}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <Hero />
          <About />
          <Projects />
          <Experience />
          <Skills />
          <Contact />
          
          {/* Footer */}
          <footer className="py-12 border-t border-zinc-900 bg-black flex justify-center text-zinc-500 font-mono text-sm">
            <p className="flex items-center gap-2">
              &copy; {new Date().getFullYear()} Vann.
              <span className="w-1 h-1 rounded-full bg-blue-500 block" /> 
              Designed with aesthetics in mind.
            </p>
          </footer>
        </div>
      </div>
    </main>
  )
}

export default App
