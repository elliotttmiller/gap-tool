import { LifeOutputs } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"
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
import { useOnceAnimation } from "@/lib/use-once-animation"
import { transformLifeCoverageChartData } from "../transformers/transformLifeChartData"

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

export function LifeOutputView({ outputs }: LifeOutputViewProps) {
  const chartData = transformLifeCoverageChartData(outputs)
  const anim = useOnceAnimation(chartData.animationKey)

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="grid gap-4 md:grid-cols-3">
        <AnimatedSection delay={0}>
          <Card className="border-gray-800">
            <CardContent className="p-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Survivor Income Gap</div>
              <div className="text-2xl font-bold tracking-tight text-amber-500">
                {formatCurrency(outputs.remainingGap)}
              </div>
              <p className="text-[10px] text-gray-600 mt-1">Uncovered protection need</p>
            </CardContent>
          </Card>
        </AnimatedSection>
        <AnimatedSection delay={0.08}>
          <Card className="border-gray-800">
            <CardContent className="p-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Protection Need</div>
              <div className="text-2xl font-bold tracking-tight text-blue-400">
                {formatCurrency(outputs.baseProtectionNeed)}
              </div>
              <p className="text-[10px] text-gray-600 mt-1">Income + debts + goals</p>
            </CardContent>
          </Card>
        </AnimatedSection>
        <AnimatedSection delay={0.16}>
          <Card className="border-gray-800">
            <CardContent className="p-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Coverage Offset</div>
              <div className="text-2xl font-bold tracking-tight text-gray-50">
                {formatPercent(outputs.coverageOffsetPercentage)}
              </div>
              <p className="text-[10px] text-gray-600 mt-1">Of total protection need</p>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      <AnimatedSection delay={0.26}>
        <Card className="border-gray-800">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
              {chartData.chartTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.yearlyCoverageData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                  barCategoryGap="8%"
                >
                  <XAxis
                    dataKey="age"
                    tick={({ x, y, payload }) =>
                      chartData.tickAges.has(payload.value) ? (
                        <text x={x} y={y + 12} textAnchor="middle" fill="#64748b" fontSize={11}>
                          {payload.value}
                        </text>
                      ) : <g />
                    }
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                  />
                  <Tooltip content={CustomTooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Legend wrapperStyle={{ paddingTop: "12px" }} formatter={legendFormatter} />
                  <Bar dataKey="gliCovered" name="Covered by Group Life (GLI)" stackId="a" fill="#3b82f6" isAnimationActive={anim.active} animationBegin={anim.begin(0)} animationDuration={anim.duration} animationEasing={anim.easing} />
                  <Bar dataKey="privateCovered" name="Covered by Private Life Insurance" stackId="a" fill="#06b6d4" isAnimationActive={anim.active} animationBegin={anim.begin(1)} animationDuration={anim.duration} animationEasing={anim.easing} />
                  <Bar dataKey="survivorGap" name="Survivor Income Gap" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} isAnimationActive={anim.active} animationBegin={anim.begin(2)} animationDuration={anim.duration} animationEasing={anim.easing} onAnimationEnd={anim.done} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      <AnimatedSection delay={0.38}>
        <Card className="bg-[#090E1A] border border-gray-800">
          <CardContent className="p-6">
            <h4 className="font-semibold text-blue-400 mb-2 uppercase tracking-wider text-xs">Advisor Narrative</h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              {getLifeInsuranceNarrative(outputs)}
            </p>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  )
}
