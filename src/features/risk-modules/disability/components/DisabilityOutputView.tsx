import { DisabilityOutputs } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts"
import { getDisabilityNarrative } from "../constants/moduleCopy"
import { AnimatedSection } from "@/components/ui/animated-section"
import { useOnceAnimation } from "@/lib/use-once-animation"
import { transformDisabilityChartData } from "../transformers/transformDisabilityChartData"

interface DisabilityOutputViewProps {
  outputs: DisabilityOutputs
}

const CustomStackTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 p-3 border border-gray-700 rounded-lg shadow-sm text-sm">
      <p className="font-medium text-gray-100 mb-2">{label}</p>
      {payload.map((entry: any, index: number) =>
        entry.value > 0 ? (
          <div key={index} className="flex justify-between gap-4 mb-1">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-semibold">{formatCurrency(entry.value)}/mo</span>
          </div>
        ) : null
      )}
    </div>
  )
}

const CustomTimelineTooltip = ({ active, payload, label }: any) => {
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

const legendStyle = { fontSize: "12px", color: "#64748b" }

export function DisabilityOutputView({ outputs }: DisabilityOutputViewProps) {
  const chartData = transformDisabilityChartData(outputs)
  const barAnim = useOnceAnimation(`bar-${chartData.animationKey}`)
  const areaAnim = useOnceAnimation(`area-${chartData.animationKey}`)

  return (
    <div className="space-y-6 flex flex-col h-full w-full">
      {/* Lead KPI — income replacement rate is the core advisor story for DI */}
      <div className="grid gap-4 sm:grid-cols-2">
        <AnimatedSection delay={0}>
          <Card className="border-gray-800 bg-gray-900/60">
            <CardContent className="p-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Income Replaced by Benefits</div>
              <div className="text-3xl font-bold tracking-tight text-emerald-500">
                {formatPercent(outputs.peakIncomeReplacementRate)}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {formatCurrency(outputs.existingBenefitsPeakMonthly)}/mo peak · of {formatCurrency(outputs.monthlyIncomePreDisability)}/mo pre-disability
              </p>
            </CardContent>
          </Card>
        </AnimatedSection>
        <AnimatedSection delay={0.08}>
          <Card className="border-red-900/40 bg-gray-900/60">
            <CardContent className="p-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Income Gap — Private DI Can Fill</div>
              <div className="text-3xl font-bold tracking-tight text-rose-500">
                {formatPercent(outputs.incomeGapRate)}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                ≈ {formatCurrency(outputs.averageMonthlyGap)}/mo avg uncovered
              </p>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <AnimatedSection delay={0.14}>
          <Card className="border-gray-800">
            <CardContent className="p-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Avg Monthly Gap</div>
              <div className="text-2xl font-bold tracking-tight text-amber-600">
                {formatCurrency(outputs.averageMonthlyGap)}<span className="text-sm font-normal text-gray-500">/mo</span>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={0.20}>
          <Card className="border-gray-800">
            <CardContent className="p-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Uncovered Gap</div>
              <div className="text-2xl font-bold tracking-tight text-amber-500">
                {formatCurrency(outputs.totalUncoveredGap)}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Across full modeled period</p>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={0.26} className="sm:col-span-2 md:col-span-1">
          <Card className="border-gray-800 h-full">
            <CardContent className="p-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Lifestyle Compression</div>
              <div className="text-2xl font-bold tracking-tight text-rose-600">
                {formatPercent(outputs.lifestyleCompressionRequired)}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Required spending cut</p>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatedSection delay={0.26}>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Peak Gap Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.gapStackData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={80}>
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(val) => `$${val / 1000}k`} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={CustomStackTooltip} cursor={{ fill: "transparent" }} />
                    <Legend wrapperStyle={legendStyle} />
                    <Bar dataKey="Expenses" stackId="a" fill="#334155" isAnimationActive={barAnim.active} animationBegin={barAnim.begin(0)} animationDuration={barAnim.duration} animationEasing={barAnim.easing} />
                    <Bar dataKey="Available" stackId="a" fill="#22c55e" isAnimationActive={barAnim.active} animationBegin={barAnim.begin(1)} animationDuration={barAnim.duration} animationEasing={barAnim.easing} />
                    <Bar dataKey="Gap" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} isAnimationActive={barAnim.active} animationBegin={barAnim.begin(2)} animationDuration={barAnim.duration} animationEasing={barAnim.easing} onAnimationEnd={barAnim.done} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={0.34}>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reserve Depletion Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.reserveTimelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorReserveDI" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorShortfallDI" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="Month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(val) => `$${val / 1000}k`} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={CustomTimelineTooltip} />
                    <Legend wrapperStyle={legendStyle} />
                    <Area type="monotone" dataKey="ReserveBalance" name="Cash Reserves" stroke="#22c55e" fillOpacity={1} fill="url(#colorReserveDI)" isAnimationActive={areaAnim.active} animationBegin={areaAnim.begin(0)} animationDuration={areaAnim.duration + 120} animationEasing={areaAnim.easing} />
                    <Area type="monotone" dataKey="Shortfall" name="Unfunded Shortfall" stroke="#f43f5e" fillOpacity={1} fill="url(#colorShortfallDI)" isAnimationActive={areaAnim.active} animationBegin={areaAnim.begin(1)} animationDuration={areaAnim.duration + 120} animationEasing={areaAnim.easing} onAnimationEnd={areaAnim.done} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      <AnimatedSection delay={0.44}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-gray-800 bg-gray-900/40">
            <CardContent className="p-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Benefit Summary</div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Total Benefits</span>
                  <span className="font-semibold text-gray-50">{formatCurrency(outputs.totalBenefitsReceived)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900/40">
            <CardContent className="p-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Exposure</div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Total Uncovered Gap</span>
                  <span className="font-semibold text-amber-600">{formatCurrency(outputs.totalUncoveredGap)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Assumes a modeled duration of {outputs.timeline.length} months.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.52}>
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
