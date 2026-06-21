import { useState } from "react"
import { DisabilityOutputs } from "../types"
import type { DisabilityInputs, DisabilityAssumptions } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { getDisabilityNarrative } from "../constants/moduleCopy"
import { AnimatedSection } from "@/components/ui/animated-section"
import { transformDisabilityChartData } from "../transformers/transformDisabilityChartData"
import { PremiumVsSelfInsuredModule } from "../calculators/PremiumVsSelfInsuredModule"
import { JobComparisonModule } from "../calculators/JobComparisonModule"
import {
  ModuleMetricCard,
  MetricGroup,
} from "@/features/risk-modules/core/ModuleMetricCard"

/** Default COLA rate applied when the rider is toggled on (mirrors SSA average). */
const DEFAULT_COLA_RATE = 0.03

interface DisabilityOutputViewProps {
  outputs: DisabilityOutputs
  inputs?: DisabilityInputs
  assumptions?: DisabilityAssumptions
  onAssumptionsChange?: (updates: Partial<DisabilityAssumptions>) => void
  formOpen?: boolean
  mode?: "builder" | "presentation"
  visualization?: DisabilityVisualization
  onVisualizationChange?: (v: DisabilityVisualization) => void
}

type DisabilityVisualization = "incomeGap" | "premiumVsSelfInsured" | "jobComparison"

function buildAgeTicks(data: { age: number }[], targetTickCount = 8): number[] {
  if (data.length === 0) return []
  const firstAge = data[0].age
  const lastAge = data[data.length - 1].age
  if (firstAge === lastAge) return [firstAge]

  const span = lastAge - firstAge
  const rawStep = Math.max(1, Math.ceil(span / Math.max(1, targetTickCount - 1)))

  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const normalized = rawStep / magnitude
  const snappedBase = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  const step = snappedBase * magnitude

  const ticks: number[] = [firstAge]
  let age = firstAge + step
  while (age < lastAge) {
    ticks.push(age)
    age += step
  }
  ticks.push(lastAge)
  return ticks
}

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

  return {
    ltdNetMonthly,
    ltdGrossMonthly,
    individualDIMonthly,
    totalNetMonthly,
    totalGrossMonthly,
    incomeGrossMonthly,
    incomeNetMonthly,
    incomeLossNet: incomeNetMonthly - totalNetMonthly,
    incomeLossGross: incomeGrossMonthly - totalGrossMonthly,
  }
}

export function DisabilityOutputView({
  outputs,
  inputs,
  assumptions,
  onAssumptionsChange,
  formOpen = false,
  mode = "builder",
  visualization: visualizationProp,
  onVisualizationChange,
}: DisabilityOutputViewProps) {
  const chartData = transformDisabilityChartData(outputs)
  const ageTicks = buildAgeTicks(chartData.projectionChartData)
  const [selectedAge, setSelectedAge] = useState<number | null>(null)
  const [chartView, setChartView] = useState<"net" | "gross">("net")
  const [visualizationInternal, setVisualizationInternal] = useState<DisabilityVisualization>("incomeGap")

  // ── COLA toggle ─────────────────────────────────────────────────────────
  const colaRate = assumptions?.colaRate ?? 0
  const colaEnabled = colaRate > 0
  function toggleCola() {
    onAssumptionsChange?.({ colaRate: colaEnabled ? 0 : DEFAULT_COLA_RATE })
  }

  const visualization = visualizationProp ?? visualizationInternal
  function setVisualization(v: DisabilityVisualization) {
    setVisualizationInternal(v)
    onVisualizationChange?.(v)
  }

  const startAge = outputs.incomeProjection[0]?.age ?? 0
  const displayAge = selectedAge ?? startAge
  const monthly = getMonthlyStatsAtAge(outputs, displayAge)

  const ltdDisplayMonthly = chartView === "gross" ? monthly.ltdGrossMonthly : monthly.ltdNetMonthly
  const totalDisplayMonthly = chartView === "gross" ? monthly.totalGrossMonthly : monthly.totalNetMonthly
  const incomeLossDisplayMonthly = chartView === "gross" ? monthly.incomeLossGross : monthly.incomeLossNet
  const assumedIncomeDisplayMonthly = chartView === "gross" ? monthly.incomeGrossMonthly : monthly.incomeNetMonthly
  const assumedIncomeKey = chartView === "gross" ? "Assumed Income (Gross)" : "Assumed Income (Net)"
  const assumedIncomeLabel = chartView === "gross" ? "Assumed Income (Gross)" : "Assumed Income (Net)"
  const ltdLabel = chartView === "gross" ? "Group LTD (Gross)" : "Group LTD (Net)"
  const totalBenefitLabel = chartView === "gross" ? "Total Benefit (Gross)" : "Total Benefit (Net)"
  const incomeLossLabel = chartView === "gross" ? "Income Loss (Gross)" : "Income Loss (Net)"
  const incomeLossDescription = chartView === "gross"
    ? "Assumed gross income minus total gross monthly benefit"
    : "Assumed net income minus total net monthly benefit"

  const totalProjectedIncomeGross = outputs.incomeProjection.reduce((sum, point) => sum + point.annualIncome, 0)
  const totalGroupLTDCoverageGross = outputs.incomeProjection.reduce(
    (sum, point) => sum + point.ltdAnnualBenefitGross,
    0,
  )
  const totalCoverageGross = outputs.incomeProjection.reduce(
    (sum, point) => sum + point.ltdAnnualBenefitGross + point.individualDIAnnualBenefit,
    0,
  )

  const projectedIncomeDisplay = chartView === "gross" ? totalProjectedIncomeGross : outputs.totalProjectedIncome

  // ── 3-card grid derived metrics ────────────────────────────────────────────
  const groupLTDDisplay = chartView === "gross" ? totalGroupLTDCoverageGross : outputs.totalGroupLTDCoverage
  const totalIncomeReplacedDisplay = chartView === "gross" ? totalCoverageGross : outputs.totalCoverage
  const incomeGap1Display = projectedIncomeDisplay - groupLTDDisplay
  const incomeGap2Display = projectedIncomeDisplay - totalIncomeReplacedDisplay
  const incomeGapDiffDisplay = incomeGap1Display - incomeGap2Display

  // ── COLA Comparison card metrics ───────────────────────────────────────────
  // Flat (no-COLA) IDI total = base monthly benefit × 12 × active projection years.
  // Active years = number of projection points where individual DI was non-zero.
  const baseDIMonthly = inputs?.privateDiMonthlyPremium ?? 0
  const baseBenefitMonthly = inputs?.privateDiBenefitMonthly ?? 0
  const colaDIActiveYears = outputs.incomeProjection.filter(p => p.individualDIAnnualBenefit > 0).length
  const flatIDICoverage = baseBenefitMonthly * 12 * colaDIActiveYears
  const colaBenefitDifference = outputs.totalIndividualDICoverage - flatIDICoverage
  const colaMonthlyPremiumCost = Math.round(baseDIMonthly * 0.2 * 100) / 100   // 20% rider load
  // IDI Expense Diff = lifetime premiums WITH COLA − lifetime premiums WITHOUT COLA
  // outputs.lifetimeIDIExpense already uses the 1.2× multiplier when COLA is on.
  const projectionMonths = outputs.incomeProjection.length * 12
  const flatLifetimeIDIExpense = Math.round(baseDIMonthly * projectionMonths * 100) / 100
  const colaIDIExpenseDiff = Math.round((outputs.lifetimeIDIExpense - flatLifetimeIDIExpense) * 100) / 100

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const point = payload[0]?.payload
    const assumedIncomeAnnual = point?.[assumedIncomeKey] ?? 0
    const grossIncome = point?.["Assumed Income (Gross)"] ?? 0
    const netIncome = point?.["Assumed Income (Net)"] ?? 0
    const ltdGross = point?.["Group LTD (Gross)"] ?? 0
    const ltdNet = point?.["Group LTD (Net)"] ?? 0
    const idiAnnual = point?.["Individual DI"] ?? 0
    const displayGap = chartView === "gross"
      ? grossIncome - (ltdGross + idiAnnual)
      : netIncome - (ltdNet + idiAnnual)
    return (
      <div className="min-w-52 rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm shadow-lg">
        <p className="mb-2 font-semibold text-gray-100">Age {label}</p>
        <div className="mb-1.5 flex justify-between gap-4">
          <span className="text-xs text-slate-300">{assumedIncomeLabel}:</span>
          <span className="text-xs font-semibold text-slate-100">
            {formatCurrency(assumedIncomeAnnual)}/yr · {formatCurrency(assumedIncomeAnnual / 12)}/mo
          </span>
        </div>
        {payload.map((entry: any) => (
          <div key={entry.name} className="mb-1 flex justify-between gap-4">
            <span style={{ color: entry.color }} className="text-xs">{entry.name}:</span>
            <span className="text-xs font-semibold text-gray-100">
              {entry.name === "Income Gap"
                ? `${formatCurrency(displayGap)}/yr · ${formatCurrency(displayGap / 12)}/mo`
                : `${formatCurrency(entry.value)}/yr · ${formatCurrency(entry.value / 12)}/mo`}
            </span>
          </div>
        ))}
      </div>
    )
  }

  function renderVisualization() {
    if (visualization === "premiumVsSelfInsured") {
      // When COLA rider is active the premium carries a 20% load — reflect that
      // in the break-even module so the self-insurance comparison is accurate.
      const basePremium = inputs?.privateDiMonthlyPremium ?? 0
      const colaPremiumMultiplier = colaEnabled ? 1.2 : 1
      return (
        <PremiumVsSelfInsuredModule
          monthlyPremium={basePremium * colaPremiumMultiplier}
          monthlyBenefit={inputs?.privateDiBenefitMonthly ?? 0}
          annualRateOfReturn={inputs?.breakEvenRateOfReturn ?? 0.06}
          monthsWithoutIncome={inputs?.breakEvenMonthsWithoutIncome ?? 12}
          mode={mode}
          inputs={inputs}
        />
      )
    }

    if (visualization === "jobComparison") {
      return <JobComparisonModule inputs={inputs} />
    }

    return (
      <div className="module-output-container">
        <div className={`disability-coverage-grid${formOpen ? " disability-coverage-grid--form-open" : ""}`}>
          <div className={`disability-summary-rail${colaEnabled ? " disability-summary-rail--cola" : ""}`}>
            <Card className="module-kpi-card">
              <CardContent className="p-3.5">
                <div className="mb-2 text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">Lifetime Coverage</div>
                <div className="divide-y divide-slate-800/80 text-xs">
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Group LTD</span>
                    <span className="font-mono font-semibold text-blue-300">{formatCurrency(groupLTDDisplay)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Individual DI</span>
                    <span className="font-mono font-semibold text-cyan-300">{formatCurrency(outputs.totalIndividualDICoverage)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Total Income Replaced</span>
                    <span className="font-mono font-semibold text-emerald-400">{formatCurrency(totalIncomeReplacedDisplay)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="module-kpi-card">
              <CardContent className="p-3.5">
                <div className="mb-2 text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">Lifetime Income</div>
                <div className="divide-y divide-slate-800/80 text-xs">
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Projected Income ({chartView === "gross" ? "Gross" : "Net"})</span>
                    <span className="font-mono font-semibold text-slate-200">{formatCurrency(projectedIncomeDisplay)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Income Gap #1</span>
                    <span className="font-mono font-semibold text-red-400">{formatCurrency(incomeGap1Display)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Income Gap #2</span>
                    <span className="font-mono font-semibold text-orange-400">{formatCurrency(incomeGap2Display)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="module-kpi-card">
              <CardContent className="p-3.5">
                <div className="mb-2 text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">Outcome</div>
                <div className="divide-y divide-slate-800/80 text-xs">
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Gap Difference</span>
                    <span className="font-mono font-semibold text-emerald-400">{formatCurrency(incomeGapDiffDisplay)}</span>
                  </div>
                  {outputs.lifetimeIDIExpense > 0 ? (
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-400">IDI Expense</span>
                      <span className="font-mono font-semibold text-amber-400">{formatCurrency(outputs.lifetimeIDIExpense)}</span>
                    </div>
                  ) : null}
                  {colaEnabled && baseDIMonthly > 0 ? (
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-emerald-400">COLA Monthly Premium</span>
                      <span className="font-mono font-semibold text-emerald-300">{formatCurrency(baseDIMonthly * 1.2)}/mo</span>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {/* ── COLA Comparison card — only visible when rider is active ── */}
            {colaEnabled ? (
              <Card className="module-kpi-card border-emerald-900/50">
                <CardContent className="p-3.5">
                  <div className="mb-2 text-[10px] font-bold tracking-[0.18em] text-emerald-500 uppercase">COLA Comparison</div>
                  <div className="divide-y divide-slate-800/80 text-xs">
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-400">Benefit Difference</span>
                      <span className="font-mono font-semibold text-emerald-300">{formatCurrency(colaBenefitDifference)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-400">IDI Expense Diff.</span>
                      <span className="font-mono font-semibold text-amber-300">{formatCurrency(colaIDIExpenseDiff)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-400">Monthly Premium Diff.</span>
                      <span className="font-mono font-semibold text-amber-300">{formatCurrency(colaMonthlyPremiumCost)}/mo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <Card className="module-chart-card disability-chart-panel module-visual-panel flex flex-col border-slate-800/80 bg-slate-950/60">
            <CardHeader className="shrink-0 px-6 pt-5 pb-0">
              <div className="grid gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="text-xs font-bold tracking-[0.15em] text-slate-500 uppercase">
                      Income vs. Disability Coverage — Annual Projection
                    </CardTitle>
                    <p className="mt-1 text-sm leading-snug text-slate-400">LTD and individual DI benefits stacked against projected income need</p>
                    {selectedAge !== null ? (
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="rounded-full border border-blue-700 bg-blue-900/40 px-3 py-1 text-xs font-semibold text-blue-300">Age {selectedAge}</span>
                        <button onClick={() => setSelectedAge(null)} className="text-xs text-gray-400 transition-colors hover:text-gray-100" aria-label="Reset to current age">× Reset</button>
                      </div>
                    ) : null}
                  </div>

                  {/* ── COLA toggle pill ───────────────────────────────── */}
                  {onAssumptionsChange ? (
                    <button
                      type="button"
                      onClick={toggleCola}
                      aria-pressed={colaEnabled}
                      title={colaEnabled ? `COLA active at ${(colaRate * 100).toFixed(1)}%` : "Enable COLA benefit growth"}
                      className={`flex shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] transition-all ${
                        colaEnabled
                          ? "border-emerald-700/60 bg-emerald-950/50 text-emerald-300 hover:border-emerald-600"
                          : "border-gray-700 bg-gray-900/60 text-gray-500 hover:border-gray-600 hover:text-gray-300"
                      }`}
                    >
                      <span className="font-bold uppercase tracking-widest">COLA</span>
                      {/* pill switch */}
                      <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${colaEnabled ? "bg-emerald-500" : "bg-gray-700"}`}>
                        <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform ${colaEnabled ? "translate-x-3.5" : "translate-x-0.5"}`} />
                      </span>
                      {colaEnabled && (
                        <span className="font-mono font-semibold">{(colaRate * 100).toFixed(1)}%</span>
                      )}
                    </button>
                  ) : null}
                </div>

                <div className="flex justify-center sm:justify-end">
                  <div className="flex shrink-0 overflow-hidden rounded-md border border-gray-700 text-xs">
                    <button onClick={() => setChartView("net")} className={`px-3 py-1 transition-colors ${chartView === "net" ? "bg-brand-700 text-white shadow-sm ring-1 ring-inset ring-brand-600 dark:bg-brand-950/70 dark:ring-brand-700/70" : "bg-gray-900 text-gray-400 hover:text-gray-100"}`}>Net</button>
                    <button onClick={() => setChartView("gross")} className={`px-3 py-1 transition-colors ${chartView === "gross" ? "bg-brand-700 text-white shadow-sm ring-1 ring-inset ring-brand-600 dark:bg-brand-950/70 dark:ring-brand-700/70" : "bg-gray-900 text-gray-400 hover:text-gray-100"}`}>Gross</button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col px-6 pt-4 pb-6">
              <div className="flex min-h-0 flex-1 items-stretch gap-1">
                <div className="flex w-3.5 shrink-0 items-center justify-center">
                  <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }} className="text-[10px] font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">Annual Benefit ($)</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="chart-reveal min-h-52 w-full flex-1">
                    <ResponsiveContainer width="100%" height="100%" debounce={100}>
                      <BarChart
                        data={chartData.projectionChartData}
                        margin={{ top: 10, right: 16, left: 0, bottom: 4 }}
                        barCategoryGap="8%"
                        onClick={(data) => { if (data?.activePayload) setSelectedAge(Number(data.activeLabel)) }}
                        style={{ cursor: "pointer" }}
                      >
                        <XAxis
                          dataKey="age"
                          ticks={ageTicks}
                          interval={0}
                          tick={{ fill: "#64748b", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
                        <Tooltip content={CustomTooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                        <Bar dataKey={ltdLabel} stackId="a" fill="#3b82f6" isAnimationActive={false} />
                        <Bar dataKey="Individual DI" stackId="a" fill="#06b6d4" isAnimationActive={false} />
                        <Bar dataKey="Income Gap" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-1 text-center"><span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Age</span></div>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400"><span className="inline-block h-2.5 w-4 rounded-sm bg-[#3b82f6]" />{ltdLabel}</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400"><span className="inline-block h-2.5 w-4 rounded-sm bg-[#06b6d4]" />Individual DI</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400"><span className="inline-block h-2.5 w-4 rounded-sm bg-[#ef4444]" />Income Gap</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="module-metric-rail">
            <MetricGroup title="Monthly Benefits">
              <ModuleMetricCard
                label={assumedIncomeLabel}
                value={<>{formatCurrency(assumedIncomeDisplayMonthly)}<span className="text-sm font-normal text-gray-400">/mo</span></>}
                description="Monthly income basis used for the selected view"
                accent="slate"
              />
              <ModuleMetricCard label={ltdLabel} value={<>{formatCurrency(ltdDisplayMonthly)}<span className="text-sm font-normal text-gray-400">/mo</span></>} description={chartView === "gross" ? "Gross monthly LTD benefit" : "Net after-tax LTD monthly benefit"} accent="blue" />
              <ModuleMetricCard label="Individual DI" value={<>{formatCurrency(monthly.individualDIMonthly)}<span className="text-sm font-normal text-gray-400">/mo</span></>} description="Private disability insurance benefit" accent="cyan" />
              <ModuleMetricCard label={totalBenefitLabel} value={<>{formatCurrency(totalDisplayMonthly)}<span className="text-sm font-normal text-gray-400">/mo</span></>} description="Combined LTD + individual DI monthly benefit" accent="slate" />
              <ModuleMetricCard label={incomeLossLabel} value={<>{formatCurrency(incomeLossDisplayMonthly)}<span className="text-sm font-normal text-gray-400">/mo</span></>} description={incomeLossDescription} accent="red" />
            </MetricGroup>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <AnimatedSection delay={0.3}>
        <div className="flex flex-wrap gap-1 mb-4">
          {(
            [
              { value: "incomeGap", label: "Income Gap", active: "border border-brand-700 bg-brand-700 text-white shadow-sm ring-1 ring-brand-600 dark:border-brand-950/70 dark:bg-brand-950/70 dark:text-white dark:ring-brand-700/70" },
              { value: "premiumVsSelfInsured", label: "Premium vs Self-Insured", active: "border border-brand-700 bg-brand-700 text-white shadow-sm ring-1 ring-brand-600 dark:border-brand-950/70 dark:bg-brand-950/70 dark:text-white dark:ring-brand-700/70" },
              { value: "jobComparison", label: "Job A vs Job B", active: "border border-brand-700 bg-brand-700 text-white shadow-sm ring-1 ring-brand-600 dark:border-brand-950/70 dark:bg-brand-950/70 dark:text-white dark:ring-brand-700/70" },
            ] as const
          ).map(({ value, label, active }) => (
            <button
              key={value}
              type="button"
              onClick={() => setVisualization(value)}
              className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
                visualization === value
                  ? active
                  : "bg-slate-900/40 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {renderVisualization()}
      </AnimatedSection>

      {visualization === "incomeGap" && mode === "builder" && (
        <AnimatedSection delay={0.46}>
          <Card className="border border-gray-800 bg-[#090E1A] text-white">
            <CardContent className="p-6">
              <h4 className="mb-2 text-xs font-semibold tracking-wider text-blue-400 uppercase">Planning Narrative</h4>
              <p className="text-sm leading-relaxed text-gray-300">{getDisabilityNarrative(outputs)}</p>
            </CardContent>
          </Card>
        </AnimatedSection>
      )}
    </div>
  )
}
