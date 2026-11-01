import { useEffect, useState } from 'react'
import { cn } from '../utils'

type CopyEmailProps = {
  email: string
  copyLabel: string
  copiedLabel: string
  className?: string
}

/** Email as a real mailto link, plus a copy button that confirms itself. */
export default function CopyEmail({ email, copyLabel, copiedLabel, className }: CopyEmailProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(id)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
    } catch {
      window.location.href = `mailto:${email}`
    }
  }

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <a
        href={`mailto:${email}`}
        className="min-w-0 truncate text-lg font-medium underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current md:text-xl"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        className="type-label shrink-0 border border-current/30 px-2.5 py-1.5 transition-colors hover:bg-ink hover:text-paper-100"
      >
        <span aria-live="polite">{copied ? copiedLabel : copyLabel}</span>
      </button>
    </div>
  )
}
