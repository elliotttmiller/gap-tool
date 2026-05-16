import { useState } from "react"
import { DisabilityOutputs } from "../types"
import type { DisabilityInputs } from "../types"
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
import { transformDisabilityChartData } from "../transformers/transformDisabilityChartData"
import { BreakEvenCalculator } from "../calculators/BreakEvenCalculator"
import { ModuleMetricCard, MetricGroup, MetricGroupDivider } from "@/features/risk-modules/core/ModuleMetricCard"

interface DisabilityOutputViewProps {
  outputs: DisabilityOutputs
  inputs?: DisabilityInputs
  formOpen?: boolean
}

// ── Helper: derive monthly KPI values for a given age ─────────────────────
function getMonthlyStatsAtAge(outputs: DisabilityOutputs, age: number) {
  const point = outputs.incomeProjection.find((p) => p.age === age)
  if (!point) {
    const startingPoint = outputs.incomeProjection[0]
    const incomeGrossMonthly = (startingPoint?.annualIncome ?? 0) / 12
    const incomeNetMonthly = (startingPoint?.annualIncomeNet ?? 0) / 12
    const totalGrossMonthly = outputs.ltdComputedMonthlyBenefit + outputs.privateDiMonthlyBenefit
    return {
      ltdNetMonthly: outputs.ltdNetMonthlyBenefit,
      ltdGrossMonthly: outputs.ltdComputedMonthlyBenefit,
      individualDIMonthly: outputs.privateDiMonthlyBenefit,
      totalNetMonthly: outputs.totalNetMonthlyBenefit,
      totalGrossMonthly,
      incomeGrossMonthly,
      incomeNetMonthly,
      incomeLossNet: incomeNetMonthly - outputs.totalNetMonthlyBenefit,
      incomeLossGross: incomeGrossMonthly - totalGrossMonthly,
    }
  }
  const ltdNetMonthly = point.ltdAnnualBenefit / 12
  const ltdGrossMonthly = point.ltdAnnualBenefitGross / 12
  const individualDIMonthly = point.individualDIAnnualBenefit / 12
  const totalNetMonthly = point.totalAnnualBenefit / 12
  const totalGrossMonthly = ltdGrossMonthly + individualDIMonthly
  const incomeGrossMonthly = point.annualIncome / 12
  const incomeNetMonthly = point.annualIncomeNet / 12
  const incomeLossNet = incomeNetMonthly - totalNetMonthly
  const incomeLossGross = incomeGrossMonthly - totalGrossMonthly
  return {
    ltdNetMonthly,
    ltdGrossMonthly,
    individualDIMonthly,
    totalNetMonthly,
    totalGrossMonthly,
    incomeGrossMonthly,
    incomeNetMonthly,
    incomeLossNet,
    incomeLossGross,
  }
}

const legendFormatter = (value: string) => (
  <span style={{ color: "#9ca3af", fontSize: 12 }}>{value}</span>
)

export function DisabilityOutputView({ outputs, inputs, formOpen = false }: DisabilityOutputViewProps) {
  const chartData = transformDisabilityChartData(outputs)

  // ── Interactivity state ────────────────────────────────────────────────
  const [selectedAge, setSelectedAge] = useState<number | null>(null)
  const [chartView, setChartView] = useState<"net" | "gross">("net")
  const [visualization, setVisualization] = useState<"coverage" | "module2">("coverage")

  const startAge = outputs.incomeProjection[0]?.age ?? 0
  const displayAge = selectedAge ?? startAge
  const monthly = getMonthlyStatsAtAge(outputs, displayAge)

  const ltdDisplayMonthly = chartView === "gross" ? monthly.ltdGrossMonthly : monthly.ltdNetMonthly
  const totalDisplayMonthly = chartView === "gross" ? monthly.totalGrossMonthly : monthly.totalNetMonthly
  const incomeLossDisplayMonthly = chartView === "gross" ? monthly.incomeLossGross : monthly.incomeLossNet
  const assumedIncomeKey = chartView === "gross" ? "Assumed Income (Gross)" : "Assumed Income (Net)"
  const assumedIncomeLabel = chartView === "gross" ? "Assumed Income (Gross)" : "Assumed Income (Net)"
  const ltdLabel = chartView === "gross" ? "Group LTD (Gross)" : "Group LTD (Net)"
  const totalBenefitLabel = chartView === "gross" ? "Total Benefit (Gross)" : "Total Benefit (Net)"
  const incomeLossLabel = chartView === "gross" ? "Income Loss (Gross)" : "Income Loss (Net)"
  const incomeLossDescription = chartView === "gross"
    ? "Assumed gross income minus total gross monthly benefit"
    : "Assumed net income minus total net monthly benefit"

  const totalProjectedIncomeGross = outputs.incomeProjection.reduce((sum, point) => sum + point.annualIncome, 0)
  const projectedIncomeAtRetirementGross = outputs.incomeProjection.at(-1)?.annualIncome ?? 0
  const totalCoverageGross = outputs.incomeProjection.reduce(
    (sum, point) => sum + point.ltdAnnualBenefitGross + point.individualDIAnnualBenefit,
    0,
  )
  const totalGapGross = outputs.incomeProjection.reduce(
    (sum, point) => sum + Math.max(0, point.annualIncome - (point.ltdAnnualBenefitGross + point.individualDIAnnualBenefit)),
    0,
  )
  const averageCoverageRateGross = totalProjectedIncomeGross > 0 ? totalCoverageGross / totalProjectedIncomeGross : 0

  const projectedIncomeDisplay = chartView === "gross" ? totalProjectedIncomeGross : outputs.totalProjectedIncome
  const retirementIncomeDisplay = chartView === "gross" ? projectedIncomeAtRetirementGross : outputs.projectedIncomeAtRetirement
  const totalGapDisplay = chartView === "gross" ? totalGapGross : outputs.totalGap
  const averageCoverageRateDisplay = chartView === "gross" ? averageCoverageRateGross : outputs.averageCoverageRate

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const assumedIncomeAnnual = payload[0]?.payload?.[assumedIncomeKey] ?? 0
    return (
      <div className="bg-gray-900 p-3 border border-gray-700 rounded-lg shadow-lg text-sm min-w-52">
        <p className="font-semibold text-gray-100 mb-2">Age {label}</p>
        <div className="flex justify-between gap-4 mb-1.5">
          <span className="text-xs text-slate-300">{assumedIncomeLabel}:</span>
          <span className="font-semibold text-xs text-slate-100">
            {formatCurrency(assumedIncomeAnnual)}/yr · {formatCurrency(assumedIncomeAnnual / 12)}/mo
          </span>
        </div>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex justify-between gap-4 mb-1">
            <span style={{ color: entry.color }} className="text-xs">{entry.name}:</span>
            <span className="font-semibold text-xs text-gray-100">
              {formatCurrency(entry.value)}/yr · {formatCurrency(entry.value / 12)}/mo
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* ── Income projection chart ────────────────────────────────────────── */}
      <AnimatedSection delay={0.30}>
        <div className="mb-3 inline-flex max-w-full overflow-x-auto rounded-lg border border-gray-800 bg-[#090E1A] p-1 text-xs">
          <button
            type="button"
            onClick={() => setVisualization("coverage")}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 font-semibold transition-colors ${visualization === "coverage" ? "bg-brand-600 text-white" : "text-gray-400 hover:text-gray-100"}`}
          >
            Annual Coverage
          </button>
          <button
            type="button"
            onClick={() => setVisualization("module2")}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 font-semibold transition-colors ${visualization === "module2" ? "bg-brand-600 text-white" : "text-gray-400 hover:text-gray-100"}`}
          >
            Break Even
          </button>
          <button
            type="button"
            disabled
            className="whitespace-nowrap rounded-md px-3 py-1.5 font-semibold text-gray-600"
          >
            Module 3
          </button>
        </div>

        {visualization === "coverage" ? (
          <div className="module-output-container">
          <div className={`disability-coverage-grid${formOpen ? " disability-coverage-grid--form-open" : ""}`}>

          {/* ── SUMMARY: below chart (narrow) / left column (wide) ───── */}
          <div className="disability-summary-rail">
            {/* Lifetime Coverage */}
            <Card className="module-kpi-card">
              <CardContent className="p-3.5">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Lifetime Coverage
                </div>
                  <div className="divide-y divide-slate-800/80 text-xs">
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-400">Proj. Income</span>
                      <span className="font-mono font-semibold text-slate-200">{formatCurrency(projectedIncomeDisplay)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-400">Group LTD</span>
                    <span className="font-mono font-semibold text-blue-300">{formatCurrency(outputs.totalGroupLTDCoverage)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Individual DI</span>
                    <span className="font-mono font-semibold text-cyan-300">{formatCurrency(outputs.totalIndividualDICoverage)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Total</span>
                    <span className="font-mono font-semibold text-emerald-400">{formatCurrency(outputs.totalCoverage)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* At Retirement */}
            <Card className="module-kpi-card">
              <CardContent className="p-3.5">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  At Retirement
                </div>
                  <div className="divide-y divide-slate-800/80 text-xs">
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-400">Annual Income</span>
                      <span className="font-mono font-semibold text-slate-200">{formatCurrency(retirementIncomeDisplay)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-400">Uncov. Gap</span>
                      <span className="font-mono font-semibold text-red-400">{formatCurrency(totalGapDisplay)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-400">Coverage</span>
                      <span className="font-mono font-semibold text-slate-200">{formatPercent(averageCoverageRateDisplay)}</span>
                    </div>
                  {outputs.lifetimeIDIExpense > 0 && (
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-400">IDI Expense</span>
                      <span className="font-mono font-semibold text-amber-400">{formatCurrency(outputs.lifetimeIDIExpense)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── CENTRE: chart panel ──────────────────────────────────── */}
          <Card className="disability-chart-panel module-visual-panel flex flex-col border-slate-800/80 bg-slate-950/60">
            <CardHeader className="shrink-0 px-6 pb-0 pt-5">
              <div className="relative flex items-start justify-center">
                <div className="text-center">
                  <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                    Income vs. Disability Coverage — Annual Projection
                  </CardTitle>
                  <p className="mt-1 text-sm leading-snug text-slate-400">
                    LTD and individual DI benefits stacked against projected income need
                  </p>
                  {selectedAge !== null && (
                    <div className="flex items-center justify-center gap-2 mt-1.5">
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
                {/* Net / Gross toggle */}
                <div className="absolute right-0 top-0 flex rounded-md overflow-hidden border border-gray-700 text-xs shrink-0">
                  <button
                    onClick={() => setChartView("net")}
                    className={`px-3 py-1 transition-colors ${chartView === "net" ? "bg-brand-600 text-white" : "bg-gray-900 text-gray-400 hover:text-gray-100"}`}
                  >
                    Net
                  </button>
                  <button
                    onClick={() => setChartView("gross")}
                    className={`px-3 py-1 transition-colors ${chartView === "gross" ? "bg-brand-600 text-white" : "bg-gray-900 text-gray-400 hover:text-gray-100"}`}
                  >
                    Gross
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col min-h-0 px-6 pb-6 pt-4">
              {/* axis-label wrapper: [y-title] [chart+x-title] */}
              <div className="flex flex-1 min-h-0 items-stretch gap-1">
                <div className="flex w-3.5 shrink-0 items-center justify-center">
                  <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                    className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Annual Benefit ($)
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex-1 min-h-52 w-full chart-reveal">
                    <ResponsiveContainer width="100%" height="100%" debounce={100}>
                      <BarChart
                        data={chartData.projectionChartData}
                        margin={{ top: 10, right: 16, left: 0, bottom: 4 }}
                        barCategoryGap="8%"
                        onClick={(data) => {
                          if (data?.activePayload) setSelectedAge(Number(data.activeLabel))
                        }}
                        style={{ cursor: "pointer" }}
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
                          width={48}
                        />
                        <Tooltip content={CustomTooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                        <Bar
                          dataKey={ltdLabel}
                          stackId="a"
                          fill="#3b82f6"
                          isAnimationActive={false}
                        />
                        <Bar
                          dataKey="Individual DI"
                          stackId="a"
                          fill="#06b6d4"
                          isAnimationActive={false}
                        />
                        <Bar
                          dataKey="Income Gap"
                          stackId="a"
                          fill="#ef4444"
                          radius={[2, 2, 0, 0]}
                          isAnimationActive={false}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-1 text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Age</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400"><span className="inline-block h-2.5 w-4 rounded-sm bg-[#3b82f6]" />{ltdLabel}</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400"><span className="inline-block h-2.5 w-4 rounded-sm bg-[#06b6d4]" />Individual DI</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400"><span className="inline-block h-2.5 w-4 rounded-sm bg-[#ef4444]" />Income Gap</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── RIGHT: metric rail ───────────────────────────────────── */}
          <div className="module-metric-rail">
            <MetricGroup title="Monthly Benefits">
              <ModuleMetricCard
                label={ltdLabel}
                value={<>{formatCurrency(ltdDisplayMonthly)}<span className="text-sm font-normal text-gray-400">/mo</span></>}
                description={chartView === "gross" ? "Gross monthly LTD benefit" : "Net after-tax LTD monthly benefit"}
                accent="blue"
              />
              <ModuleMetricCard
                label="Individual DI"
                value={<>{formatCurrency(monthly.individualDIMonthly)}<span className="text-sm font-normal text-gray-400">/mo</span></>}
                description="Private disability insurance benefit"
                accent="cyan"
              />
              <ModuleMetricCard
                label={totalBenefitLabel}
                value={<>{formatCurrency(totalDisplayMonthly)}<span className="text-sm font-normal text-gray-400">/mo</span></>}
                description="Combined LTD + individual DI monthly benefit"
                accent="slate"
              />
            </MetricGroup>
            <MetricGroupDivider />
            <MetricGroup title="Gap">
              <ModuleMetricCard
                label={incomeLossLabel}
                value={<>{formatCurrency(incomeLossDisplayMonthly)}<span className="text-sm font-normal text-gray-400">/mo</span></>}
                description={incomeLossDescription}
                accent="red"
              />
            </MetricGroup>
          </div>
          </div>
          </div>
        ) : (
          <BreakEvenCalculator
            monthlyPremium={inputs?.privateDiMonthlyPremium ?? 0}
            monthlyBenefit={inputs?.privateDiBenefitMonthly ?? 0}
            annualRateOfReturn={inputs?.breakEvenRateOfReturn ?? 0.06}
            monthsWithoutIncome={inputs?.breakEvenMonthsWithoutIncome ?? 12}
          />
        )}
      </AnimatedSection>

      {/* ── Advisor narrative ─────────────────────────────────────────────── */}
      {visualization === "coverage" && (
        <AnimatedSection delay={0.46}>
          <Card className="bg-[#090E1A] text-white border border-gray-800">
            <CardContent className="p-6">
              <h4 className="font-semibold text-blue-400 mb-2 uppercase tracking-wider text-xs">Planning Narrative</h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {getDisabilityNarrative(outputs)}
              </p>
            </CardContent>
          </Card>
        </AnimatedSection>
      )}
    </div>
  )
}
