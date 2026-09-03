import { LiabilityOutputs } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts"
import { transformLiabilityChartData } from "../transformers/transformLiabilityChartData"
import { ModuleMetricCard } from "@/features/risk-modules/core/ModuleMetricCard"
import { advisorSafeCopy } from "@/domain/copy/advisorSafeCopy"
import { financialBarChartTheme } from "@/components/charts/financialBarChartTheme"

interface LiabilityOutputViewProps {
  outputs: LiabilityOutputs
  animate?: boolean
}

const compactCardClass = "liability-kpi-card"

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

export function LiabilityOutputView({ outputs, animate = true }: LiabilityOutputViewProps) {
  const animateChart = animate
  const chartData = transformLiabilityChartData(outputs)
  const totalRisk = outputs.totalHouseholdLiabilityRisk
  const coveragePct = totalRisk > 0 ? Math.min(100, (outputs.householdTotalCoverage / totalRisk) * 100) : 0
  const neededUmbrellaCoverage = outputs.neededUmbrellaCoverage
    ?? (outputs.householdLiabilityGap > 0 ? Math.ceil(outputs.householdLiabilityGap / 1_000_000) * 1_000_000 : 0)
  const coverageLayers = [
    { label: "Auto Liability", value: outputs.householdAutoLiabilityCoverage, color: financialBarChartTheme.semantic.supported, text: "text-emerald-600 dark:text-emerald-400" },
    { label: "Existing Umbrella", value: outputs.householdUmbrellaCoverage, color: financialBarChartTheme.semantic.secondaryCoverage, text: "text-[#1db8b9]" },
    { label: "Unprotected Gap", value: outputs.householdLiabilityGap, color: financialBarChartTheme.semantic.gap, text: "text-red-600 dark:text-red-400" },
  ]

  return (
    <div className="liability-output-container">
      <div className="liability-visual-dashboard">
        <Card className="module-chart-card liability-chart-panel-compact border-slate-800/80 bg-slate-950/60">
          <CardHeader className="px-5 pb-0 pt-4">
            <div className="relative flex items-start justify-center">
              <div className="text-center">
                <CardTitle className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Liability Protection Stack
                </CardTitle>
                <p className="mt-1 text-xs leading-snug text-slate-400">
                  Current coverage versus modeled household liability exposure
                </p>
              </div>
              <div className="absolute right-0 top-0 shrink-0 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-right">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Covered</p>
                <p className={`text-base font-bold leading-tight ${coveragePct >= 100 ? "text-emerald-400" : coveragePct >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                  {coveragePct.toFixed(0)}%
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-5 pb-4 pt-3">
            <div className="flex items-stretch gap-1">
              <div className="flex w-4 shrink-0 items-center justify-center">
                <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }} className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-500">Exposure and Coverage ($)</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="liability-chart-area chart-reveal financial-bar-chart">
                  <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <BarChart
                      data={chartData.protectionStackData}
                      margin={{ top: 8, right: 24, left: 2, bottom: 12 }}
                      barSize={financialBarChartTheme.geometry.comparisonBarSize}
                      barCategoryGap={financialBarChartTheme.geometry.comparisonCategoryGap}
                    >
                      <CartesianGrid stroke={financialBarChartTheme.grid.stroke} strokeDasharray={financialBarChartTheme.grid.strokeDasharray} vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: financialBarChartTheme.axis.tickFill, fontSize: 11, fontWeight: 600 }} axisLine={{ stroke: financialBarChartTheme.axis.lineStroke, strokeOpacity: financialBarChartTheme.axis.lineOpacity }} tickLine={{ stroke: financialBarChartTheme.axis.lineStroke, strokeOpacity: financialBarChartTheme.axis.lineOpacity }} tickMargin={10} />
                      <YAxis tickFormatter={(val) => `$${Math.round(Number(val) / 1000)}k`} tick={{ fill: financialBarChartTheme.axis.tickFill, fontSize: 10 }} axisLine={false} tickLine={false} width={50} />
                      <Tooltip content={CustomTooltip} cursor={{ fill: financialBarChartTheme.cursor.fill }} />
                      {outputs.householdAutoLiabilityCoverage > 0 ? (
                        <ReferenceLine
                          y={outputs.householdAutoLiabilityCoverage}
                          stroke={financialBarChartTheme.semantic.supported}
                          strokeDasharray="4 4"
                          strokeOpacity={0.75}
                          label={{ value: `Auto limit ${formatLiabilityMetric(outputs.householdAutoLiabilityCoverage)}`, position: "insideBottomLeft", fill: financialBarChartTheme.semantic.supported, fontSize: 10 }}
                        />
                      ) : null}
                      <Bar dataKey="AutoCoverage" name="Auto Liability Coverage" stackId="a" fill={financialBarChartTheme.semantic.supported} minPointSize={6} radius={[0, 0, 0, 0]} shapeRendering="geometricPrecision" isAnimationActive={animateChart} animationDuration={financialBarChartTheme.animation.duration} animationEasing={financialBarChartTheme.animation.easing} />
                      <Bar dataKey="UmbrellaCoverage" name="Umbrella Coverage" stackId="a" fill={financialBarChartTheme.semantic.secondaryCoverage} radius={[0, 0, 0, 0]} shapeRendering="geometricPrecision" isAnimationActive={animateChart} animationBegin={financialBarChartTheme.animation.staggerMs} animationDuration={financialBarChartTheme.animation.duration} animationEasing={financialBarChartTheme.animation.easing} />
                      <Bar dataKey="ExposureGap" name="Unprotected Liability Gap" stackId="a" fill={financialBarChartTheme.semantic.gap} radius={[financialBarChartTheme.geometry.stackRadius, financialBarChartTheme.geometry.stackRadius, 0, 0]} shapeRendering="geometricPrecision" isAnimationActive={animateChart} animationBegin={financialBarChartTheme.animation.staggerMs * 1.6} animationDuration={financialBarChartTheme.animation.duration} animationEasing={financialBarChartTheme.animation.easing} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-1 text-center"><span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Coverage Scenario</span></div>
              </div>
            </div>
            <div className="mt-2 grid gap-2 border-t border-slate-800/50 pt-2 sm:grid-cols-3">
              {coverageLayers.map((layer) => (
                <div key={layer.label} className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/70 bg-slate-950/50 px-3 py-2">
                  <span className="flex min-w-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    <span className="h-7 w-1 shrink-0 rounded-full" style={{ backgroundColor: layer.color }} />
                    {layer.label}
                  </span>
                  <span className={`text-xs font-bold tabular-nums ${layer.text}`}>{formatLiabilityMetric(layer.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="liability-metric-grid">
          <ModuleMetricCard
            className={compactCardClass}
            label="Total Exposure"
            value={formatLiabilityMetric(totalRisk)}
            description="Projected wage exposure + assets at risk"
            accent="primary"
          />
          <ModuleMetricCard
            className={compactCardClass}
            label="Total Current Coverage"
            value={formatLiabilityMetric(outputs.householdTotalCoverage)}
            description="Auto liability + existing umbrella"
            accent="primary"
          />
          <ModuleMetricCard
            className={compactCardClass}
            label="Coverage Gap"
            value={formatLiabilityMetric(outputs.householdLiabilityGap)}
            description="Exposure minus current coverage"
            accent={outputs.householdLiabilityGap > 0 ? "negative" : "positive"}
          />
          <ModuleMetricCard
            className={compactCardClass}
            label="Needed Umbrella"
            value={formatLiabilityMetric(neededUmbrellaCoverage)}
            description={advisorSafeCopy.liability.umbrellaNeededDescription}
            accent={neededUmbrellaCoverage > 0 ? "negative" : "positive"}
          />
        </div>
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
        {advisorSafeCopy.liability.notRecommendation} Wage garnishment uses a simplified disposable-income proxy; actual garnishment rules vary by jurisdiction and case type. {advisorSafeCopy.liability.umbrellaBlocks}
      </p>
    </div>
  )
}
