import icons from '../data/icons.json'
import sprite from '../data/icon-sprite.json'
import { cn } from '../utils'

const tech: Record<string, string | undefined> = icons.tech
const skill: Record<string, string | undefined> = icons.skill

/**
 * One symbol from the build-time sprite (scripts/build-icon-sprite.mjs). No
 * icon path data lives in the JS bundle; the sprite is fetched once and cached.
 */
export function Icon({ symbol, className }: { symbol: string; className?: string }) {
  // Callers that pass a className also set the size; otherwise the icon matches the text
  return (
    <svg aria-hidden="true" focusable="false" className={cn('inline-block shrink-0', className ?? 'h-[1em] w-[1em]')}>
      <use href={`${sprite.url}#${symbol}`} />
    </svg>
  )
}

/** Tech names as written in projects.json */
export function TechIcon({ name, className }: { name: string; className?: string }) {
  return <Icon symbol={tech[name] ?? icons.fallback} className={className} />
}

/** Icon keys as written in skills.json */
export function SkillIcon({ icon, className }: { icon: string; className?: string }) {
  return <Icon symbol={skill[icon] ?? icons.fallback} className={className} />
}

export function UiIcon({ name, className }: { name: keyof typeof icons.ui; className?: string }) {
  return <Icon symbol={icons.ui[name]} className={className} />
}
