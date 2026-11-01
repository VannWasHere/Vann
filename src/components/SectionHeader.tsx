import { cn } from '../utils'

type SectionHeaderProps = {
  index: string
  title: string
  meta?: string
  className?: string
  /** Colour of the index number — pass the AA-safe red on paper sections */
  indexClassName?: string
}

/** Manifest-style label row: "02 — SELECTED WORK ········ 5 / 8 ON DISPLAY" */
export default function SectionHeader({
  index,
  title,
  meta,
  className,
  indexClassName = 'text-signal',
}: SectionHeaderProps) {
  return (
    <p className={cn('type-label flex items-center gap-3', className)}>
      <span className={cn('tabular-nums', indexClassName)}>{index}</span>
      <span aria-hidden className="h-px w-6 bg-current opacity-40" />
      <span>{title}</span>
      <span aria-hidden className="mx-1 h-0 flex-1 border-b border-dotted border-current opacity-35" />
      {meta && <span className="text-right opacity-75">{meta}</span>}
    </p>
  )
}
