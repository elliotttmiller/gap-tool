import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModuleMetricCard } from "@/features/risk-modules/core/ModuleMetricCard"
import { advisorSafeCopy } from "@/domain/copy/advisorSafeCopy"
import { UnemploymentOutputs } from "../types"

interface UnemploymentOutputViewProps {
  outputs: UnemploymentOutputs
}

const compactCardClass = "unemployment-kpi-card"

function formatCurrency(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${value < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(2).replace(/\.00$/, "")}M`
  if (abs >= 1_000) return `${value < 0 ? "-" : ""}$${(abs / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return `${value < 0 ? "-" : ""}$${Math.round(abs)}`
}

function formatMonths(months: number): string {
  return `${months.toFixed(1)} mo`
}

function getReserveStatus(months: number, idealMonths: number): { label: string; tone: string } {
  if (months > idealMonths) return { label: "Above Target", tone: "text-cyan-300 border-cyan-800/60 bg-cyan-950/40" }
  if (months < 1.5) return { label: "Danger", tone: "text-rose-300 border-rose-800/60 bg-rose-950/40" }
  if (months < 3) return { label: "Below Minimum", tone: "text-amber-300 border-amber-800/60 bg-amber-950/40" }
  if (months < idealMonths) return { label: "Within Range", tone: "text-emerald-300 border-emerald-800/60 bg-emerald-950/40" }
  return { label: "Target Met", tone: "text-emerald-300 border-emerald-800/60 bg-emerald-950/40" }
}

function ReservePositionPanel({ outputs }: { outputs: UnemploymentOutputs }) {
  const reserveMonths = outputs.reserveMonthsCurrent
  const idealMonths = outputs.idealReserveMonths
  const gaugeMaxMonths = Math.max(6, idealMonths)
  const markerPct = Math.min(100, Math.max(0, (reserveMonths / gaugeMaxMonths) * 100))
  const dangerPct = Math.min(100, (1.5 / gaugeMaxMonths) * 100)
  const minimumPct = Math.min(100, (3 / gaugeMaxMonths) * 100)
  const idealPct = Math.min(100, (idealMonths / gaugeMaxMonths) * 100)
  const status = getReserveStatus(reserveMonths, idealMonths)

  return (
    <Card className="unemployment-chart-panel border-slate-800/80 bg-slate-950/60">
      <CardHeader className="px-5 pb-0 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Emergency Reserve Position
            </CardTitle>
            <p className="mt-1 text-xs leading-snug text-slate-400">
              Current emergency savings compared with the 6-month replacement target
            </p>
          </div>
          <div className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-4 pt-4">
        <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-4">
          <div className="relative h-5 overflow-hidden rounded-full bg-slate-900">
            <div className="absolute inset-y-0 left-0 bg-rose-500/65" style={{ width: `${dangerPct}%` }} />
            <div className="absolute inset-y-0 bg-amber-500/65" style={{ left: `${dangerPct}%`, width: `${Math.max(0, minimumPct - dangerPct)}%` }} />
            <div className="absolute inset-y-0 bg-emerald-500/65" style={{ left: `${minimumPct}%`, width: `${Math.max(0, idealPct - minimumPct)}%` }} />
            <div className="absolute inset-y-0 left-0 bg-sky-300/55" style={{ width: `${markerPct}%` }} />
            <div className="absolute top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]" style={{ left: `${markerPct}%` }} />
          </div>
          <div className="relative mt-2 h-4 text-[10px] font-medium text-slate-500">
            <span className="absolute left-0">0 mo</span>
            <span className="absolute -translate-x-1/2" style={{ left: `${minimumPct}%` }}>3 mo minimum</span>
            <span className="absolute right-0">6+ mo ideal</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function UnemploymentOutputView({ outputs }: UnemploymentOutputViewProps) {
  const runwayAccent: "green" | "cyan" | "red" = outputs.reserveMonthsCurrent < 3 ? "red" : outputs.reserveMonthsCurrent < outputs.idealReserveMonths ? "cyan" : "green"

  return (
    <div className="unemployment-output-container">
      <div className="grid grid-cols-2 gap-3">
        <ModuleMetricCard className={compactCardClass} label="3 Month Target" value={formatCurrency(outputs.minimumReserveTarget)} description="Monthly gap × 3" accent="cyan" />
        <ModuleMetricCard className={compactCardClass} label="6 Month Target" value={formatCurrency(outputs.idealReserveTarget)} description="Monthly gap × 6" accent="green" />
      </div>

      <div className="mt-3">
        <ReservePositionPanel outputs={outputs} />
      </div>

      <div className="unemployment-metric-grid mt-3">
        <ModuleMetricCard className={compactCardClass} label="Remaining Income" value={`${formatCurrency(outputs.remainingIncome)}/mo`} description="Net household income remaining" accent={outputs.remainingIncome > 0 ? "cyan" : "red"} />
        <ModuleMetricCard className={compactCardClass} label="Monthly Gap" value={`${formatCurrency(outputs.monthlyExpenseReplacement)}/mo`} description="Total expenses − remaining income" accent={outputs.monthlyExpenseReplacement > 0 ? "red" : "green"} />
        <ModuleMetricCard className={compactCardClass} label="Current Reserves" value={formatCurrency(outputs.currentReserveLevel)} description="Current emergency reserves" accent={outputs.currentReserveLevel > 0 ? "cyan" : "red"} />
        <ModuleMetricCard className={compactCardClass} label="Current Runway" value={formatMonths(outputs.reserveMonthsCurrent)} description="Reserves ÷ monthly gap" accent={runwayAccent} />
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
        {advisorSafeCopy.unemployment.netIncomeProxy} {advisorSafeCopy.unemployment.reserveDisclosure}
      </p>
    </div>
  )
}
