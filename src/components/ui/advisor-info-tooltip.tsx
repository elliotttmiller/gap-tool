import { useId, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Info } from "lucide-react"

interface AdvisorInfoTooltipProps {
  content: string
  ariaLabel?: string
  className?: string
}

const TOOLTIP_WIDTH = 256
const VIEWPORT_GUTTER = 12
const TRIGGER_GAP = 8

export function AdvisorInfoTooltip({
  content,
  ariaLabel = "More information",
  className,
}: AdvisorInfoTooltipProps) {
  const tooltipId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ left: 0, top: 0 })

  useLayoutEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const trigger = triggerRef.current
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()
      const idealCenter = rect.left + rect.width / 2
      const halfWidth = TOOLTIP_WIDTH / 2
      const minCenter = VIEWPORT_GUTTER + halfWidth
      const maxCenter = window.innerWidth - VIEWPORT_GUTTER - halfWidth

      setPosition({
        left: Math.min(Math.max(idealCenter, minCenter), Math.max(minCenter, maxCenter)),
        top: rect.top - TRIGGER_GAP,
      })
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [open])

  const tooltip = open && typeof document !== "undefined"
    ? createPortal(
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none fixed z-[1000] w-64 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-700/80 bg-slate-950/95 px-3 py-2.5 text-[10px] font-normal normal-case leading-relaxed tracking-normal text-slate-200 opacity-100 shadow-xl backdrop-blur-sm print:hidden"
          style={{ left: position.left, top: position.top }}
        >
          {content}
          <span
            className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border-b border-r border-slate-700/80 bg-slate-950"
            aria-hidden="true"
          />
        </span>,
        document.body,
      )
    : null

  return (
    <span
      className={`inline-flex shrink-0 align-middle print:hidden ${className ?? ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        className="inline-flex size-4 items-center justify-center rounded-full text-slate-500 outline-none transition-colors hover:text-[#1db8b9] focus-visible:text-[#1db8b9] focus-visible:ring-2 focus-visible:ring-[#1db8b9]/40"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((current) => !current)}
      >
        <Info className="size-3.5" aria-hidden="true" />
      </button>
      {tooltip}
    </span>
  )
}
