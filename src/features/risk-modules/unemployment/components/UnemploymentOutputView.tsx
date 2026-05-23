import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModuleMetricCard, MetricGroup, MetricGroupDivider } from "@/features/risk-modules/core/ModuleMetricCard"
import { Bar, BarChart, CartesianGrid, LabelList, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { UnemploymentOutputs } from "../types"

interface UnemploymentOutputViewProps {
  outputs: UnemploymentOutputs
}

function formatCurrency(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2).replace(/\.00$/, "")}M`
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return `$${Math.round(value)}`
}

function formatMonths(months: number): string {
  return `${months.toFixed(2)} mo`
}

function GaugeTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/95 px-4 py-3 text-sm shadow-xl backdrop-blur-sm">
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-6">
          <span className="text-slate-300">{entry.name}</span>
          <span className="font-bold text-slate-100">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

function TimelineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/95 px-4 py-3 text-sm shadow-xl backdrop-blur-sm">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Month {label}</p>
      {payload.filter((entry: any) => entry.value > 0).map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-6">
          <span className="text-slate-300">{entry.name}</span>
          <span className="font-bold text-slate-100">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

function PositionGaugePanel({ outputs }: { outputs: UnemploymentOutputs }) {
  const burn = outputs.monthlyBurnRate
  const dangerBand = outputs.dangerThreshold
  const minimumBand = Math.max(outputs.minimumReserveTarget - outputs.dangerThreshold, 0)
  const idealBand = Math.max((burn * 4.5) - outputs.minimumReserveTarget, 0)
  const strongBand = Math.max(outputs.optimalReserveTarget - (burn * 4.5), 0)
  const topDomain = Math.max(outputs.currentReserveLevel, outputs.optimalReserveTarget + burn, 1)
  const gaugeData = [{ name: "Reserve Position", Danger: dangerBand, Minimum: minimumBand, Ideal: idealBand, Strong: strongBand }]

  return (
    <Card className="border-slate-800/80 bg-slate-950/60">
      <CardHeader className="px-5 pb-0 pt-4">
        <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Position Gauge</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gaugeData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }} barSize={90}>
              <CartesianGrid stroke="rgba(148,163,184,0.06)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                domain={[0, topDomain]}
                tickFormatter={(v) => `${Math.round(Number(v) / Math.max(outputs.monthlyBurnRate, 1))}mo`}
                width={48}
              />
              <Tooltip content={<GaugeTooltip />} cursor={{ fill: "rgba(255,255,255,0.025)" }} />
              <ReferenceLine y={outputs.minimumReserveTarget} stroke="#f8fafc" strokeDasharray="7 5" strokeOpacity={0.75} />
              <ReferenceLine y={outputs.optimalReserveTarget} stroke="#22c55e" strokeDasharray="5 4" strokeOpacity={0.75} />
              <ReferenceDot x="Reserve Position" y={outputs.currentReserveLevel} r={6} fill="#f43f5e" stroke="#ffffff" strokeWidth={1.5} />
              <Bar dataKey="Danger" stackId="g" fill="#ef4444" radius={[0, 0, 0, 0]} isAnimationActive animationDuration={1400} animationEasing="ease-out" />
              <Bar dataKey="Minimum" stackId="g" fill="#eab308" radius={[0, 0, 0, 0]} isAnimationActive animationBegin={120} animationDuration={1400} animationEasing="ease-out" />
              <Bar dataKey="Ideal" stackId="g" fill="#22c55e" radius={[0, 0, 0, 0]} isAnimationActive animationBegin={220} animationDuration={1400} animationEasing="ease-out">
                <LabelList dataKey="Ideal" position="center" formatter={() => "IDEAL"} style={{ fill: "#fff", fontSize: 11, fontWeight: 800 }} />
              </Bar>
              <Bar dataKey="Strong" stackId="g" fill="#38bdf8" radius={[10, 10, 0, 0]} isAnimationActive animationBegin={320} animationDuration={1400} animationEasing="ease-out">
                <LabelList dataKey="Strong" position="center" formatter={() => "STRONG"} style={{ fill: "#fff", fontSize: 10, fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function RunwayTimelinePanel({ outputs }: { outputs: UnemploymentOutputs }) {
  const rows = outputs.timeline.map((point) => {
    const coveredByOffset = Math.min(point.expenses, point.offsetIncome)
    const coveredBySavings = Math.min(point.expenses - coveredByOffset, Math.max(0, point.expenses - point.offsetIncome - point.shortfall))
    const gap = Math.max(point.shortfall, 0)
    return {
      month: point.month,
      OffsetCover: coveredByOffset,
      SavingsBridge: coveredBySavings,
      Gap: gap,
    }
  })

  return (
    <Card className="border-slate-800/80 bg-slate-950/60">
      <CardHeader className="px-5 pb-0 pt-4">
        <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Runway Timeline</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 16, right: 12, left: 0, bottom: 8 }} barCategoryGap="35%">
              <CartesianGrid stroke="rgba(148,163,184,0.06)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} />
              <YAxis hide />
              <Tooltip content={<TimelineTooltip />} cursor={{ fill: "rgba(255,255,255,0.025)" }} />
              <Bar dataKey="OffsetCover" stackId="r" fill="#22c55e" isAnimationActive animationDuration={1200} animationEasing="ease-out" />
              <Bar dataKey="SavingsBridge" stackId="r" fill="#0ea5e9" isAnimationActive animationBegin={140} animationDuration={1200} animationEasing="ease-out" />
              <Bar dataKey="Gap" stackId="r" fill="#ef4444" radius={[4, 4, 0, 0]} isAnimationActive animationBegin={260} animationDuration={1200} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function ShortfallPanel({ outputs }: { outputs: UnemploymentOutputs }) {
  const cashFlowAccent: "red" | "green" | "cyan" =
    outputs.cashFlowStatus === "negative" ? "red" : outputs.cashFlowStatus === "positive" ? "green" : "cyan"
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <ModuleMetricCard label="Monthly Cash Flow" value={formatCurrency(outputs.monthlyCashFlow)} description="Monthly income − monthly burn rate" accent={cashFlowAccent} />
      <ModuleMetricCard label="Months of Runway" value={formatMonths(outputs.reserveMonthsCurrent)} description="Liquid savings ÷ monthly burn rate" accent={outputs.reserveMonthsCurrent < 3 ? "red" : "green"} />
      <ModuleMetricCard label="Net Cash Needed" value={formatCurrency(outputs.netCashNeeded)} description="Burn rate × search duration − offsets" accent="cyan" />
      <ModuleMetricCard label="Shortfall" value={formatCurrency(outputs.remainingShortfall)} description="Net cash needed − liquid savings" accent={outputs.remainingShortfall > 0 ? "red" : "green"} />
      <ModuleMetricCard label="Effective Runway" value={formatMonths(outputs.effectiveRunwayMonths)} description="(Savings + total offset pool) ÷ burn rate" accent={outputs.fullyFundedForSearch ? "green" : "red"} />
      <ModuleMetricCard label="Breakeven Search Duration" value={formatMonths(outputs.breakEvenSearchDurationMonths)} description="Months supportable before depletion" accent="slate" />
    </div>
  )
}

export function UnemploymentOutputView({ outputs }: UnemploymentOutputViewProps) {
  return (
    <div className="module-output-container">
      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-3">
          <PositionGaugePanel outputs={outputs} />
          <RunwayTimelinePanel outputs={outputs} />
          <Card className="border-slate-800/80 bg-slate-950/60">
            <CardHeader className="px-5 pb-0 pt-4">
              <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Shortfall Summary</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-3">
              <ShortfallPanel outputs={outputs} />
            </CardContent>
          </Card>
        </div>

        <div className="module-metric-rail">
          <MetricGroup title="Reserve Status">
            <ModuleMetricCard label="Current Reserve" value={formatCurrency(outputs.currentReserveLevel)} description={`${formatMonths(outputs.reserveMonthsCurrent)} runway • ${outputs.reserveStatus}`} accent={outputs.reserveStatus === "danger" ? "red" : outputs.reserveStatus === "minimum" ? "cyan" : "green"} />
            <ModuleMetricCard label="Available at Onset" value={formatCurrency(outputs.availableAtOnset)} description="Liquid savings + total severance/UB pool" accent="slate" />
            <ModuleMetricCard label="Reserve Coverage" value={`${Math.round(outputs.reserveCoveragePct)}%`} description="Current reserve ÷ optimal reserve" accent={outputs.reserveCoveragePct < 50 ? "red" : "green"} />
          </MetricGroup>
          <MetricGroupDivider />
          <MetricGroup title="Offsets & Risk">
            <ModuleMetricCard label="Monthly Offset" value={formatCurrency(outputs.monthlyOffset)} description="Severance/mo + unemployment benefit/mo" accent="cyan" />
            <ModuleMetricCard label="Monthly Net Burn" value={formatCurrency(outputs.monthlyNetBurn)} description="Burn rate − monthly offset" accent={outputs.monthlyNetBurn > 0 ? "red" : "green"} />
            <ModuleMetricCard label="Annual Income at Risk" value={formatCurrency(outputs.annualIncomeAtRisk)} description="Current annual income exposure" accent="amber" />
            <ModuleMetricCard label="Spouse Income (Reference)" value={formatCurrency(outputs.spouseMonthlyIncomeReference)} description="Monthly spouse income, shown for planning context" accent="slate" />
          </MetricGroup>
        </div>
      </div>
    </div>
  )
}
