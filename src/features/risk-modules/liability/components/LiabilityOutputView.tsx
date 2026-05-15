import { LiabilityOutputs } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { transformLiabilityChartData } from "../transformers/transformLiabilityChartData"
import { ModuleMetricCard, MetricGroup, MetricGroupDivider } from "@/features/risk-modules/core/ModuleMetricCard"

interface LiabilityOutputViewProps {
  outputs: LiabilityOutputs
}

const CustomTooltip = ({ active, payload, label }: any) => {
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
          <span className="font-bold text-slate-100">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

function formatLiabilityMetric(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `$${Math.round(value / 1_000)}K`
  return formatCurrency(value)
}

export function LiabilityOutputView({ outputs }: LiabilityOutputViewProps) {
  const chartData = transformLiabilityChartData(outputs)
  const totalRisk = outputs.totalHouseholdLiabilityRisk || outputs.householdAutoLiabilityCoverage + outputs.householdLiabilityGap
  const coveragePct = totalRisk > 0 ? Math.min(100, (outputs.householdAutoLiabilityCoverage / totalRisk) * 100) : 0

  return (
    <div className="module-output-container">
      <div className="module-visual-dashboard">

        {/* ── Chart panel ─────────────────────────────────────────────── */}
        <Card className="module-visual-panel flex flex-col border-slate-800/80 bg-slate-950/60">
          <CardHeader className="shrink-0 px-6 pb-0 pt-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                  Liability Protection Stack
                </CardTitle>
                <p className="mt-1 text-sm leading-snug text-slate-400">
                  Auto coverage applied against total household liability exposure
                </p>
              </div>
              {/* Coverage ratio badge */}
              <div className="shrink-0 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Covered</p>
                <p className={`text-lg font-bold leading-tight ${coveragePct >= 100 ? "text-emerald-400" : coveragePct >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                  {coveragePct.toFixed(0)}%
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col min-h-0 px-6 pb-6 pt-4">
            <div className="flex flex-1 min-h-0 items-stretch gap-2">
              <div className="flex w-4 shrink-0 items-center justify-center">
                <span
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-600"
                >
                  Amount ($)
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex-1 min-h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <BarChart
                      data={chartData.protectionStackData}
                      margin={{ top: 16, right: 40, left: 0, bottom: 12 }}
                      barSize={96}
                      barCategoryGap="50%"
                    >
                      <CartesianGrid stroke="rgba(148,163,184,0.06)" strokeDasharray="4 4" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        dy={6}
                      />
                      <YAxis
                        tickFormatter={(val) => `$${Math.round(Number(val) / 1000)}k`}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={54}
                      />
                      <Tooltip content={CustomTooltip} cursor={{ fill: "rgba(255,255,255,0.025)" }} />
                      <Bar
                        dataKey="Coverage"
                        name="Auto Liability Coverage"
                        stackId="a"
                        fill="#22c55e"
                        radius={outputs.householdLiabilityGap > 0 ? [0, 0, 0, 0] : [6, 6, 0, 0]}
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={1400}
                        animationEasing="ease-out"
                      />
                      <Bar
                        dataKey="ExposureGap"
                        name="Unprotected Liability Gap"
                        stackId="a"
                        fill="#f43f5e"
                        radius={[6, 6, 0, 0]}
                        isAnimationActive={true}
                        animationBegin={200}
                        animationDuration={1400}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-1 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    Protection Category
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 shrink-0 flex items-center justify-center gap-6 border-t border-slate-800/50 pt-4">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className="h-2 w-4 rounded-sm bg-emerald-500" />
                Auto Liability Coverage
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className="h-2 w-4 rounded-sm bg-rose-500" />
                Unprotected Liability Gap
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Metric rail ─────────────────────────────────────────────── */}
        <div className="module-metric-rail">
          <MetricGroup title="Exposure">
            <ModuleMetricCard
              label="Wage Garnishment Risk"
              value={formatLiabilityMetric(outputs.householdWageGarnishmentRisk)}
              description="25% of projected income to age 65 at 3%/yr"
              accent="red"
            />
            <ModuleMetricCard
              label="Non-Qualified Assets at Risk"
              value={formatLiabilityMetric(outputs.nonQualifiedAssetsAtRisk)}
              description="Taxable assets exposed to judgment"
              accent="red"
            />
            <ModuleMetricCard
              label="Total Liability Exposure"
              value={formatLiabilityMetric(totalRisk)}
              description="Garnishment risk + non-qualified assets"
              accent="cyan"
            />
          </MetricGroup>

          <MetricGroupDivider />

          <MetricGroup title="Coverage &amp; Gap">
            <ModuleMetricCard
              label="Auto Liability Coverage"
              value={formatLiabilityMetric(outputs.householdAutoLiabilityCoverage)}
              description="Underlying auto policy limit"
              accent="green"
            />
            <ModuleMetricCard
              label="Unprotected Liability Gap"
              value={formatLiabilityMetric(outputs.householdLiabilityGap)}
              description="Total exposure minus auto coverage"
              accent={outputs.householdLiabilityGap > 0 ? "red" : "green"}
            />
          </MetricGroup>
        </div>

      </div>
    </div>
  )
}
