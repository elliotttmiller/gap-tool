import { useEffect, useState } from "react"

interface AnimatedSectionProps {
  children: React.ReactNode
  /** Delay in seconds before entrance begins. Use for staggered cascades. */
  delay?: number
  className?: string
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
}

/**
 * Lightweight fade + slide-up entrance wrapper.
 *
 * This intentionally avoids a runtime animation dependency. It gives cards,
 * forms, narratives, and chart panels a calm staged entrance while preserving
 * full ownership over the app's performance profile.
 */
export function AnimatedSection({ children, delay = 0, className }: AnimatedSectionProps) {
  const reduceMotion = prefersReducedMotion()
  const [visible, setVisible] = useState(reduceMotion)

  useEffect(() => {
    if (reduceMotion) {
      setVisible(true)
      return
    }

    const frame = window.requestAnimationFrame(() => setVisible(true))
    return () => window.cancelAnimationFrame(frame)
  }, [reduceMotion])

  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transitionProperty: "opacity, transform",
        transitionDuration: reduceMotion ? "0ms" : "520ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: reduceMotion ? "0ms" : `${delay}s`,
        willChange: visible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  )
}
