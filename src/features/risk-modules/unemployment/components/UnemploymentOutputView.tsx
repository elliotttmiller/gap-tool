import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModuleMetricCard } from "@/features/risk-modules/core/ModuleMetricCard"
import { advisorSafeCopy } from "@/domain/copy/advisorSafeCopy"
import { UnemploymentOutputs } from "../types"
import { useRef, useState } from "react"
import { MoveVertical } from "lucide-react"

interface UnemploymentOutputViewProps {
  outputs: UnemploymentOutputs
  onReserveLevelChange?: (value: number) => void
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

function ReservePositionPanel({ outputs, onReserveLevelChange }: UnemploymentOutputViewProps) {
  const reserveMonths = outputs.reserveMonthsCurrent
  const idealMonths = outputs.idealReserveMonths
  const naturalGaugeMax = Math.max(9, idealMonths + 3, Math.ceil(reserveMonths))
  const [dragScale, setDragScale] = useState<number | null>(null)
  const gaugeMaxMonths = dragScale ?? naturalGaugeMax
  const barRef = useRef<HTMLDivElement>(null)
  const canAdjust = Boolean(onReserveLevelChange && outputs.monthlyGapAtDepletion > 0)
  const markerPct = Math.min(100, Math.max(0, (reserveMonths / gaugeMaxMonths) * 100))
  const dangerPct = Math.min(100, (1.5 / gaugeMaxMonths) * 100)
  const minimumPct = Math.min(100, (3 / gaugeMaxMonths) * 100)
  const idealPct = Math.min(100, (idealMonths / gaugeMaxMonths) * 100)
  const status = getReserveStatus(reserveMonths, idealMonths)
  const ticks = Array.from(new Set([0, 1.5, 3, idealMonths, gaugeMaxMonths])).sort((a, b) => a - b)

  function setMonthsFromClientY(clientY: number) {
    const rect = barRef.current?.getBoundingClientRect()
    if (!rect || !onReserveLevelChange || outputs.monthlyGapAtDepletion <= 0) return
    const ratio = Math.max(0, Math.min(1, (rect.bottom - clientY) / rect.height))
    const months = ratio * gaugeMaxMonths
    onReserveLevelChange(Math.round(months * outputs.monthlyGapAtDepletion))
  }

  function nudgeMonths(delta: number) {
    if (!onReserveLevelChange || outputs.monthlyGapAtDepletion <= 0) return
    const months = Math.max(0, Math.min(gaugeMaxMonths, reserveMonths + delta))
    onReserveLevelChange(Math.round(months * outputs.monthlyGapAtDepletion))
  }

  return (
    <Card className="module-chart-card unemployment-chart-panel border-slate-800/80 bg-slate-950/60">
      <CardHeader className="px-5 pb-0 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Emergency Reserve Target Visualization
            </CardTitle>
            <p className="mt-1 text-xs leading-snug text-slate-400">
              Current reserves measured against the monthly-gap minimum and income-adjusted ideal; temporary transition benefits are shown below
            </p>
          </div>
          <div className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-4">
        <div className="unemployment-reserve-plot grid min-h-[25rem] gap-5 rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 lg:grid-cols-[13rem_minmax(20rem,1fr)_13rem] lg:items-center">
          <aside className="grid grid-cols-2 gap-3 lg:flex lg:flex-col" aria-label="Reserve targets">
            <div className="col-span-2 px-1 lg:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Reserve Targets</p>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-600">Calculated from the current monthly income gap.</p>
            </div>
            <ModuleMetricCard className={compactCardClass} label="3 Month Minimum" value={formatCurrency(outputs.minimumReserveTarget)} description="Monthly gap × 3" accent="cyan" />
            <ModuleMetricCard className={compactCardClass} label={`${outputs.idealReserveMonths} Month Ideal`} value={formatCurrency(outputs.idealReserveTarget)} description={`Monthly gap × ${outputs.idealReserveMonths}`} accent="green" />
          </aside>

          <div className="flex min-w-0 items-center justify-center py-1">
          <div className="relative h-[22rem] w-full max-w-[26rem]" role="img" aria-label={`Current reserves cover ${reserveMonths.toFixed(1)} months; the minimum is 3 months and the ideal is ${idealMonths} months`}>
            <div ref={barRef} className="absolute bottom-3 left-1/2 top-3 w-28 -translate-x-1/2 overflow-hidden rounded-[1.5rem] border border-slate-700/80 bg-slate-900 shadow-[inset_0_1px_2px_rgba(255,255,255,0.08),0_18px_38px_rgba(2,6,23,0.32)]">
              <div className="absolute inset-x-0 bottom-0 bg-rose-500/80 transition-[height] duration-500 ease-out" style={{ height: `${dangerPct}%` }} />
              <div className="absolute inset-x-0 bg-amber-500/75 transition-[bottom,height] duration-500 ease-out" style={{ bottom: `${dangerPct}%`, height: `${Math.max(0, minimumPct - dangerPct)}%` }} />
              <div className="absolute inset-x-0 bg-emerald-500/70 transition-[bottom,height] duration-500 ease-out" style={{ bottom: `${minimumPct}%`, height: `${Math.max(0, idealPct - minimumPct)}%` }} />
              <div className="absolute inset-x-0 top-0 bg-brand-700/65 transition-[height] duration-500 ease-out" style={{ height: `${Math.max(0, 100 - idealPct)}%` }} />
              <div className="absolute inset-x-0 border-t border-dashed border-white/60" style={{ bottom: `${minimumPct}%` }} />
              <div className="absolute inset-x-0 border-t border-dashed border-white/70" style={{ bottom: `${idealPct}%` }} />
              <span className="absolute inset-x-0 bottom-[8%] text-center text-[9px] font-bold uppercase tracking-widest text-white/85">Danger</span>
              {minimumPct - dangerPct > 12 ? <span className="absolute inset-x-0 text-center text-[9px] font-bold uppercase tracking-widest text-white/85" style={{ bottom: `${dangerPct + (minimumPct - dangerPct) / 2}%` }}>Below Minimum</span> : null}
              {idealPct - minimumPct > 16 ? <span className="absolute inset-x-0 text-center text-[9px] font-bold uppercase tracking-widest text-white/85" style={{ bottom: `${minimumPct + Math.min(8, (idealPct - minimumPct) * 0.2)}%` }}>Target Range</span> : null}
              {100 - idealPct > 12 ? <span className="absolute inset-x-0 top-[8%] text-center text-[9px] font-bold uppercase tracking-widest text-white/85">Ideal+</span> : null}
            </div>

            {canAdjust ? (
              <div
                role="slider"
                tabIndex={0}
                aria-label="Current emergency reserve coverage"
                aria-valuemin={0}
                aria-valuemax={gaugeMaxMonths}
                aria-valuenow={Number(reserveMonths.toFixed(2))}
                aria-valuetext={`${reserveMonths.toFixed(1)} months, ${formatCurrency(outputs.currentReserveLevel)}`}
                title="Drag to adjust current emergency savings"
                className="peer absolute bottom-3 left-1/2 top-3 z-20 w-40 -translate-x-1/2 touch-none cursor-ns-resize rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId)
                  setDragScale(naturalGaugeMax)
                  setMonthsFromClientY(event.clientY)
                }}
                onPointerMove={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) setMonthsFromClientY(event.clientY)
                }}
                onPointerUp={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
                  setDragScale(null)
                }}
                onPointerCancel={() => setDragScale(null)}
                onLostPointerCapture={() => setDragScale(null)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowUp" || event.key === "ArrowRight") { event.preventDefault(); nudgeMonths(event.shiftKey ? 1 : 0.25) }
                  if (event.key === "ArrowDown" || event.key === "ArrowLeft") { event.preventDefault(); nudgeMonths(event.shiftKey ? -1 : -0.25) }
                  if (event.key === "Home") { event.preventDefault(); nudgeMonths(-reserveMonths) }
                  if (event.key === "End") { event.preventDefault(); nudgeMonths(gaugeMaxMonths - reserveMonths) }
                }}
              />
            ) : null}

            {ticks.map((month) => (
              <div key={month} className="pointer-events-none absolute bottom-3 left-0 right-[calc(50%+3.5rem)] top-3">
                <div className="absolute inset-x-0 flex -translate-y-1/2 items-center justify-end gap-1.5" style={{ bottom: `${(month / gaugeMaxMonths) * 100}%` }}>
                  <span className="whitespace-nowrap text-[10px] font-medium tabular-nums text-slate-500">{month % 1 === 0 ? month : month.toFixed(1)} mo</span>
                  <span className="h-px w-2 bg-slate-600" />
                </div>
              </div>
            ))}

            <div className="pointer-events-none absolute bottom-3 left-[calc(50%-3.5rem)] right-0 top-3 z-10">
              <div className="absolute inset-x-0 flex translate-y-1/2 items-center transition-[bottom] duration-500 ease-out" style={{ bottom: `${markerPct}%` }}>
                <span className={`h-[3px] w-28 rounded-full bg-gradient-to-r from-cyan-400/10 via-cyan-300/70 to-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.4)] transition-all duration-200 peer-hover:h-1 peer-hover:shadow-[0_0_16px_rgba(34,211,238,0.65)] ${dragScale !== null ? "h-1 shadow-[0_0_18px_rgba(34,211,238,0.8)]" : ""}`} />
                <span className={`relative -ml-2 flex size-5 items-center justify-center rounded-full border-2 border-cyan-100 bg-slate-950 shadow-[0_0_0_4px_rgba(34,211,238,0.12),0_0_16px_rgba(34,211,238,0.75)] transition-transform duration-200 peer-hover:scale-110 ${dragScale !== null ? "scale-110" : ""}`}>
                  <span className={`size-2 rounded-full bg-cyan-300 ${dragScale !== null ? "animate-pulse" : ""}`} />
                </span>
                <span className={`ml-2 flex items-center gap-2 rounded-xl border border-cyan-700/60 bg-slate-950/95 px-2.5 py-1.5 whitespace-nowrap shadow-[0_8px_24px_rgba(2,6,23,0.45)] backdrop-blur transition-all duration-200 peer-hover:-translate-y-0.5 peer-hover:border-cyan-500/70 ${dragScale !== null ? "-translate-y-0.5 border-cyan-400/80 shadow-[0_10px_28px_rgba(8,145,178,0.22)]" : ""}`}>
                  <span className="flex flex-col leading-none">
                    <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">Current</span>
                    <span className="mt-1 text-[11px] font-bold tabular-nums text-cyan-200">{reserveMonths.toFixed(1)} mo</span>
                  </span>
                  {canAdjust ? <MoveVertical className="size-3.5 text-cyan-400" aria-hidden="true" /> : null}
                </span>
              </div>
            </div>
          </div>
          </div>
          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  )
}

export function UnemploymentOutputView({ outputs, onReserveLevelChange }: UnemploymentOutputViewProps) {
  const monthlyGap = Math.max(0, outputs.monthlyBurnRate - outputs.remainingIncome)
  const currentRunway = monthlyGap > 0 ? outputs.currentReserveLevel / monthlyGap : 0
  const runwayAccent: "green" | "cyan" | "red" = currentRunway < 3 ? "red" : currentRunway < 6 ? "cyan" : "green"

  return (
    <div className="unemployment-output-container">
      <ReservePositionPanel outputs={outputs} onReserveLevelChange={onReserveLevelChange} />

      {/* Advisor-approved result row: exactly four metrics below the visualization. */}
      <div className="mt-3 grid grid-cols-4 gap-3">
        <ModuleMetricCard className={compactCardClass} label="Remaining Income" value={`${formatCurrency(outputs.remainingIncome)}/mo`} description="Net household income remaining" accent={outputs.remainingIncome > 0 ? "cyan" : "red"} />
        <ModuleMetricCard className={compactCardClass} label="Monthly Gap" value={`${formatCurrency(monthlyGap)}/mo`} description="Total expenses − remaining income" accent={monthlyGap > 0 ? "red" : "green"} />
        <ModuleMetricCard className={compactCardClass} label="Current Reserves" value={formatCurrency(outputs.currentReserveLevel)} description="Current emergency reserves" accent={outputs.currentReserveLevel > 0 ? "cyan" : "red"} />
        <ModuleMetricCard className={compactCardClass} label="Current Runway" value={formatMonths(currentRunway)} description="Reserves ÷ monthly gap" accent={runwayAccent} />
      </div>

      <div className="unemployment-metric-grid mt-3">
        <ModuleMetricCard className={compactCardClass} label="Search-Period Expenses" value={formatCurrency(outputs.totalExpensesDuringSearch)} description="Monthly expenses × entered search duration" accent="slate" />
        <ModuleMetricCard className={compactCardClass} label="Transition Income Offsets" value={formatCurrency(outputs.totalOffsetDuringSearch)} description="Remaining income + severance + unemployment benefits" accent={outputs.totalOffsetDuringSearch > 0 ? "cyan" : "red"} />
        <ModuleMetricCard className={compactCardClass} label="Reserve Draw" value={formatCurrency(outputs.coveredBySavings)} description="Search-period need funded from emergency savings" accent={outputs.coveredBySavings > 0 ? "amber" : "slate"} />
        <ModuleMetricCard className={compactCardClass} label="Uncovered Shortfall" value={formatCurrency(outputs.remainingShortfall)} description="Cash need remaining after offsets and reserves" accent={outputs.remainingShortfall > 0 ? "red" : "green"} />
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
        {advisorSafeCopy.unemployment.netIncomeProxy} {advisorSafeCopy.unemployment.reserveDisclosure}
      </p>
    </div>
  )
}
