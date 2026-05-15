import { useMemo, useState } from "react"
import {
  RiAlertLine,
  RiFundsLine,
  RiLineChartLine,
  RiTimeLine,
} from "@remixicon/react"
import { calculateBreakEven } from "./calculateBreakEven"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import {
  CartesianGrid,
  Legend,
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
          <div className="module-visual-panel space-y-3">
            {/* Hero stat */}
            <Card className="border-blue-700/40 bg-linear-to-br from-blue-950/40 to-[#090E1A]">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      What Month Would You Break-Even?
                    </p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-4xl font-bold tracking-tight text-blue-300">
                        {formatDecimal(result.breakEvenMonths, 1)}
                      </span>
                      <span className="text-lg font-normal text-gray-400">months</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatDecimal(result.breakEvenYears, 1)} years to self insure this income gap.
                    </p>
                  </div>
                  <div className="rounded-md border border-blue-800/50 bg-blue-950/25 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Benefits Received
                    </p>
                    <p className="mt-1 text-xl font-bold text-gray-100">
                      {formatCurrency(result.benefitsReceived)}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatCurrency(result.monthlyBenefit)} for {result.monthsWithoutIncome} months
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Break-Even Curve chart */}
            <Card className="border-gray-800 bg-gray-900/25">
              <CardContent className="p-4">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Self-Insurance Break-Even Curve
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Showing months 1–{chartEndMonth}. Premiums compound until the self-insurance
                      balance reaches the benefit need.
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-1 rounded-lg border border-gray-800 bg-[#090E1A] p-1">
                    {CHART_RANGE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setChartRange(option.value)}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                          chartRange === option.value
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:bg-gray-900 hover:text-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-72 w-full">
                  {/* axis-label wrapper */}
                  <div className="flex h-full items-stretch gap-1">
                    <div className="flex w-3.5 shrink-0 items-center justify-center">
                      <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                        className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Accumulated Value ($)
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex-1">
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
                            <Legend
                              verticalAlign="bottom"
                              height={32}
                              iconType="line"
                              formatter={(value) => (
                                <span className="text-xs text-gray-400">{value}</span>
                              )}
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
                              activeDot={{ r: 4, stroke: "#bfdbfe", strokeWidth: 2, fill: "#2563eb" }}
                            />
                            <Line
                              type="monotone"
                              dataKey="Benefit Need"
                              stroke="#34d399"
                              strokeWidth={2}
                              dot={false}
                              strokeDasharray="6 4"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-1 text-center">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Month</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium vs. Self-Insurance table */}
            <Card className="border-gray-800 bg-gray-900/25">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Premium vs. Self Insurance
                  </p>
                  <p className="text-xs text-gray-500">
                    Investment at month {result.roundedBreakEvenMonths}:{" "}
                    {formatCurrency(result.investmentAtRoundedBreakEven)}
                  </p>
                </div>
                <div className="scrollbar-hide max-h-52 overflow-auto rounded-md border border-gray-800">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-[#090E1A] text-[10px] uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Month</th>
                        <th className="px-3 py-2 text-right font-semibold">Investment</th>
                        <th className="px-3 py-2 text-right font-semibold">Benefit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {visibleRows.map((row) => (
                        <tr
                          key={row.month}
                          className={
                            row.month === result.roundedBreakEvenMonths
                              ? "bg-blue-950/30 text-blue-100"
                              : "text-gray-300"
                          }
                        >
                          <td className="px-3 py-2 font-mono">{row.month}</td>
                          <td className="px-3 py-2 text-right font-mono">
                            {formatCurrency(row.investmentBalance)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {formatCurrency(row.cumulativeBenefits)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT: metric rail ───────────────────────────────────── */}
          <div className="module-metric-rail">
            {/* Summary details card — top */}
            <Card className="module-kpi-card">
              <CardContent className="space-y-0 divide-y divide-slate-800/80 p-3.5 text-xs">
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Monthly Premium</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {formatCurrency(result.monthlyPremium)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Monthly Benefit</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {formatCurrency(result.monthlyBenefit)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Annual Return</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {formatPlainPercent(result.annualRateOfReturn)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Benefits Received</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatCurrency(result.benefitsReceived)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Years to Self-Insure</span>
                  <span className="font-mono font-bold text-blue-300">
                    {formatDecimal(result.breakEvenYears, 2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* KPI stat cards */}
            <Card className="module-kpi-card">
              <CardContent className="p-3.5">
                <div className="mb-2.5 h-0.5 w-12 rounded-full bg-emerald-400" />
                <RiFundsLine className="mb-2 size-4 text-emerald-400" aria-hidden="true" />
                <p className="text-[10px] font-bold uppercase leading-snug tracking-[0.18em] text-slate-400">
                  Monthly Return
                </p>
                <p className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-slate-50">
                  {formatPlainPercent(result.monthlyRateOfReturn)}
                </p>
              </CardContent>
            </Card>

            <Card className="module-kpi-card">
              <CardContent className="p-3.5">
                <div className="mb-2.5 h-0.5 w-12 rounded-full bg-amber-400" />
                <RiTimeLine className="mb-2 size-4 text-amber-400" aria-hidden="true" />
                <p className="text-[10px] font-bold uppercase leading-snug tracking-[0.18em] text-slate-400">
                  Break-Even Month
                </p>
                <p className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-slate-50">
                  {result.roundedBreakEvenMonths}
                </p>
              </CardContent>
            </Card>

            <Card className="module-kpi-card">
              <CardContent className="p-3.5">
                <div className="mb-2.5 h-0.5 w-12 rounded-full bg-cyan-400" />
                <RiLineChartLine className="mb-2 size-4 text-cyan-400" aria-hidden="true" />
                <p className="text-[10px] font-bold uppercase leading-snug tracking-[0.18em] text-slate-400">
                  Premiums Paid
                </p>
                <p className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-slate-50">
                  {formatCurrency(result.totalPremiumsToBreakEven)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
