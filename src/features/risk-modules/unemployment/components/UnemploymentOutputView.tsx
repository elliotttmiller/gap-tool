import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModuleMetricCard } from "@/features/risk-modules/core/ModuleMetricCard"
import { UnemploymentOutputs } from "../types"

interface UnemploymentOutputViewProps {
  outputs: UnemploymentOutputs
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

function getRunwayStatus(months: number): { label: string; badgeClass: string; textClass: string } {
  if (months < 1.5) return { label: "Danger Zone", badgeClass: "bg-rose-950/50 text-rose-300 ring-1 ring-rose-800/60", textClass: "text-rose-400" }
  if (months < 3) return { label: "Below Minimum", badgeClass: "bg-amber-950/50 text-amber-300 ring-1 ring-amber-800/60", textClass: "text-amber-400" }
  if (months < 4.5) return { label: "Minimum Met", badgeClass: "bg-amber-950/50 text-amber-300 ring-1 ring-amber-800/60", textClass: "text-amber-400" }
  if (months < 6) return { label: "Ideal Range", badgeClass: "bg-emerald-950/50 text-emerald-300 ring-1 ring-emerald-800/60", textClass: "text-emerald-400" }
  return { label: "Strong Position", badgeClass: "bg-cyan-950/50 text-cyan-300 ring-1 ring-cyan-800/60", textClass: "text-cyan-400" }
}

function PositionGauge({ outputs }: { outputs: UnemploymentOutputs }) {
  const burn = Math.max(outputs.monthlyBurnRate, 1)
  const runway = outputs.effectiveRunwayMonths
  const status = getRunwayStatus(runway)
  const gaugeW = 200
  const gaugeH = 360
  const tankX = 30
  const tankY = 20
  const tankW = 100
  const tankH = 300
  const gaugeMaxMo = 9
  const clampMo = Math.min(Math.max(runway, 0), gaugeMaxMo)
  const fillHeightPx = (clampMo / gaugeMaxMo) * tankH
  const fillTopPx = tankY + tankH - fillHeightPx
  const needleYPx = fillTopPx
  const yAtMonths = (m: number) => tankY + tankH - (m / gaugeMaxMo) * tankH
  const min3YPx = yAtMonths(3)
  const ideal6YPx = yAtMonths(6)
  const danger15YPx = yAtMonths(1.5)
  const coveragePct = outputs.optimalReserveTarget > 0
    ? Math.min(100, (outputs.availableAtOnset / outputs.optimalReserveTarget) * 100)
    : 0

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Position Gauge</p>
      <div className="relative h-[340px] w-[200px]">
        <div className="absolute left-0 top-[20px] h-[300px] w-[28px]">
          {[0, 3, 6, 9].map((m) => {
            const y = yAtMonths(m)
            return (
              <div key={m} className="absolute inset-x-0" style={{ top: `${y - tankY}px`, transform: "translateY(-50%)" }}>
                <div className="flex items-center justify-end pr-1">
                  <span className="text-[10px] text-slate-400">{m}mo</span>
                </div>
              </div>
            )
          })}
        </div>

        <div
          className="absolute overflow-hidden rounded-[14px] border border-slate-600/70 bg-slate-950/70"
          style={{ left: `${tankX}px`, top: `${tankY}px`, width: `${tankW}px`, height: `${tankH}px` }}
        >
          <div className="absolute inset-x-0 bottom-0 bg-rose-500/35" style={{ top: `${danger15YPx - tankY}px` }} />
          <div className="absolute inset-x-0 bg-amber-500/35" style={{ top: `${min3YPx - tankY}px`, height: `${danger15YPx - min3YPx}px` }} />
          <div className="absolute inset-x-0 bg-emerald-500/35" style={{ top: `${ideal6YPx - tankY}px`, height: `${min3YPx - ideal6YPx}px` }} />
          <div className="absolute inset-x-0 top-0 bg-cyan-400/30" style={{ height: `${ideal6YPx - tankY}px` }} />

          <div
            className="absolute inset-x-0 bottom-0 bg-[#378ADD]/90 transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
            style={{ height: `${fillHeightPx}px` }}
          />

          <div className="absolute inset-x-0 top-[22%] text-center text-[11px] font-bold tracking-[0.08em] text-slate-100">IDEAL</div>
          <div className="absolute inset-x-0 top-[57%] text-center text-[10px] text-slate-200/85">MINIMUM</div>
          <div className="absolute inset-x-0 top-[89%] text-center text-[10px] text-slate-200/85">DANGER</div>
        </div>

        <div
          className="absolute border-t-2 border-dashed border-sky-300/90 transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ left: `${tankX - 6}px`, width: `${tankW + 14}px`, top: `${needleYPx}px` }}
        />
        <div
          className="absolute h-2.5 w-2.5 rounded-full border border-white bg-sky-300 transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ left: `${tankX + tankW - 4}px`, top: `${needleYPx - 5}px` }}
        />
        <div
          className="absolute text-[10px] text-sky-300 transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ left: `${tankX + tankW + 14}px`, top: `${needleYPx - 6}px` }}
        >
          {formatCurrency(outputs.availableAtOnset)}
        </div>

        <div className="absolute border-t border-dashed border-slate-200/70" style={{ left: `${tankX - 8}px`, width: `${tankW + 16}px`, top: `${min3YPx}px` }} />
        <div className="absolute border-t border-dashed border-emerald-400/80" style={{ left: `${tankX - 8}px`, width: `${tankW + 16}px`, top: `${ideal6YPx}px` }} />
      </div>

      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.badgeClass}`}>{status.label}</span>
      <p className="text-xs text-slate-400">{formatMonths(runway)} runway • {Math.round(coveragePct)}% of optimal</p>
      <p className="text-[11px] text-slate-500">Targets: {formatCurrency(outputs.minimumReserveTarget)} (3mo) / {formatCurrency(outputs.optimalReserveTarget)} (6mo)</p>
      <p className="text-[11px] text-slate-500">Based on monthly burn rate: {formatCurrency(burn)}</p>
    </div>
  )
}

export function UnemploymentOutputView({ outputs }: UnemploymentOutputViewProps) {
  const cfAccent: "green" | "cyan" | "red" = outputs.cashFlowStatus === "positive" ? "green" : outputs.cashFlowStatus === "breakeven" ? "cyan" : "red"
  const runwayAccent: "green" | "cyan" | "red" = outputs.reserveMonthsCurrent < 3 ? "red" : outputs.reserveMonthsCurrent < 6 ? "cyan" : "green"
  const shortfallAccent: "green" | "red" = outputs.remainingShortfall > 0 ? "red" : "green"
  const effectiveAccent: "green" | "cyan" | "red" = outputs.effectiveRunwayMonths >= outputs.timeline.length ? "green" : outputs.effectiveRunwayMonths >= outputs.timeline.length * 0.75 ? "cyan" : "red"

  return (
    <div className="module-output-container">
      <div className="module-visual-dashboard">
        <Card className="module-visual-panel border-slate-800/80 bg-slate-950/60">
          <CardHeader className="px-6 pb-0 pt-5">
            <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Emergency Reserve Position Gauge
            </CardTitle>
            <p className="mt-1 text-sm leading-snug text-slate-400">
              Interactive savings position against burn-rate runway thresholds
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-4">
            <PositionGauge outputs={outputs} />
          </CardContent>
        </Card>

        <div className="module-metric-rail">
          <ModuleMetricCard
            label="Monthly Cash Flow"
            value={formatCurrency(outputs.monthlyCashFlow)}
            description="Income minus monthly burn rate"
            accent={cfAccent}
          />
          <ModuleMetricCard
            label="Current Runway"
            value={formatMonths(outputs.reserveMonthsCurrent)}
            description="Liquid savings ÷ monthly burn rate"
            accent={runwayAccent}
          />
          <ModuleMetricCard
            label="Available at Onset"
            value={formatCurrency(outputs.availableAtOnset)}
            description="Savings + severance + unemployment pool"
            accent="slate"
          />
          <ModuleMetricCard
            label="Monthly Net Burn"
            value={formatCurrency(outputs.monthlyNetBurn)}
            description="Burn rate minus monthly offsets"
            accent={outputs.monthlyNetBurn > 0 ? "red" : "green"}
          />
          <ModuleMetricCard
            label="Effective Runway"
            value={formatMonths(outputs.effectiveRunwayMonths)}
            description="Onset pool ÷ monthly net burn"
            accent={effectiveAccent}
          />
          <ModuleMetricCard
            label="Shortfall"
            value={outputs.remainingShortfall > 0 ? formatCurrency(outputs.remainingShortfall) : "$0"}
            description="Search-period funding gap after savings"
            accent={shortfallAccent}
          />
        </div>
      </div>
    </div>
  )
}
