import { useState } from 'react'
import { cn } from '../utils'

type ProjectImageProps = {
  src?: string
  alt: string
  title: string
  className?: string
  /** Extra classes applied to the fallback panel only */
  fallbackClassName?: string
}

/**
 * Renders a project preview, falling back to a typographic panel when the file
 * is missing or fails to load. Lets a project be listed before its screenshot
 * has been dropped into /public.
 */
export default function ProjectImage({
  src,
  alt,
  title,
  className,
  fallbackClassName,
}: ProjectImageProps) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  if (showImage) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={className}
      />
    )
  }

  const initials = title
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase())
    .join('')

  return (
    <div
      aria-label={alt}
      role="img"
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-zinc-900',
        className,
        fallbackClassName
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <span className="font-display relative text-4xl font-extrabold tracking-tight text-white/10 md:text-6xl">
        {initials || 'WIP'}
      </span>
      <span className="absolute bottom-4 left-4 font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-600">
        Preview soon
      </span>
    </div>
  )
}
