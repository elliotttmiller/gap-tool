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
  const gaugeMaxMonths = Math.max(6, idealMonths, Math.ceil(reserveMonths))
  const markerPct = Math.min(100, Math.max(0, (reserveMonths / gaugeMaxMonths) * 100))
  const dangerPct = Math.min(100, (1.5 / gaugeMaxMonths) * 100)
  const minimumPct = Math.min(100, (3 / gaugeMaxMonths) * 100)
  const idealPct = Math.min(100, (idealMonths / gaugeMaxMonths) * 100)
  const status = getReserveStatus(reserveMonths, idealMonths)
  const minimumGap = Math.max(0, outputs.minimumReserveTarget - outputs.currentReserveLevel)
  const idealGap = Math.max(0, outputs.idealReserveTarget - outputs.currentReserveLevel)
  const ticks = Array.from(new Set([0, 1.5, 3, idealMonths, gaugeMaxMonths])).sort((a, b) => a - b)

  return (
    <Card className="module-chart-card unemployment-chart-panel border-slate-800/80 bg-slate-950/60">
      <CardHeader className="px-5 pb-0 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Emergency Reserve Target Visualization
            </CardTitle>
            <p className="mt-1 text-xs leading-snug text-slate-400">
              Current reserves measured against the monthly-gap minimum and income-adjusted ideal
            </p>
          </div>
          <div className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-4">
        <div className="grid items-center gap-6 rounded-2xl border border-slate-800/70 bg-slate-950/70 px-5 py-5 sm:grid-cols-[12rem_minmax(0,1fr)]">
          <div className="relative mx-auto h-72 w-44" role="img" aria-label={`Current reserves cover ${reserveMonths.toFixed(1)} months; the minimum is 3 months and the ideal is ${idealMonths} months`}>
            <div className="absolute bottom-3 right-3 top-3 w-24 overflow-hidden rounded-[1.35rem] border border-slate-700/80 bg-slate-900 shadow-[inset_0_1px_2px_rgba(255,255,255,0.08),0_14px_30px_rgba(2,6,23,0.28)]">
              <div className="absolute inset-x-0 bottom-0 bg-rose-500/80" style={{ height: `${dangerPct}%` }} />
              <div className="absolute inset-x-0 bg-amber-500/75" style={{ bottom: `${dangerPct}%`, height: `${Math.max(0, minimumPct - dangerPct)}%` }} />
              <div className="absolute inset-x-0 bg-emerald-500/70" style={{ bottom: `${minimumPct}%`, height: `${Math.max(0, idealPct - minimumPct)}%` }} />
              <div className="absolute inset-x-0 top-0 bg-brand-700/65" style={{ height: `${Math.max(0, 100 - idealPct)}%` }} />
              <div className="absolute inset-x-0 border-t border-dashed border-white/60" style={{ bottom: `${minimumPct}%` }} />
              <div className="absolute inset-x-0 border-t border-dashed border-white/70" style={{ bottom: `${idealPct}%` }} />
              <span className="absolute inset-x-0 bottom-[8%] text-center text-[9px] font-bold uppercase tracking-widest text-white/85">Danger</span>
              {idealPct - minimumPct > 16 ? <span className="absolute inset-x-0 text-center text-[9px] font-bold uppercase tracking-widest text-white/85" style={{ bottom: `${minimumPct + (idealPct - minimumPct) / 2}%` }}>Minimum</span> : null}
              {100 - idealPct > 12 ? <span className="absolute inset-x-0 top-[8%] text-center text-[9px] font-bold uppercase tracking-widest text-white/85">Ideal+</span> : null}
            </div>

            {ticks.map((month) => (
              <div key={month} className="absolute left-0 right-28 flex -translate-y-1/2 items-center justify-end gap-1.5" style={{ bottom: `${12 + 264 * (month / gaugeMaxMonths)}px` }}>
                <span className="whitespace-nowrap text-[10px] font-medium tabular-nums text-slate-500">{month % 1 === 0 ? month : month.toFixed(1)} mo</span>
                <span className="h-px w-2 bg-slate-600" />
              </div>
            ))}

            <div className="absolute right-0 z-10 flex translate-y-1/2 items-center" style={{ bottom: `${12 + 264 * (markerPct / 100)}px` }}>
              <span className="h-px w-28 bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.75)]" />
              <span className="-ml-1 size-3 rounded-full border-2 border-white bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Current Position</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-cyan-300">{formatCurrency(outputs.currentReserveLevel)}</p>
              <p className="mt-1 text-sm font-semibold text-slate-300">{reserveMonths.toFixed(1)} months of the monthly gap covered</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-amber-800/40 bg-amber-950/20 px-3 py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400">3-Month Minimum</p>
                <p className="mt-1 text-sm font-bold text-slate-100">{formatCurrency(outputs.minimumReserveTarget)}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">{minimumGap > 0 ? `${formatCurrency(minimumGap)} still needed` : "Minimum funded"}</p>
              </div>
              <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/20 px-3 py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">{idealMonths}-Month Ideal</p>
                <p className="mt-1 text-sm font-bold text-slate-100">{formatCurrency(outputs.idealReserveTarget)}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">{idealGap > 0 ? `${formatCurrency(idealGap)} still needed` : "Ideal funded"}</p>
              </div>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500">The marker moves with current emergency savings. Thresholds scale from the modeled monthly gap after remaining household income.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function UnemploymentOutputView({ outputs }: UnemploymentOutputViewProps) {
  const monthlyGap = Math.max(0, outputs.monthlyBurnRate - outputs.remainingIncome)
  const currentRunway = monthlyGap > 0 ? outputs.currentReserveLevel / monthlyGap : 0
  const runwayAccent: "green" | "cyan" | "red" = currentRunway < 3 ? "red" : currentRunway < 6 ? "cyan" : "green"

  return (
    <div className="unemployment-output-container">
      {/* Advisor-approved target row: exactly two metrics above the visualization. */}
      <div className="grid grid-cols-2 gap-3">
        <ModuleMetricCard label="3 Month Minimum" value={formatCurrency(outputs.minimumReserveTarget)} description="Monthly gap × 3" accent="cyan" />
        <ModuleMetricCard label={`${outputs.idealReserveMonths} Month Ideal`} value={formatCurrency(outputs.idealReserveTarget)} description={`Monthly gap × ${outputs.idealReserveMonths}`} accent="green" />
      </div>

      <div className="mt-3">
        <ReservePositionPanel outputs={outputs} />
      </div>

      {/* Advisor-approved result row: exactly four metrics below the visualization. */}
      <div className="mt-3 grid grid-cols-4 gap-3">
        <ModuleMetricCard className={compactCardClass} label="Remaining Income" value={`${formatCurrency(outputs.remainingIncome)}/mo`} description="Net household income remaining" accent={outputs.remainingIncome > 0 ? "cyan" : "red"} />
        <ModuleMetricCard className={compactCardClass} label="Monthly Gap" value={`${formatCurrency(monthlyGap)}/mo`} description="Total expenses − remaining income" accent={monthlyGap > 0 ? "red" : "green"} />
        <ModuleMetricCard className={compactCardClass} label="Current Reserves" value={formatCurrency(outputs.currentReserveLevel)} description="Current emergency reserves" accent={outputs.currentReserveLevel > 0 ? "cyan" : "red"} />
        <ModuleMetricCard className={compactCardClass} label="Current Runway" value={formatMonths(currentRunway)} description="Reserves ÷ monthly gap" accent={runwayAccent} />
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
        {advisorSafeCopy.unemployment.netIncomeProxy} {advisorSafeCopy.unemployment.reserveDisclosure}
      </p>
    </div>
  )
}
