import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../utils'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseEnter = () => setHidden(false)
    const handleMouseLeave = () => setHidden(true)

    // Delegated so elements added later (theme swaps, route changes) still
    // trigger the hover state without re-binding listeners
    const handleOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      setIsHovered(Boolean(target?.closest('a, button, [data-hoverable]')))
    }

    window.addEventListener('mousemove', updatePosition)
    window.addEventListener('mouseenter', handleMouseEnter)
    window.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseover', handleOver)

    return () => {
      window.removeEventListener('mousemove', updatePosition)
      window.removeEventListener('mouseenter', handleMouseEnter)
      window.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseover', handleOver)
    }
  }, [])

  // Do not render custom cursor on touch devices simply
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  return (
    <>
      <motion.div
        className={cn(
          "fixed top-0 left-0 w-4 h-4 rounded-full bg-white pointer-events-none mix-blend-difference z-[9999] transition-opacity duration-300",
          hidden ? "opacity-0" : "opacity-100"
        )}
        animate={{
          x: position.x - 8,
          y: position.y - 8,
          scale: isHovered ? 2 : 1,
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
      />
      <motion.div
        className={cn(
          "fixed top-0 left-0 w-10 h-10 rounded-full border border-white pointer-events-none mix-blend-difference z-[9998] transition-opacity duration-300",
          hidden ? "opacity-0" : "opacity-60"
        )}
        animate={{
          x: position.x - 20,
          y: position.y - 20,
          scale: isHovered ? 1.5 : 1,
        }}
        transition={{ type: "tween", ease: "circOut", duration: 0.4 }}
      />
    </>
  )
}
