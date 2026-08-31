import { motion } from 'framer-motion'
import { useTheme } from '../theme/themeContext'

/**
 * Screen-space CRT dressing for the terminal theme: scanlines, phosphor glow,
 * a slow refresh sweep, and a power-on flash when the theme is switched in.
 * Purely decorative and never interactive.
 */
export default function CRTOverlay() {
  const { isTerminal } = useTheme()
  if (!isTerminal) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]">
      {/* Power-on flash */}
      <motion.div
        initial={{ opacity: 0.9, scaleY: 0.004 }}
        animate={{ opacity: 0, scaleY: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="absolute inset-0 bg-[#c9ffe5]"
      />

      <div className="crt-scanlines crt-flicker absolute inset-0 opacity-[0.55]" />
      <div className="crt-glow absolute inset-0" />

      {/* Refresh sweep */}
      <div className="crt-sweep absolute inset-x-0 top-0 h-[22vh] bg-gradient-to-b from-transparent via-[#00ff9c]/[0.04] to-transparent" />
    </div>
  )
}
