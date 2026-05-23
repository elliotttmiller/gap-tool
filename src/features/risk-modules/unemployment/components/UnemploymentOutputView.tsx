import { UnemploymentOutputs } from "../types"
import { ModuleMetricCard, MetricGroup, MetricGroupDivider } from "@/features/risk-modules/core/ModuleMetricCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface UnemploymentOutputViewProps {
  outputs: UnemploymentOutputs
}

function formatAdvisorCurrency(value: number): string {
  return `$${Math.round(value / 1000)}K`
}

function formatMonths(value: number, monthlyIncome: number): string {
  if (monthlyIncome <= 0) return "0mo"
  return `${Math.round(value / monthlyIncome)}mo`
}

const ReserveTooltip = ({ active, payload, label, monthlyIncome }: any) => {
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
          <span className="font-bold text-slate-100">{formatAdvisorCurrency(entry.value)} ({formatMonths(entry.value, monthlyIncome)})</span>
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
  const ticks = [0, 1, 2, 3, 4, 5, 6].map((month) => month * outputs.monthlyIncome)

  return (
    <Card className="module-visual-panel flex flex-col border-slate-800/80 bg-slate-950/60">
      <CardHeader className="shrink-0 px-6 pb-0 pt-5 text-center">
        <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          Emergency Reserve Dashboard
        </CardTitle>
        <p className="mt-1 text-sm leading-snug text-slate-400">
          Optimal savings runway target based on monthly income
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
                    tickFormatter={(val) => formatMonths(Number(val), outputs.monthlyIncome)}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    ticks={ticks}
                    domain={[0, outputs.optimalReserveTarget]}
                    width={54}
                  />
                  <Tooltip content={<ReserveTooltip monthlyIncome={outputs.monthlyIncome} />} cursor={{ fill: "rgba(255,255,255,0.025)" }} />
                  <ReferenceLine y={outputs.minimumReserveTarget} stroke="#e2e8f0" strokeDasharray="7 5" strokeOpacity={0.75} />
                  <ReferenceLine y={effectiveReserveAtOnset} stroke="#f43f5e" strokeWidth={2} strokeOpacity={0.9} />

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
            <p className="text-xs text-slate-400">6 months of income</p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-400">Minimum Reserve</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-50">{formatAdvisorCurrency(outputs.minimumReserveTarget)}</p>
            <p className="text-xs text-slate-400">3 months of income</p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.15em] text-rose-400">Current Reserve</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-50">{formatAdvisorCurrency(outputs.currentReserveLevel)}</p>
            <p className="text-xs text-slate-400">{formatMonths(outputs.currentReserveLevel, outputs.monthlyIncome)} held today</p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-200">Available at Onset</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-50">{formatAdvisorCurrency(effectiveReserveAtOnset)}</p>
            <p className="text-xs text-slate-400">Current reserve + severance</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AdvisorReserveDashboard({ outputs }: { outputs: UnemploymentOutputs }) {
  return (
    <div className="module-visual-dashboard">
      <AdvisorReserveVisualization outputs={outputs} />

      <div className="module-metric-rail">
        <MetricGroup title="Income">
          <ModuleMetricCard label="Monthly Income" value={formatAdvisorCurrency(outputs.monthlyIncome)} description="Current monthly earnings" accent="slate" />
        </MetricGroup>
        <MetricGroupDivider />
        <MetricGroup title="Reserve Targets">
          <ModuleMetricCard label="Minimum Reserve" value={formatAdvisorCurrency(outputs.minimumReserveTarget)} description="3 months — floor of the goal range" accent="cyan" />
          <ModuleMetricCard label="Optimal Reserve" value={formatAdvisorCurrency(outputs.optimalReserveTarget)} description="6 months — top of the goal range" accent="green" />
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
