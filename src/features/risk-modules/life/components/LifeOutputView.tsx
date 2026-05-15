import { useState } from "react"
import { LifeOutputs } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { getLifeInsuranceNarrative } from "../constants/moduleCopy"
import { AnimatedSection } from "@/components/ui/animated-section"
import { transformLifeCoverageChartData } from "../transformers/transformLifeChartData"
import { ModuleMetricCard, MetricGroup, MetricGroupDivider } from "@/features/risk-modules/core/ModuleMetricCard"

interface LifeOutputViewProps {
  outputs: LifeOutputs
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 p-3 border border-gray-700 rounded-lg shadow-lg text-sm min-w-45">
      <p className="font-semibold text-gray-100 mb-2">Age {label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex justify-between gap-4 mb-1">
          <span style={{ color: entry.color }} className="text-xs">{entry.name}:</span>
          <span className="font-semibold text-xs text-gray-100">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

const legendFormatter = (value: string) => (
  <span style={{ color: "#9ca3af", fontSize: 12 }}>{value}</span>
)

function getLifeStatsAtAge(outputs: LifeOutputs, age: number) {
  return outputs.yearlyBreakdown.find((point) => point.age === age) ?? outputs.yearlyBreakdown[0] ?? {
    age,
    totalNeed: 0,
    gliCovered: 0,
    privateCovered: 0,
    survivorGap: 0,
  }
}

export function LifeOutputView({ outputs }: LifeOutputViewProps) {
  const chartData = transformLifeCoverageChartData(outputs)
  const [selectedAge, setSelectedAge] = useState<number | null>(null)

  const startAge = outputs.yearlyBreakdown[0]?.age ?? 0
  const displayAge = selectedAge ?? startAge
  const annual = getLifeStatsAtAge(outputs, displayAge)
  const isYearlyView = selectedAge !== null

  return (
    <div className="module-output-container">
      <div className="module-visual-dashboard">
        <Card className="module-visual-panel flex flex-col border-slate-800/80 bg-slate-950/60">
          <CardHeader className="shrink-0 px-6 pb-0 pt-5">
            <div className="flex flex-wrap items-start gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                  {chartData.chartTitle}
                </CardTitle>
                <p className="mt-1 text-sm leading-snug text-slate-400">
                  Annual income need vs. life insurance coverage to retirement
                </p>
              </div>
              {selectedAge !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-300 bg-blue-900/40 border border-blue-700 rounded-full px-3 py-1">
                    Age {selectedAge}
                  </span>
                  <button
                    onClick={() => setSelectedAge(null)}
                    className="text-xs text-gray-400 hover:text-gray-100 transition-colors"
                    aria-label="Reset to current age"
                  >
                    × Reset
                  </button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col min-h-0 px-6 pb-6 pt-4">
            {/* axis-label wrapper */}
            <div className="flex flex-1 min-h-0 items-stretch gap-1">
              <div className="flex w-3.5 shrink-0 items-center justify-center">
                <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Annual Income ($)
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex-1 min-h-56 w-full chart-reveal">
                  <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <BarChart
                      data={chartData.yearlyCoverageData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 4 }}
                      barCategoryGap="8%"
                      onClick={(data) => {
                        if (data?.activePayload) setSelectedAge(Number(data.activeLabel))
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <XAxis
                        dataKey="age"
                        tick={({ x, y, payload }) => chartData.tickAges.has(payload.value) ? (
                          <text x={x} y={y + 12} textAnchor="middle" fill="#64748b" fontSize={11}>{payload.value}</text>
                        ) : <g />}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
                      <Tooltip content={CustomTooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Legend wrapperStyle={{ paddingTop: "12px" }} formatter={legendFormatter} />
                      <Bar dataKey="gliCovered" name="Covered by Group Life (GLI)" stackId="a" fill="#3b82f6" isAnimationActive={false} />
                      <Bar dataKey="privateCovered" name="Covered by Private Life Insurance" stackId="a" fill="#06b6d4" isAnimationActive={false} />
                      <Bar dataKey="survivorGap" name="Survivor Income Gap" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-1 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Age</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="module-metric-rail">
          <MetricGroup title="Coverage">
            <ModuleMetricCard
              label="Projected Income"
              value={isYearlyView ? <>{formatCurrency(annual.totalNeed)}<span className="text-sm font-normal text-gray-400">/yr</span></> : formatCurrency(outputs.projectedIncomeToRetirement)}
              description={isYearlyView ? "Income need at selected age" : "Total projected income to retirement"}
              accent="slate"
            />
            <ModuleMetricCard
              label="Group Life (GLI)"
              value={isYearlyView ? <>{formatCurrency(annual.gliCovered)}<span className="text-sm font-normal text-gray-400">/yr</span></> : formatCurrency(outputs.groupLifeBenefit)}
              description="Employer group life insurance benefit"
              accent="blue"
            />
            <ModuleMetricCard
              label="Private Life Insurance"
              value={isYearlyView ? <>{formatCurrency(annual.privateCovered)}<span className="text-sm font-normal text-gray-400">/yr</span></> : formatCurrency(outputs.privateLifeBenefit)}
              description="Individual private policy benefit"
              accent="cyan"
            />
          </MetricGroup>
          <MetricGroupDivider />
          <MetricGroup title="Gap">
            <ModuleMetricCard
              label="Survivor Gap"
              value={isYearlyView ? <>{formatCurrency(annual.survivorGap)}<span className="text-sm font-normal text-gray-400">/yr</span></> : formatCurrency(outputs.cumulativeSurvivorGap)}
              description="Uncovered survivor income shortfall"
              accent={annual.survivorGap <= 0 ? "green" : "red"}
            />
          </MetricGroup>
        </div>
      </div>

      <Card className="bg-[#090E1A] border border-gray-800 mt-4">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-400 mb-2 uppercase tracking-wider text-xs">Planning Narrative</h4>
          <p className="text-sm text-gray-300 leading-relaxed">{getLifeInsuranceNarrative(outputs)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
