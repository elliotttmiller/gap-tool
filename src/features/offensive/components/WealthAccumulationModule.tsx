import { useMemo, useState } from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"
import type { WealthAccumulationInputs } from "@/lib/store-types"
import {
  calculateWealthAccumulation,
  type WealthAccumulationOutputs,
} from "../calculations/wealthAccumulationCalc"
import { ModuleMetricCard } from "@/features/risk-modules/core/ModuleMetricCard"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { cx } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CollapsibleInputSection } from "@/components/ui/collapsible-input-section"

// ── Input helpers ─────────────────────────────────────────────────────────────

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="whitespace-nowrap">{label}</Label>
      {children}
    </div>
  )
}

// ── Currency/percent input ────────────────────────────────────────────────────

function CurrencyInput({ value, onChange, placeholder }: { value: number; onChange: (v: number) => void; placeholder?: string }) {
  return (
    <Input
      type="number"
      min={0}
      step={1}
      prefix="$"
      placeholder={placeholder ?? "0"}
      value={value === 0 ? "" : value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    />
  )
}

function PercentInput({ value, onChange, min = 0, max = 100, step = 0.1 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <Input
      type="number"
      min={min}
      max={max}
      step={step}
      suffix="%"
      value={+(value * 100).toFixed(2) || ""}
      onChange={(e) => onChange((parseFloat(e.target.value) || 0) / 100)}
    />
  )
}

function IntInput({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <Input
      type="number"
      min={min}
      max={max}
      step={1}
      value={value || ""}
      onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
    />
  )
}

// ── Input Form ────────────────────────────────────────────────────────────────

interface WealthInputFormProps {
  inputs: WealthAccumulationInputs
  onChange: (inputs: WealthAccumulationInputs) => void
}

function WealthInputForm({ inputs, onChange }: WealthInputFormProps) {
  function set<K extends keyof WealthAccumulationInputs>(k: K, v: WealthAccumulationInputs[K]) {
    onChange({ ...inputs, [k]: v })
  }

  return (
    <div className="space-y-2">
      <CollapsibleInputSection title="Client Profile" contentClassName="grid grid-cols-2 gap-3 px-5 pt-3 pb-4">
        <FieldGroup label="Current Age">
          <IntInput value={inputs.currentAge} onChange={(v) => set("currentAge", v)} min={18} max={79} />
        </FieldGroup>
        <FieldGroup label="Retirement Age">
          <IntInput value={inputs.retirementAge} onChange={(v) => set("retirementAge", v)} min={inputs.currentAge + 1} max={85} />
        </FieldGroup>
        <FieldGroup label="Annual Income">
          <CurrencyInput value={inputs.currentAnnualIncome} onChange={(v) => set("currentAnnualIncome", v)} />
        </FieldGroup>
        <FieldGroup label="Income Replacement">
          <PercentInput value={inputs.incomeReplacementRatio} onChange={(v) => set("incomeReplacementRatio", v)} min={50} max={100} />
        </FieldGroup>
        <div className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="wag-override-toggle"
            checked={inputs.useTargetRetirementIncomeOverride}
            onChange={(e) => set("useTargetRetirementIncomeOverride", e.target.checked)}
            className="size-4 rounded border-gray-700 bg-gray-900 accent-cyan-500"
          />
          <label htmlFor="wag-override-toggle" className="text-xs text-slate-400">Override: enter target income directly</label>
        </div>
        {inputs.useTargetRetirementIncomeOverride && (
          <div className="col-span-2">
            <FieldGroup label="Target Annual Income">
              <CurrencyInput value={inputs.targetRetirementIncome} onChange={(v) => set("targetRetirementIncome", v)} />
            </FieldGroup>
          </div>
        )}
      </CollapsibleInputSection>

      <CollapsibleInputSection title="Financial Position" contentClassName="grid grid-cols-2 gap-3 px-5 pt-3 pb-4">
        <FieldGroup label="Portfolio Value">
          <CurrencyInput value={inputs.currentPortfolioValue} onChange={(v) => set("currentPortfolioValue", v)} />
        </FieldGroup>
        <FieldGroup label="Monthly Contribution">
          <CurrencyInput value={inputs.monthlyContribution} onChange={(v) => set("monthlyContribution", v)} />
        </FieldGroup>
        <FieldGroup label="SS Monthly">
          <CurrencyInput value={inputs.socialSecurityMonthly} onChange={(v) => set("socialSecurityMonthly", v)} />
        </FieldGroup>
        <FieldGroup label="Pension Monthly">
          <CurrencyInput value={inputs.pensionMonthly} onChange={(v) => set("pensionMonthly", v)} />
        </FieldGroup>
        <div className="col-span-2">
          <FieldGroup label="Other Guaranteed">
            <CurrencyInput value={inputs.otherGuaranteedMonthly} onChange={(v) => set("otherGuaranteedMonthly", v)} />
          </FieldGroup>
        </div>
      </CollapsibleInputSection>

      <CollapsibleInputSection title="Growth Assumptions" contentClassName="grid grid-cols-2 gap-3 px-5 pt-3 pb-4">
        <FieldGroup label="Expected Return">
          <PercentInput value={inputs.expectedAnnualReturn} onChange={(v) => set("expectedAnnualReturn", v)} min={0} max={15} />
        </FieldGroup>
        <FieldGroup label="Inflation Rate">
          <PercentInput value={inputs.inflationRate} onChange={(v) => set("inflationRate", v)} min={0} max={10} />
        </FieldGroup>
        <FieldGroup label="Retirement Duration">
          <IntInput value={inputs.retirementDurationYears} onChange={(v) => set("retirementDurationYears", v)} min={10} max={50} />
        </FieldGroup>
        <FieldGroup label="Safe Withdrawal">
          <PercentInput value={inputs.safeWithdrawalRate} onChange={(v) => set("safeWithdrawalRate", Math.max(0.01, v))} min={1} max={8} />
        </FieldGroup>
        <div className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="wag-inflation-toggle"
            checked={inputs.useInflationAdjustment}
            onChange={(e) => set("useInflationAdjustment", e.target.checked)}
            className="size-4 rounded border-gray-700 bg-gray-900 accent-cyan-500"
          />
          <label htmlFor="wag-inflation-toggle" className="text-xs text-slate-400">Inflation adjustment on target income</label>
        </div>
      </CollapsibleInputSection>

      <CollapsibleInputSection title="Custom Wealth Target" defaultOpen={false} contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="wag-custom-target"
            checked={inputs.useCustomWealthTarget}
            onChange={(e) => set("useCustomWealthTarget", e.target.checked)}
            className="size-4 rounded border-gray-700 bg-gray-900 accent-cyan-500"
          />
          <label htmlFor="wag-custom-target" className="text-xs text-slate-400">Override: enter custom wealth target</label>
        </div>
        {inputs.useCustomWealthTarget && (
          <FieldGroup label="Custom Wealth Target">
            <CurrencyInput value={inputs.customWealthTarget} onChange={(v) => set("customWealthTarget", v)} />
          </FieldGroup>
        )}
      </CollapsibleInputSection>
    </div>
  )
}

// ── Status color helpers ──────────────────────────────────────────────────────

function fundingColor(ratio: number) {
  if (ratio >= 1) return "green"
  if (ratio >= 0.8) return "amber"
  if (ratio >= 0.6) return "blue"
  return "red"
}

function savingsRateColor(rate: number) {
  if (rate >= 0.15) return "green"
  if (rate >= 0.10) return "amber"
  return "red"
}

// ── Tooltip helpers ───────────────────────────────────────────────────────────

const TOOLTIP_CLASS = "bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm shadow-lg min-w-44"

function CurrencyTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: number }) {
  if (!active || !payload?.length) return null
  return (
    <div className={TOOLTIP_CLASS}>
      <p className="mb-2 font-semibold text-gray-100">Age {label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span className="text-xs" style={{ color: p.color }}>{p.name}</span>
          <span className="text-xs font-semibold text-gray-100">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Chart 1A — Retirement Readiness Timeline ──────────────────────────────────

function WealthTimelineChart({ outputs }: { outputs: WealthAccumulationOutputs }) {
  const data = outputs.timelineData
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">Retirement Readiness Timeline</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="wag-portfolio-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="age" tick={{ fill: "#64748b", fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`} tick={{ fill: "#64748b", fontSize: 11 }} width={60} />
          <Tooltip content={<CurrencyTooltip />} />
          <ReferenceLine y={outputs.wealthNeeded} stroke="#ef4444" strokeDasharray="6 3" label={{ value: "Target", fill: "#ef4444", fontSize: 10, position: "insideTopRight" }} />
          <Area type="monotone" dataKey="portfolioBalance" name="Projected Portfolio" stroke="#06b6d4" fill="url(#wag-portfolio-fill)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Chart 1B — Retirement Income Waterfall ────────────────────────────────────

function IncomeWaterfallChart({ outputs }: { outputs: WealthAccumulationOutputs }) {
  const guaranteed = outputs.derived.annualGuaranteedIncome
  const portfolio = outputs.projectedWealthAtRetirement * outputs.derived.annualGuaranteedIncome > 0
    ? outputs.projectedWealthAtRetirement * 0.04
    : outputs.projectedWealthAtRetirement * outputs.derived.annualGuaranteedIncome >= 0
      ? outputs.projectedWealthAtRetirement * 0.04
      : 0

  // Use the actual formula values
  const portfolioIncome = outputs.projectedWealthAtRetirement * (outputs.derived.annualGuaranteedIncome > 0 ? 0.04 : 0.04)
  const incomeGap = Math.max(0, outputs.inflationAdjustedTarget - guaranteed - portfolioIncome)

  const data = [
    { name: "Retirement Income", guaranteed, portfolio: portfolioIncome, gap: incomeGap },
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">Retirement Income Waterfall</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fill: "#64748b", fontSize: 10 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} width={110} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              return (
                <div className={TOOLTIP_CLASS}>
                  {payload.map((p) => (
                    <div key={p.name} className="flex justify-between gap-4">
                      <span className="text-xs" style={{ color: p.color as string }}>{p.name}</span>
                      <span className="text-xs font-semibold text-gray-100">{formatCurrency(p.value as number)}</span>
                    </div>
                  ))}
                </div>
              )
            }}
          />
          <ReferenceLine x={outputs.inflationAdjustedTarget} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "Target", fill: "#f59e0b", fontSize: 10, position: "insideTopRight" }} />
          <Bar dataKey="guaranteed" name="Social Security + Pension" stackId="a" fill="#10b981" />
          <Bar dataKey="portfolio" name="Portfolio Withdrawal" stackId="a" fill="#3b82f6" />
          <Bar dataKey="gap" name="Unfunded Gap" stackId="a" fill="#ef4444" />
          <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Chart 1C — Contribution Sensitivity ──────────────────────────────────────

function ContributionSensitivityChart({ outputs }: { outputs: WealthAccumulationOutputs }) {
  const data = outputs.timelineData
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">Contribution Sensitivity</h3>
      <p className="mb-3 text-[11px] text-slate-600">Impact of increasing contributions on projected wealth</p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="age" tick={{ fill: "#64748b", fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`} tick={{ fill: "#64748b", fontSize: 11 }} width={60} />
          <Tooltip content={<CurrencyTooltip />} />
          <ReferenceLine y={outputs.wealthNeeded} stroke="#ef4444" strokeDasharray="6 3" label={{ value: "Target", fill: "#ef4444", fontSize: 10, position: "insideTopRight" }} />
          <Line type="monotone" dataKey="portfolioBalance" name="Current Trajectory" stroke="#64748b" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="scenarioHalf" name="+50% Additional" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="scenarioClosed" name="Gap Fully Closed" stroke="#10b981" strokeWidth={2} dot={false} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Assumptions Panel ─────────────────────────────────────────────────────────

function AssumptionsPanel({ inputs, outputs }: { inputs: WealthAccumulationInputs; outputs: WealthAccumulationOutputs }) {
  const items = [
    { label: "Expected Annual Return", value: formatPercent(inputs.expectedAnnualReturn), source: "User" },
    { label: "Inflation Rate", value: formatPercent(inputs.inflationRate), source: "User" },
    { label: "Real Rate of Return", value: formatPercent(outputs.derived.realRate), source: "Calculated" },
    { label: "Safe Withdrawal Rate", value: formatPercent(inputs.safeWithdrawalRate), source: "User" },
    { label: "Income Replacement Ratio", value: formatPercent(inputs.incomeReplacementRatio), source: "User" },
    { label: "Retirement Duration", value: `${inputs.retirementDurationYears} yrs`, source: "User" },
    { label: "Inflation Adjustment", value: inputs.useInflationAdjustment ? "Enabled" : "Disabled", source: "User" },
    { label: "SS / Pension Included", value: outputs.derived.annualGuaranteedIncome > 0 ? "Yes" : "No", source: "User" },
    { label: "Planning Horizon", value: `${outputs.derived.yearsToRetirement} yrs`, source: "Calculated" },
  ]
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">Assumptions</h3>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">{item.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">{item.value}</span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500">{item.source}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[10px] leading-5 text-slate-600">
        Projections are illustrative estimates based on the assumptions above and do not guarantee future results. Returns are hypothetical and not adjusted for taxes unless noted. The Safe Withdrawal Rate methodology assumes a diversified portfolio. This tool is for planning purposes only.
      </p>
    </div>
  )
}

// ── Action Items ──────────────────────────────────────────────────────────────

function ActionItems({ outputs }: { outputs: WealthAccumulationOutputs }) {
  const items: { id: string; title: string; body: string }[] = []

  if (outputs.wealthAccumulationGap > 0) {
    items.push({
      id: "a1",
      title: "Increase Monthly Contributions",
      body: `To close your ${formatCurrency(outputs.wealthAccumulationGap)} retirement gap, increase monthly contributions by ${formatCurrency(outputs.additionalMonthlyNeeded)} — bringing total savings to ${formatCurrency(outputs.totalMonthlyRequired)}/month (${formatPercent(outputs.requiredSavingsRate)} of income).`,
    })
    items.push({
      id: "a2",
      title: "Urgency Signal — Cost of Delay",
      body: `Every 12 months without action increases the required monthly savings by an additional ${formatCurrency(outputs.costOfDelay)}. Acting today costs ${formatCurrency(outputs.additionalMonthlyNeeded)}/month; waiting one year costs ${formatCurrency(outputs.additionalMonthlyNeeded + outputs.costOfDelay)}/month.`,
    })
  }

  if (outputs.derived.annualGuaranteedIncome > 0 && outputs.netIncomeNeed > 0) {
    items.push({
      id: "a3",
      title: "Guaranteed Income Offset",
      body: `Social Security and pension cover ${formatCurrency(outputs.derived.annualGuaranteedIncome)}/year of your ${formatCurrency(outputs.inflationAdjustedTarget)}/year target. Your portfolio must generate the remaining ${formatCurrency(outputs.netIncomeNeed)}/year — equivalent to maintaining a ${formatCurrency(outputs.wealthNeeded)} portfolio.`,
    })
  }

  if (outputs.wealthSurplus > 0) {
    items.push({
      id: "a4",
      title: "Surplus — Legacy / Early Retirement",
      body: `At current savings rates, you are projected to exceed your retirement target by ${formatCurrency(outputs.wealthSurplus)}. This surplus supports legacy planning, charitable giving, or retiring ahead of schedule.`,
    })
  }

  if (!items.length) return null

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">Action Items</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-xs font-semibold text-cyan-400">{item.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Metric Cards ──────────────────────────────────────────────────────────────

function MetricCards({ outputs }: { outputs: WealthAccumulationOutputs }) {
  const fr = outputs.fundingRatio
  const clampedFundingRatio = Math.min(fr, 2)

  return (
    <div className="space-y-3">
      {/* Warnings */}
      {outputs.shortHorizonWarning && (
        <div className="rounded-lg border border-amber-800/60 bg-amber-950/20 px-4 py-3 text-xs text-amber-300">
          ⚠ Short planning horizon — results are highly sensitive to market timing. Consider reviewing with Monte Carlo analysis.
        </div>
      )}
      {outputs.guaranteedFullyCoveredWarning && (
        <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/20 px-4 py-3 text-xs text-emerald-300">
          ✓ Guaranteed income fully covers the retirement target — no portfolio gap identified.
        </div>
      )}

      {/* Primary headline row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ModuleMetricCard
          label="Projected Wealth at Retirement"
          value={formatCurrency(outputs.projectedWealthAtRetirement)}
          description={`At age ${outputs.timelineData.at(-1)?.age ?? "—"}`}
          accent={fundingColor(fr) as "green" | "amber" | "blue" | "red"}
        />
        <ModuleMetricCard
          label="Wealth Needed at Retirement"
          value={formatCurrency(outputs.wealthNeeded)}
          description="Benchmark"
          accent="slate"
        />
        {outputs.wealthAccumulationGap > 0 ? (
          <ModuleMetricCard
            label="Retirement Readiness Gap"
            value={formatCurrency(outputs.wealthAccumulationGap)}
            description="Funding shortfall"
            accent="red"
          />
        ) : (
          <ModuleMetricCard
            label="Wealth Surplus"
            value={formatCurrency(outputs.wealthSurplus)}
            description="Above target"
            accent="green"
          />
        )}
      </div>

      {/* Readiness row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ModuleMetricCard
          label="Retirement Readiness"
          value={clampedFundingRatio >= 2 ? "200%+" : formatPercent(fr)}
          description={fr >= 1 ? "On Track" : fr >= 0.8 ? "Close — Adjust" : fr >= 0.6 ? "Behind — Act" : "Significantly Under"}
          accent={fundingColor(fr) as "green" | "amber" | "blue" | "red"}
        />
        <ModuleMetricCard
          label="Target Retirement Income"
          value={`${formatCurrency(outputs.baseTargetIncome)}/yr`}
          description="Today's dollars"
          accent="slate"
        />
        <ModuleMetricCard
          label="Inflation-Adjusted Target"
          value={`${formatCurrency(outputs.inflationAdjustedTarget)}/yr`}
          description={`At retirement (nominal)`}
          accent="slate"
        />
        <ModuleMetricCard
          label="Guaranteed Annual Income"
          value={`${formatCurrency(outputs.derived.annualGuaranteedIncome)}/yr`}
          description="SS + Pension + Other"
          accent={outputs.derived.annualGuaranteedIncome > 0 ? "green" : "slate"}
        />
      </div>

      {/* Income row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ModuleMetricCard
          label="Net Portfolio Income Need"
          value={`${formatCurrency(outputs.netIncomeNeed)}/yr`}
          description="After guaranteed income"
          accent={outputs.netIncomeNeed > 0 ? "amber" : "green"}
        />
        <ModuleMetricCard
          label="Sustainable Annual Income"
          value={`${formatCurrency(outputs.sustainableAnnualIncome)}/yr`}
          description="On current trajectory"
          accent={outputs.sustainableAnnualIncome >= outputs.inflationAdjustedTarget ? "green" : outputs.sustainableAnnualIncome >= outputs.inflationAdjustedTarget * 0.8 ? "amber" : "red"}
        />
        {outputs.retirementIncomeGap > 0 && (
          <ModuleMetricCard
            label="Annual Income Shortfall"
            value={`${formatCurrency(outputs.retirementIncomeGap)}/yr`}
            description="Annual gap in retirement"
            accent="red"
          />
        )}
      </div>

      {/* Action row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ModuleMetricCard
          label="Additional Monthly Savings"
          value={`${formatCurrency(outputs.additionalMonthlyNeeded)}/mo`}
          description="To close the gap"
          accent={outputs.additionalMonthlyNeeded > 0 ? "red" : "green"}
        />
        <ModuleMetricCard
          label="Total Monthly Savings Needed"
          value={`${formatCurrency(outputs.totalMonthlyRequired)}/mo`}
          accent="slate"
        />
        <ModuleMetricCard
          label="Cost of 1-Year Delay"
          value={`+${formatCurrency(outputs.costOfDelay)}/mo`}
          description="If action delayed 1 year"
          accent="red"
        />
      </div>

      {/* Savings rate row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ModuleMetricCard
          label="Current Savings Rate"
          value={formatPercent(outputs.currentSavingsRate)}
          accent={savingsRateColor(outputs.currentSavingsRate) as "green" | "amber" | "red"}
        />
        <ModuleMetricCard
          label="Required Savings Rate"
          value={formatPercent(outputs.requiredSavingsRate)}
          accent={outputs.requiredSavingsRate > outputs.currentSavingsRate ? "red" : "green"}
        />
        <ModuleMetricCard
          label="Future Value — Current Portfolio"
          value={formatCurrency(outputs.portfolioFV)}
          description="Existing assets compounded"
          accent="slate"
        />
        <ModuleMetricCard
          label="Future Value — Contributions"
          value={formatCurrency(outputs.contributionsFV)}
          description="Ongoing contributions only"
          accent="slate"
        />
      </div>
    </div>
  )
}

// ── Main Module Component ─────────────────────────────────────────────────────

interface WealthAccumulationModuleProps {
  inputs: WealthAccumulationInputs
  onChange: (inputs: WealthAccumulationInputs) => void
}

export function WealthAccumulationModule({ inputs, onChange }: WealthAccumulationModuleProps) {
  const [inputsOpen, setInputsOpen] = useState(true)

  const outputs = useMemo(() => calculateWealthAccumulation(inputs), [inputs])

  return (
    <div
      className={cx(
        "grid w-full min-w-0 items-start gap-5 overflow-visible transition-[grid-template-columns,gap] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:gap-6",
        inputsOpen
          ? "xl:grid-cols-[minmax(20rem,22rem)_minmax(0,1fr)]"
          : "xl:grid-cols-[0rem_minmax(0,1fr)] xl:gap-x-0",
      )}
    >
      {/* Left: Input panel */}
      <div
        className={cx(
          "relative min-w-0 overflow-visible transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        )}
      >
        <div
          className={cx(
            "w-full overflow-hidden transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            inputsOpen ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-3 opacity-0",
          )}
          aria-hidden={!inputsOpen}
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-500">Inputs</span>
            <button
              type="button"
              onClick={() => setInputsOpen(false)}
              className="text-[11px] text-slate-600 hover:text-slate-400"
            >
              Hide
            </button>
          </div>
          <WealthInputForm inputs={inputs} onChange={onChange} />
        </div>
      </div>

      {/* Right: Output area */}
      <div className="min-w-0 space-y-5">
        {!inputsOpen && (
          <button
            type="button"
            onClick={() => setInputsOpen(true)}
            className="mb-1 text-xs text-slate-500 hover:text-slate-300"
          >
            ← Show Inputs
          </button>
        )}

        <MetricCards outputs={outputs} />
        <WealthTimelineChart outputs={outputs} />
        <IncomeWaterfallChart outputs={outputs} />
        <ContributionSensitivityChart outputs={outputs} />
        <ActionItems outputs={outputs} />
        <AssumptionsPanel inputs={inputs} outputs={outputs} />
      </div>
    </div>
  )
}
