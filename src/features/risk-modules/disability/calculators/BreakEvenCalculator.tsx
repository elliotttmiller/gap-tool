import { useState, useMemo, useCallback } from "react"
import { RiAlertLine, RiCheckboxCircleLine, RiInformationLine } from "@remixicon/react"
import { calculateBreakEven, type PremiumFrequency } from "./calculateBreakEven"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/Button"
import { formatCurrency } from "@/lib/utils"

const QUICK_EXAMPLES = [
  { label: "Auto", frequency: "monthly" as PremiumFrequency, planAPremium: 150, planADeductible: 500, planBPremium: 100, planBDeductible: 1000 },
  { label: "Health (PPO vs HDHP)", frequency: "monthly" as PremiumFrequency, planAPremium: 600, planADeductible: 1500, planBPremium: 350, planBDeductible: 6000 },
  { label: "Homeowners", frequency: "yearly" as PremiumFrequency, planAPremium: 1200, planADeductible: 1000, planBPremium: 900, planBDeductible: 2500 },
]

function toFloat(s: string): number {
  return parseFloat(s) || 0
}

function validatePositive(s: string, setter: (v: string) => void) {
  const n = parseFloat(s)
  if (s === "" || (!isNaN(n) && n >= 0)) setter(s)
}

export function BreakEvenCalculator() {
  const [frequency, setFrequency] = useState<PremiumFrequency>("monthly")
  const [planAPremium, setPlanAPremium] = useState("200")
  const [planADeductible, setPlanADeductible] = useState("500")
  const [planBPremium, setPlanBPremium] = useState("120")
  const [planBDeductible, setPlanBDeductible] = useState("2000")

  const handleChange = useCallback(
    (setter: (v: string) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        validatePositive(e.target.value, setter),
    [],
  )

  const result = useMemo(
    () =>
      calculateBreakEven({
        planAPremium: toFloat(planAPremium),
        planADeductible: toFloat(planADeductible),
        planBPremium: toFloat(planBPremium),
        planBDeductible: toFloat(planBDeductible),
        premiumFrequency: frequency,
      }),
    [planAPremium, planADeductible, planBPremium, planBDeductible, frequency],
  )

  function applyExample(idx: number) {
    const ex = QUICK_EXAMPLES[idx]
    setFrequency(ex.frequency)
    setPlanAPremium(String(ex.planAPremium))
    setPlanADeductible(String(ex.planADeductible))
    setPlanBPremium(String(ex.planBPremium))
    setPlanBDeductible(String(ex.planBDeductible))
  }

  const freqLabel = frequency === "monthly" ? "monthly" : "yearly"

  return (
    <div className="space-y-5">
      {/* ── Premium frequency toggle ──────────────────────────────────────── */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-700 bg-gray-900 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setFrequency("monthly")}
            className={`rounded-md px-4 py-1.5 font-semibold transition-colors ${frequency === "monthly" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-100"}`}
          >
            Monthly Premiums
          </button>
          <button
            type="button"
            onClick={() => setFrequency("yearly")}
            className={`rounded-md px-4 py-1.5 font-semibold transition-colors ${frequency === "yearly" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-100"}`}
          >
            Yearly Premiums
          </button>
        </div>
      </div>

      {/* ── Plan inputs ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Plan A */}
        <Card className="border-blue-800/50 bg-blue-950/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Plan A</span>
              <span className="text-[10px] bg-blue-900/50 text-blue-300 border border-blue-800 rounded px-2 py-0.5">Low Deductible</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="be-planAPremium">Premium ({freqLabel})</Label>
              <Input
                id="be-planAPremium"
                type="number"
                min={0}
                step={1}
                prefix="$"
                value={planAPremium}
                onChange={handleChange(setPlanAPremium)}
                placeholder="200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="be-planADeductible">Deductible</Label>
              <Input
                id="be-planADeductible"
                type="number"
                min={0}
                step={100}
                prefix="$"
                value={planADeductible}
                onChange={handleChange(setPlanADeductible)}
                placeholder="500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Plan B */}
        <Card className="border-cyan-800/50 bg-cyan-950/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Plan B</span>
              <span className="text-[10px] bg-cyan-900/50 text-cyan-300 border border-cyan-800 rounded px-2 py-0.5">High Deductible</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="be-planBPremium">Premium ({freqLabel})</Label>
              <Input
                id="be-planBPremium"
                type="number"
                min={0}
                step={1}
                prefix="$"
                value={planBPremium}
                onChange={handleChange(setPlanBPremium)}
                placeholder="120"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="be-planBDeductible">Deductible</Label>
              <Input
                id="be-planBDeductible"
                type="number"
                min={0}
                step={100}
                prefix="$"
                value={planBDeductible}
                onChange={handleChange(setPlanBDeductible)}
                placeholder="2000"
              />
            </div>
          </CardContent>
        </Card>
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
          {/* Primary KPI */}
          <Card className="border-blue-700/40 bg-gradient-to-br from-blue-950/40 to-[#090E1A]">
            <CardContent className="p-5 text-center space-y-1">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Break-Even Period</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-blue-300 tracking-tight">{result.breakEvenMonths}</span>
                <span className="text-xl text-gray-400 font-normal">months</span>
              </div>
              <p className="text-xs text-gray-500">(~{result.breakEvenYears} years to save the deductible difference)</p>
            </CardContent>
          </Card>

          {/* Recommendation badge */}
          <Card className={`border ${result.recommendation.includes("Plan B") ? "border-green-700/40 bg-green-950/20" : "border-blue-700/40 bg-blue-950/20"}`}>
            <CardContent className="p-4 flex items-start gap-3">
              <RiCheckboxCircleLine className={`size-5 mt-0.5 shrink-0 ${result.recommendation.includes("Plan B") ? "text-green-400" : "text-blue-400"}`} aria-hidden="true" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Statistical Winner</p>
                <p className={`font-bold text-base ${result.recommendation.includes("Plan B") ? "text-green-300" : "text-blue-300"}`}>
                  {result.recommendation}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  If you go {result.breakEvenMonths} months without a claim, Plan B saves you money.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown rows */}
          <Card className="border-gray-800">
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="text-gray-400">Annual Savings (Premiums)</span>
                <span className="font-mono font-bold text-green-400">+{formatCurrency(result.yearlySavings)}/yr</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="text-gray-400">Monthly Savings</span>
                <span className="font-mono font-semibold text-green-400">+{formatCurrency(result.monthlySavings)}/mo</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="text-gray-400">Deductible Gap (Risk)</span>
                <span className="font-mono font-bold text-amber-400">-{formatCurrency(result.riskGap)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="text-gray-400">Total Cost w/ Claim — Plan A</span>
                <span className="font-mono text-gray-300">{formatCurrency(result.costWithClaimA)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-gray-400">Total Cost w/ Claim — Plan B</span>
                <span className="font-mono text-gray-300">{formatCurrency(result.costWithClaimB)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Worst-case notice */}
          <Card className="border-red-900/40 bg-red-950/10">
            <CardContent className="p-3 flex items-start gap-2">
              <RiInformationLine className="size-4 text-red-400 mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-xs text-gray-400">
                <strong className="text-red-300">Worst Case:</strong> If a major claim occurs immediately, Plan B costs{" "}
                <strong className="text-red-300">{formatCurrency(result.claimDifference)}</strong> more than Plan A this year.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
