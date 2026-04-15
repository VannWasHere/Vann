import { useEffect } from 'react'
import { useSmoothScroll } from '../hooks/useSmoothScroll'
import { initScrollTrigger } from '../lib/animations'
import { FaGithub, FaLinkedin, FaArrowUp } from 'react-icons/fa'

import CustomCursor from '../components/CustomCursor'
import Hero from '../sections/Hero'
import About from '../sections/About'
import Projects from '../sections/Projects'
import Experience from '../sections/Experience'
import Skills from '../sections/Skills'
import Contact from '../sections/Contact'
import contentData from '../data/content.json'

export default function Home() {
  useSmoothScroll()

  useEffect(() => {
    initScrollTrigger()
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="bg-black min-h-screen font-sans selection:bg-red-500/30 selection:text-white relative">
      <CustomCursor />

      <div id="smooth-wrapper" className="relative">
        <div id="smooth-content" className="relative">
          <Hero />
          <About />
          <Projects />
          <Experience />
          <Skills />
          <Contact />

          <footer className="relative py-16 border-t border-zinc-900/50 bg-black px-6 md:px-12">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col items-center md:items-start gap-2">
                  <span className="text-white font-bold text-xl tracking-tighter font-display">VANN</span>
                  <p className="text-zinc-600 font-mono text-xs tracking-wider">
                    &copy; {new Date().getFullYear()} {contentData.footer.text}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <a
                    href={contentData.footer.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 hover:text-white transition-colors duration-300"
                    aria-label="GitHub"
                  >
                    <FaGithub className="text-lg" />
                  </a>
                  <a
                    href={contentData.footer.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 hover:text-white transition-colors duration-300"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin className="text-lg" />
                  </a>
                  <button
                    onClick={scrollToTop}
                    className="w-10 h-10 rounded-full border border-zinc-800 hover:border-zinc-600 flex items-center justify-center text-zinc-600 hover:text-white transition-all duration-300 ml-2"
                    aria-label="Back to top"
                  >
                    <FaArrowUp className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  )
}
