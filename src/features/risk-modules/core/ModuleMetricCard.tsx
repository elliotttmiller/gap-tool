import type { ReactNode } from "react"

export type MetricCardAccent = "slate" | "green" | "red" | "cyan" | "amber" | "blue"

const TONES: Record<MetricCardAccent, { bar: string; value: string; border: string }> = {
  slate: { bar: "bg-slate-500",   value: "text-slate-50",    border: "border-slate-800/80" },
  green: { bar: "bg-emerald-400", value: "text-emerald-300", border: "border-slate-800/80" },
  red:   { bar: "bg-rose-500",    value: "text-rose-300",    border: "border-slate-800/80" },
  cyan:  { bar: "bg-cyan-400",    value: "text-cyan-300",    border: "border-slate-800/80" },
  amber: { bar: "bg-amber-400",   value: "text-amber-300",   border: "border-slate-800/80" },
  blue:  { bar: "bg-blue-400",    value: "text-blue-300",    border: "border-slate-800/80" },
}

interface ModuleMetricCardProps {
  label: string
  value: ReactNode
  description?: string
  accent?: MetricCardAccent
  className?: string
}

export function ModuleMetricCard({
  label,
  value,
  description,
  accent = "slate",
  className,
}: ModuleMetricCardProps) {
  const tone = TONES[accent]

  return (
    <div className={`rounded-lg border ${tone.border} bg-slate-950/60 px-3.5 py-3 ${className ?? ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase leading-snug tracking-[0.15em] text-slate-500">{label}</p>
          <div className={`mt-1 text-xl font-bold leading-none tracking-tight ${tone.value}`}>{value}</div>
          {description && (
            <p className="mt-1.5 text-[11px] leading-snug text-slate-600">{description}</p>
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
