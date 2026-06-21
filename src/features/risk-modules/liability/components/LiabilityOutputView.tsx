import { LiabilityOutputs } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { transformLiabilityChartData } from "../transformers/transformLiabilityChartData"
import { ModuleMetricCard } from "@/features/risk-modules/core/ModuleMetricCard"
import { advisorSafeCopy } from "@/domain/copy/advisorSafeCopy"

interface LiabilityOutputViewProps {
  outputs: LiabilityOutputs
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

export function LiabilityOutputView({ outputs }: LiabilityOutputViewProps) {
  const chartData = transformLiabilityChartData(outputs)
  const totalRisk = outputs.totalHouseholdLiabilityRisk
  const coveragePct = totalRisk > 0 ? Math.min(100, (outputs.householdTotalCoverage / totalRisk) * 100) : 0
  const neededUmbrellaCoverage = outputs.neededUmbrellaCoverage
    ?? (outputs.householdLiabilityGap > 0 ? Math.ceil(outputs.householdLiabilityGap / 1_000_000) * 1_000_000 : 0)

  return (
    <div className="liability-output-container">
      <div className="liability-visual-dashboard">
        <Card className="liability-chart-panel-compact border-slate-800/80 bg-slate-950/60">
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

          <CardContent className="px-5 pb-3 pt-2">
            <div className="liability-chart-area chart-reveal">
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <BarChart
                  data={chartData.protectionStackData}
                  margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
                  barSize={92}
                  barCategoryGap="48%"
                >
                  <CartesianGrid stroke="rgba(148,163,184,0.06)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={4} />
                  <YAxis tickFormatter={(val) => `$${Math.round(Number(val) / 1000)}k`} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} width={46} />
                  <Tooltip content={CustomTooltip} cursor={{ fill: "rgba(255,255,255,0.025)" }} />
                  <Bar dataKey="AutoCoverage" name="Auto Liability Coverage" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                  <Bar dataKey="UmbrellaCoverage" name="Umbrella Coverage" stackId="a" fill="#06b6d4" radius={[0, 0, 0, 0]} isAnimationActive={true} animationBegin={100} animationDuration={1200} animationEasing="ease-out" />
                  <Bar dataKey="ExposureGap" name="Unprotected Liability Gap" stackId="a" fill="#f43f5e" radius={[5, 5, 0, 0]} isAnimationActive={true} animationBegin={160} animationDuration={1200} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-slate-800/50 pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400"><span className="h-2 w-4 rounded-sm bg-emerald-500" />Auto Liability</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400"><span className="h-2 w-4 rounded-sm bg-cyan-500" />Umbrella</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400"><span className="h-2 w-4 rounded-sm bg-rose-500" />Unprotected Gap</span>
            </div>
          </CardContent>
        </Card>

        <div className="liability-metric-grid">
          <ModuleMetricCard
            className={compactCardClass}
            label="Total Exposure"
            value={formatLiabilityMetric(totalRisk)}
            description="Projected wage exposure + assets at risk"
            accent="cyan"
          />
          <ModuleMetricCard
            className={compactCardClass}
            label="Total Current Coverage"
            value={formatLiabilityMetric(outputs.householdTotalCoverage)}
            description="Auto liability + existing umbrella"
            accent={outputs.householdTotalCoverage > 0 ? "green" : "red"}
          />
          <ModuleMetricCard
            className={compactCardClass}
            label="Coverage Gap"
            value={formatLiabilityMetric(outputs.householdLiabilityGap)}
            description="Exposure minus current coverage"
            accent={outputs.householdLiabilityGap > 0 ? "red" : "green"}
          />
          <ModuleMetricCard
            className={compactCardClass}
            label="Needed Umbrella"
            value={formatLiabilityMetric(neededUmbrellaCoverage)}
            description={advisorSafeCopy.liability.umbrellaNeededDescription}
            accent={neededUmbrellaCoverage > 0 ? "red" : "green"}
          />
        </div>
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
        {advisorSafeCopy.liability.notRecommendation} Wage garnishment uses a simplified disposable-income proxy; actual garnishment rules vary by jurisdiction and case type. {advisorSafeCopy.liability.umbrellaBlocks}
      </p>
    </div>
  )
}
