import { useEffect, useState, type ReactNode } from "react"
import { Bar, Cell, Tooltip } from "recharts"
import { LifeOutputs, LifeInputs, LifeAssumptions, IncomeGapOutputs, IncomeGapModule1, IncomeGapModule2 } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { AnimatedSection } from "@/components/ui/animated-section"
import { ModuleMetricCard } from "@/features/risk-modules/core/ModuleMetricCard"
import { FinancialProjectionChart } from "@/components/charts/FinancialProjectionChart"
import {
  buildProjectionAgeTicks,
  financialBarChartTheme,
  projectionCellVisualState,
  topStackCellRadius,
  topStackRadius,
} from "@/components/charts/financialBarChartTheme"

interface LifeOutputViewProps {
  outputs: LifeOutputs
  inputs: LifeInputs
  assumptions: LifeAssumptions
  incomeGapOutputs: IncomeGapOutputs
  activeTab?: "safe" | "runway"
  onActiveTabChange?: (tab: "safe" | "runway") => void
  mode?: "builder" | "presentation"
}

const compactCardClass = "life-kpi-card"
const tooltipClass = "bg-gray-900 p-3 border border-gray-700 rounded-lg shadow-lg text-sm min-w-48"

function formatRatePctOneDecimal(rate: number): string {
  return `${(Math.round(rate * 1000) / 10).toFixed(1)}%`
}

function getRunwayCoverageStatus(covered: number, need: number) {
  const coverageRate = need > 0 ? Math.max(0, Math.min(1, covered / need)) : 1
  if (coverageRate >= 0.999999) {
    return { label: "Fully Covered", description: "Resource pool funds the full annual need", accent: "positive" as const, coverageRate }
  }
  if (coverageRate <= 0.000001) {
    return { label: "Uncovered", description: "Resource pool funds none of the annual need", accent: "negative" as const, coverageRate }
  }
  return { label: "Partially Covered", description: "Resource pool funds part of the annual need", accent: "warning" as const, coverageRate }
}

const SafeTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const supported = payload.find((p: any) => p.dataKey === "safeIncomeCoverage")?.value ?? 0
  const gap = payload.find((p: any) => p.dataKey === "incomeGap")?.value ?? 0
  const target = supported + gap
  return (
    <div className={tooltipClass}>
      <p className="mb-2 font-semibold text-gray-100">Age {label}</p>
      <div className="flex justify-between gap-4"><span className="text-xs text-gray-400">Target Income Need:</span><span className="text-xs font-semibold text-gray-100">{formatCurrency(target)}</span></div>
      <div className="flex justify-between gap-4"><span className="text-xs text-emerald-400">Income Supported:</span><span className="text-xs font-semibold text-emerald-300">{formatCurrency(supported)}</span></div>
      {gap > 0 ? <div className="flex justify-between gap-4"><span className="text-xs text-rose-400">Income Gap:</span><span className="text-xs font-semibold text-rose-300">{formatCurrency(gap)}</span></div> : null}
    </div>
  )
}

const RunwayTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const covered = payload.find((p: any) => p.dataKey === "runwayIncomeCovered")?.value ?? 0
  const gap = payload.find((p: any) => p.dataKey === "runwayIncomeGap")?.value ?? 0
  const income = covered + gap
  const status = getRunwayCoverageStatus(covered, income)
  return (
    <div className={tooltipClass}>
      <p className="mb-2 font-semibold text-gray-100">Age {label}</p>
      <div className="flex justify-between gap-4"><span className="text-xs text-gray-400">Net Income Need:</span><span className="text-xs font-semibold text-gray-100">{formatCurrency(income)}</span></div>
      <div className="flex justify-between gap-4"><span className="text-xs text-emerald-400">Net Income Covered:</span><span className="text-xs font-semibold text-emerald-300">{formatCurrency(covered)}</span></div>
      {gap > 0 ? <div className="flex justify-between gap-4"><span className="text-xs text-rose-400">Annual Gap:</span><span className="text-xs font-semibold text-rose-300">{formatCurrency(gap)}</span></div> : null}
      <div className="mt-2 flex justify-between gap-4 border-t border-gray-700 pt-2"><span className="text-xs text-gray-400">Coverage Status:</span><span className="text-xs font-semibold text-gray-100">{status.label} ({formatRatePctOneDecimal(status.coverageRate)})</span></div>
    </div>
  )
}

function RunwayMetricBoxes({ m2, projectionEndAge, selectedAge }: { m2: IncomeGapModule2; projectionEndAge: number; selectedAge: number | null }) {
  const selected = selectedAge === null ? undefined : m2.yearlyData.find((point) => point.age === selectedAge)
  const hasGap = m2.survivorGap > 0
  const runwayGapCapital = m2.deathBenefitNeeded
  if (selected) {
    const status = getRunwayCoverageStatus(selected.runwayIncomeCovered, selected.projectedIncome)
    return (
      <div className="life-metric-grid life-metric-grid--runway">
        <ModuleMetricCard className={compactCardClass} label={`Proj. Net Income at Age ${selected.age}`} value={formatCurrency(selected.projectedIncome)} description="Annual projected need" accent="neutral" />
        <ModuleMetricCard className={compactCardClass} label={`Coverage at Age ${selected.age}`} value={status.label} description={`${formatRatePctOneDecimal(status.coverageRate)} covered. ${status.description}`} accent={status.accent} />
        <ModuleMetricCard className={compactCardClass} label={`Net Income Replaced at Age ${selected.age}`} value={formatCurrency(selected.runwayIncomeCovered)} description="Covered by resource pool" accent="primary" />
        <ModuleMetricCard className={compactCardClass} label={`Income Gap at Age ${selected.age}`} value={formatCurrency(selected.runwayIncomeGap)} description="Projected net need minus amount covered" accent={selected.runwayIncomeGap > 0 ? "negative" : "positive"} />
        <ModuleMetricCard className={compactCardClass} label={`Cumulative Gap Through Age ${selected.age}`} value={formatCurrency(selected.cumulativeRunwayIncomeGap)} description="Running uncovered net income total" accent={selected.cumulativeRunwayIncomeGap > 0 ? "negative" : "positive"} />
      </div>
    )
  }
  return (
    <div className="life-metric-grid life-metric-grid--runway">
      <ModuleMetricCard className={compactCardClass} label={`Proj. Net Income to Age ${projectionEndAge}`} value={formatCurrency(m2.projectedNetIncomeTotal)} description="Total projected net income need" accent="neutral" />
      <ModuleMetricCard className={compactCardClass} label="Years of Full Coverage" value={<>{Math.floor(m2.yearsOfFullCoverage)}<span className="text-sm font-normal text-gray-400"> Years</span></>} description={m2.yearsOfFullCoverage > 0 ? `Ages ${m2.startCoverageAge}–${m2.endCoverageAge}` : "No full coverage years"} accent={m2.yearsOfFullCoverage > 0 ? "positive" : "negative"} />
      <ModuleMetricCard className={compactCardClass} label="Total Net Income Replaced" value={formatCurrency(m2.totalIncomeReplaced)} description="Covered by resource pool" accent="primary" />
      <ModuleMetricCard className={compactCardClass} label="Survivor Gap" value={formatCurrency(m2.survivorGap)} description="Projected minus replaced" accent={hasGap ? "negative" : "positive"} />
      <ModuleMetricCard className={compactCardClass} label="Death Benefit Gap" value={hasGap ? formatCurrency(runwayGapCapital) : "$0"} description={`Scenario PV gap at ${formatRatePctOneDecimal(m2.roi)}`} accent={hasGap ? "negative" : "positive"} />
    </div>
  )
}

function SafeIncomeMetricBoxes({ m1, projectionEndAge, selectedAge }: { m1: IncomeGapModule1; projectionEndAge: number; selectedAge: number | null }) {
  const selected = selectedAge === null ? undefined : m1.yearlyData.find((point) => point.age === selectedAge)
  const annualIncomeReplacementPct = m1.projectedNetIncomeTotal > 0
    ? m1.totalIncomeReplaced / m1.projectedNetIncomeTotal
    : 0
  const survivorGap = Math.max(0, m1.targetIncomeSupportTotal - m1.totalIncomeReplaced)
  const hasGap = survivorGap > 0
  if (selected) {
    const selectedCoveragePct = selected.projectedIncome > 0 ? selected.safeIncomeCoverage / selected.projectedIncome : 0
    return (
      <div className="life-metric-grid life-metric-grid--runway">
        <ModuleMetricCard className={compactCardClass} label={`Proj. Net Income at Age ${selected.age}`} value={formatCurrency(selected.projectedIncome)} description="Annual projected net income need" accent="neutral" />
        <ModuleMetricCard className={compactCardClass} label="Income Support Rate" value={formatRatePctOneDecimal(selectedCoveragePct)} description="Constant support ratio applied across the projection schedule" accent="primary" />
        <ModuleMetricCard className={compactCardClass} label={`Income Supported at Age ${selected.age}`} value={formatCurrency(selected.safeIncomeCoverage)} description="Annual income backed by resources" accent="primary" />
        <ModuleMetricCard className={compactCardClass} label={`Income Gap at Age ${selected.age}`} value={formatCurrency(selected.incomeGap)} description="Target support minus supported income" accent={selected.incomeGap > 0 ? "negative" : "positive"} />
        <ModuleMetricCard className={compactCardClass} label={`Cumulative Gap Through Age ${selected.age}`} value={formatCurrency(selected.cumulativeIncomeGap)} description="Running target-income gap" accent={selected.cumulativeIncomeGap > 0 ? "negative" : "positive"} />
      </div>
    )
  }

  return (
    <div className="life-metric-grid life-metric-grid--runway">
      <ModuleMetricCard className={compactCardClass} label={`Proj. Net Income to Age ${projectionEndAge}`} value={formatCurrency(m1.projectedNetIncomeTotal)} description="Full projected net income need" accent="neutral" />
      <ModuleMetricCard className={compactCardClass} label="Income Support Rate" value={formatRatePctOneDecimal(annualIncomeReplacementPct)} disclosure="Total safe income supported ÷ total projected income need; constant across projected years" accent="primary" />
      <ModuleMetricCard className={compactCardClass} label="Total Income Supported" value={formatCurrency(m1.totalIncomeReplaced)} description="Supported target income stream" accent="primary" />
      <ModuleMetricCard className={compactCardClass} label="Survivor Gap" value={formatCurrency(survivorGap)} description="Target support minus supported income" accent={hasGap ? "negative" : "positive"} />
      <ModuleMetricCard className={compactCardClass} label="Death Benefit Gap" value={formatCurrency(m1.additionalDeathBenefitNeeded)} description={`PV capital gap at ${formatRatePctOneDecimal(m1.roi)}`} accent={m1.additionalDeathBenefitNeeded > 0 ? "negative" : "positive"} />
    </div>
  )
}

function ChartPanel({ title, subtitle, coveredLabel, data, ticks, selectedAge, onSelectAge, onReset, children }: { title: string; subtitle: string; coveredLabel: string; data: { age: number }[]; ticks: number[]; selectedAge: number | null; onSelectAge: (age: number) => void; onReset: () => void; children: ReactNode }) {
  return (
    <Card className="module-chart-card life-chart-panel financial-projection-chart border-slate-800/80 bg-slate-950/60">
      <CardHeader className="px-5 pt-4 pb-0">
        <div className="text-center">
          <CardTitle className="text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase">{title}</CardTitle>
          <p className="mt-1 text-xs leading-snug text-slate-400">{subtitle}</p>
          {selectedAge !== null ? <div className="mt-2 flex items-center justify-center gap-2"><span className="rounded-full border border-brand-700 bg-brand-950/40 px-3 py-1 text-xs font-semibold text-brand-300">Age {selectedAge}</span><button type="button" onClick={onReset} className="text-xs text-gray-400 transition-colors hover:text-gray-100" aria-label="Reset selected age">× Reset</button></div> : <p className="mt-2 text-[10px] text-slate-500">Select a bar to inspect that age</p>}
        </div>
      </CardHeader>
      <CardContent className="px-5 pt-3 pb-4">
        <div className="flex items-stretch gap-2">
          <div className="flex w-4 shrink-0 items-center justify-center">
            <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }} className="text-[10px] font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">Annual Income ($)</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="life-chart-area chart-reveal financial-projection-plot">
              <FinancialProjectionChart data={data} ticks={ticks} onSelectAge={onSelectAge}>
                {children}
              </FinancialProjectionChart>
            </div>
            <div className="mt-1 text-center"><span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Age (Years)</span></div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-slate-800/50 pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400"><span className="h-2.5 w-4 rounded-sm" style={{ backgroundColor: financialBarChartTheme.semantic.supported }} />{coveredLabel}</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400"><span className="h-2.5 w-4 rounded-sm" style={{ backgroundColor: financialBarChartTheme.semantic.gap }} />Income Gap</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function LifeOutputView({ incomeGapOutputs, activeTab: activeTabProp, onActiveTabChange, mode = "builder" }: LifeOutputViewProps) {
  const animateChart = mode === "builder"
  const [activeTabInternal, setActiveTabInternal] = useState<"safe" | "runway">("safe")
  const [selectedSafeAge, setSelectedSafeAge] = useState<number | null>(null)
  const [selectedRunwayAge, setSelectedRunwayAge] = useState<number | null>(null)
  const activeTab = activeTabProp ?? activeTabInternal
  const setActiveTab = (tab: "safe" | "runway") => {
    setActiveTabInternal(tab)
    onActiveTabChange?.(tab)
  }

  const { module1, module2, isM1FullyCovered, m1SurvivorGap } = incomeGapOutputs
  const retirementAge = module1.yearlyData.at(-1)?.age ?? 65
  const safeTicks = buildProjectionAgeTicks(module1.yearlyData, 14)
  const runwayTicks = buildProjectionAgeTicks(module2.yearlyData, 14)
  const safePct = module1.targetIncomeSupportTotal > 0 ? Math.round((module1.totalIncomeReplaced / module1.targetIncomeSupportTotal) * 1000) / 10 : 0
  const runwayPct = module2.projectedNetIncomeTotal > 0 ? Math.round((module2.totalIncomeReplaced / module2.projectedNetIncomeTotal) * 1000) / 10 : 0

  useEffect(() => {
    if (selectedSafeAge !== null && !module1.yearlyData.some((point) => point.age === selectedSafeAge)) setSelectedSafeAge(null)
  }, [module1.yearlyData, selectedSafeAge])

  useEffect(() => {
    if (selectedRunwayAge !== null && !module2.yearlyData.some((point) => point.age === selectedRunwayAge)) setSelectedRunwayAge(null)
  }, [module2.yearlyData, selectedRunwayAge])

  const activeNarrative = activeTab === "safe"
    ? isM1FullyCovered
      ? "Based on the assumptions entered, existing resources match the modeled target income stream through the selected projection horizon. This is an illustrative gap analysis, not a formal recommendation."
      : `A protection gap of ${formatCurrency(m1SurvivorGap)} remains after applying entered resources (${formatRatePctOneDecimal(safePct / 100)} of the modeled target income support). The modeled remaining capital gap is ${formatCurrency(module1.additionalDeathBenefitNeeded)}. This is an illustrative gap analysis, not a formal recommendation.`
    : module2.survivorGap <= 0
      ? `Covered Runway Scenario shows no remaining runway gap through the selected projection horizon using the ${formatRatePctOneDecimal(module2.roi)} PV reference rate. This is a scenario-only view and does not replace the Safe Income Coverage target model.`
      : `Covered Runway Scenario shows a ${formatCurrency(module2.survivorGap)} survivor gap after applying modeled net-income replacement (${formatRatePctOneDecimal(runwayPct / 100)} of projected need). Death Benefit Gap estimates the additional scenario capital required at the shared PV reference rate. This is an illustrative scenario, not a formal recommendation.`

  return (
    <div className="life-output-container">
      <div className="mb-2 flex flex-wrap gap-1">
        <button onClick={() => setActiveTab("safe")} className={`rounded-md border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === "safe" ? "border-[#188a89] bg-[#188a89] text-white shadow-sm ring-1 ring-[#188a89]" : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-[#1db8b9] hover:bg-[#1db8b9]/15 hover:text-[#1db8b9] dark:hover:text-white"}`}>Safe Income Coverage</button>
        <button onClick={() => setActiveTab("runway")} className={`rounded-md border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === "runway" ? "border-[#188a89] bg-[#188a89] text-white shadow-sm ring-1 ring-[#188a89]" : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-[#1db8b9] hover:bg-[#1db8b9]/15 hover:text-[#1db8b9] dark:hover:text-white"}`}>Covered Runway Scenario</button>
      </div>

      {activeTab === "safe" && (
        <AnimatedSection key="safe-income-coverage">
          <div className="life-visual-dashboard">
            <ChartPanel title={`Safe Income Coverage — Target Annual Net Income to Age ${retirementAge}`} subtitle={`${formatRatePctOneDecimal(module1.netIncomeFactor)} net income factor; capital required uses ${formatRatePctOneDecimal(module1.roi)} PV reference rate`} coveredLabel="Income Supported" data={module1.yearlyData} ticks={safeTicks} selectedAge={selectedSafeAge} onSelectAge={setSelectedSafeAge} onReset={() => setSelectedSafeAge(null)}>
              <Tooltip content={SafeTooltip} cursor={{ fill: financialBarChartTheme.cursor.fill }} />
              <Bar dataKey="safeIncomeCoverage" name="Income Supported" stackId="income" barSize={financialBarChartTheme.geometry.projectionBarSize} fill={financialBarChartTheme.semantic.supported} radius={topStackRadius(false)} shapeRendering="geometricPrecision" isAnimationActive={animateChart} animationDuration={financialBarChartTheme.animation.duration} animationEasing={financialBarChartTheme.animation.easing}>
                {module1.yearlyData.map((point) => {
                  const visual = projectionCellVisualState(selectedSafeAge, point.age, financialBarChartTheme.semantic.supportedGlow)
                  return <Cell key={`safe-covered-${point.age}`} radius={topStackCellRadius(point.incomeGap <= 0 && point.safeIncomeCoverage > 0)} opacity={visual.opacity} style={visual.style} />
                })}
              </Bar>
              <Bar dataKey="incomeGap" name="Income Gap" stackId="income" barSize={financialBarChartTheme.geometry.projectionBarSize} fill={financialBarChartTheme.semantic.gap} radius={topStackRadius(false)} shapeRendering="geometricPrecision" isAnimationActive={animateChart} animationBegin={financialBarChartTheme.animation.staggerMs} animationDuration={financialBarChartTheme.animation.duration} animationEasing={financialBarChartTheme.animation.easing}>
                {module1.yearlyData.map((point) => {
                  const visual = projectionCellVisualState(selectedSafeAge, point.age, financialBarChartTheme.semantic.gapGlow)
                  return <Cell key={`safe-gap-${point.age}`} radius={topStackCellRadius(point.incomeGap > 0)} opacity={visual.opacity} style={visual.style} />
                })}
              </Bar>
            </ChartPanel>
            <div key={`safe-metrics-${selectedSafeAge ?? "all"}`} className="animate-slideUpAndFade"><SafeIncomeMetricBoxes m1={module1} projectionEndAge={retirementAge} selectedAge={selectedSafeAge} /></div>
          </div>
        </AnimatedSection>
      )}

      {activeTab === "runway" && (
        <AnimatedSection key="covered-runway">
          <div className="life-visual-dashboard">
            <ChartPanel title="Covered Runway Scenario — Resource Drawdown Coverage" subtitle={`Existing coverage resources modeled at the shared ${formatRatePctOneDecimal(module2.roi)} PV reference rate while funding projected net income`} coveredLabel="Net Income Covered" data={module2.yearlyData} ticks={runwayTicks} selectedAge={selectedRunwayAge} onSelectAge={setSelectedRunwayAge} onReset={() => setSelectedRunwayAge(null)}>
              <Tooltip content={RunwayTooltip} cursor={{ fill: financialBarChartTheme.cursor.fill }} />
              <Bar dataKey="runwayIncomeCovered" name="Net Income Covered" stackId="income" barSize={financialBarChartTheme.geometry.projectionBarSize} fill={financialBarChartTheme.semantic.supported} radius={topStackRadius(false)} shapeRendering="geometricPrecision" isAnimationActive={animateChart} animationDuration={financialBarChartTheme.animation.duration} animationEasing={financialBarChartTheme.animation.easing}>
                {module2.yearlyData.map((point) => {
                  const visual = projectionCellVisualState(selectedRunwayAge, point.age, financialBarChartTheme.semantic.supportedGlow)
                  return <Cell key={`runway-covered-${point.age}`} radius={topStackCellRadius(point.runwayIncomeGap <= 0 && point.runwayIncomeCovered > 0)} opacity={visual.opacity} style={visual.style} />
                })}
              </Bar>
              <Bar dataKey="runwayIncomeGap" name="Income Gap" stackId="income" barSize={financialBarChartTheme.geometry.projectionBarSize} fill={financialBarChartTheme.semantic.gap} radius={topStackRadius(false)} shapeRendering="geometricPrecision" isAnimationActive={animateChart} animationBegin={financialBarChartTheme.animation.staggerMs} animationDuration={financialBarChartTheme.animation.duration} animationEasing={financialBarChartTheme.animation.easing}>
                {module2.yearlyData.map((point) => {
                  const visual = projectionCellVisualState(selectedRunwayAge, point.age, financialBarChartTheme.semantic.gapGlow)
                  return <Cell key={`runway-gap-${point.age}`} radius={topStackCellRadius(point.runwayIncomeGap > 0)} opacity={visual.opacity} style={visual.style} />
                })}
              </Bar>
            </ChartPanel>
            <div key={`runway-metrics-${selectedRunwayAge ?? "all"}`} className="animate-slideUpAndFade"><RunwayMetricBoxes m2={module2} projectionEndAge={retirementAge} selectedAge={selectedRunwayAge} /></div>
          </div>
        </AnimatedSection>
      )}

      {mode === "builder" ? (
        <Card className="mt-2 border border-gray-800 bg-[#090E1A]">
          <CardContent className="px-4 py-3">
            <h4 className="mb-1 text-[11px] font-semibold tracking-wider text-[#27aae1] uppercase">Planning Narrative</h4>
            <p className="text-xs leading-relaxed text-gray-300">{activeNarrative}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
