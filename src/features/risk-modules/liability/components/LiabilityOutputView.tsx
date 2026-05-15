import { LiabilityOutputs } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useOnceAnimation } from "@/lib/use-once-animation"
import { transformLiabilityChartData } from "../transformers/transformLiabilityChartData"

interface LiabilityOutputViewProps {
  outputs: LiabilityOutputs
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm shadow-sm">
      <p className="mb-2 font-medium text-gray-100">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="mb-1 flex justify-between gap-4">
          <span style={{ color: entry.color }}>{entry.name}:</span>
          <span className="font-semibold">{formatCurrency(entry.value)}</span>
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

function LiabilityMetricCard({
  label,
  value,
  description,
  accent = "slate",
}: {
  label: string
  value: string
  description: string
  accent?: "slate" | "green" | "red" | "cyan"
}) {
  const tone = {
    slate: { line: "bg-slate-400", value: "text-slate-50", border: "border-slate-800/90" },
    green: { line: "bg-emerald-400", value: "text-emerald-300", border: "border-emerald-900/40" },
    red: { line: "bg-rose-400", value: "text-rose-300", border: "border-rose-900/40" },
    cyan: { line: "bg-cyan-400", value: "text-cyan-300", border: "border-cyan-900/40" },
  }[accent]

  return (
    <Card className={`h-full ${tone.border} bg-slate-950/70`}>
      <CardContent className="p-3.5">
        <div className={`mb-2.5 h-0.5 w-12 rounded-full ${tone.line}`} />
        <div className="text-[10px] font-bold uppercase leading-snug tracking-[0.18em] text-slate-400">{label}</div>
        <div className={`mt-1.5 text-2xl font-bold leading-tight tracking-tight ${tone.value}`}>{value}</div>
        <p className="mt-1.5 text-[11px] font-medium leading-snug text-slate-500">{description}</p>
      </CardContent>
    </Card>
  )
}

export function LiabilityOutputView({ outputs }: LiabilityOutputViewProps) {
  const chartData = transformLiabilityChartData(outputs)
  const anim = useOnceAnimation(chartData.animationKey)
  const totalRisk = outputs.totalHouseholdLiabilityRisk || outputs.householdAutoLiabilityCoverage + outputs.householdLiabilityGap

  return (
    <div className="module-output-container">
      <div className="module-visual-dashboard">
        <Card className="module-visual-panel border-slate-800/90 bg-slate-950/70">
            <CardHeader className="pb-2">
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Liability Protection Stack</CardTitle>
                <p className="mt-1 text-sm text-slate-400">Household auto coverage applied against total household liability risk.</p>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {/* axis-label wrapper */}
              <div className="flex items-stretch gap-1">
                <div className="flex w-3.5 shrink-0 items-center justify-center">
                  <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                    className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Amount ($)
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%" debounce={100}>
                      <BarChart
                        data={chartData.protectionStackData}
                        margin={{ top: 18, right: 28, left: 0, bottom: 8 }}
                        barSize={86}
                      >
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(val) => `$${Math.round(Number(val) / 1000)}k`}
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          width={52}
                        />
                        <Tooltip content={CustomTooltip} cursor={{ fill: "transparent" }} />
                        <Bar
                          dataKey="Coverage"
                          name="Household Auto Liability Coverage"
                          stackId="a"
                          fill="#22c55e"
                          radius={outputs.householdLiabilityGap > 0 ? [0, 0, 0, 0] : [6, 6, 0, 0]}
                          isAnimationActive={anim.active}
                          animationBegin={anim.begin(0)}
                          animationDuration={anim.duration}
                          animationEasing={anim.easing}
                        />
                        <Bar
                          dataKey="ExposureGap"
                          name="Household Liability Gap"
                          stackId="a"
                          fill="#f43f5e"
                          radius={[6, 6, 0, 0]}
                          isAnimationActive={anim.active}
                          animationBegin={anim.begin(1)}
                          animationDuration={anim.duration}
                          animationEasing={anim.easing}
                          onAnimationEnd={anim.done}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-1 text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Protection Category</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-5 text-xs font-medium text-slate-400">
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Household Auto Liability Coverage</span>
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-rose-500" /> Household Liability Gap</span>
              </div>
            </CardContent>
          </Card>

        <div className="module-metric-rail">
          <LiabilityMetricCard
            label="Household Wage Garnishment Risk"
            value={formatLiabilityMetric(outputs.householdWageGarnishmentRisk)}
            description="25% of all projected household income to age 65 at 3%/yr"
            accent="red"
          />
          <LiabilityMetricCard
            label="Non-Qualified Assets at Risk"
            value={formatLiabilityMetric(outputs.nonQualifiedAssetsAtRisk)}
            description="Combined taxable assets exposed to judgment"
            accent="red"
          />
          <LiabilityMetricCard
            label="Total Household Liability Risk"
            value={formatLiabilityMetric(totalRisk)}
            description="Wage garnishment risk + non-qualified assets"
            accent="cyan"
          />
          <LiabilityMetricCard
            label="Household Auto Liability Coverage"
            value={formatLiabilityMetric(outputs.householdAutoLiabilityCoverage)}
            description="Underlying auto policy limit"
            accent="green"
          />
          <LiabilityMetricCard
            label="Household Liability Gap"
            value={formatLiabilityMetric(outputs.householdLiabilityGap)}
            description="Total household liability risk minus auto coverage"
            accent={outputs.householdLiabilityGap > 0 ? "red" : "green"}
          />
        </div>
      </div>
    </div>
  )
}
