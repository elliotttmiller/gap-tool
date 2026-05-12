import { useRef, useState } from "react"

/**
 * Returns animation props for Recharts series (Bar, Area, Line).
 * Charts animate once on mount with staggered series, then lock off
 * so re-renders from input changes don't re-trigger the animation.
 *
 * Usage:
 *   const anim = useOnceAnimation()
 *   <Bar isAnimationActive={anim.active} animationBegin={0}   animationDuration={900} animationEasing="ease-out" />
 *   <Bar isAnimationActive={anim.active} animationBegin={150} animationDuration={900} animationEasing="ease-out" />
 *   <Bar isAnimationActive={anim.active} animationBegin={300} animationDuration={900} animationEasing="ease-out" onAnimationEnd={anim.done} />
 *
 * Attach `onAnimationEnd={anim.done}` to only the LAST series in each chart.
 */
export function useOnceAnimation() {
  const [active, setActive] = useState(true)
  // Guard so done() is a no-op after first call
  const locked = useRef(false)

  function done() {
    if (locked.current) return
    locked.current = true
    setActive(false)
  }

  return { active, done }
}
