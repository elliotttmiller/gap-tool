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
  const targetCoveragePct = outputs.idealReserveTarget > 0 ? Math.min(100, (outputs.currentReserveLevel / outputs.idealReserveTarget) * 100) : 100

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
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Current Savings</p>
            <p className="mt-1 text-lg font-bold leading-none text-cyan-300">{formatCurrency(outputs.currentReserveLevel)}</p>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Current Runway</p>
            <p className="mt-1 text-lg font-bold leading-none text-cyan-300">{formatMonths(reserveMonths)}</p>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Ideal Target</p>
            <p className="mt-1 text-lg font-bold leading-none text-slate-100">{formatCurrency(outputs.idealReserveTarget)}</p>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Target Covered</p>
            <p className="mt-1 text-lg font-bold leading-none text-emerald-300">{Math.round(targetCoveragePct)}%</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-4">
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
  const gapAccent: "green" | "red" = outputs.reserveGap > 0 ? "red" : "green"
  const gapValue = outputs.reserveGap > 0 ? formatCurrency(outputs.reserveGap) : "$0"

  return (
    <div className="unemployment-output-container">
      <div className="unemployment-visual-dashboard">
        <ReservePositionPanel outputs={outputs} />

        <div className="unemployment-metric-grid">
          <ModuleMetricCard className={compactCardClass} label="Monthly Expense Replacement" value={`${formatCurrency(outputs.monthlyExpenseReplacement)}/mo`} description="Monthly expenses minus lower income" accent={outputs.monthlyExpenseReplacement > 0 ? "cyan" : "green"} />
          <ModuleMetricCard className={compactCardClass} label="Current Savings" value={formatCurrency(outputs.currentReserveLevel)} description="Liquid emergency savings" accent={outputs.currentReserveLevel > 0 ? "cyan" : "red"} />
          <ModuleMetricCard className={compactCardClass} label="Current Reserve Runway" value={formatMonths(outputs.reserveMonthsCurrent)} description="Savings ÷ replacement need" accent={runwayAccent} />
          <ModuleMetricCard className={compactCardClass} label="Ideal Reserve Target" value={formatCurrency(outputs.idealReserveTarget)} description="Replacement need × 6 months" accent="slate" />
          <ModuleMetricCard className={compactCardClass} label="Emergency Reserve Shortfall" value={gapValue} description="Ideal target minus savings" accent={gapAccent} />
        </div>
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
        {advisorSafeCopy.unemployment.netIncomeProxy} {advisorSafeCopy.unemployment.reserveDisclosure}
      </p>
    </div>
  )
}
