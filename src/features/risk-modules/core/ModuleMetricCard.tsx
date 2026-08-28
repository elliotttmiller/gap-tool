import type { ReactNode } from "react"

export type MetricCardAccent = "neutral" | "primary" | "positive" | "warning" | "negative"

const TONES: Record<MetricCardAccent, { bar: string; value: string; border: string }> = {
  neutral:  { bar: "bg-slate-500", value: "text-slate-50", border: "border-slate-800/80" },
  primary:  { bar: "bg-[#188a89]", value: "text-[#1b75bc] dark:text-[#7fccef]", border: "border-slate-800/80" },
  positive: { bar: "bg-[#44b649]", value: "text-[#148f45] dark:text-[#75d27a]", border: "border-slate-800/80" },
  warning:  { bar: "bg-[#fbb040]", value: "text-[#9a4a14] dark:text-[#ffd084]", border: "border-slate-800/80" },
  negative: { bar: "bg-[#f15a29]", value: "text-[#c13f17] dark:text-[#ff9a78]", border: "border-slate-800/80" },
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
  // Keep the fallback resilient across hot reloads and persisted presentation state.
  const tone = TONES[accent] ?? TONES.neutral

  return (
    <div className={`module-metric-card rounded-lg border ${tone.border} bg-slate-950/60 px-3.5 py-3 ${className ?? ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="module-metric-label text-[10px] font-bold uppercase leading-snug tracking-[0.15em] text-slate-500">{label}</p>
          <div className={`module-metric-value mt-1 text-xl font-bold leading-none tracking-tight ${tone.value}`}>{value}</div>
          {description && (
            <p className="module-metric-description mt-1.5 text-[11px] leading-snug text-slate-600">{description}</p>
          )}
          {disclosure && (
            <p className="module-metric-disclosure mt-2 border-t border-slate-800/50 pt-1.5 text-[10px] italic leading-snug text-slate-700">{disclosure}</p>
          )}
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

// ── Compact inline metric row ─────────────────────────────────────────────────

interface CompactMetricProps {
  label: string
  value: string
  accent?: MetricCardAccent
}

export function CompactMetric({ label, value, accent = "neutral" }: CompactMetricProps) {
  const valueColor: Record<MetricCardAccent, string> = {
    neutral: "text-slate-200",
    primary: "text-[#1b75bc] dark:text-[#7fccef]",
    positive: "text-[#148f45] dark:text-[#75d27a]",
    warning: "text-[#9a4a14] dark:text-[#ffd084]",
    negative: "text-[#c13f17] dark:text-[#ff9a78]",
  }
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-slate-800/40 py-1.5 last:border-0">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span className={`text-xs font-semibold tabular-nums ${valueColor[accent]}`}>{value}</span>
    </div>
  )
}
