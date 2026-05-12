import { motion } from "framer-motion"

interface AnimatedSectionProps {
  children: React.ReactNode
  /** Delay in seconds before entrance begins. Use for staggered cascades. */
  delay?: number
  className?: string
}

/**
 * Wraps children in a Framer Motion fade + slide-up entrance on mount.
 * Use `delay` (seconds) to stagger multiple sections.
 */
export function AnimatedSection({ children, delay = 0, className }: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
