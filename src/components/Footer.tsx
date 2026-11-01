import content from '../data/content.json'
import { Arrow } from './Glyphs'
import { UiIcon } from './Icon'

const { footer, hero } = content

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-paper-100/10 bg-graphite-950">
      <div className="container-page flex flex-col gap-8 pt-14 pb-10 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="type-label text-paper-100">
            {hero.name} <span className="text-graphite-500">/</span> {hero.alias}
          </p>
          <p className="type-label text-graphite-400">
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {footer.text}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={footer.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="flex h-11 w-11 items-center justify-center border border-paper-100/15 text-graphite-300 transition-colors hover:border-paper-100/50 hover:text-paper-100"
          >
            <UiIcon name="github" />
          </a>
          <a
            href={footer.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex h-11 w-11 items-center justify-center border border-paper-100/15 text-graphite-300 transition-colors hover:border-paper-100/50 hover:text-paper-100"
          >
            <UiIcon name="linkedin" />
          </a>
          <a
            href="#top"
            className="type-label ml-2 flex h-11 items-center gap-2 border border-paper-100/15 px-4 text-graphite-300 transition-colors hover:border-paper-100/50 hover:text-paper-100"
          >
            {footer.top}
            <Arrow direction="up" />
          </a>
        </div>
      </div>

      {/* Oversized wordmark, cut off by the bottom edge */}
      <p
        aria-hidden
        className="type-display -mb-[0.2em] text-center text-[31vw] leading-[0.8] text-graphite-850 select-none"
      >
        {hero.alias}
      </p>
    </footer>
  )
}
