import content from '../data/content.json'
import Nav from '../components/Nav'
import SectionHeader from '../components/SectionHeader'
import { Arrow } from '../components/Glyphs'

const page = content.notFound

/** Shipped as static HTML + CSS — no JavaScript on this page. */
export default function NotFound() {
  return (
    <>
      <Nav home={false} />
      <main id="main" className="container-page flex min-h-[calc(100dvh-3.5rem)] flex-col justify-center py-16">
        <SectionHeader index={page.code} title={page.title} meta={page.cta} className="text-graphite-300" />
        <h1 className="type-display mt-10 text-[clamp(7rem,30vw,24rem)] leading-[0.8] text-paper-100">
          {page.code}
          <span className="text-signal">.</span>
        </h1>
        <p className="type-serif mt-6 text-[clamp(2rem,4vw,3.25rem)] leading-none text-signal">{page.title}</p>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-graphite-300">{page.body}</p>
        <a
          href="/"
          className="type-label group mt-10 inline-flex w-fit items-center gap-3 bg-paper-100 px-5 py-3.5 text-ink transition-colors hover:bg-signal"
        >
          {page.cta}
          <Arrow className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>
      </main>
    </>
  )
}
