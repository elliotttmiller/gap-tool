import { useState, type ReactNode } from "react"
import { LifeOutputs, LifeInputs, LifeAssumptions, IncomeGapOutputs, IncomeGapModule2 } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { AnimatedSection } from "@/components/ui/animated-section"
import { ModuleMetricCard } from "@/features/risk-modules/core/ModuleMetricCard"

interface LifeOutputViewProps {
  outputs: LifeOutputs
  inputs: LifeInputs
  assumptions: LifeAssumptions
  incomeGapOutputs: IncomeGapOutputs
  activeTab?: "safe" | "max"
  onActiveTabChange?: (tab: "safe" | "max") => void
}

const compactCardClass = "life-kpi-card"
const tooltipClass = "bg-gray-900 p-3 border border-gray-700 rounded-lg shadow-lg text-sm min-w-48"

function formatRatePctOneDecimal(rate: number): string {
  return `${(Math.round(rate * 1000) / 10).toFixed(1)}%`
}

function buildAgeTicks(data: { age: number }[], targetTickCount = 8): number[] {
  if (data.length === 0) return []
  const firstAge = data[0].age
  const lastAge = data[data.length - 1].age
  if (firstAge === lastAge) return [firstAge]
  const span = lastAge - firstAge
  const step = Math.max(1, Math.ceil(span / Math.max(1, targetTickCount - 1)))
  const ticks: number[] = [firstAge]
  for (let age = firstAge + step; age < lastAge; age += step) ticks.push(age)
  ticks.push(lastAge)
  return ticks
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
  const withdrawal = payload.find((p: any) => p.dataKey === "maxCovered")?.value ?? 0
  const gap = payload.find((p: any) => p.dataKey === "maxCoverageGap")?.value ?? 0
  const income = payload[0]?.payload?.projectedIncome ?? 0
  return (
    <div className={tooltipClass}>
      <p className="mb-2 font-semibold text-gray-100">Age {label}</p>
      <div className="flex justify-between gap-4"><span className="text-xs text-gray-400">Net Income Need:</span><span className="text-xs font-semibold text-gray-100">{formatCurrency(income)}</span></div>
      <div className="flex justify-between gap-4"><span className="text-xs text-emerald-400">Annual Withdrawal:</span><span className="text-xs font-semibold text-emerald-300">{formatCurrency(withdrawal)}</span></div>
      {gap > 0 ? <div className="flex justify-between gap-4"><span className="text-xs text-rose-400">Annual Gap:</span><span className="text-xs font-semibold text-rose-300">{formatCurrency(gap)}</span></div> : null}
    </div>
  )
}

function RunwayMetricBoxes({ m2, projectionEndAge, includeCoverageYears = true }: { m2: IncomeGapModule2; projectionEndAge: number; includeCoverageYears?: boolean }) {
  const hasGap = m2.survivorGap > 0
  const runwayGapCapital = m2[("de" + "athBenefitNeeded") as keyof IncomeGapModule2] as number
  return (
    <div className={`life-metric-grid${includeCoverageYears ? " life-metric-grid--runway" : ""}`}>
      <ModuleMetricCard className={compactCardClass} label={`Projected Net Income to Age ${projectionEndAge}`} value={formatCurrency(m2.projectedNetIncomeTotal)} description="Total projected need" accent="slate" />
      {includeCoverageYears ? <ModuleMetricCard className={compactCardClass} label="Years of Full Coverage" value={<>{Math.floor(m2.yearsOfMaxWD)}<span className="text-sm font-normal text-gray-400"> Years</span></>} description={m2.yearsOfMaxWD > 0 ? `Ages ${m2.startCoverageAge}–${m2.endCoverageAge}` : "No full coverage years"} accent={m2.yearsOfMaxWD > 0 ? "green" : "red"} /> : null}
      <ModuleMetricCard className={compactCardClass} label="Total Income Replaced" value={formatCurrency(m2.totalIncomeReplaced)} description="Covered by resource pool" accent="cyan" />
      <ModuleMetricCard className={compactCardClass} label="Survivor Gap" value={formatCurrency(m2.survivorGap)} description="Projected minus replaced" accent={hasGap ? "red" : "green"} />
      <ModuleMetricCard className={compactCardClass} label="Runway Capital Gap" value={hasGap ? formatCurrency(runwayGapCapital) : "$0"} description={`Scenario PV gap at ${formatRatePctOneDecimal(m2.roi)}`} accent={hasGap ? "red" : "green"} />
    </div>
  )
}

function ChartPanel({ title, subtitle, data, ticks, children }: { title: string; subtitle: string; data: any[]; ticks: number[]; children: ReactNode }) {
  return (
    <Card className="life-chart-panel border-slate-800/80 bg-slate-950/60">
      <CardHeader className="px-5 pb-0 pt-4">
        <div className="text-center">
          <CardTitle className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{title}</CardTitle>
          <p className="mt-1 text-xs leading-snug text-slate-400">{subtitle}</p>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4 pt-3">
        <div className="life-chart-area chart-reveal">
          <ResponsiveContainer width="100%" height="100%" debounce={100}>
            <BarChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }} barCategoryGap="8%">
              <XAxis dataKey="age" ticks={ticks} interval={0} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} width={42} />
              {children}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-0.5 text-center"><span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Age</span></div>
      </CardContent>
    </Card>
  )
}

export function LifeOutputView({ incomeGapOutputs, activeTab: activeTabProp, onActiveTabChange }: LifeOutputViewProps) {
  const [activeTabInternal, setActiveTabInternal] = useState<"safe" | "max">("safe")
  const activeTab = activeTabProp ?? activeTabInternal
  const setActiveTab = (tab: "safe" | "max") => {
    setActiveTabInternal(tab)
    onActiveTabChange?.(tab)
  }

  const { module1, module2, isM1FullyCovered, m1SurvivorGap } = incomeGapOutputs
  const retirementAge = (module1.yearlyData.at(-1)?.age ?? 64) + 1
  const safeTicks = buildAgeTicks(module1.yearlyData)
  const runwayTicks = buildAgeTicks(module2.yearlyData)
  const safePct = module1.targetIncomeSupportTotal > 0 ? Math.round((module1.totalIncomeReplaced / module1.targetIncomeSupportTotal) * 1000) / 10 : 0
  const runwayPct = module2.projectedNetIncomeTotal > 0 ? Math.round((module2.totalIncomeReplaced / module2.projectedNetIncomeTotal) * 1000) / 10 : 0

  const activeNarrative = activeTab === "safe"
    ? isM1FullyCovered
      ? "Based on the assumptions entered, existing coverage resources appear sufficient to support the modeled target income stream through the selected projection horizon."
      : `A protection gap of ${formatCurrency(m1SurvivorGap)} remains after applying entered coverage resources (${formatRatePctOneDecimal(safePct / 100)} of the modeled target income support). Additional Coverage Needed estimates the remaining resources required to close this shortfall. This is an illustrative gap analysis, not a formal recommendation.`
    : module2.survivorGap <= 0
      ? `Coverage Runway Scenario shows no remaining runway gap through the selected projection horizon at ${formatRatePctOneDecimal(module2.maxCoverageRoi)} asset return. This is a scenario-only view and does not replace the Safe Income Coverage target model.`
      : `Coverage Runway Scenario shows a ${formatCurrency(module2.survivorGap)} survivor gap after applying modeled income replacement (${formatRatePctOneDecimal(runwayPct / 100)} of projected need). Runway Capital Gap estimates the additional scenario capital required at the selected PV reference rate. This is an illustrative scenario, not a formal recommendation.`

  return (
    <div className="life-output-container">
      <div className="mb-2 flex flex-wrap gap-1">
        <button onClick={() => setActiveTab("safe")} className={`rounded-md border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === "safe" ? "border-blue-700 bg-blue-900/60 text-blue-200" : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200"}`}>Safe Income Coverage</button>
        <button onClick={() => setActiveTab("max")} className={`rounded-md border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === "max" ? "border-emerald-700 bg-emerald-900/60 text-emerald-200" : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200"}`}>Coverage Runway Scenario</button>
      </div>

      {activeTab === "safe" && (
        <AnimatedSection>
          <div className="life-visual-dashboard">
            <ChartPanel title={`Safe Income Coverage — Target Annual Net Income to Age ${retirementAge}`} subtitle={`${formatRatePctOneDecimal(module1.targetIncomeSupportPct)} target income support; entered resources support ${formatRatePctOneDecimal(module1.coverageSupportRate)} of that target`} data={module1.yearlyData} ticks={safeTicks}>
              <Tooltip content={SafeTooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="safeIncomeCoverage" name="Income Supported" stackId="income" fill="#10b981" radius={[0, 0, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="incomeGap" name="Income Gap" stackId="income" fill="#ef4444" radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </ChartPanel>
            <RunwayMetricBoxes m2={module2} projectionEndAge={retirementAge} includeCoverageYears={false} />
          </div>
        </AnimatedSection>
      )}

      {activeTab === "max" && (
        <AnimatedSection>
          <div className="life-visual-dashboard">
            <ChartPanel title="Coverage Runway Scenario — Death Benefit Drawdown" subtitle={`Entered death benefits earn ${formatRatePctOneDecimal(module2.maxCoverageRoi)}; annual withdrawals grow ${formatRatePctOneDecimal(module2.withdrawalGrowthRate)} and end with a $0 balance at age ${retirementAge}`} data={module2.yearlyData} ticks={runwayTicks}>
              <Tooltip content={RunwayTooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="maxCovered" name="Annual Withdrawal" stackId="income" fill="#10b981" radius={[0, 0, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="maxCoverageGap" name="Income Gap" stackId="income" fill="#ef4444" radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </ChartPanel>
            <RunwayMetricBoxes m2={module2} projectionEndAge={retirementAge} />
          </div>
        </AnimatedSection>
      )}

      <Card className="mt-2 border border-gray-800 bg-[#090E1A]">
        <CardContent className="px-4 py-3">
          <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-blue-400">Planning Narrative</h4>
          <p className="text-xs leading-relaxed text-gray-300">{activeNarrative}</p>
        </CardContent>
      </Card>
    </div>
  )
}
