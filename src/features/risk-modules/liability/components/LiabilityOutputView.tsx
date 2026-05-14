import { LiabilityOutputs } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { getLiabilityNarrative } from "../constants/moduleCopy"
import { AnimatedSection } from "@/components/ui/animated-section"
import { useOnceAnimation } from "@/lib/use-once-animation"
import { transformLiabilityChartData } from "../transformers/transformLiabilityChartData"

interface LiabilityOutputViewProps {
  outputs: LiabilityOutputs
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 p-3 border border-gray-700 rounded-lg shadow-sm text-sm">
      <p className="font-medium text-gray-100 mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex justify-between gap-4 mb-1">
          <span style={{ color: entry.color }}>{entry.name}:</span>
          <span className="font-semibold">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function LiabilityOutputView({ outputs }: LiabilityOutputViewProps) {
  const chartData = transformLiabilityChartData(outputs)
  const anim = useOnceAnimation(chartData.animationKey)

  return (
    <div className="space-y-6 flex flex-col h-full w-full">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnimatedSection delay={0}>
          <Card className="border-gray-800 h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Household Wage Garnishment Risk</div>
              <div className="text-2xl font-bold tracking-tight text-gray-50">{formatCurrency(outputs.householdWageGarnishmentRisk)}</div>
            </CardContent>
          </Card>
        </AnimatedSection>
        <AnimatedSection delay={0.08}>
          <Card className="border-gray-800 h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Non-Qualified Assets at Risk</div>
              <div className="text-2xl font-bold tracking-tight text-gray-50">{formatCurrency(outputs.nonQualifiedAssetsAtRisk)}</div>
            </CardContent>
          </Card>
        </AnimatedSection>
        <AnimatedSection delay={0.16}>
          <Card className="border-gray-800 h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Auto Liability Coverage</div>
              <div className="text-2xl font-bold tracking-tight text-gray-50">{formatCurrency(outputs.householdAutoLiabilityCoverage)}</div>
            </CardContent>
          </Card>
        </AnimatedSection>
        <AnimatedSection delay={0.24}>
          <Card className="border-gray-800 h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Household Liability Gap</div>
              <div className="text-2xl font-bold tracking-tight text-gray-50">{formatCurrency(outputs.householdLiabilityGap)}</div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      <AnimatedSection delay={0.3}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Liability Protection Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.protectionStackData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={80}>
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(val) => `$${val / 1000}k`} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={CustomTooltip} cursor={{ fill: "transparent" }} />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#64748b" }} />
                  <Bar dataKey="Coverage" stackId="a" fill="#22c55e" radius={outputs.exposureGap > 0 ? [0, 0, 0, 0] : [4, 4, 0, 0]} isAnimationActive={anim.active} animationBegin={anim.begin(0)} animationDuration={anim.duration} animationEasing={anim.easing} />
                  <Bar dataKey="ExposureGap" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} isAnimationActive={anim.active} animationBegin={anim.begin(1)} animationDuration={anim.duration} animationEasing={anim.easing} onAnimationEnd={anim.done} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      <AnimatedSection delay={0.38}>
        <Card className="bg-[#090E1A] text-white border border-gray-800">
          <CardContent className="p-6">
            <h4 className="font-semibold text-blue-400 mb-2 uppercase tracking-wider text-xs">Advisor Narrative</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{getLiabilityNarrative(outputs)}</p>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  )
}
