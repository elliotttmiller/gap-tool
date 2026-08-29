import { Info } from "lucide-react"

interface AdvisorInfoTooltipProps {
  content: string
  ariaLabel?: string
  className?: string
}

export function AdvisorInfoTooltip({
  content,
  ariaLabel = "More information",
  className,
}: AdvisorInfoTooltipProps) {
  return (
    <span className={`group relative inline-flex shrink-0 align-middle print:hidden ${className ?? ""}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        className="inline-flex size-4 items-center justify-center rounded-full text-slate-500 outline-none transition-colors hover:text-[#188a89] focus-visible:text-[#188a89] focus-visible:ring-2 focus-visible:ring-[#188a89]/35"
      >
        <Info className="size-3.5" aria-hidden="true" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 translate-y-1 rounded-lg border border-slate-700/80 bg-slate-950/95 px-3 py-2.5 text-[10px] font-normal normal-case leading-relaxed tracking-normal text-slate-200 opacity-0 shadow-xl backdrop-blur-sm transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
      >
        {content}
        <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border-b border-r border-slate-700/80 bg-slate-950" aria-hidden="true" />
      </span>
    </span>
  )
}
