import { useMemo, useState } from "react"
import { RiAlertLine } from "@remixicon/react"
import { calculateBreakEven } from "./calculateBreakEven"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

function formatDecimal(value: number, digits = 1): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}

function formatPlainPercent(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value)
}

interface BreakEvenTooltipProps {
  active?: boolean
  payload?: Array<{ payload: BreakEvenChartPoint }>
  label?: number
}

interface BreakEvenChartPoint {
  month: number
  "Self-Insurance Balance": number
  "Benefit Need": number
  remainingGap: number
}

type ChartRange = "breakeven" | "plus12" | "plus24" | "10y" | "20y" | "full"

const CHART_RANGE_OPTIONS: { value: ChartRange; label: string }[] = [
  { value: "breakeven", label: "To Break-Even" },
  { value: "plus12", label: "+1 Year" },
  { value: "plus24", label: "+2 Years" },
  { value: "10y", label: "10 Years" },
  { value: "20y", label: "20 Years" },
  { value: "full", label: "Full" },
]

function getChartEndMonth(range: ChartRange, result: Extract<ReturnType<typeof calculateBreakEven>, { ok: true }>): number {
  switch (range) {
    case "breakeven":
      return result.roundedBreakEvenMonths
    case "plus12":
      return result.roundedBreakEvenMonths + 12
    case "plus24":
      return result.roundedBreakEvenMonths + 24
    case "10y":
      return 120
    case "20y":
      return 240
    case "full":
      return result.schedule.length
  }
}

function BreakEvenTooltip({ active, payload, label }: BreakEvenTooltipProps) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload

  return (
    <div className="min-w-56 rounded-lg border border-gray-700 bg-gray-950 p-3 text-xs shadow-xl">
      <p className="mb-2 font-semibold text-gray-100">Month {label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-blue-300">Self-Insurance Balance</span>
          <span className="font-mono text-gray-100">{formatCurrency(point["Self-Insurance Balance"])}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-emerald-300">Benefit Need</span>
          <span className="font-mono text-gray-100">{formatCurrency(point["Benefit Need"])}</span>
        </div>
        <div className="flex justify-between gap-4 border-t border-gray-800 pt-1">
          <span className="text-gray-400">Remaining Gap</span>
          <span className={point.remainingGap > 0 ? "font-mono text-amber-300" : "font-mono text-green-300"}>
            {formatCurrency(point.remainingGap)}
          </span>
        </div>
      </div>
    </div>
  )
}

export interface BreakEvenCalculatorProps {
  monthlyPremium: number
  monthlyBenefit: number
  annualRateOfReturn: number
  monthsWithoutIncome: number
}

export function BreakEvenCalculator({
  monthlyPremium,
  monthlyBenefit,
  annualRateOfReturn,
  monthsWithoutIncome,
}: BreakEvenCalculatorProps) {
  const [chartRange, setChartRange] = useState<ChartRange>("plus24")

  const result = useMemo(
    () =>
      calculateBreakEven({
        monthlyPremium,
        monthlyBenefit,
        annualRateOfReturn,
        monthsWithoutIncome,
      }),
    [monthlyPremium, monthlyBenefit, annualRateOfReturn, monthsWithoutIncome],
  )

  const visibleRows = result.ok
    ? result.schedule.filter(
        (row) =>
          row.month <= Math.min(result.schedule.length, 12) ||
          row.month % 24 === 0 ||
          row.month === result.roundedBreakEvenMonths,
      )
    : []
  const chartEndMonth = result.ok
    ? Math.min(getChartEndMonth(chartRange, result), result.schedule.length)
    : 0
  const chartData: BreakEvenChartPoint[] = result.ok
    ? result.schedule
        .filter((row) => row.month <= chartEndMonth)
        .map((row) => ({
          month: row.month,
          "Self-Insurance Balance": row.investmentBalance,
          "Benefit Need": result.benefitsReceived,
          remainingGap: Math.max(result.benefitsReceived - row.investmentBalance, 0),
        }))
    : []

  return (
    <div className="module-output-container">
      {result.ok === false ? (
        <Card className="border-red-800/60 bg-red-950/20">
          <CardContent className="flex items-start gap-3 p-4">
            <RiAlertLine className="mt-0.5 size-4 shrink-0 text-red-400" aria-hidden="true" />
            <p className="text-sm text-red-300">{result.error}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="module-visual-dashboard">
          {/* ── LEFT: chart panel ────────────────────────────────────── */}
          <div className="module-visual-panel self-start space-y-3">
            {/* Break-Even Curve chart */}
            <Card className="border-gray-800 bg-gray-900/25">
              <CardContent className="p-4">
                {/* ── Header: title centered, dropdown right ──────────── */}
                <div className="relative mb-3 flex items-start justify-center">
                  <div className="text-center">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Self-Insurance Break-Even Curve
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Showing months 1–{chartEndMonth}
                    </p>
                  </div>
                  <div className="absolute right-0 top-0 shrink-0">
                    <div className="relative">
                      <select
                        value={chartRange}
                        onChange={(e) => setChartRange(e.target.value as ChartRange)}
                        className="appearance-none cursor-pointer rounded-md border border-gray-700/70 bg-gray-900/80 py-1 pl-2.5 pr-7 text-[11px] font-semibold text-gray-300 outline-none transition-colors hover:border-gray-600 hover:text-gray-100 focus:border-blue-600/70 focus:ring-0"
                      >
                        {CHART_RANGE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                        <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* ── Chart area ───────────────────────────────────────── */}
                <div className="flex gap-1">
                    <div className="flex w-3.5 shrink-0 items-center justify-center">
                      <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                        className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Accumulated Value ($)
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="chart-reveal h-64">
                        <ResponsiveContainer width="100%" height="100%" debounce={100}>
                          <LineChart data={chartData} margin={{ top: 12, right: 18, left: 0, bottom: 4 }}>
                            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
                            <XAxis
                              dataKey="month"
                              tick={{ fill: "#64748b", fontSize: 11 }}
                              tickLine={false}
                              axisLine={false}
                              interval="preserveStartEnd"
                            />
                            <YAxis
                              tick={{ fill: "#64748b", fontSize: 11 }}
                              tickLine={false}
                              axisLine={false}
                              width={56}
                              tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}
                            />
                            <Tooltip
                              content={<BreakEvenTooltip />}
                              cursor={{ stroke: "#475569", strokeDasharray: "4 4" }}
                            />
                            <ReferenceLine
                              x={result.roundedBreakEvenMonths}
                              stroke="#f59e0b"
                              strokeDasharray="4 4"
                              label={{
                                value: "Break-even",
                                fill: "#fbbf24",
                                fontSize: 11,
                                position: "insideTopRight",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="Self-Insurance Balance"
                              stroke="#60a5fa"
                              strokeWidth={3}
                              dot={false}
                              isAnimationActive={false}
                              activeDot={{ r: 4, stroke: "#bfdbfe", strokeWidth: 2, fill: "#2563eb" }}
                            />
                            <Line
                              type="monotone"
                              dataKey="Benefit Need"
                              stroke="#34d399"
                              strokeWidth={2}
                              dot={false}
                              isAnimationActive={false}
                              strokeDasharray="6 4"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-1 text-center">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Month</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
                          <svg width="16" height="3"><line x1="0" y1="1.5" x2="16" y2="1.5" stroke="#60a5fa" strokeWidth="2.5" /></svg>
                          Self-Insurance Balance
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
                          <svg width="16" height="3"><line x1="0" y1="1.5" x2="16" y2="1.5" stroke="#34d399" strokeWidth="2" strokeDasharray="4 3" /></svg>
                          Benefit Need
                        </span>
                      </div>
                    </div>
                  </div>

                {/* ── Input context bar: 3 inputs ──────────────────────── */}
                <div className="mt-4 flex overflow-hidden rounded-lg border border-slate-800/60 bg-slate-950/40">
                  <div className="flex flex-1 flex-col items-center gap-0.5 px-3 py-2.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Monthly Premium</span>
                    <span className="text-sm font-bold text-slate-200">{formatCurrency(result.monthlyPremium)}</span>
                  </div>
                  <div className="w-px self-stretch bg-slate-800/60" />
                  <div className="flex flex-1 flex-col items-center gap-0.5 px-3 py-2.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Monthly Benefit</span>
                    <span className="text-sm font-bold text-blue-300">{formatCurrency(result.monthlyBenefit)}</span>
                  </div>
                  <div className="w-px self-stretch bg-slate-800/60" />
                  <div className="flex flex-1 flex-col items-center gap-0.5 px-3 py-2.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Annual Return</span>
                    <span className="text-sm font-bold text-emerald-300">{formatPlainPercent(result.annualRateOfReturn)}</span>
                  </div>
                </div>

                {/* ── 4 metric stat cells ──────────────────────────────── */}
                <div className="mt-2 flex overflow-hidden rounded-lg border border-slate-800/60 bg-slate-950/40">
                  <div className="flex flex-1 flex-col items-center gap-0.5 px-3 py-2.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Benefits Received</span>
                    <span className="text-sm font-bold text-emerald-400">{formatCurrency(result.benefitsReceived)}</span>
                    <span className="text-[10px] text-slate-600">{formatCurrency(result.monthlyBenefit)}/mo × {result.monthsWithoutIncome}mo</span>
                  </div>
                  <div className="w-px self-stretch bg-slate-800/60" />
                  <div className="flex flex-1 flex-col items-center gap-0.5 px-3 py-2.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Break-Even Month</span>
                    <span className="text-sm font-bold text-amber-300">{result.roundedBreakEvenMonths}</span>
                    <span className="text-[10px] text-slate-600">{formatDecimal(result.breakEvenYears, 1)} years</span>
                  </div>
                  <div className="w-px self-stretch bg-slate-800/60" />
                  <div className="flex flex-1 flex-col items-center gap-0.5 px-3 py-2.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Monthly Return</span>
                    <span className="text-sm font-bold text-emerald-400">{formatPlainPercent(result.monthlyRateOfReturn)}</span>
                    <span className="text-[10px] text-slate-600">Compounded monthly</span>
                  </div>
                  <div className="w-px self-stretch bg-slate-800/60" />
                  <div className="flex flex-1 flex-col items-center gap-0.5 px-3 py-2.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Premiums Paid</span>
                    <span className="text-sm font-bold text-slate-200">{formatCurrency(result.totalPremiumsToBreakEven)}</span>
                    <span className="text-[10px] text-slate-600">Total to break-even</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT: Premium vs. Self Insurance table ───────────────── */}
          <div className="self-start">
            <Card className="border-gray-800 bg-gray-900/25">
              <CardContent className="p-0">
                {/* ── Table header ─────────────────────────────────────── */}
                <div className="px-4 pt-4 pb-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Premium vs. Self Insurance
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 ring-1 ring-amber-500/20">
                      <span className="h-1 w-1 rounded-full bg-amber-400" />
                      Break-even mo. {result.roundedBreakEvenMonths}
                    </span>
                    <span className="text-[10px] text-gray-600">→</span>
                    <span className="text-[10px] font-semibold text-gray-400">{formatCurrency(result.investmentAtRoundedBreakEven)}</span>
                  </div>
                </div>

                {/* ── Column headers ───────────────────────────────────── */}
                <div className="grid grid-cols-[2.5rem_1fr_1fr] border-y border-gray-800/80 bg-gray-950/60 px-3 py-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-600">Mo.</span>
                  <span className="text-right text-[9px] font-bold uppercase tracking-[0.15em] text-gray-600">Investment</span>
                  <span className="text-right text-[9px] font-bold uppercase tracking-[0.15em] text-gray-600">Benefit</span>
                </div>

                {/* ── Rows ─────────────────────────────────────────────── */}
                <div className="scrollbar-hide max-h-96 overflow-auto">
                  {visibleRows.map((row, i) => {
                    const isBreakEven = row.month === result.roundedBreakEvenMonths
                    const pct = Math.min(row.investmentBalance / result.benefitsReceived, 1)
                    return (
                      <div
                        key={row.month}
                        className={`relative grid grid-cols-[2.5rem_1fr_1fr] items-center px-3 py-2 transition-colors ${
                          isBreakEven
                            ? "bg-amber-500/8 ring-1 ring-inset ring-amber-500/20"
                            : i % 2 === 0
                              ? "bg-transparent"
                              : "bg-gray-900/20"
                        }`}
                      >
                        {/* progress fill */}
                        <div
                          className="pointer-events-none absolute inset-y-0 left-0 bg-blue-500/5"
                          style={{ width: `${pct * 100}%` }}
                        />
                        <span className={`relative z-10 text-[11px] font-mono font-semibold ${isBreakEven ? "text-amber-300" : "text-gray-500"}`}>
                          {row.month}
                        </span>
                        <span className={`relative z-10 text-right text-[11px] font-mono ${isBreakEven ? "text-amber-200 font-semibold" : "text-blue-300/90"}`}>
                          {formatCurrency(row.investmentBalance)}
                        </span>
                        <span className={`relative z-10 text-right text-[11px] font-mono ${isBreakEven ? "text-amber-200 font-semibold" : "text-gray-400"}`}>
                          {formatCurrency(row.cumulativeBenefits)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
