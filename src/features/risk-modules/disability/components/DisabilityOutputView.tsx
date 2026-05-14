import { DisabilityOutputs } from "../types"
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
import { getDisabilityNarrative } from "../constants/moduleCopy"
import { AnimatedSection } from "@/components/ui/animated-section"
import { useOnceAnimation } from "@/lib/use-once-animation"
import { transformDisabilityChartData } from "../transformers/transformDisabilityChartData"

interface DisabilityOutputViewProps {
  outputs: DisabilityOutputs
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 p-3 border border-gray-700 rounded-lg shadow-lg text-sm min-w-45">
      <p className="font-semibold text-gray-100 mb-2">Age {label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex justify-between gap-4 mb-1">
          <span style={{ color: entry.color }} className="text-xs">{entry.name}:</span>
          <span className="font-semibold text-xs text-gray-100">{formatCurrency(entry.value)}/yr</span>
        </div>
      ))}
    </div>
  )
}

const legendFormatter = (value: string) => (
  <span style={{ color: "#9ca3af", fontSize: 12 }}>{value}</span>
)

export function DisabilityOutputView({ outputs }: DisabilityOutputViewProps) {
  const chartData = transformDisabilityChartData(outputs)
  const anim = useOnceAnimation(chartData.animationKey)

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* ── Monthly benefit KPI cards ──────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnimatedSection delay={0}>
          <Card className="border-gray-800 h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Group LTD Monthly (Net)</div>
              <div className="text-2xl font-bold tracking-tight text-gray-50">
                {formatCurrency(outputs.ltdNetMonthlyBenefit)}<span className="text-sm font-normal text-gray-400">/mo</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Gross {formatCurrency(outputs.ltdComputedMonthlyBenefit)}/mo
                {outputs.ltdNetMonthlyBenefit < outputs.ltdComputedMonthlyBenefit ? " · 70% after tax" : " · non-taxable"}
              </p>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={0.08}>
          <Card className="border-gray-800 h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Individual DI Monthly</div>
              <div className="text-2xl font-bold tracking-tight text-gray-50">
                {formatCurrency(outputs.privateDiMonthlyBenefit)}<span className="text-sm font-normal text-gray-400">/mo</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Supplemental individual coverage</p>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={0.16}>
          <Card className="border-gray-800 h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Monthly Benefit</div>
              <div className="text-2xl font-bold tracking-tight text-gray-50">
                {formatCurrency(outputs.totalNetMonthlyBenefit)}<span className="text-sm font-normal text-gray-400">/mo</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Combined group LTD + individual DI</p>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={0.24}>
          <Card className="border-gray-800 h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Coverage Rate</div>
              <div className="text-2xl font-bold tracking-tight text-gray-50">
                {formatPercent(outputs.averageCoverageRate)}
              </div>
              <p className="text-xs text-gray-400 mt-2">Of projected lifetime income covered</p>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      {/* ── Income projection chart ────────────────────────────────────────── */}
      <AnimatedSection delay={0.30}>
        <Card className="border-gray-800">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
              Income vs. Disability Coverage — Annual Projection (3% Growth)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.projectionChartData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                  barCategoryGap="8%"
                >
                  <XAxis
                    dataKey="age"
                    tick={({ x, y, payload }) => {
                      const ages = chartData.projectionChartData.map((d) => d.age)
                      const step = Math.ceil(ages.length / 8)
                      const showTick = ages.indexOf(payload.value) % step === 0 || payload.value === ages.at(-1)
                      return showTick ? (
                        <text x={x} y={y + 12} textAnchor="middle" fill="#64748b" fontSize={11}>{payload.value}</text>
                      ) : <g />
                    }}
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
                  <Bar
                    dataKey="Group LTD"
                    stackId="a"
                    fill="#3b82f6"
                    isAnimationActive={anim.active}
                    animationBegin={anim.begin(0)}
                    animationDuration={anim.duration}
                    animationEasing={anim.easing}
                  />
                  <Bar
                    dataKey="Individual DI"
                    stackId="a"
                    fill="#06b6d4"
                    isAnimationActive={anim.active}
                    animationBegin={anim.begin(1)}
                    animationDuration={anim.duration}
                    animationEasing={anim.easing}
                  />
                  <Bar
                    dataKey="Income Gap"
                    stackId="a"
                    fill="#ef4444"
                    radius={[2, 2, 0, 0]}
                    isAnimationActive={anim.active}
                    animationBegin={anim.begin(2)}
                    animationDuration={anim.duration}
                    animationEasing={anim.easing}
                    onAnimationEnd={anim.done}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* ── Coverage summary table ─────────────────────────────────────────── */}
      <AnimatedSection delay={0.38}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-gray-800 bg-gray-900/40">
            <CardContent className="p-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Lifetime Coverage Summary</div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Total Projected Income</span>
                  <span className="font-semibold text-gray-50">{formatCurrency(outputs.totalProjectedIncome)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Group LTD Coverage</span>
                  <span className="font-semibold text-blue-300">{formatCurrency(outputs.totalGroupLTDCoverage)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Individual DI Coverage</span>
                  <span className="font-semibold text-cyan-300">{formatCurrency(outputs.totalIndividualDICoverage)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Coverage</span>
                  <span className="font-semibold text-green-400">{formatCurrency(outputs.totalCoverage)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900/40">
            <CardContent className="p-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Income at Retirement</div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Projected Annual Income</span>
                  <span className="font-semibold text-gray-50">{formatCurrency(outputs.projectedIncomeAtRetirement)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Uncovered Gap (Lifetime)</span>
                  <span className="font-semibold text-red-400">{formatCurrency(outputs.totalGap)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Coverage Rate</span>
                  <span className="font-semibold text-gray-50">{formatPercent(outputs.averageCoverageRate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AnimatedSection>

      {/* ── Advisor narrative ─────────────────────────────────────────────── */}
      <AnimatedSection delay={0.46}>
        <Card className="bg-[#090E1A] text-white border border-gray-800">
          <CardContent className="p-6">
            <h4 className="font-semibold text-blue-400 mb-2 uppercase tracking-wider text-xs">Advisor Narrative</h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              {getDisabilityNarrative(outputs)}
            </p>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  )
}
