import { useState } from "react"
import { LifeOutputs, LifeInputs, LifeAssumptions, IncomeGapOutputs, IncomeGapModule1, IncomeGapModule2 } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
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
  const rounded = Math.round(rate * 1000) / 10
  return `${rounded.toFixed(1)}%`
}

function roundYears(years: number): number {
  return Math.floor(years)
}

// ── Shared tooltip ────────────────────────────────────────────────────────────

const TOOLTIP_CLASS = "bg-gray-900 p-3 border border-gray-700 rounded-lg shadow-lg text-sm min-w-48"

const M1Tooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  // payload[0] = safeIncomeCoverage, payload[1] = incomeGap (stacked)
  const covered = payload.find((p: any) => p.dataKey === "safeIncomeCoverage")?.value ?? 0
  const incomeGap = payload.find((p: any) => p.dataKey === "incomeGap")?.value ?? 0
  const totalNeed = covered + incomeGap
  return (
    <div className={TOOLTIP_CLASS}>
      <p className="font-semibold text-gray-100 mb-2">Age {label}</p>
      <div className="flex justify-between gap-4 mb-1">
        <span className="text-xs text-gray-400">Net Income Need:</span>
        <span className="font-semibold text-xs text-gray-100">{formatCurrency(totalNeed)}</span>
      </div>
      <div className="flex justify-between gap-4 mb-1">
        <span className="text-xs text-emerald-400">Safe Income Coverage:</span>
        <span className="font-semibold text-xs text-emerald-300">{formatCurrency(covered)}</span>
      </div>
      {incomeGap > 0 && (
        <div className="flex justify-between gap-4">
          <span className="text-xs text-rose-400">Income Gap:</span>
          <span className="font-semibold text-xs text-rose-300">{formatCurrency(incomeGap)}</span>
        </div>
      )}
    </div>
  )
}

const M2Tooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const covered = payload.find((p: any) => p.dataKey === "maxCovered")?.value ?? 0
  const gap = payload.find((p: any) => p.dataKey === "maxCoverageGap")?.value ?? 0
  const income = covered + gap
  const isCovered = gap <= 0 && income > 0
  return (
    <div className={TOOLTIP_CLASS}>
      <p className="font-semibold text-gray-100 mb-2">Age {label}</p>
      <div className="flex justify-between gap-4 mb-1">
        <span className="text-xs text-gray-400">Status:</span>
        <span className={`font-semibold text-xs ${isCovered ? "text-emerald-400" : "text-rose-400"}`}>
          {isCovered ? "✓ Covered" : "✗ Gap"}
        </span>
      </div>
      <div className="flex justify-between gap-4 mb-1">
        <span className="text-xs text-gray-400">Net Income Need:</span>
        <span className="font-semibold text-xs text-gray-100">{formatCurrency(income)}</span>
      </div>
      <div className="flex justify-between gap-4 mb-1">
        <span className="text-xs text-emerald-400">Net Income Covered:</span>
        <span className="font-semibold text-xs text-emerald-300">{formatCurrency(covered)}</span>
      </div>
      {gap > 0 && (
        <div className="flex justify-between gap-4">
          <span className="text-xs text-rose-400">Annual Gap:</span>
          <span className="font-semibold text-xs text-rose-300">{formatCurrency(gap)}</span>
        </div>
      )}
    </div>
  )
}

// ── Tick helper shared by both charts ────────────────────────────────────────

function buildAgeTicks(data: { age: number }[], targetTickCount = 8): number[] {
  if (data.length === 0) return []

  const firstAge = data[0].age
  const lastAge = data[data.length - 1].age
  if (firstAge === lastAge) return [firstAge]

  const span = lastAge - firstAge
  const rawStep = Math.max(1, Math.ceil(span / Math.max(1, targetTickCount - 1)))

  // Snap to readable intervals to avoid cluttered labels.
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const normalized = rawStep / magnitude
  const snappedBase = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  const step = snappedBase * magnitude

  const ticks: number[] = [firstAge]
  let tickAge = firstAge + step
  while (tickAge < lastAge) {
    ticks.push(tickAge)
    tickAge += step
  }
  ticks.push(lastAge)

  return ticks
}

// ── Death Benefit Needed — prominent card ─────────────────────────────────────

function DeathBenefitBox({ amount, roi, isFullyCovered }: { amount: number; roi: number; isFullyCovered: boolean }) {
  return (
    <div className="rounded-lg border border-blue-700/60 bg-blue-950/40 px-4 py-4">
      <p className="text-[10px] font-bold uppercase leading-snug tracking-[0.15em] text-blue-400">
        Death Benefit Needed
      </p>
      <div className="mt-2 text-2xl font-bold leading-none tracking-tight text-blue-200">
        {isFullyCovered ? <span className="text-emerald-300">Fully Covered</span> : formatCurrency(amount)}
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-blue-400/70">
        Based on {formatRatePctOneDecimal(roi)} discount rate · Capital Needs Analysis
      </p>
    </div>
  )
}

// ── Module 1 metric boxes ──────────────────────────────────────────────────────

function Module1Boxes({ m1, isFullyCovered, projectionEndAge }: { m1: IncomeGapModule1; isFullyCovered: boolean; projectionEndAge: number }) {
  const m1SurvivorGap = Math.max(0, m1.projectedNetIncomeTotal - m1.totalIncomeReplaced)
  return (
    <div className="space-y-2">
      <MetricGroup>
        <ModuleMetricCard
          label={`Projected Net Income to Age ${projectionEndAge}`}
          value={formatCurrency(m1.projectedNetIncomeTotal)}
          description="Total projected net income from current age to retirement"
          accent="slate"
        />
        <ModuleMetricCard
          label={`Safe Income Coverage — Year 1`}
          value={<>{formatCurrency(m1.annualCoverageYear1)}<span className="text-sm font-normal text-gray-400"> / yr</span></>}
          description={`${formatRatePctOneDecimal(m1.safeIncomeCoveragePct)} of projected income supported by entered death benefit/resources`}
          accent="blue"
        />
        <ModuleMetricCard
          label="Coverage Resources"
          value={formatCurrency(m1.existingCoverageResources)}
          description={`Compared against ${formatCurrency(m1.pvOfProjectedNeed)} PV of projected income need`}
          accent="slate"
        />
        <ModuleMetricCard
          label="Total Income Covered"
          value={formatCurrency(m1.totalIncomeReplaced)}
          description={`Sum of derived Safe Income Coverage across all projection years`}
          accent="cyan"
        />
      </MetricGroup>
      <MetricGroupDivider />
      <MetricGroup>
        <ModuleMetricCard
          label="Survivor Gap (Undiscounted)"
          value={formatCurrency(m1SurvivorGap)}
          description="Projected Net Income − Total Income Covered (nominal, not discounted)"
          accent={m1SurvivorGap > 0 ? "red" : "green"}
        />
        <DeathBenefitBox amount={m1.deathBenefitNeeded} roi={m1.roi} isFullyCovered={isFullyCovered} />
      </MetricGroup>
    </div>
  )
}

// ── Module 2 metric boxes ──────────────────────────────────────────────────────

function Module2Boxes({ m2, projectionEndAge }: { m2: IncomeGapModule2; projectionEndAge: number }) {
  const hasGap = m2.survivorGap > 0
  const hasCoverage = m2.yearsOfMaxWD > 0
  return (
    <div className="space-y-2">
      <MetricGroup>
        <ModuleMetricCard
          label={`Projected Net Income to Age ${projectionEndAge}`}
          value={formatCurrency(m2.projectedNetIncomeTotal)}
          description="Total projected net income from current age to retirement"
          accent="slate"
        />
        <ModuleMetricCard
          label="Years of Full Coverage"
          value={<>{roundYears(m2.yearsOfMaxWD)}<span className="text-sm font-normal text-gray-400"> Years</span></>}
          description={
            hasCoverage
              ? `Ages ${m2.startCoverageAge}–${m2.endCoverageAge} fully covered`
              : "No full coverage years — increase existing coverage resources"
          }
          accent={hasCoverage ? "green" : "red"}
        />
        <ModuleMetricCard
          label="Total Income Replaced"
          value={formatCurrency(m2.totalIncomeReplaced)}
          description="Sum of annual income covered by the existing coverage resource pool"
          accent="cyan"
        />
      </MetricGroup>
      <MetricGroupDivider />
      <MetricGroup>
        <ModuleMetricCard
          label="Survivor Gap"
          value={formatCurrency(m2.survivorGap)}
          description="Projected Net Income − Total Income Replaced"
          accent={hasGap ? "red" : "green"}
        />
        <DeathBenefitBox amount={m2.deathBenefitNeeded} roi={m2.roi} isFullyCovered={m2.survivorGap <= 0} />
      </MetricGroup>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function LifeOutputView({ outputs, incomeGapOutputs, activeTab: activeTabProp, onActiveTabChange }: LifeOutputViewProps) {
  const [activeTabInternal, setActiveTabInternal] = useState<"safe" | "max">("safe")
  const activeTab = activeTabProp ?? activeTabInternal
  const setActiveTab = (tab: "safe" | "max") => {
    setActiveTabInternal(tab)
    onActiveTabChange?.(tab)
  }
  const { module1, module2, isM1FullyCovered, m1SurvivorGap } = incomeGapOutputs

  const m1TickAges = buildAgeTicks(module1.yearlyData)
  const m2TickAges = buildAgeTicks(module2.yearlyData)
  const retirementAge = (module1.yearlyData.at(-1)?.age ?? 64) + 1
  const activeModule = activeTab === "safe" ? module1 : module2
  const replacedPct = activeModule.projectedNetIncomeTotal > 0
    ? Math.round((activeModule.totalIncomeReplaced / activeModule.projectedNetIncomeTotal) * 1000) / 10
    : 0
  const activeIsFullyCovered = activeTab === "safe" ? isM1FullyCovered : module2.survivorGap <= 0
  const activeSurvivorGap = activeTab === "safe" ? m1SurvivorGap : module2.survivorGap
  const activeNarrative = activeIsFullyCovered
    ? "Based on the assumptions entered, projected income needs appear fully covered through the selected projection horizon. Review whenever income, coverage, or family circumstances change."
    : `A protection gap of ${formatCurrency(activeSurvivorGap)} remains after applying modeled income replacement (${formatCurrency(activeModule.totalIncomeReplaced)} total — ${replacedPct}% of projected need). This gap represents income that would go unfunded if the client passed away today. The Death Benefit Needed value estimates the additional coverage required to close this shortfall at the selected discount rate. This is an illustrative capital-needs analysis, not a formal recommendation.`

  return (
    <div className="module-output-container">
      {/* ── Tab header ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setActiveTab("safe")}
          className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "safe"
              ? "bg-blue-900/60 border border-blue-700 text-blue-200"
              : "bg-slate-900/40 border border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          Safe Income Coverage
        </button>
        <button
          onClick={() => setActiveTab("max")}
          className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "max"
              ? "bg-emerald-900/60 border border-emerald-700 text-emerald-200"
              : "bg-slate-900/40 border border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          Full Coverage Scenario
        </button>
      </div>

      {/* ── Module 1 — Safe Income Coverage ──────────────────────────────── */}
      {activeTab === "safe" && (
        <AnimatedSection>
          <div className="module-visual-dashboard">
            {/* Chart */}
            <Card className="module-visual-panel flex flex-col border-slate-800/80 bg-slate-950/60">
              <CardHeader className="shrink-0 px-6 pb-0 pt-5">
                <div className="text-center">
                  <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                    Safe Income Coverage — Annual Net Income to Age {retirementAge}
                  </CardTitle>
                  <p className="mt-1 text-sm leading-snug text-slate-400">
                    Entered death benefit/resources support {formatRatePctOneDecimal(module1.safeIncomeCoveragePct)} of the modeled income need
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col min-h-0 px-6 pb-6 pt-4">
                <div className="flex flex-1 min-h-0 items-stretch gap-1">
                  <div className="flex w-3.5 shrink-0 items-center justify-center">
                    <span
                      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                      className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Annual Net Income ($)
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex-1 min-h-56 w-full chart-reveal">
                      <ResponsiveContainer width="100%" height="100%" debounce={100}>
                        <BarChart
                          data={module1.yearlyData}
                          margin={{ top: 10, right: 20, left: 0, bottom: 4 }}
                          barCategoryGap="8%"
                        >
                          <XAxis
                            dataKey="age"
                            ticks={m1TickAges}
                            interval={0}
                            tick={{ fill: "#64748b", fontSize: 11 }}
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
                          <Tooltip content={M1Tooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                          {/* Stacked bars: safe income coverage (blue, bottom) + income gap (red, top) */}
                          <Bar dataKey="safeIncomeCoverage" name="Safe Income Coverage" stackId="income" fill="#10b981" radius={[0, 0, 0, 0]} isAnimationActive={false} />
                          <Bar dataKey="incomeGap" name="Income Gap" stackId="income" fill="#ef4444" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-1 text-center">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Age</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
                        <span className="inline-block h-2.5 w-4 rounded-sm bg-[#10b981]" />
                        Safe Income Coverage ({formatRatePctOneDecimal(module1.safeIncomeCoveragePct)} of need, derived from entered resources)
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
                        <span className="inline-block h-2.5 w-4 rounded-sm bg-[#ef4444]" />
                        Income Gap
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metric rail */}
            <div className="module-metric-rail">
              <Module1Boxes m1={module1} isFullyCovered={isM1FullyCovered} projectionEndAge={retirementAge} />
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ── Module 2 — Full Coverage Scenario ───────────────────────────────── */}
      {activeTab === "max" && (
        <AnimatedSection>
          <div className="module-visual-dashboard">
            {/* Chart */}
            <Card className="module-visual-panel flex flex-col border-slate-800/80 bg-slate-950/60">
              <CardHeader className="shrink-0 px-6 pb-0 pt-5">
                <div className="text-center">
                  <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                    Full Coverage Scenario — Years of Full Net Income Coverage
                  </CardTitle>
                  <p className="mt-1 text-sm leading-snug text-slate-400">
                    Years existing coverage resources can sustain full net income at the selected asset return rate
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col min-h-0 px-6 pb-6 pt-4">
                <div className="flex flex-1 min-h-0 items-stretch gap-1">
                  <div className="flex w-3.5 shrink-0 items-center justify-center">
                    <span
                      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                      className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Annual Net Income ($)
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex-1 min-h-56 w-full chart-reveal">
                      <ResponsiveContainer width="100%" height="100%" debounce={100}>
                        <BarChart
                          data={module2.yearlyData}
                          margin={{ top: 10, right: 20, left: 0, bottom: 4 }}
                          barCategoryGap="8%"
                        >
                          <XAxis
                            dataKey="age"
                            ticks={m2TickAges}
                            interval={0}
                            tick={{ fill: "#64748b", fontSize: 11 }}
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
                          <Tooltip content={M2Tooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                          <Bar dataKey="maxCovered" name="Net Income Covered" stackId="income" fill="#10b981" radius={[0, 0, 0, 0]} isAnimationActive={false} />
                          <Bar dataKey="maxCoverageGap" name="Income Gap" stackId="income" fill="#ef4444" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-1 text-center">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Age</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
                        <span className="inline-block h-2.5 w-4 rounded-sm bg-[#10b981]" />
                        Fully Covered
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
                        <span className="inline-block h-2.5 w-4 rounded-sm bg-[#ef4444]" />
                        Income Gap
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metric rail */}
            <div className="module-metric-rail">
              <Module2Boxes m2={module2} projectionEndAge={retirementAge} />
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ── Planning narrative (unchanged) ───────────────────────────────── */}
      <Card className="bg-[#090E1A] border border-gray-800 mt-4">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-400 mb-2 uppercase tracking-wider text-xs">Planning Narrative</h4>
          <p className="text-sm text-gray-300 leading-relaxed">{activeNarrative}</p>
        </CardContent>
      </Card>
    </div>
  )
}
