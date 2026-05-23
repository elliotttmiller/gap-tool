import { UnemploymentOutputs } from "../types"
import { ModuleMetricCard, MetricGroup, MetricGroupDivider } from "@/features/risk-modules/core/ModuleMetricCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, LabelList, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface UnemploymentOutputViewProps {
  outputs: UnemploymentOutputs
}

function formatAdvisorCurrency(value: number, decimalsInThousands = 0): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2).replace(/\.00$/, "")}M`
  }
  const inThousands = value / 1000
  const rendered = inThousands.toFixed(decimalsInThousands).replace(/\.0$/, "")
  return `$${rendered}K`
}

function formatMonths(value: number, monthlyBurnRate: number): string {
  if (monthlyBurnRate <= 0) return "0mo"
  return `${Math.round(value / monthlyBurnRate)}mo`
}

const ReserveTooltip = ({ active, payload, label, monthlyBurnRate }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/95 px-4 py-3 text-sm shadow-xl backdrop-blur-sm">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-2 text-slate-300">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: entry.fill }} />
            {entry.name}
          </span>
          <span className="font-bold text-slate-100">{formatAdvisorCurrency(entry.value)} ({formatMonths(entry.value, monthlyBurnRate)})</span>
        </div>
      ))}
    </div>
  )
}

function AdvisorReserveVisualization({ outputs }: { outputs: UnemploymentOutputs }) {
  const effectiveReserveAtOnset = outputs.currentReserveLevel + outputs.severanceTotal
  const reserveData = [
    {
      name: "Savings Bucket",
      MinimumReserve: outputs.minimumReserveTarget,
      IdealExtension: Math.max(outputs.optimalReserveTarget - outputs.minimumReserveTarget, 0),
      EffectiveReserve: Math.min(effectiveReserveAtOnset, outputs.optimalReserveTarget),
    },
  ]
  const dynamicTop = Math.max(outputs.optimalReserveTarget, effectiveReserveAtOnset)
  const topMonths = outputs.monthlyBurnRate > 0 ? Math.max(6, Math.ceil(dynamicTop / outputs.monthlyBurnRate)) : 6
  const tickMonths = Array.from({ length: topMonths + 1 }, (_, i) => i)
  const ticks = tickMonths.map((month) => month * outputs.monthlyBurnRate)

  return (
    <Card className="module-visual-panel flex flex-col border-slate-800/80 bg-slate-950/60">
      <CardHeader className="shrink-0 px-6 pb-0 pt-5 text-center">
        <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          Emergency Reserve Dashboard
        </CardTitle>
        <p className="mt-1 text-sm leading-snug text-slate-400">
          Reserve runway target based on monthly burn rate
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col min-h-0 px-6 pb-6 pt-4">
        <div className="flex flex-1 min-h-0 items-stretch gap-2">
          <div className="flex w-4 shrink-0 items-center justify-center">
            <span
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-600"
            >
              Reserve Runway
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex-1 min-h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <BarChart
                  data={reserveData}
                  margin={{ top: 16, right: 160, left: 0, bottom: 12 }}
                  barSize={112}
                  barCategoryGap="50%"
                >
                  <defs>
                    <linearGradient id="unemp-ideal-segment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.84" />
                    </linearGradient>
                    <linearGradient id="unemp-min-segment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0891b2" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.58" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148,163,184,0.06)" strokeDasharray="4 4" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    dy={6}
                  />
                  <YAxis
                    tickFormatter={(val) => formatMonths(Number(val), outputs.monthlyBurnRate)}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    ticks={ticks}
                    domain={[0, (dataMax: number) => Math.max(dataMax, dynamicTop)]}
                    width={54}
                  />
                  <Tooltip content={<ReserveTooltip monthlyBurnRate={outputs.monthlyBurnRate} />} cursor={{ fill: "rgba(255,255,255,0.025)" }} />
                  <ReferenceLine y={outputs.minimumReserveTarget} stroke="#e2e8f0" strokeDasharray="7 5" strokeOpacity={0.75} />
                  <ReferenceLine y={outputs.currentReserveLevel} stroke="#fb7185" strokeDasharray="3 3" strokeWidth={1.5} strokeOpacity={0.9} />
                  <ReferenceLine y={effectiveReserveAtOnset} stroke="#f43f5e" strokeWidth={2} strokeOpacity={0.9} />
                  <ReferenceDot
                    x="Savings Bucket"
                    y={outputs.currentReserveLevel}
                    r={5}
                    fill="#fb7185"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    ifOverflow="extendDomain"
                  />
                  <ReferenceDot
                    x="Savings Bucket"
                    y={effectiveReserveAtOnset}
                    r={5}
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    ifOverflow="extendDomain"
                  />

                  <Bar
                    dataKey="MinimumReserve"
                    name="Minimum Zone"
                    stackId="a"
                    fill="url(#unemp-min-segment)"
                    radius={outputs.optimalReserveTarget <= outputs.minimumReserveTarget ? [18, 18, 0, 0] : [0, 0, 0, 0]}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1400}
                    animationEasing="ease-out"
                  />
                  <Bar
                    dataKey="IdealExtension"
                    name="Ideal Extension"
                    stackId="a"
                    fill="url(#unemp-ideal-segment)"
                    radius={[18, 18, 0, 0]}
                    isAnimationActive={true}
                    animationBegin={200}
                    animationDuration={1400}
                    animationEasing="ease-out"
                  >
                    <LabelList
                      dataKey="IdealExtension"
                      position="center"
                      formatter={() => "IDEAL RANGE"}
                      style={{ fill: "#ffffff", fontSize: 12, fontWeight: 800, letterSpacing: "0.14em" }}
                    />
                  </Bar>
                  <Bar
                    dataKey="EffectiveReserve"
                    name="Available at Onset"
                    stackId="overlay"
                    fill="rgba(248,250,252,0.1)"
                    stroke="#f8fafc"
                    strokeOpacity={0.55}
                    strokeWidth={2}
                    radius={[18, 18, 0, 0]}
                    isAnimationActive={true}
                    animationBegin={400}
                    animationDuration={1400}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 shrink-0 flex items-center justify-center gap-6 border-t border-slate-800/50 pt-4">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className="h-2 w-4 rounded-sm bg-cyan-400/70" />
                Minimum Zone
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className="h-2 w-4 rounded-sm bg-emerald-500/80" />
                Ideal Extension
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className="h-2 w-4 rounded-sm border border-slate-200/60 bg-slate-50/10" />
                Available at Onset
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className="h-2 w-4 rounded-sm bg-rose-400/80" />
                Current Position
              </span>
            </div>
            <div className="mt-1 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Emergency Reserve Savings Bucket
              </span>
            </div>
          </div>
          <div className="hidden w-40 shrink-0 pt-4 lg:block">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-400">Optimal Target</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-50">{formatAdvisorCurrency(outputs.optimalReserveTarget)}</p>
            <p className="text-xs text-slate-400">6 months of burn rate</p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-400">Minimum Reserve</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-50">{formatAdvisorCurrency(outputs.minimumReserveTarget)}</p>
            <p className="text-xs text-slate-400">3 months of burn rate</p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.15em] text-rose-400">Current Reserve</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-50">{formatAdvisorCurrency(outputs.currentReserveLevel, 1)}</p>
            <p className="text-xs text-slate-400">{formatMonths(outputs.currentReserveLevel, outputs.monthlyBurnRate)} held today</p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-200">Available at Onset</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-50">{formatAdvisorCurrency(effectiveReserveAtOnset, 1)}</p>
            <p className="text-xs text-slate-400">Current reserve + severance</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AdvisorReserveDashboard({ outputs }: { outputs: UnemploymentOutputs }) {
  const monthlyCashFlow = outputs.monthlyIncome - outputs.monthlyBurnRate
  const isCashFlowNegative = monthlyCashFlow < 0
  const currentRunwayMonths = outputs.monthlyBurnRate > 0 ? outputs.currentReserveLevel / outputs.monthlyBurnRate : 0
  const projectedRunwayMonths = outputs.monthlyBurnRate > 0 ? (outputs.currentReserveLevel + outputs.severanceTotal) / outputs.monthlyBurnRate : 0
  const depletionText = outputs.reserveDepletionMonth > 0 ? `Month ${outputs.reserveDepletionMonth}` : "No depletion modeled"

  return (
    <div className="module-visual-dashboard">
      <AdvisorReserveVisualization outputs={outputs} />

      <div className="module-metric-rail">
        <MetricGroup title="Income">
          <ModuleMetricCard label="Monthly Income" value={formatAdvisorCurrency(outputs.monthlyIncome, 1)} description="Current monthly earnings" accent="slate" />
          <ModuleMetricCard label="Spouse Income" value={formatAdvisorCurrency(outputs.monthlyAvailableIncomeBase, 1)} description="Base monthly household offset" accent="cyan" />
          <ModuleMetricCard
            label="Monthly Cash Flow"
            value={`${monthlyCashFlow < 0 ? "-" : "+"}${formatAdvisorCurrency(Math.abs(monthlyCashFlow), 1)}`}
            description={isCashFlowNegative ? "Burn rate exceeds income" : "Income covers burn rate"}
            accent={isCashFlowNegative ? "red" : "green"}
          />
        </MetricGroup>
        <MetricGroupDivider />
        <MetricGroup title="Reserve Targets">
          <ModuleMetricCard label="Minimum Reserve" value={formatAdvisorCurrency(outputs.minimumReserveTarget)} description="3 months of burn rate — floor of the goal range" accent="cyan" />
          <ModuleMetricCard label="Optimal Reserve" value={formatAdvisorCurrency(outputs.optimalReserveTarget)} description="6 months of burn rate — top of the goal range" accent="green" />
          <ModuleMetricCard
            label="Current Runway"
            value={`${currentRunwayMonths.toFixed(1)} mo`}
            description="Liquid savings ÷ monthly burn rate"
            accent={currentRunwayMonths < 3 ? "red" : currentRunwayMonths < 6 ? "cyan" : "green"}
          />
          <ModuleMetricCard
            label="Runway at Onset"
            value={`${projectedRunwayMonths.toFixed(1)} mo`}
            description="(Savings + severance) ÷ burn rate"
            accent={projectedRunwayMonths < 3 ? "red" : projectedRunwayMonths < 6 ? "cyan" : "green"}
          />
        </MetricGroup>
        <MetricGroupDivider />
        <MetricGroup title="Transition Impact">
          <ModuleMetricCard
            label="Severance Buffer"
            value={formatAdvisorCurrency(outputs.severanceTotal, 1)}
            description="Salary-based offset added at job loss"
            accent="slate"
          />
          <ModuleMetricCard
            label="Reserve Depletion"
            value={depletionText}
            description="Month reserves are expected to run out"
            accent={outputs.reserveDepletionMonth > 0 ? "red" : "green"}
          />
          <ModuleMetricCard
            label="Uncovered Shortfall"
            value={formatAdvisorCurrency(outputs.totalUncoveredShortfall, 1)}
            description="Cumulative uncovered gap in the modeled search period"
            accent={outputs.totalUncoveredShortfall > 0 ? "red" : "green"}
          />
        </MetricGroup>
        <MetricGroupDivider />
        <MetricGroup title="Exposure">
          <ModuleMetricCard label="Annual Income at Risk" value={formatAdvisorCurrency(outputs.annualIncomeAtRisk)} description="Full income exposure during unemployment" accent="amber" />
        </MetricGroup>
      </div>
    </div>
  )
}

export function UnemploymentOutputView({ outputs }: UnemploymentOutputViewProps) {
  return (
    <div className="module-output-container">
      <AdvisorReserveDashboard outputs={outputs} />
    </div>
  )
}
