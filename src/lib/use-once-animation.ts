import { useEffect, useRef, useState } from "react"

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
}

export type ChartAnimationController = {
  active: boolean
  done: () => void
  begin: (index?: number) => number
  duration: number
  easing: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear"
}

/**
 * Returns a consistent animation controller for Recharts series.
 *
 * Charts animate on first mount, then lock off after the final series reports
 * completion. If a `resetKey` is provided, the animation resets when that key
 * changes so newly selected clients/scenarios can animate naturally without
 * constantly replaying on minor state changes.
 */
export function useOnceAnimation(resetKey?: string | number): ChartAnimationController {
  const reduceMotion = prefersReducedMotion()
  const [active, setActive] = useState(!reduceMotion)
  const locked = useRef(reduceMotion)
  const previousResetKey = useRef(resetKey)

  useEffect(() => {
    if (reduceMotion) {
      locked.current = true
      setActive(false)
      return
    }

    if (previousResetKey.current !== resetKey) {
      previousResetKey.current = resetKey
      locked.current = false
      setActive(true)
    }
  }, [reduceMotion, resetKey])

  function done() {
    if (locked.current) return
    locked.current = true
    setActive(false)
  }

  return {
    active,
    done,
    begin: (index = 0) => index * 160,
    duration: 950,
    easing: "ease-out",
  }
}
