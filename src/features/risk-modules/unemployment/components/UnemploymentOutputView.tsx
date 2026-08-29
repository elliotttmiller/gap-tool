import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModuleMetricCard } from "@/features/risk-modules/core/ModuleMetricCard"
import { advisorSafeCopy } from "@/domain/copy/advisorSafeCopy"
import { UnemploymentOutputs } from "../types"
import { useEffect, useRef, useState } from "react"
import { MoveVertical } from "lucide-react"

interface UnemploymentOutputViewProps {
  outputs: UnemploymentOutputs
  /**
   * Interactive reserve marker callback.
   * Dragging the month marker updates liquid emergency savings only:
   * emergencySavings = selectedRunwayMonths × monthlyExpenseReplacement.
   * Monthly gap remains driven by expenses minus remaining income.
   */
  onReserveLevelChange?: (value: number) => void
}

const compactCardClass = "unemployment-kpi-card"
const SAVINGS_DRAG_STEP = 250

interface ReserveBandLabelProps {
  label: string
  lowerPct: number
  upperPct: number
}

function ReserveBandLabel({ label, lowerPct, upperPct }: ReserveBandLabelProps) {
  const bandHeight = Math.max(0, upperPct - lowerPct)
  if (bandHeight === 0) return null

  return (
    <span
      className="pointer-events-none absolute inset-x-0 translate-y-1/2 text-center text-[9px] font-bold uppercase tracking-widest text-white/85"
      style={{ bottom: `${lowerPct + bandHeight / 2}%` }}
    >
      {label}
    </span>
  )
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step
}

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
  if (months > idealMonths) return { label: "Above Target", tone: "border-[#91b8f2] bg-[#eaf2ff] text-[#285b9f] dark:border-[#6f96ea]/70 dark:bg-[#31558f]/40 dark:text-[#cfe0ff]" }
  if (months < 1.5) return { label: "Danger", tone: "border-[#f3a398] bg-[#fde9e6] text-[#a92d20] dark:border-[#f47a5f]/70 dark:bg-[#8f3124]/45 dark:text-[#ffc7bf]" }
  if (months < 3) return { label: "Below Minimum", tone: "border-[#efc471] bg-[#fff4dc] text-[#85500d] dark:border-[#f5b955]/70 dark:bg-[#76531d]/45 dark:text-[#ffe0a1]" }
  if (months < idealMonths) return { label: "Within Range", tone: "border-[#93d3aa] bg-[#e9f7ed] text-[#236c3e] dark:border-[#65c78a]/70 dark:bg-[#286743]/45 dark:text-[#c5f2d4]" }
  return { label: "Target Met", tone: "border-[#93d3aa] bg-[#e9f7ed] text-[#236c3e] dark:border-[#65c78a]/70 dark:bg-[#286743]/45 dark:text-[#c5f2d4]" }
}

function ReservePositionPanel({ outputs, onReserveLevelChange }: UnemploymentOutputViewProps) {
  const reserveMonths = outputs.reserveMonthsCurrent
  const idealMonths = outputs.idealReserveMonths
  const naturalGaugeMax = Math.max(6, idealMonths, Math.ceil(reserveMonths))
  const [dragScale, setDragScale] = useState<number | null>(null)
  const [dragPreviewDollars, setDragPreviewDollars] = useState<number | null>(null)
  const gaugeMaxMonths = dragScale ?? naturalGaugeMax
  const barRef = useRef<HTMLDivElement>(null)
  const dragRectRef = useRef<DOMRect | null>(null)
  const isDraggingRef = useRef(false)
  const pendingCommitRef = useRef<number | null>(null)
  const commitFrameRef = useRef<number | null>(null)
  const canAdjust = Boolean(onReserveLevelChange && outputs.monthlyGapAtDepletion > 0)
  const displayedReserveDollars = dragPreviewDollars ?? outputs.currentReserveLevel
  const displayedReserveMonths = outputs.monthlyGapAtDepletion > 0
    ? displayedReserveDollars / outputs.monthlyGapAtDepletion
    : reserveMonths
  const markerPct = Math.min(100, Math.max(0, (displayedReserveMonths / gaugeMaxMonths) * 100))
  const dangerPct = Math.min(100, (1.5 / gaugeMaxMonths) * 100)
  const minimumPct = Math.min(100, (3 / gaugeMaxMonths) * 100)
  const idealPct = Math.min(100, (idealMonths / gaugeMaxMonths) * 100)
  const status = getReserveStatus(displayedReserveMonths, idealMonths)
  const ticks = Array.from(new Set([0, 1.5, 3, idealMonths, gaugeMaxMonths])).sort((a, b) => a - b)

  // Snapped to SAVINGS_DRAG_STEP and floored so a rounded value can never
  // push reserveMonths past gaugeMaxMonths (keeps aria-valuenow <= aria-valuemax).
  const maxSnappedDollars = Math.floor((gaugeMaxMonths * outputs.monthlyGapAtDepletion) / SAVINGS_DRAG_STEP) * SAVINGS_DRAG_STEP

  useEffect(() => () => {
    if (commitFrameRef.current !== null) cancelAnimationFrame(commitFrameRef.current)
  }, [])

  function dollarsFromClientY(clientY: number, scaleMonths = gaugeMaxMonths): number | null {
    const rect = dragRectRef.current ?? barRef.current?.getBoundingClientRect()
    if (!rect || rect.height <= 0 || outputs.monthlyGapAtDepletion <= 0) return null
    const ratio = Math.max(0, Math.min(1, (rect.bottom - clientY) / rect.height))
    const months = ratio * scaleMonths
    const maxDollars = Math.floor((scaleMonths * outputs.monthlyGapAtDepletion) / SAVINGS_DRAG_STEP) * SAVINGS_DRAG_STEP
    const snapped = roundToStep(months * outputs.monthlyGapAtDepletion, SAVINGS_DRAG_STEP)
    return Math.max(0, Math.min(maxDollars, snapped))
  }

  function scheduleReserveCommit(value: number) {
    if (!onReserveLevelChange) return
    pendingCommitRef.current = value
    if (commitFrameRef.current !== null) return
    commitFrameRef.current = requestAnimationFrame(() => {
      commitFrameRef.current = null
      const pending = pendingCommitRef.current
      pendingCommitRef.current = null
      if (pending !== null) onReserveLevelChange(pending)
    })
  }

  function updateDrag(clientY: number, scaleMonths = gaugeMaxMonths) {
    const nextDollars = dollarsFromClientY(clientY, scaleMonths)
    if (nextDollars === null) return
    // The marker follows the pointer from local state immediately. Persisted
    // inputs/calculations are limited to one update per animation frame so a
    // high-frequency pointer stream cannot stall the drag interaction.
    setDragPreviewDollars(nextDollars)
    scheduleReserveCommit(nextDollars)
  }

  function finishDrag(finalClientY?: number) {
    if (!isDraggingRef.current) return
    if (finalClientY !== undefined) {
      const finalDollars = dollarsFromClientY(finalClientY, dragScale ?? naturalGaugeMax)
      if (finalDollars !== null) {
        setDragPreviewDollars(finalDollars)
        pendingCommitRef.current = finalDollars
      }
    }

    if (commitFrameRef.current !== null) {
      cancelAnimationFrame(commitFrameRef.current)
      commitFrameRef.current = null
    }
    const finalCommit = pendingCommitRef.current
    pendingCommitRef.current = null
    if (finalCommit !== null) onReserveLevelChange?.(finalCommit)

    isDraggingRef.current = false
    dragRectRef.current = null
    setDragScale(null)
    setDragPreviewDollars(null)
  }

  function nudgeMonths(delta: number) {
    if (!onReserveLevelChange || outputs.monthlyGapAtDepletion <= 0) return
    // Anchor off the already-snapped current value so every keypress moves
    // by a full step instead of rounding back to the same amount.
    const currentSnappedDollars = roundToStep(outputs.currentReserveLevel, SAVINGS_DRAG_STEP)
    const deltaDollars = roundToStep(delta * outputs.monthlyGapAtDepletion, SAVINGS_DRAG_STEP) || Math.sign(delta) * SAVINGS_DRAG_STEP
    const nextDollars = currentSnappedDollars + deltaDollars
    onReserveLevelChange(Math.max(0, Math.min(maxSnappedDollars, nextDollars)))
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
              Current liquid emergency savings measured against the monthly-gap minimum and six-month ideal target
            </p>
          </div>
          <div className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-4">
        <div className="unemployment-reserve-plot grid min-h-[25rem] gap-5 rounded-2xl bg-slate-950/70 p-5 lg:grid-cols-[13rem_minmax(20rem,1fr)_13rem] lg:items-center">
          <aside className="grid grid-cols-2 gap-3 lg:flex lg:flex-col" aria-label="Reserve targets">
            <div className="col-span-2 px-1 lg:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Reserve Targets</p>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-600">
                Calculated from Monthly Gap only.
              </p>
            </div>
            <ModuleMetricCard className={compactCardClass} label="3 Month Target" value={formatCurrency(outputs.minimumReserveTarget)} description="Monthly gap × 3" accent="primary" />
            <ModuleMetricCard className={compactCardClass} label="6 Month Target" value={formatCurrency(outputs.idealReserveTarget)} description="Monthly gap × 6" accent="primary" />
          </aside>

          <div className="flex min-w-0 items-center justify-center py-1">
            <div className="relative h-[22rem] w-full max-w-[26rem]" role="img" aria-label={`Current liquid emergency savings cover ${displayedReserveMonths.toFixed(1)} months; the minimum is 3 months and the ideal is ${idealMonths} months`}>
              <div ref={barRef} className="absolute bottom-3 left-1/2 top-3 w-28 -translate-x-1/2 overflow-hidden rounded-[1.5rem] border border-slate-700/80 bg-slate-900 shadow-[inset_0_1px_2px_rgba(255,255,255,0.08),0_18px_38px_rgba(2,6,23,0.32)]">
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[#ed5a46] to-[#f47a5f] transition-[height] duration-500 ease-out" style={{ height: `${dangerPct}%` }} />
                <div className="absolute inset-x-0 bg-linear-to-t from-[#f2aa45] to-[#f8c76b] transition-[bottom,height] duration-500 ease-out" style={{ bottom: `${dangerPct}%`, height: `${Math.max(0, minimumPct - dangerPct)}%` }} />
                <div className="absolute inset-x-0 bg-linear-to-t from-[#4eb979] to-[#79cf95] transition-[bottom,height] duration-500 ease-out" style={{ bottom: `${minimumPct}%`, height: `${Math.max(0, idealPct - minimumPct)}%` }} />
                <div className="absolute inset-x-0 top-0 bg-linear-to-t from-[#5279d8] to-[#7399e8] transition-[height] duration-500 ease-out" style={{ height: `${Math.max(0, 100 - idealPct)}%` }} />
                <div className="absolute inset-x-0 border-t border-dashed border-white/60" style={{ bottom: `${minimumPct}%` }} />
                <div className="absolute inset-x-0 border-t border-dashed border-white/70" style={{ bottom: `${idealPct}%` }} />
                <ReserveBandLabel label="Danger" lowerPct={0} upperPct={dangerPct} />
                <ReserveBandLabel label="Below Minimum" lowerPct={dangerPct} upperPct={minimumPct} />
                <ReserveBandLabel label="Target Range" lowerPct={minimumPct} upperPct={idealPct} />
                <ReserveBandLabel label="Ideal+" lowerPct={idealPct} upperPct={100} />
              </div>

              {canAdjust ? (
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label="Liquid emergency savings coverage"
                  aria-valuemin={0}
                  aria-valuemax={gaugeMaxMonths}
                  aria-valuenow={Number(displayedReserveMonths.toFixed(2))}
                  aria-valuetext={`${displayedReserveMonths.toFixed(1)} months of runway, ${formatCurrency(displayedReserveDollars)} liquid emergency savings`}
                  title="Drag to model liquid emergency savings. Monthly gap is controlled by expenses and remaining income."
                  className="peer absolute bottom-3 left-1/2 top-3 z-20 w-40 -translate-x-1/2 touch-none cursor-ns-resize rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  onPointerDown={(event) => {
                    event.preventDefault()
                    dragRectRef.current = barRef.current?.getBoundingClientRect() ?? null
                    isDraggingRef.current = true
                    setDragScale(naturalGaugeMax)
                    event.currentTarget.setPointerCapture(event.pointerId)
                    updateDrag(event.clientY, naturalGaugeMax)
                  }}
                  onPointerMove={(event) => {
                    if (isDraggingRef.current && event.currentTarget.hasPointerCapture(event.pointerId)) updateDrag(event.clientY, dragScale ?? naturalGaugeMax)
                  }}
                  onPointerUp={(event) => {
                    finishDrag(event.clientY)
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
                  }}
                  onPointerCancel={() => finishDrag()}
                  onLostPointerCapture={() => finishDrag()}
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
                  <div className="absolute inset-x-0 flex translate-y-1/2 items-center justify-end gap-1.5" style={{ bottom: `${(month / gaugeMaxMonths) * 100}%` }}>
                    <span className="whitespace-nowrap text-[10px] font-medium tabular-nums text-slate-500">{month % 1 === 0 ? month : month.toFixed(1)} mo</span>
                    <span className="h-px w-2 bg-slate-600" />
                  </div>
                </div>
              ))}

              <div className="pointer-events-none absolute bottom-3 left-[calc(50%-3.5rem)] right-0 top-3 z-10">
                <div className={`absolute inset-x-0 flex translate-y-1/2 items-center ${dragScale !== null ? "transition-none" : "transition-[bottom] duration-150 ease-out"}`} style={{ bottom: `${markerPct}%` }}>
                  <span className={`h-[3px] w-28 rounded-full bg-gradient-to-r from-cyan-400/10 via-cyan-300/70 to-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.4)] transition-all duration-150 peer-hover:h-1 peer-hover:shadow-[0_0_16px_rgba(34,211,238,0.65)] ${dragScale !== null ? "h-1 shadow-[0_0_18px_rgba(34,211,238,0.8)]" : ""}`} />
                  <span className={`relative -ml-2 flex size-5 items-center justify-center rounded-full border-2 border-cyan-100 bg-slate-950 shadow-[0_0_0_4px_rgba(34,211,238,0.12),0_0_16px_rgba(34,211,238,0.75)] transition-transform duration-150 peer-hover:scale-110 ${dragScale !== null ? "scale-110" : ""}`}>
                    <span className="size-2 rounded-full bg-cyan-300" />
                  </span>
                  <span className={`ml-2 flex items-center gap-2 rounded-xl border border-cyan-700/60 bg-slate-950/95 px-2.5 py-1.5 whitespace-nowrap shadow-[0_8px_24px_rgba(2,6,23,0.45)] backdrop-blur transition-[transform,border-color,box-shadow] duration-150 peer-hover:-translate-y-0.5 peer-hover:border-cyan-500/70 ${dragScale !== null ? "-translate-y-0.5 border-cyan-400/80 shadow-[0_10px_28px_rgba(8,145,178,0.22)]" : ""}`}>
                    <span className="flex flex-col leading-none">
                      <span className="savings-level-label text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">Savings Level</span>
                      <span className="savings-level-value mt-1 text-[11px] font-bold tabular-nums text-cyan-200">{displayedReserveMonths.toFixed(1)} mo · {formatCurrency(displayedReserveDollars)}</span>
                    </span>
                    {canAdjust ? <MoveVertical className="size-3.5 text-cyan-400" aria-hidden="true" /> : null}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:block" aria-hidden="true" />
        </div>
        <div className="mt-3 rounded-lg border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-[10px] leading-relaxed text-slate-500">
          <span className="font-semibold uppercase tracking-[0.14em] text-slate-400">Interaction note:</span>{" "}
          Dragging the marker models liquid emergency savings only. Monthly Gap remains calculated from Monthly Expenses minus Remaining Income.
        </div>
      </CardContent>
    </Card>
  )
}

export function UnemploymentOutputView({ outputs, onReserveLevelChange }: UnemploymentOutputViewProps) {
  const monthlyGap = Math.max(0, outputs.monthlyBurnRate - outputs.remainingIncome)
  const currentRunway = monthlyGap > 0 ? outputs.currentReserveLevel / monthlyGap : 0
  const runwayAccent = currentRunway < 3 ? "negative" : currentRunway < 6 ? "warning" : "positive"

  return (
    <div className="unemployment-output-container">
      <ReservePositionPanel outputs={outputs} onReserveLevelChange={onReserveLevelChange} />

      {/* Advisor-approved result row: primary reserve metrics only. */}
      <div className="mt-3 grid grid-cols-4 gap-3">
        <ModuleMetricCard className={compactCardClass} label="Remaining Income" value={`${formatCurrency(outputs.remainingIncome)}/mo`} description="Net household income remaining" accent="primary" />
        <ModuleMetricCard className={compactCardClass} label="Monthly Gap" value={`${formatCurrency(monthlyGap)}/mo`} description="Expenses − remaining income" accent={monthlyGap > 0 ? "negative" : "positive"} />
        <ModuleMetricCard className={compactCardClass} label="Liquid Emergency Savings" value={formatCurrency(outputs.currentReserveLevel)} description="Drag marker updates this value" accent="primary" />
        <ModuleMetricCard className={compactCardClass} label="Current Runway" value={formatMonths(currentRunway)} description="Savings ÷ monthly gap" accent={runwayAccent} />
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
        {advisorSafeCopy.unemployment.netIncomeProxy} {advisorSafeCopy.unemployment.reserveDisclosure}
      </p>
    </div>
  )
}
