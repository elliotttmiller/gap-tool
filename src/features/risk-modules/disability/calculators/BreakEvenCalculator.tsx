import { useCallback, useMemo, useState } from "react"
import {
  RiAlertLine,
  RiBankCardLine,
  RiFundsLine,
  RiLineChartLine,
  RiMoneyDollarCircleLine,
  RiTimeLine,
} from "@remixicon/react"
import { calculateBreakEven } from "./calculateBreakEven"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

function toNumber(value: string): number {
  return Number.parseFloat(value) || 0
}

function toRate(value: string): number {
  return toNumber(value) / 100
}

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

function validateNonNegative(value: string, setter: (v: string) => void) {
  const parsed = Number.parseFloat(value)
  if (value === "" || (Number.isFinite(parsed) && parsed >= 0)) setter(value)
}

function validateWholePositive(value: string, setter: (v: string) => void) {
  const parsed = Number.parseInt(value, 10)
  if (value === "" || (Number.isFinite(parsed) && parsed >= 1)) setter(String(parsed))
}

interface InputFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  prefix?: string
  suffix?: string
  step?: number
  min?: number
}

function InputField({ id, label, value, onChange, prefix, suffix, step = 1, min = 0 }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        step={step}
        prefix={prefix}
        suffix={suffix}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
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

export function BreakEvenCalculator() {
  const [monthlyPremium, setMonthlyPremium] = useState("450")
  const [monthlyBenefit, setMonthlyBenefit] = useState("10000")
  const [annualRateOfReturn, setAnnualRateOfReturn] = useState("6")
  const [monthsWithoutIncome, setMonthsWithoutIncome] = useState("12")

  const handleCurrencyChange = useCallback(
    (setter: (v: string) => void) => (value: string) => validateNonNegative(value, setter),
    [],
  )
  const handleMonthsChange = useCallback(
    (value: string) => validateWholePositive(value, setMonthsWithoutIncome),
    [],
  )

  const result = useMemo(
    () =>
      calculateBreakEven({
        monthlyPremium: toNumber(monthlyPremium),
        monthlyBenefit: toNumber(monthlyBenefit),
        annualRateOfReturn: toRate(annualRateOfReturn),
        monthsWithoutIncome: toNumber(monthsWithoutIncome),
      }),
    [monthlyPremium, monthlyBenefit, annualRateOfReturn, monthsWithoutIncome],
  )

  const visibleRows = result.ok
    ? result.schedule.filter((row) => row.month <= Math.min(result.schedule.length, 12) || row.month % 24 === 0 || row.month === result.roundedBreakEvenMonths)
    : []
  const chartData: BreakEvenChartPoint[] = result.ok
    ? result.schedule
        .filter((row) => row.month <= result.roundedBreakEvenMonths + 24)
        .map((row) => ({
          month: row.month,
          "Self-Insurance Balance": row.investmentBalance,
          "Benefit Need": result.benefitsReceived,
          remainingGap: Math.max(result.benefitsReceived - row.investmentBalance, 0),
        }))
    : []

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-gray-800 bg-gray-900/35">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <RiBankCardLine className="size-4 text-blue-400" aria-hidden="true" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Premium Funding</p>
            </div>
            <InputField
              id="be-monthly-premium"
              label="Monthly Premium"
              prefix="$"
              value={monthlyPremium}
              onChange={handleCurrencyChange(setMonthlyPremium)}
            />
            <InputField
              id="be-rate"
              label="Rate of Return"
              suffix="%"
              step={0.1}
              value={annualRateOfReturn}
              onChange={handleCurrencyChange(setAnnualRateOfReturn)}
            />
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/35">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <RiMoneyDollarCircleLine className="size-4 text-emerald-400" aria-hidden="true" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Disability Benefit</p>
            </div>
            <InputField
              id="be-monthly-benefit"
              label="Monthly Benefit"
              prefix="$"
              value={monthlyBenefit}
              onChange={handleCurrencyChange(setMonthlyBenefit)}
            />
            <InputField
              id="be-months-without-income"
              label="Months without an Income"
              min={1}
              value={monthsWithoutIncome}
              onChange={handleMonthsChange}
            />
          </CardContent>
        </Card>
      </div>

      {result.ok === false ? (
        <Card className="border-red-800/60 bg-red-950/20">
          <CardContent className="flex items-start gap-3 p-4">
            <RiAlertLine className="mt-0.5 size-4 shrink-0 text-red-400" aria-hidden="true" />
            <p className="text-sm text-red-300">{result.error}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="border-blue-700/40 bg-gradient-to-br from-blue-950/40 to-[#090E1A]">
            <CardContent className="p-5">
              <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr] sm:items-center">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">What Month Would You Breakeven?</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight text-blue-300">{formatDecimal(result.breakEvenMonths, 1)}</span>
                    <span className="text-xl font-normal text-gray-400">months</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDecimal(result.breakEvenYears, 1)} years to self insure this income gap.
                  </p>
                </div>
                <div className="rounded-md border border-blue-800/50 bg-blue-950/25 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Benefits Received</p>
                  <p className="mt-1 text-2xl font-bold text-gray-100">{formatCurrency(result.benefitsReceived)}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatCurrency(result.monthlyBenefit)} for {result.monthsWithoutIncome} months
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900/25">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Self-Insurance Break-Even Curve</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Premiums compound until the self-insurance balance reaches the benefit need.
                  </p>
                </div>
                <p className="shrink-0 text-xs font-semibold text-blue-300">
                  Break-even month {result.roundedBreakEvenMonths}
                </p>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 12, right: 18, left: 4, bottom: 4 }}>
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
                      width={62}
                      tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}
                    />
                    <Tooltip content={<BreakEvenTooltip />} cursor={{ stroke: "#475569", strokeDasharray: "4 4" }} />
                    <Legend
                      verticalAlign="bottom"
                      height={32}
                      iconType="line"
                      formatter={(value) => <span className="text-xs text-gray-400">{value}</span>}
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
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border-gray-800 bg-gray-900/30">
              <CardContent className="p-4">
                <RiFundsLine className="mb-2 size-4 text-emerald-400" aria-hidden="true" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Monthly Return</p>
                <p className="mt-1 text-lg font-bold text-gray-100">{formatPlainPercent(result.monthlyRateOfReturn)}</p>
              </CardContent>
            </Card>
            <Card className="border-gray-800 bg-gray-900/30">
              <CardContent className="p-4">
                <RiTimeLine className="mb-2 size-4 text-amber-400" aria-hidden="true" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Rounded Month</p>
                <p className="mt-1 text-lg font-bold text-gray-100">{result.roundedBreakEvenMonths}</p>
              </CardContent>
            </Card>
            <Card className="border-gray-800 bg-gray-900/30">
              <CardContent className="p-4">
                <RiLineChartLine className="mb-2 size-4 text-cyan-400" aria-hidden="true" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Premiums Paid</p>
                <p className="mt-1 text-lg font-bold text-gray-100">{formatCurrency(result.totalPremiumsToBreakEven)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-gray-800">
            <CardContent className="space-y-2 p-4 text-sm">
              <div className="flex items-center justify-between border-b border-gray-800 py-1.5">
                <span className="text-gray-400">Monthly Premium</span>
                <span className="font-mono font-semibold text-gray-200">{formatCurrency(result.monthlyPremium)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-800 py-1.5">
                <span className="text-gray-400">Monthly Benefit</span>
                <span className="font-mono font-semibold text-gray-200">{formatCurrency(result.monthlyBenefit)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-800 py-1.5">
                <span className="text-gray-400">Annual Rate of Return</span>
                <span className="font-mono font-semibold text-gray-200">{formatPlainPercent(result.annualRateOfReturn)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-800 py-1.5">
                <span className="text-gray-400">Benefits Received</span>
                <span className="font-mono font-bold text-emerald-400">{formatCurrency(result.benefitsReceived)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-400">Number of years you need to self insure</span>
                <span className="font-mono font-bold text-blue-300">{formatDecimal(result.breakEvenYears, 2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900/25">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Premium vs. Self Insurance</p>
                <p className="text-xs text-gray-500">Investment at month {result.roundedBreakEvenMonths}: {formatCurrency(result.investmentAtRoundedBreakEven)}</p>
              </div>
              <div className="max-h-64 overflow-auto rounded-md border border-gray-800">
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
                      <tr key={row.month} className={row.month === result.roundedBreakEvenMonths ? "bg-blue-950/30 text-blue-100" : "text-gray-300"}>
                        <td className="px-3 py-2 font-mono">{row.month}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.investmentBalance)}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.cumulativeBenefits)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
