import { useState } from "react"
import { LifeOutputs, LifeInputs, LifeAssumptions, IncomeGapOutputs, IncomeGapModule1, IncomeGapModule2 } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { AnimatedSection } from "@/components/ui/animated-section"
import { ModuleMetricCard, MetricGroup, MetricGroupDivider } from "@/features/risk-modules/core/ModuleMetricCard"

interface LifeOutputViewProps {
  outputs: LifeOutputs
  inputs: LifeInputs
  assumptions: LifeAssumptions
  incomeGapOutputs: IncomeGapOutputs
  activeTab?: "safe" | "max"
  onActiveTabChange?: (tab: "safe" | "max") => void
}

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

const tooltipClass = "bg-gray-900 p-3 border border-gray-700 rounded-lg shadow-lg text-sm min-w-48"

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
  const covered = payload.find((p: any) => p.dataKey === "maxCovered")?.value ?? 0
  const gap = payload.find((p: any) => p.dataKey === "maxCoverageGap")?.value ?? 0
  const income = covered + gap
  return (
    <div className={tooltipClass}>
      <p className="mb-2 font-semibold text-gray-100">Age {label}</p>
      <div className="flex justify-between gap-4"><span className="text-xs text-gray-400">Net Income Need:</span><span className="text-xs font-semibold text-gray-100">{formatCurrency(income)}</span></div>
      <div className="flex justify-between gap-4"><span className="text-xs text-emerald-400">Net Income Covered:</span><span className="text-xs font-semibold text-emerald-300">{formatCurrency(covered)}</span></div>
      {gap > 0 ? <div className="flex justify-between gap-4"><span className="text-xs text-rose-400">Annual Gap:</span><span className="text-xs font-semibold text-rose-300">{formatCurrency(gap)}</span></div> : null}
    </div>
  )
}

function AdditionalDeathBenefitBox({ amount, isFullyCovered }: { amount: number; isFullyCovered: boolean }) {
  return (
    <div className="rounded-lg border border-blue-700/60 bg-blue-950/40 px-4 py-4">
      <p className="text-[10px] font-bold uppercase leading-snug tracking-[0.15em] text-blue-400">Additional Death Benefit Needed</p>
      <div className="mt-2 text-2xl font-bold leading-none tracking-tight text-blue-200">
        {isFullyCovered ? <span className="text-emerald-300">Fully Covered</span> : formatCurrency(amount)}
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-blue-400/70">Target death benefit need minus entered resources</p>
    </div>
  )
}

function DeathBenefitBox({ amount, roi, isFullyCovered }: { amount: number; roi: number; isFullyCovered: boolean }) {
  return (
    <div className="rounded-lg border border-blue-700/60 bg-blue-950/40 px-4 py-4">
      <p className="text-[10px] font-bold uppercase leading-snug tracking-[0.15em] text-blue-400">Death Benefit Needed</p>
      <div className="mt-2 text-2xl font-bold leading-none tracking-tight text-blue-200">
        {isFullyCovered ? <span className="text-emerald-300">Fully Covered</span> : formatCurrency(amount)}
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-blue-400/70">PV of annual gap stream at {formatRatePctOneDecimal(roi)} reference rate</p>
    </div>
  )
}

function Module1Boxes({ m1, isFullyCovered, projectionEndAge }: { m1: IncomeGapModule1; isFullyCovered: boolean; projectionEndAge: number }) {
  const gap = Math.max(0, m1.targetIncomeSupportTotal - m1.totalIncomeReplaced)
  return (
    <div className="space-y-2">
      <MetricGroup>
        <ModuleMetricCard label={`Projected Net Income to Age ${projectionEndAge}`} value={formatCurrency(m1.projectedNetIncomeTotal)} description="Total projected net income before the target support percentage is applied" accent="slate" />
        <ModuleMetricCard label="Target Income Support" value={<>{formatRatePctOneDecimal(m1.targetIncomeSupportPct)}<span className="text-sm font-normal text-gray-400"> of need</span></>} description={`${formatCurrency(m1.targetIncomeSupportTotal)} modeled target support across all projection years`} accent="blue" />
        <ModuleMetricCard label="Coverage Resources" value={formatCurrency(m1.existingCoverageResources)} description="Group life + private life + non-qualified assets" accent="slate" />
        <ModuleMetricCard label="Coverage Support Rate" value={formatRatePctOneDecimal(m1.coverageSupportRate)} description="Entered resources divided by target death benefit need" accent={m1.coverageSupportRate >= 1 ? "green" : "cyan"} />
      </MetricGroup>
      <MetricGroupDivider />
      <MetricGroup>
        <ModuleMetricCard label="Target Death Benefit Need" value={formatCurrency(m1.targetDeathBenefitNeed)} description="Advisor-facing target need before existing resources are applied" accent="cyan" />
        <ModuleMetricCard label="Total Income Supported" value={formatCurrency(m1.totalIncomeReplaced)} description="Sum of annual target income support backed by entered resources" accent="cyan" />
        <ModuleMetricCard label="Survivor Gap" value={formatCurrency(gap)} description="Target Income Support minus Total Income Supported" accent={gap > 0 ? "red" : "green"} />
        <AdditionalDeathBenefitBox amount={m1.additionalDeathBenefitNeeded} isFullyCovered={isFullyCovered} />
      </MetricGroup>
    </div>
  )
}

function Module2Boxes({ m2, projectionEndAge }: { m2: IncomeGapModule2; projectionEndAge: number }) {
  const hasGap = m2.survivorGap > 0
  return (
    <div className="space-y-2">
      <MetricGroup>
        <ModuleMetricCard label={`Projected Net Income to Age ${projectionEndAge}`} value={formatCurrency(m2.projectedNetIncomeTotal)} description="Total projected net income from current age to retirement" accent="slate" />
        <ModuleMetricCard label="Years of Full Coverage" value={<>{Math.floor(m2.yearsOfMaxWD)}<span className="text-sm font-normal text-gray-400"> Years</span></>} description={m2.yearsOfMaxWD > 0 ? `Ages ${m2.startCoverageAge}–${m2.endCoverageAge} fully covered` : "No full coverage years"} accent={m2.yearsOfMaxWD > 0 ? "green" : "red"} />
        <ModuleMetricCard label="Total Income Replaced" value={formatCurrency(m2.totalIncomeReplaced)} description="Sum of annual income covered by the existing coverage resource pool" accent="cyan" />
      </MetricGroup>
      <MetricGroupDivider />
      <MetricGroup>
        <ModuleMetricCard label="Survivor Gap" value={formatCurrency(m2.survivorGap)} description="Projected Net Income minus Total Income Replaced" accent={hasGap ? "red" : "green"} />
        <DeathBenefitBox amount={m2.deathBenefitNeeded} roi={m2.roi} isFullyCovered={!hasGap} />
      </MetricGroup>
    </div>
  )
}

function ChartPanel({ title, subtitle, data, ticks, children }: { title: string; subtitle: string; data: any[]; ticks: number[]; children: React.ReactNode }) {
  return (
    <Card className="module-visual-panel flex flex-col border-slate-800/80 bg-slate-950/60">
      <CardHeader className="shrink-0 px-6 pb-0 pt-5">
        <div className="text-center">
          <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">{title}</CardTitle>
          <p className="mt-1 text-sm leading-snug text-slate-400">{subtitle}</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col min-h-0 px-6 pb-6 pt-4">
        <div className="flex-1 min-h-56 w-full chart-reveal">
          <ResponsiveContainer width="100%" height="100%" debounce={100}>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 4 }} barCategoryGap="8%">
              <XAxis dataKey="age" ticks={ticks} interval={0} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
              {children}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-1 text-center"><span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Age</span></div>
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
      : `A protection gap of ${formatCurrency(m1SurvivorGap)} remains after applying entered coverage resources (${formatRatePctOneDecimal(safePct / 100)} of the modeled target income support). Additional Death Benefit Needed estimates the remaining resources required to close this shortfall. This is an illustrative gap analysis, not a formal recommendation.`
    : module2.survivorGap <= 0
      ? "Based on the assumptions entered, projected income needs appear fully covered through the selected projection horizon."
      : `A protection gap of ${formatCurrency(module2.survivorGap)} remains after applying modeled income replacement (${formatRatePctOneDecimal(runwayPct / 100)} of projected need). This is an illustrative capital-needs analysis, not a formal recommendation.`

  return (
    <div className="module-output-container">
      <div className="mb-4 flex gap-1">
        <button onClick={() => setActiveTab("safe")} className={`rounded-md border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === "safe" ? "border-blue-700 bg-blue-900/60 text-blue-200" : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200"}`}>Safe Income Coverage</button>
        <button onClick={() => setActiveTab("max")} className={`rounded-md border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === "max" ? "border-emerald-700 bg-emerald-900/60 text-emerald-200" : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200"}`}>Coverage Runway Scenario</button>
      </div>

      {activeTab === "safe" && (
        <AnimatedSection>
          <div className="module-visual-dashboard">
            <ChartPanel
              title={`Safe Income Coverage — Target Annual Net Income to Age ${retirementAge}`}
              subtitle={`${formatRatePctOneDecimal(module1.targetIncomeSupportPct)} target income support; entered resources support ${formatRatePctOneDecimal(module1.coverageSupportRate)} of that target`}
              data={module1.yearlyData}
              ticks={safeTicks}
            >
              <Tooltip content={SafeTooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="safeIncomeCoverage" name="Income Supported" stackId="income" fill="#10b981" radius={[0, 0, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="incomeGap" name="Income Gap" stackId="income" fill="#ef4444" radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </ChartPanel>
            <div className="module-metric-rail"><Module1Boxes m1={module1} isFullyCovered={isM1FullyCovered} projectionEndAge={retirementAge} /></div>
          </div>
        </AnimatedSection>
      )}

      {activeTab === "max" && (
        <AnimatedSection>
          <div className="module-visual-dashboard">
            <ChartPanel title="Coverage Runway Scenario — Years of Full Net Income Coverage" subtitle="Years existing coverage resources can sustain full net income at the selected asset return rate" data={module2.yearlyData} ticks={runwayTicks}>
              <Tooltip content={RunwayTooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="maxCovered" name="Net Income Covered" stackId="income" fill="#10b981" radius={[0, 0, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="maxCoverageGap" name="Income Gap" stackId="income" fill="#ef4444" radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </ChartPanel>
            <div className="module-metric-rail"><Module2Boxes m2={module2} projectionEndAge={retirementAge} /></div>
          </div>
        </AnimatedSection>
      )}

      <Card className="mt-4 border border-gray-800 bg-[#090E1A]">
        <CardContent className="p-6">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-400">Planning Narrative</h4>
          <p className="text-sm leading-relaxed text-gray-300">{activeNarrative}</p>
        </CardContent>
      </Card>
    </div>
  )
}