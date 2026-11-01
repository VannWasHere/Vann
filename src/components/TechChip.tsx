import { TechIcon } from './Icon'
import { cn } from '../utils'

export default function TechChip({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn('type-label inline-flex items-center gap-2 border border-current/20 px-2.5 py-1.5', className)}>
      <TechIcon name={name} className="h-3.5 w-3.5" />
      {name}
    </span>
  )
}
