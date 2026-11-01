import { initials, largestSrc, projectImage, srcSet, type Project } from '../lib/projects'
import { cn } from '../utils'

type ProjectImageProps = {
  project: Project
  /** The `sizes` attribute — how wide the image renders at each breakpoint */
  sizes: string
  className?: string
  eager?: boolean
}

/**
 * Responsive AVIF/WebP screenshot with intrinsic size (no layout shift) and a
 * blurred placeholder. Falls back to a typographic panel when a project has no
 * screenshot yet — see `npm run images`.
 */
export default function ProjectImage({ project, sizes, className, eager = false }: ProjectImageProps) {
  const image = projectImage(project.slug)

  if (!image) {
    // Blueprint wireframe of an app screen — same layout as the box's canvas texture
    return (
      <div
        role="img"
        aria-label={`${project.title} — preview coming soon`}
        className={cn('relative overflow-hidden bg-graphite-850', className)}
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(239 236 228 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(239 236 228 / 0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden className="absolute inset-0 h-full w-full">
          <g fill="none" stroke="rgb(239 236 228 / 0.42)" strokeWidth="1.2" vectorEffect="non-scaling-stroke">
            <rect x="14" y="12" width="292" height="18" />
            <rect x="14" y="38" width="58" height="130" />
            <rect x="82" y="38" width="70" height="40" />
            <rect x="158" y="38" width="70" height="40" />
            <rect x="234" y="38" width="70" height="40" />
            <rect x="82" y="88" width="222" height="80" />
          </g>
          <g fill="rgb(239 68 68 / 0.85)">
            {[0.35, 0.55, 0.42, 0.7, 0.5, 0.82, 0.64, 0.9].map((value, i) => (
              <rect key={i} x={96 + i * 25} y={160 - 58 * value} width="12" height={58 * value} />
            ))}
          </g>
          <g fill="rgb(239 236 228 / 0.42)">
            <rect x="90" y="50" width="30" height="8" />
            <rect x="166" y="50" width="30" height="8" />
            <rect x="242" y="50" width="30" height="8" />
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x="22" y={48 + i * 14} width="40" height="4" />
            ))}
          </g>
        </svg>
        <span aria-hidden className="type-label absolute top-3 left-4 text-paper-100/60">
          {initials(project.title)} · Preview soon
        </span>
      </div>
    )
  }

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(image.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image.webp)} sizes={sizes} />
      <img
        src={largestSrc(image.webp)}
        width={image.width}
        height={image.height}
        alt={`${project.title} — screenshot`}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
        style={{ backgroundImage: `url(${image.placeholder})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
    </picture>
  )
}
