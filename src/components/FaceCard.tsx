import type { ArchiveFace, ProjectFace } from '../three/textures/faces'
import type { Project } from '../lib/projects'
import Barcode from './Barcode'
import ProjectImage from './ProjectImage'
import Stamp from './Stamp'
import { Arrow } from './Glyphs'
import { cn } from '../utils'

export type Slide =
  | { kind: 'project'; project: Project; face: ProjectFace }
  | { kind: 'archive'; face: ArchiveFace }

/**
 * DOM twin of a box face, drawn with the same layout as the 3D texture. It is
 * the prerendered poster for the box and the whole experience on devices
 * without 3D. Sizes are in container units, so it scales like a texture.
 */
export default function FaceCard({ slide, className }: { slide: Slide; className?: string }) {
  return (
    <div className={cn('aspect-square bg-[#f2efe7] p-[7cqw] text-ink [container-type:size]', className)}>
      {slide.kind === 'project' ? <ProjectLabel slide={slide} /> : <ArchiveLabel face={slide.face} />}
    </div>
  )
}

function ProjectLabel({ slide }: { slide: Extract<Slide, { kind: 'project' }> }) {
  const { face, project } = slide
  return (
    <div className="flex h-full flex-col border-[0.3cqw] border-ink bg-[#fbfaf6] px-[4.2cqw] pt-[4cqw] pb-[3.4cqw]">
      <div className="flex justify-between font-mono text-[2.7cqw] font-semibold tracking-[0.15em]">
        <span>{face.pkg}</span>
        <span>{face.year}</span>
      </div>
      <div className="mt-[2.4cqw] h-[0.3cqw] bg-ink" />
      <div className="mt-[2.2cqw] flex justify-between font-mono text-[2.1cqw] tracking-[0.16em] text-ink-muted uppercase">
        <span>{face.type}</span>
        <span>{face.tracking}</span>
      </div>
      <div className="mt-[2.4cqw] h-[35cqw] shrink-0 overflow-hidden border-[0.3cqw] border-ink">
        <ProjectImage project={project} sizes="(min-width: 768px) 32vw, 60vw" className="h-full w-full object-cover" />
      </div>
      <p className="type-display mt-[3.2cqw] line-clamp-2 text-[10.5cqw]">{face.title}</p>
      <p className="mt-auto truncate font-mono text-[2.1cqw] tracking-[0.12em] text-ink-muted uppercase">
        {face.tech.join(' · ')}
      </p>
      <div className="mt-[2.2cqw] flex items-center justify-between">
        <Barcode value={face.tracking} className="h-[4.6cqw] w-[33cqw]" />
        <Stamp className="mr-[4cqw] text-[2.3cqw]! text-signal">{face.live ? 'Live' : 'Private build'}</Stamp>
      </div>
    </div>
  )
}

function ArchiveLabel({ face }: { face: ArchiveFace }) {
  return (
    <div className="flex h-full gap-[4cqw]">
      <div className="flex w-[38cqw] flex-col border-[0.3cqw] border-ink bg-[#fbfaf6] p-[3.2cqw]">
        <p className="type-display text-[9cqw]">{face.title}</p>
        <div className="mt-[2.4cqw] h-[0.3cqw] bg-ink" />
        <dl className="mt-[3cqw] space-y-[2.6cqw] font-mono uppercase">
          {[
            ['From', face.from],
            ['To', face.to],
            ['Contents', face.contents],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[1.9cqw] tracking-[0.16em] text-ink-muted">{label}</dt>
              <dd className="mt-[0.6cqw] text-[2.5cqw] font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <Barcode value={face.tracking} className="mt-auto h-[8cqw] w-full" />
      </div>
      <div className="relative w-[16cqw] bg-signal" aria-hidden />
      <div className="flex flex-1 flex-col items-center justify-center gap-[3cqw] text-center">
        <p className="type-display text-[8.4cqw] text-signal">Fragile</p>
        <p className="font-mono text-[1.8cqw] tracking-[0.16em] uppercase">{face.note}</p>
        <p className="mt-[6cqw] flex items-center gap-[1cqw] border-b-[0.3cqw] border-ink pb-[0.8cqw] font-mono text-[2.1cqw] font-bold tracking-[0.14em] uppercase">
          {face.cta} <Arrow />
        </p>
      </div>
    </div>
  )
}
