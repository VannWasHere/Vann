import Nav from '../components/Nav'
import Footer from '../components/Footer'
import Hero from '../sections/Hero'
import Work from '../sections/Work'
import About from '../sections/About'
import Experience from '../sections/Experience'
import Stack from '../sections/Stack'
import Contact from '../sections/Contact'
import { useReveal } from '../lib/reveal'

export default function Home() {
  useReveal()

  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Work />
        <About />
        <Experience />
        <Stack />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
