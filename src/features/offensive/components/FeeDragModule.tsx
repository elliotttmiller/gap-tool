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
} from "recharts"
import type { FeeDragInputs } from "@/lib/store-types"
import { calculateFeeDrag, type FeeDragOutputs } from "../calculations/feeDragCalc"
import { ModuleMetricCard } from "@/features/risk-modules/core/ModuleMetricCard"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { cx } from "@/lib/utils"

// ── Input helpers ─────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  children: React.ReactNode
}
function Field({ label, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</label>
      {children}
    </div>
  )
}

const inputClass =
  "h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 text-sm text-gray-50 placeholder-gray-600 focus:border-cyan-500 focus:outline-none"

function CurrencyInput({ value, onChange, placeholder }: { value: number; onChange: (v: number) => void; placeholder?: string }) {
  return (
    <input
      type="number"
      min={0}
      step={1}
      className={inputClass}
      placeholder={placeholder ?? "0"}
      value={value === 0 ? "" : value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    />
  )
}

function PercentInput({ value, onChange, min = 0, max = 300, step = 0.01 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      className={inputClass}
      value={+(value * 100).toFixed(4) || ""}
      onChange={(e) => onChange((parseFloat(e.target.value) || 0) / 100)}
    />
  )
}

function IntInput({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      step={1}
      className={inputClass}
      value={value || ""}
      onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
    />
  )
}

function TextInputField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      className={inputClass}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">{children}</p>
  )
}

// ── Input Form ────────────────────────────────────────────────────────────────

interface FeeDragInputFormProps {
  inputs: FeeDragInputs
  onChange: (inputs: FeeDragInputs) => void
}

function FeeDragInputForm({ inputs, onChange }: FeeDragInputFormProps) {
  function set<K extends keyof FeeDragInputs>(k: K, v: FeeDragInputs[K]) {
    onChange({ ...inputs, [k]: v })
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <SectionTitle>Portfolio Basis</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Portfolio Value ($)">
          <CurrencyInput value={inputs.currentPortfolioValue} onChange={(v) => set("currentPortfolioValue", v)} />
        </Field>
        <Field label="Monthly Contribution ($)">
          <CurrencyInput value={inputs.monthlyContribution} onChange={(v) => set("monthlyContribution", v)} />
        </Field>
        <Field label="Years to Retirement">
          <IntInput value={inputs.yearsToRetirement} onChange={(v) => set("yearsToRetirement", Math.max(1, v))} min={1} max={60} />
        </Field>
        <Field label="Gross Market Return (%)">
          <PercentInput value={inputs.grossMarketReturn} onChange={(v) => set("grossMarketReturn", v)} min={0} max={15} />
        </Field>
      </div>

      <SectionTitle>Current Cost Structure</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Portfolio Label">
          <TextInputField value={inputs.currentPortfolioLabel} onChange={(v) => set("currentPortfolioLabel", v)} />
        </Field>
        <Field label="Expense Ratio (%)">
          <PercentInput value={inputs.currentExpenseRatio} onChange={(v) => set("currentExpenseRatio", v)} min={0} max={3} />
        </Field>
        <Field label="Advisor Fee (%)">
          <PercentInput value={inputs.currentAdvisorFee} onChange={(v) => set("currentAdvisorFee", v)} min={0} max={3} />
        </Field>
        <Field label="Annual Turnover Rate (%)">
          <PercentInput value={inputs.currentTurnoverRate} onChange={(v) => set("currentTurnoverRate", v)} min={0} max={200} />
        </Field>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="fda-trading-toggle"
          checked={inputs.includeTradingCosts}
          onChange={(e) => set("includeTradingCosts", e.target.checked)}
          className="size-4 rounded border-gray-700 bg-gray-900 accent-cyan-500"
        />
        <label htmlFor="fda-trading-toggle" className="text-xs text-slate-400">Include trading cost drag estimate</label>
      </div>

      <SectionTitle>Proposed Cost Structure</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Portfolio Label">
          <TextInputField value={inputs.proposedPortfolioLabel} onChange={(v) => set("proposedPortfolioLabel", v)} />
        </Field>
        <Field label="Expense Ratio (%)">
          <PercentInput value={inputs.proposedExpenseRatio} onChange={(v) => set("proposedExpenseRatio", v)} min={0} max={3} />
        </Field>
        <Field label="Advisor Fee (%)">
          <PercentInput value={inputs.proposedAdvisorFee} onChange={(v) => set("proposedAdvisorFee", v)} min={0} max={3} />
        </Field>
        <Field label="Annual Turnover Rate (%)">
          <PercentInput value={inputs.proposedTurnoverRate} onChange={(v) => set("proposedTurnoverRate", v)} min={0} max={200} />
        </Field>
        <Field label="Switching Cost / Tax ($)">
          <CurrencyInput value={inputs.switchingCostEstimate} onChange={(v) => set("switchingCostEstimate", v)} />
        </Field>
        <Field label="Safe Withdrawal Rate (%)">
          <PercentInput value={inputs.safeWithdrawalRate} onChange={(v) => set("safeWithdrawalRate", Math.max(0.01, v))} min={1} max={8} />
        </Field>
      </div>

      <SectionTitle>Integration</SectionTitle>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="fda-apply-toggle"
          checked={inputs.applyFeeOptimizationToWealthGap}
          onChange={(e) => set("applyFeeOptimizationToWealthGap", e.target.checked)}
          className="size-4 rounded border-gray-700 bg-gray-900 accent-cyan-500"
        />
        <label htmlFor="fda-apply-toggle" className="text-xs text-slate-400">Apply fee optimization to Wealth Gap module (Module 1)</label>
      </div>
    </div>
  )
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

const TOOLTIP_CLASS = "bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm shadow-lg min-w-44"

// ── Chart 2A — Portfolio Growth Comparison ────────────────────────────────────

function PortfolioGrowthChart({ outputs, inputs }: { outputs: FeeDragOutputs; inputs: FeeDragInputs }) {
  const data = outputs.yearlyData

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">Portfolio Growth Comparison</h3>
      <p className="mb-3 text-[11px] text-slate-600">
        {inputs.currentPortfolioLabel} vs. {inputs.proposedPortfolioLabel}
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="fda-proposed-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="fda-current-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6b7280" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6b7280" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="age" tick={{ fill: "#64748b", fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`} tick={{ fill: "#64748b", fontSize: 11 }} width={60} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className={TOOLTIP_CLASS}>
                  <p className="mb-2 font-semibold text-gray-100">Age {label}</p>
                  {payload.map((p) => (
                    <div key={p.name} className="flex justify-between gap-4">
                      <span className="text-xs" style={{ color: p.color }}>{p.name}</span>
                      <span className="text-xs font-semibold text-gray-100">{formatCurrency(p.value as number)}</span>
                    </div>
                  ))}
                </div>
              )
            }}
          />
          <Area type="monotone" dataKey="proposedBalance" name={inputs.proposedPortfolioLabel} stroke="#10b981" fill="url(#fda-proposed-fill)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="currentBalance" name={inputs.currentPortfolioLabel} stroke="#6b7280" fill="url(#fda-current-fill)" strokeWidth={2} dot={false} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Chart 2B — Cumulative Investment Cost Impact ──────────────────────────────

function CumulativeFeeDragChart({ outputs, inputs }: { outputs: FeeDragOutputs; inputs: FeeDragInputs }) {
  const data = outputs.yearlyData
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">Cumulative Investment Cost Impact Over Time</h3>
      <p className="mb-3 text-[11px] text-slate-600">Compounding wealth destroyed by current cost structure</p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="fda-drag-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="age" tick={{ fill: "#64748b", fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `$${(v / 1_000).toFixed(0)}K`} tick={{ fill: "#64748b", fontSize: 11 }} width={65} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className={TOOLTIP_CLASS}>
                  <p className="mb-1 font-semibold text-gray-100">Age {label}</p>
                  <div className="flex justify-between gap-4">
                    <span className="text-xs text-rose-400">Investment Cost Impact</span>
                    <span className="text-xs font-semibold text-gray-100">{formatCurrency(payload[0]?.value as number)}</span>
                  </div>
                </div>
              )
            }}
          />
          {inputs.switchingCostEstimate > 0 && (
            <ReferenceLine
              y={inputs.switchingCostEstimate}
              stroke="#f59e0b"
              strokeDasharray="4 2"
              label={{ value: "Transition Cost", fill: "#f59e0b", fontSize: 10 }}
            />
          )}
          <Area type="monotone" dataKey="cumulativeFeeDrag" name="Cumulative Investment Cost Impact" stroke="#ef4444" fill="url(#fda-drag-fill)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Chart 2C — Cost Breakdown Comparison ─────────────────────────────────────

function CostBreakdownChart({ outputs, inputs }: { outputs: FeeDragOutputs; inputs: FeeDragInputs }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">Annual Cost Breakdown (Year 1)</h3>
      <p className="mb-3 text-[11px] text-slate-600">Dollar cost by category — {inputs.currentPortfolioLabel} vs. {inputs.proposedPortfolioLabel}</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={outputs.costBreakdown} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="category" tick={{ fill: "#64748b", fontSize: 10 }} />
          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(1)}K`} tick={{ fill: "#64748b", fontSize: 11 }} width={55} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className={TOOLTIP_CLASS}>
                  <p className="mb-2 font-semibold text-gray-100">{label}</p>
                  {payload.map((p) => (
                    <div key={p.name} className="flex justify-between gap-4">
                      <span className="text-xs" style={{ color: p.color }}>{p.name}</span>
                      <span className="text-xs font-semibold text-gray-100">{formatCurrency(p.value as number)}</span>
                    </div>
                  ))}
                </div>
              )
            }}
          />
          <Bar dataKey="current" name={inputs.currentPortfolioLabel} fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="proposed" name={inputs.proposedPortfolioLabel} fill="#10b981" radius={[4, 4, 0, 0]} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Assumptions Panel ─────────────────────────────────────────────────────────

function AssumptionsPanel({ inputs, outputs }: { inputs: FeeDragInputs; outputs: FeeDragOutputs }) {
  const items = [
    { label: "Gross Market Return", value: formatPercent(inputs.grossMarketReturn), source: "User" },
    { label: "Trading Cost Drag Enabled", value: inputs.includeTradingCosts ? "Yes" : "No", source: "User" },
    { label: "Trading Cost per 100% Turnover", value: "0.30%", source: "Fixed (industry)" },
    { label: "Current Turnover Rate", value: formatPercent(inputs.currentTurnoverRate), source: "User" },
    { label: "Proposed Turnover Rate", value: formatPercent(inputs.proposedTurnoverRate), source: "User" },
    { label: "Safe Withdrawal Rate", value: formatPercent(inputs.safeWithdrawalRate), source: "User" },
    { label: "Switching Cost Included", value: inputs.switchingCostEstimate > 0 ? `Yes (${formatCurrency(inputs.switchingCostEstimate)})` : "No", source: "User" },
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
        Trading cost drag is estimated at 0.30% per 100% annual turnover rate, reflecting bid-ask spreads, market impact costs, and short-term capital gains friction for taxable accounts. This is a simplified estimate; actual costs vary by asset class, fund size, and tax situation. Expense ratios and returns are hypothetical and for planning purposes only.
      </p>
    </div>
  )
}

// ── Action Items ──────────────────────────────────────────────────────────────

interface ActionItemsProps {
  outputs: FeeDragOutputs
  inputs: FeeDragInputs
  wealthAccumulationGap?: number
}

function ActionItems({ outputs, inputs, wealthAccumulationGap }: ActionItemsProps) {
  const items: { id: string; title: string; body: string }[] = []

  items.push({
    id: "a1",
    title: "Core Investment Cost Impact Finding",
    body: `The current portfolio's all-in cost of ${formatPercent(outputs.currentEffectiveCost)} vs. the proposed ${formatPercent(outputs.proposedEffectiveCost)} will cost ${formatCurrency(outputs.feeDragCost)} in accumulated wealth by retirement — equivalent to ${formatCurrency(outputs.retirementIncomeLost)}/year in retirement income.`,
  })

  if (outputs.annualFeeSavings > 0) {
    items.push({
      id: "a2",
      title: "Immediate First-Year Savings",
      body: `Optimizing the cost structure saves ${formatCurrency(outputs.annualFeeSavings)} in the first year alone — money that stays in the portfolio and compounds forward.`,
    })
  }

  if (inputs.switchingCostEstimate > 0 && outputs.breakEvenYear !== null && outputs.breakEvenAge !== null) {
    items.push({
      id: "a3",
      title: "Break-Even on Transition Costs",
      body: `Even accounting for an estimated ${formatCurrency(inputs.switchingCostEstimate)} transition cost, the fee savings break even by year ${outputs.breakEvenYear} (age ${outputs.breakEvenAge}). Every year after that is a net gain.`,
    })
  }

  if (wealthAccumulationGap != null && wealthAccumulationGap > 0 && outputs.feeDragCost > 0) {
    const pct = Math.min(100, (outputs.feeDragCost / wealthAccumulationGap) * 100).toFixed(1)
    const remaining = Math.max(0, wealthAccumulationGap - outputs.feeDragCost)
    items.push({
      id: "a4",
      title: "Bridge to Retirement Readiness Gap",
      body: `The ${formatCurrency(outputs.feeDragCost)} recovered through fee optimization closes ${pct}% of the ${formatCurrency(wealthAccumulationGap)} retirement readiness gap — without the client saving a single additional dollar. The remaining ${formatCurrency(remaining)} gap still requires increased contributions.`,
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

// ── Status color ──────────────────────────────────────────────────────────────

function costRateColor(rate: number): "red" | "amber" | "green" {
  if (rate > 0.0075) return "red"
  if (rate >= 0.0035) return "amber"
  return "green"
}

// ── Metric Cards ──────────────────────────────────────────────────────────────

function MetricCards({ outputs, inputs }: { outputs: FeeDragOutputs; inputs: FeeDragInputs }) {
  return (
    <div className="space-y-3">
      {/* Warnings */}
      {outputs.costsNotLowerWarning && (
        <div className="rounded-lg border border-amber-800/60 bg-amber-950/20 px-4 py-3 text-xs text-amber-300">
          ⚠ Proposed cost structure is not lower than current. Review inputs.
        </div>
      )}
      {outputs.currentNegativeReturnWarning && (
        <div className="rounded-lg border border-red-800/60 bg-red-950/20 px-4 py-3 text-xs text-red-300">
          ⚠ Current costs exceed expected return — portfolio is projected to shrink in real terms.
        </div>
      )}
      {outputs.noProposedAdvisorFeeWarning && (
        <div className="rounded-lg border border-slate-700 bg-slate-900/40 px-4 py-3 text-xs text-slate-400">
          ℹ No advisor fee entered for proposed portfolio. Confirm this is a self-directed account.
        </div>
      )}
      {outputs.alreadyLowCostNotice && (
        <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/20 px-4 py-3 text-xs text-emerald-300">
          ✓ Current portfolio is already cost-optimized. Fee drag will be minimal.
        </div>
      )}
      {outputs.shortHorizonWarning && (
        <div className="rounded-lg border border-amber-800/60 bg-amber-950/20 px-4 py-3 text-xs text-amber-300">
          ⚠ Short planning horizon — investment cost impact will be small.
        </div>
      )}
      {outputs.switchingCostExceedsDragWarning && (
        <div className="rounded-lg border border-red-800/60 bg-red-950/20 px-4 py-3 text-xs text-red-300">
          ⚠ Transition costs may not be recovered before retirement. Review whether position liquidation is advisable.
        </div>
      )}

      {/* Headline row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ModuleMetricCard
          label="Total Investment Cost Impact"
          value={formatCurrency(outputs.feeDragCost)}
          description={`Lifetime wealth destroyed by current costs`}
          accent="red"
        />
        <ModuleMetricCard
          label="Projected Wealth — Current"
          value={formatCurrency(outputs.currentPortfolioFV)}
          description={`At ${formatPercent(outputs.currentNetReturn)} net return`}
          accent="slate"
        />
        <ModuleMetricCard
          label="Projected Wealth — Optimized"
          value={formatCurrency(outputs.proposedPortfolioFV)}
          description={`At ${formatPercent(outputs.proposedNetReturn)} net return`}
          accent="green"
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ModuleMetricCard
          label="Investment Cost as % of Wealth"
          value={formatPercent(outputs.feeDragPercentage)}
          description="Of max achievable wealth"
          accent="red"
        />
        <ModuleMetricCard
          label="Annual Income Lost to Fees"
          value={`${formatCurrency(outputs.retirementIncomeLost)}/yr`}
          description="Retirement income equivalent"
          accent={outputs.retirementIncomeLost > 0 ? "red" : "slate"}
        />
        <ModuleMetricCard
          label="Net Return Improvement"
          value={`+${formatPercent(outputs.returnDelta)}/yr`}
          description="From optimization"
          accent="green"
        />
        {outputs.breakEvenYear !== null && inputs.switchingCostEstimate > 0 && (
          <ModuleMetricCard
            label="Break-Even Year"
            value={`Year ${outputs.breakEvenYear} (Age ${outputs.breakEvenAge})`}
            description="Fee savings exceed transition cost"
            accent={outputs.breakEvenYear <= 3 ? "green" : "amber"}
          />
        )}
      </div>

      {/* Cost rate row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ModuleMetricCard
          label="Current All-In Cost"
          value={formatPercent(outputs.currentEffectiveCost)}
          description="Expense + fee + trading"
          accent={costRateColor(outputs.currentEffectiveCost)}
        />
        <ModuleMetricCard
          label="Proposed All-In Cost"
          value={formatPercent(outputs.proposedEffectiveCost)}
          description="Including advisor fee"
          accent={outputs.proposedEffectiveCost < 0.0075 ? "green" : "amber"}
        />
        <ModuleMetricCard
          label="Current Net Return"
          value={formatPercent(outputs.currentNetReturn)}
          accent="slate"
        />
        <ModuleMetricCard
          label="Proposed Net Return"
          value={formatPercent(outputs.proposedNetReturn)}
          accent="slate"
        />
      </div>

      {/* Year 1 savings row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ModuleMetricCard
          label="Year 1 Annual Savings"
          value={`${formatCurrency(outputs.annualFeeSavings)}/yr`}
          accent={outputs.annualFeeSavings > 0 ? "green" : "slate"}
        />
        <ModuleMetricCard
          label="Current Annual Cost (Year 1)"
          value={`${formatCurrency(outputs.currentAnnualFeeCost)}/yr`}
          accent="red"
        />
        <ModuleMetricCard
          label="Proposed Annual Cost (Year 1)"
          value={`${formatCurrency(outputs.proposedAnnualFeeCost)}/yr`}
          accent="green"
        />
      </div>

      {/* Expense ratios row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        <ModuleMetricCard
          label="Current Expense Ratio"
          value={formatPercent(inputs.currentExpenseRatio)}
          accent={costRateColor(inputs.currentExpenseRatio)}
        />
        <ModuleMetricCard
          label="Proposed Expense Ratio"
          value={formatPercent(inputs.proposedExpenseRatio)}
          accent="green"
        />
      </div>
    </div>
  )
}

// ── Main Module Component ─────────────────────────────────────────────────────

interface FeeDragModuleProps {
  inputs: FeeDragInputs
  onChange: (inputs: FeeDragInputs) => void
  wealthAccumulationGap?: number
}

export function FeeDragModule({ inputs, onChange, wealthAccumulationGap }: FeeDragModuleProps) {
  const [inputsOpen, setInputsOpen] = useState(true)
  const inputsWithAge = inputs as FeeDragInputs & { currentAge?: number }
  const outputs = useMemo(() => calculateFeeDrag(inputsWithAge), [inputsWithAge])

  return (
    <div
      className={cx(
        "grid w-full min-w-0 items-start gap-5",
        inputsOpen
          ? "xl:grid-cols-[minmax(20rem,22rem)_minmax(0,1fr)]"
          : "xl:grid-cols-[0rem_minmax(0,1fr)] xl:gap-x-0",
      )}
    >
      {/* Left: Input panel */}
      <div
        className={cx(
          "transition-[opacity] duration-300",
          inputsOpen ? "opacity-100" : "pointer-events-none opacity-0 xl:hidden",
        )}
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
        <FeeDragInputForm inputs={inputs} onChange={onChange} />
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

        <MetricCards outputs={outputs} inputs={inputs} />
        <PortfolioGrowthChart outputs={outputs} inputs={inputs} />
        <CumulativeFeeDragChart outputs={outputs} inputs={inputs} />
        <CostBreakdownChart outputs={outputs} inputs={inputs} />
        <ActionItems outputs={outputs} inputs={inputs} wealthAccumulationGap={wealthAccumulationGap} />
        <AssumptionsPanel inputs={inputs} outputs={outputs} />
      </div>
    </div>
  )
}
