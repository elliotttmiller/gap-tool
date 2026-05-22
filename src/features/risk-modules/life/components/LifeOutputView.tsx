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
  Cell,
  ResponsiveContainer,
} from "recharts"
import { getLifeInsuranceNarrative } from "../constants/moduleCopy"
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

// ── Shared tooltip ────────────────────────────────────────────────────────────

const TOOLTIP_CLASS = "bg-gray-900 p-3 border border-gray-700 rounded-lg shadow-lg text-sm min-w-48"

const M1Tooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  // payload[0] = safeWD, payload[1] = incomeGap (stacked)
  const safeWD = payload.find((p: any) => p.dataKey === "safeWD")?.value ?? 0
  const incomeGap = payload.find((p: any) => p.dataKey === "incomeGap")?.value ?? 0
  const totalNeed = safeWD + incomeGap
  return (
    <div className={TOOLTIP_CLASS}>
      <p className="font-semibold text-gray-100 mb-2">Age {label}</p>
      <div className="flex justify-between gap-4 mb-1">
        <span className="text-xs text-gray-400">Income Need:</span>
        <span className="font-semibold text-xs text-gray-100">{formatCurrency(totalNeed)}</span>
      </div>
      <div className="flex justify-between gap-4 mb-1">
        <span className="text-xs text-blue-400">Safe Withdrawal:</span>
        <span className="font-semibold text-xs text-blue-300">{formatCurrency(safeWD)}</span>
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
  const point = payload[0]?.payload
  const isCovered = point?.isCoveredMax
  const income = point?.projectedIncome ?? 0
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
        <span className="text-xs text-gray-400">Income Need:</span>
        <span className="font-semibold text-xs text-gray-100">{formatCurrency(income)}</span>
      </div>
      {isCovered && (
        <div className="flex justify-between gap-4">
          <span className="text-xs text-emerald-400">Covered:</span>
          <span className="font-semibold text-xs text-emerald-300">{formatCurrency(income)}</span>
        </div>
      )}
    </div>
  )
}

// ── Tick helper shared by both charts ────────────────────────────────────────

function buildTickAges(data: { age: number }[]): Set<number> {
  return new Set(data.filter((_, i) => i % 2 === 0).map((p) => p.age))
}

// ── Death Benefit Needed — prominent card ─────────────────────────────────────

function DeathBenefitBox({ amount, roi }: { amount: number; roi: number }) {
  return (
    <div className="rounded-lg border border-blue-700/60 bg-blue-950/40 px-4 py-4">
      <p className="text-[10px] font-bold uppercase leading-snug tracking-[0.15em] text-blue-400">
        Death Benefit Needed
      </p>
      <div className="mt-2 text-2xl font-bold leading-none tracking-tight text-blue-200">
        {amount > 0 ? formatCurrency(amount) : <span className="text-emerald-300">Fully Covered</span>}
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-blue-400/70">
        Based on {Math.round(roi * 100)}% ROI · Capital Needs Analysis
      </p>
    </div>
  )
}

// ── Module 1 metric boxes ──────────────────────────────────────────────────────

function Module1Boxes({ m1 }: { m1: IncomeGapModule1 }) {
  const hasGap = m1.survivorGap > 0
  return (
    <div className="space-y-2">
      <MetricGroup>
        <ModuleMetricCard
          label="Projected Net Income to Age 65 (Total)"
          value={formatCurrency(m1.projectedNetIncomeTotal)}
          description="Total projected net income from current age to retirement"
          accent="slate"
        />
        <ModuleMetricCard
          label="Safe Withdrawal Rate to Age 65"
          value={<>{formatCurrency(m1.annualSafeWD)}<span className="text-sm font-normal text-gray-400"> / yr</span></>}
          description={`${Math.round(m1.safeWithdrawalRate * 100)}% of asset base — consistent, sustainable annual income`}
          accent="blue"
        />
        <ModuleMetricCard
          label="Total Income Replaced"
          value={formatCurrency(m1.totalIncomeReplaced)}
          description="Cumulative safe withdrawals over all years to retirement"
          accent="cyan"
        />
      </MetricGroup>
      <MetricGroupDivider />
      <MetricGroup>
        <ModuleMetricCard
          label="Survivor Gap"
          value={formatCurrency(m1.survivorGap)}
          description="Projected Net Income − Total Income Replaced"
          accent={hasGap ? "red" : "green"}
        />
        <DeathBenefitBox amount={m1.deathBenefitNeeded} roi={m1.roi} />
      </MetricGroup>
    </div>
  )
}

// ── Module 2 metric boxes ──────────────────────────────────────────────────────

function Module2Boxes({ m2 }: { m2: IncomeGapModule2 }) {
  const hasGap = m2.survivorGap > 0
  const hasCoverage = m2.yearsOfMaxWD > 0
  return (
    <div className="space-y-2">
      <MetricGroup>
        <ModuleMetricCard
          label="Projected Net Income to Age 65 (Total)"
          value={formatCurrency(m2.projectedNetIncomeTotal)}
          description="Total projected net income from current age to retirement"
          accent="slate"
        />
        <ModuleMetricCard
          label="Years of Max Withdrawal Rate"
          value={<>{m2.yearsOfMaxWD}<span className="text-sm font-normal text-gray-400"> Years</span></>}
          description={
            hasCoverage
              ? `Ages ${m2.startCoverageAge}–${m2.endCoverageAge} fully covered`
              : "No full coverage years — increase asset base"
          }
          accent={hasCoverage ? "green" : "red"}
        />
        <ModuleMetricCard
          label="Total Income Replaced"
          value={formatCurrency(m2.totalIncomeReplaced)}
          description="Sum of income during fully covered (green) years only"
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
        <DeathBenefitBox amount={m2.deathBenefitNeeded} roi={m2.roi} />
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
  const { module1, module2 } = incomeGapOutputs

  const m1TickAges = buildTickAges(module1.yearlyData)
  const m2TickAges = buildTickAges(module2.yearlyData)
  const retirementAge = (module1.yearlyData.at(-1)?.age ?? 64) + 1

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
          Safe W/D Rate
        </button>
        <button
          onClick={() => setActiveTab("max")}
          className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "max"
              ? "bg-emerald-900/60 border border-emerald-700 text-emerald-200"
              : "bg-slate-900/40 border border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          Max W/D Rate
        </button>
      </div>

      {/* ── Module 1 — Safe Withdrawal Rate ──────────────────────────────── */}
      {activeTab === "safe" && (
        <AnimatedSection>
          <div className="module-visual-dashboard">
            {/* Chart */}
            <Card className="module-visual-panel flex flex-col border-slate-800/80 bg-slate-950/60">
              <CardHeader className="shrink-0 px-6 pb-0 pt-5">
                <div className="text-center">
                  <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                    Safe Withdrawal Rate — Annual Income to Age {retirementAge}
                  </CardTitle>
                  <p className="mt-1 text-sm leading-snug text-slate-400">
                    Flat, sustainable annual safe withdrawal from asset base
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
                      Annual Income ($)
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
                            tick={({ x, y, payload }) =>
                              m1TickAges.has(payload.value) ? (
                                <text x={x} y={y + 12} textAnchor="middle" fill="#64748b" fontSize={11}>
                                  {payload.value}
                                </text>
                              ) : (
                                <g />
                              )
                            }
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
                          {/* Stacked bars: safe withdrawal (blue, bottom) + income gap (red, top) */}
                          <Bar dataKey="safeWD" name="Safe Withdrawal" stackId="income" fill="#3b82f6" radius={[0, 0, 0, 0]} isAnimationActive={false} />
                          <Bar dataKey="incomeGap" name="Income Gap" stackId="income" fill="#ef4444" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-1 text-center">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Age</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
                        <span className="inline-block h-2.5 w-4 rounded-sm bg-[#3b82f6]" />
                        Safe Withdrawal ({Math.round(module1.safeWithdrawalRate * 100)}% / yr)
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
              <Module1Boxes m1={module1} />
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ── Module 2 — Max Withdrawal Rate ───────────────────────────────── */}
      {activeTab === "max" && (
        <AnimatedSection>
          <div className="module-visual-dashboard">
            {/* Chart */}
            <Card className="module-visual-panel flex flex-col border-slate-800/80 bg-slate-950/60">
              <CardHeader className="shrink-0 px-6 pb-0 pt-5">
                <div className="text-center">
                  <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                    Max Withdrawal Rate — Years of Full Income Coverage
                  </CardTitle>
                  <p className="mt-1 text-sm leading-snug text-slate-400">
                    Years asset base can sustain full income before depleting
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
                      Annual Income ($)
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
                            tick={({ x, y, payload }) =>
                              m2TickAges.has(payload.value) ? (
                                <text x={x} y={y + 12} textAnchor="middle" fill="#64748b" fontSize={11}>
                                  {payload.value}
                                </text>
                              ) : (
                                <g />
                              )
                            }
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
                          {/* Full bar at projectedIncome height — green = covered, red = gap */}
                          <Bar dataKey="projectedIncome" name="Annual Income" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                            {module2.yearlyData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.isCoveredMax ? "#10b981" : "#ef4444"}
                              />
                            ))}
                          </Bar>
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
              <Module2Boxes m2={module2} />
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ── Planning narrative (unchanged) ───────────────────────────────── */}
      <Card className="bg-[#090E1A] border border-gray-800 mt-4">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-400 mb-2 uppercase tracking-wider text-xs">Planning Narrative</h4>
          <p className="text-sm text-gray-300 leading-relaxed">{getLifeInsuranceNarrative(outputs)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
