import type { ReactNode } from "react"
import { AdvisorInfoTooltip } from "@/components/ui/advisor-info-tooltip"

export type MetricCardAccent = "neutral" | "primary" | "positive" | "warning" | "negative"

const TONES: Record<MetricCardAccent, { bar: string; value: string; border: string }> = {
  neutral:  { bar: "bg-slate-500", value: "text-slate-50", border: "border-slate-800/80" },
  primary:  { bar: "bg-[#1db8b9]", value: "text-[#27aae1]", border: "border-slate-800/80" },
  positive: { bar: "bg-[#44b649]", value: "text-[#44b649]", border: "border-slate-800/80" },
  warning:  { bar: "bg-[#f15a29]", value: "text-[#f15a29]", border: "border-slate-800/80" },
  negative: { bar: "bg-[#f15a29]", value: "text-[#f15a29]", border: "border-slate-800/80" },
}

interface ModuleMetricCardProps {
  label: string
  value: ReactNode
  description?: string
  accent?: MetricCardAccent
  className?: string
  disclosure?: string
}

export function ModuleMetricCard({
  label,
  value,
  description,
  accent = "neutral",
  className,
  disclosure,
}: ModuleMetricCardProps) {
  const tone = TONES[accent] ?? TONES.neutral
  const info = [description, disclosure].filter(Boolean).join(" ")

  return (
    <div className={`module-metric-card rounded-lg border ${tone.border} bg-slate-950/60 px-3.5 py-3 ${className ?? ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5">
            <p className="module-metric-label text-[10px] font-bold uppercase leading-snug tracking-[0.15em] text-slate-500">{label}</p>
            {info ? <AdvisorInfoTooltip content={info} ariaLabel={`About ${label}`} /> : null}
          </div>
          <div className={`module-metric-value mt-1 text-xl font-bold leading-none tracking-tight ${tone.value}`}>{value}</div>
        </div>
        <div className={`mt-0.5 h-8 w-0.5 shrink-0 rounded-full ${tone.bar}`} />
      </div>
    </div>
  )
}

interface MetricGroupProps {
  title?: string
  children: ReactNode
}

export function MetricGroup({ children }: MetricGroupProps) {
  return (
    <div className="space-y-2">
      {children}
    </div>
  )
}

export function MetricGroupDivider() {
  return <div className="my-1 border-t border-slate-800/50" />
}

interface CompactMetricProps {
  label: string
  value: string
  accent?: MetricCardAccent
}

export function CompactMetric({ label, value, accent = "neutral" }: CompactMetricProps) {
  const valueColor: Record<MetricCardAccent, string> = {
    neutral: "text-slate-200",
    primary: "text-[#27aae1]",
    positive: "text-[#44b649]",
    warning: "text-[#f15a29]",
    negative: "text-[#f15a29]",
  }
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-slate-800/40 py-1.5 last:border-0">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span className={`text-xs font-semibold tabular-nums ${valueColor[accent]}`}>{value}</span>
    </div>
  )
}
