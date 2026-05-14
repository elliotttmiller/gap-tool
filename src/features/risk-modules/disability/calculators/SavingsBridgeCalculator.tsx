import { useState, useMemo, useCallback } from "react"
import { RiAlertLine, RiErrorWarningLine, RiCheckboxCircleLine, RiInformationLine } from "@remixicon/react"
import { calculateSavingsBridge } from "./calculateSavingsBridge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/Button"
import { formatCurrency } from "@/lib/utils"

const selectClass =
  "flex h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-1 text-sm text-gray-50 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"

const ELIMINATION_PERIOD_OPTIONS = [
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days (most common)" },
  { value: 180, label: "180 days" },
  { value: 365, label: "365 days (1 year)" },
] as const

const QUICK_EXAMPLES = [
  {
    label: "High Earner, 90-day EP",
    monthlyIncome: "12000",
    monthlyExpenses: "8000",
    liquidSavings: "30000",
    eliminationDays: 90,
    monthlyLtd: "7200",
  },
  {
    label: "Mid-career, 180-day EP",
    monthlyIncome: "7500",
    monthlyExpenses: "5500",
    liquidSavings: "15000",
    eliminationDays: 180,
    monthlyLtd: "4500",
  },
  {
    label: "Minimal Savings, 90-day EP",
    monthlyIncome: "6000",
    monthlyExpenses: "5000",
    liquidSavings: "5000",
    eliminationDays: 90,
    monthlyLtd: "3600",
  },
]

function toFloat(s: string): number {
  return parseFloat(s) || 0
}

function validatePositive(s: string, setter: (v: string) => void) {
  const n = parseFloat(s)
  if (s === "" || (!isNaN(n) && n >= 0)) setter(s)
}

interface SavingsBridgeCalculatorProps {
  /** Pre-fill monthly income from the disability module. */
  defaultMonthlyIncome?: number
  /** Pre-fill monthly LTD benefit from the disability module. */
  defaultMonthlyLtdBenefit?: number
}

export function SavingsBridgeCalculator({
  defaultMonthlyIncome,
  defaultMonthlyLtdBenefit,
}: SavingsBridgeCalculatorProps) {
  const [monthlyIncome, setMonthlyIncome] = useState(
    defaultMonthlyIncome ? String(Math.round(defaultMonthlyIncome)) : "10000",
  )
  const [monthlyExpenses, setMonthlyExpenses] = useState("7000")
  const [liquidSavings, setLiquidSavings] = useState("25000")
  const [eliminationDays, setEliminationDays] = useState<number>(90)
  const [monthlyLtd, setMonthlyLtd] = useState(
    defaultMonthlyLtdBenefit ? String(Math.round(defaultMonthlyLtdBenefit)) : "6000",
  )

  const handleChange = useCallback(
    (setter: (v: string) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        validatePositive(e.target.value, setter),
    [],
  )

  const result = useMemo(
    () =>
      calculateSavingsBridge({
        monthlyTakeHomeIncome: toFloat(monthlyIncome),
        monthlyExpenses: toFloat(monthlyExpenses),
        liquidSavings: toFloat(liquidSavings),
        eliminationPeriodDays: eliminationDays,
        monthlyLtdBenefit: toFloat(monthlyLtd),
      }),
    [monthlyIncome, monthlyExpenses, liquidSavings, eliminationDays, monthlyLtd],
  )

  function applyExample(idx: number) {
    const ex = QUICK_EXAMPLES[idx]
    setMonthlyIncome(ex.monthlyIncome)
    setMonthlyExpenses(ex.monthlyExpenses)
    setLiquidSavings(ex.liquidSavings)
    setEliminationDays(ex.eliminationDays)
    setMonthlyLtd(ex.monthlyLtd)
  }

  return (
    <div className="space-y-5">
      {/* ── Inputs ────────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sb-income">Monthly Take-Home Income</Label>
          <Input
            id="sb-income"
            type="number"
            min={0}
            step={100}
            prefix="$"
            value={monthlyIncome}
            onChange={handleChange(setMonthlyIncome)}
            placeholder="10000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sb-expenses">Monthly Living Expenses</Label>
          <Input
            id="sb-expenses"
            type="number"
            min={0}
            step={100}
            prefix="$"
            value={monthlyExpenses}
            onChange={handleChange(setMonthlyExpenses)}
            placeholder="7000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sb-savings">Liquid Savings Available</Label>
          <Input
            id="sb-savings"
            type="number"
            min={0}
            step={1000}
            prefix="$"
            value={liquidSavings}
            onChange={handleChange(setLiquidSavings)}
            placeholder="25000"
          />
          <p className="text-[11px] text-gray-500">Emergency fund + accessible accounts</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sb-ep">Elimination Period</Label>
          <select
            id="sb-ep"
            value={eliminationDays}
            onChange={(e) => setEliminationDays(Number(e.target.value))}
            className={selectClass}
          >
            {ELIMINATION_PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sb-ltd">Monthly LTD Benefit (after EP)</Label>
          <Input
            id="sb-ltd"
            type="number"
            min={0}
            step={100}
            prefix="$"
            value={monthlyLtd}
            onChange={handleChange(setMonthlyLtd)}
            placeholder="6000"
          />
        </div>
      </div>

      {/* ── Quick examples ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Examples:</span>
        {QUICK_EXAMPLES.map((ex, i) => (
          <Button
            key={ex.label}
            variant="secondary"
            className="h-7 px-2.5 text-xs"
            onClick={() => applyExample(i)}
          >
            {ex.label}
          </Button>
        ))}
      </div>

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {result.ok === false ? (
        <Card className="border-red-800/60 bg-red-950/20">
          <CardContent className="p-4 flex items-start gap-3">
            <RiAlertLine className="size-4 text-red-400 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm text-red-300">{result.error}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Primary KPI: savings needed vs available */}
          <Card className="border-blue-700/40 bg-gradient-to-br from-blue-950/40 to-[#090E1A]">
            <CardContent className="p-5 text-center space-y-1">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                Savings Needed to Bridge the {eliminationDays}-Day Wait
              </p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-blue-300 tracking-tight">
                  {formatCurrency(result.totalSavingsNeeded)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {formatCurrency(result.dailyBurnRate)}/day burn rate &nbsp;·&nbsp;{" "}
                {result.eliminationPeriodMonths.toFixed(1)} months of full expenses
              </p>
            </CardContent>
          </Card>

          {/* Coverage status */}
          {result.savingsCoverPeriod ? (
            <Card className="border-green-700/40 bg-green-950/20">
              <CardContent className="p-4 flex items-start gap-3">
                <RiCheckboxCircleLine className="size-5 mt-0.5 shrink-0 text-green-400" aria-hidden="true" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">
                    Savings Cover the Elimination Period
                  </p>
                  <p className="font-bold text-base text-green-300">
                    {formatCurrency(result.savingsRemaining)} remaining after the bridge
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Savings runway: <strong className="text-green-300">{result.savingsRunwayMonths.toFixed(1)} months</strong> at current burn rate.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-red-700/40 bg-red-950/20">
              <CardContent className="p-4 flex items-start gap-3">
                <RiErrorWarningLine className="size-5 mt-0.5 shrink-0 text-red-400" aria-hidden="true" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">
                    Savings Gap — Cannot Bridge the Elimination Period
                  </p>
                  <p className="font-bold text-base text-red-300">
                    {formatCurrency(result.savingsShortfall)} shortfall
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Savings run out after only{" "}
                    <strong className="text-red-300">{result.savingsRunwayMonths.toFixed(1)} months</strong> — before the first LTD check arrives.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Breakdown */}
          <Card className="border-gray-800">
            <CardContent className="p-4 space-y-2 text-sm">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-3">
                Elimination Period Summary
              </p>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="text-gray-400">Income Lost (no pay during EP)</span>
                <span className="font-mono font-bold text-red-400">
                  −{formatCurrency(result.incomeLostDuringElimination)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="text-gray-400">Total Expenses Due</span>
                <span className="font-mono font-semibold text-amber-400">
                  {formatCurrency(result.totalSavingsNeeded)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="text-gray-400">Liquid Savings Available</span>
                <span className="font-mono text-gray-300">
                  {formatCurrency(toFloat(liquidSavings))}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="font-semibold text-gray-200">
                  {result.savingsCoverPeriod ? "Savings Remaining After EP" : "Savings Shortfall"}
                </span>
                <span className={`font-mono font-bold ${result.savingsCoverPeriod ? "text-green-300" : "text-red-300"}`}>
                  {result.savingsCoverPeriod
                    ? formatCurrency(result.savingsRemaining)
                    : `−${formatCurrency(result.savingsShortfall)}`}
                </span>
              </div>

              {/* Post-bridge ongoing gap */}
              {result.ongoingMonthlyGap > 0 && (
                <>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                    <span className="text-gray-400">Ongoing Monthly Gap (after LTD begins)</span>
                    <span className="font-mono font-bold text-amber-400">
                      −{formatCurrency(result.ongoingMonthlyGap)}/mo
                    </span>
                  </div>
                  {result.savingsRemaining > 0 && isFinite(result.postBridgeSavingsRunwayMonths) && (
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-gray-400">Remaining Savings Cover Ongoing Gap For</span>
                      <span className="font-mono text-gray-300">
                        {result.postBridgeSavingsRunwayMonths.toFixed(1)} more months
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-gray-800/60 bg-gray-900/20">
            <CardContent className="p-3 flex items-start gap-2">
              <RiInformationLine className="size-4 text-gray-500 mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-xs text-gray-500">
                Models a complete income stop during the elimination period with expenses continuing at full rate. Actual cash flow will depend on any partial income, spouse income, or other resources. Shorter elimination periods lower risk but increase premiums.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
