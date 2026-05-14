import { useState, useMemo, useCallback } from "react"
import { RiAlertLine, RiInformationLine, RiArrowDownLine } from "@remixicon/react"
import { calculateSsdi, SSDI_WAITING_MONTHS } from "./calculateSsdi"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"

function toFloat(s: string): number {
  return parseFloat(s) || 0
}

function validatePositive(s: string, setter: (v: string) => void) {
  const n = parseFloat(s)
  if (s === "" || (!isNaN(n) && n >= 0)) setter(s)
}

interface SsdiEstimatorProps {
  /** Pre-fill from the disability module inputs when available. */
  defaultAnnualIncome?: number
}

export function SsdiEstimator({ defaultAnnualIncome }: SsdiEstimatorProps) {
  const [careerAvg, setCareerAvg] = useState(
    defaultAnnualIncome ? String(defaultAnnualIncome) : "120000",
  )
  const [currentIncome, setCurrentIncome] = useState(
    defaultAnnualIncome ? String(defaultAnnualIncome) : "120000",
  )

  const handleChange = useCallback(
    (setter: (v: string) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        validatePositive(e.target.value, setter),
    [],
  )

  const result = useMemo(
    () =>
      calculateSsdi({
        careerAvgAnnualIncome: toFloat(careerAvg),
        annualIncomeAtDisability: toFloat(currentIncome),
      }),
    [careerAvg, currentIncome],
  )

  return (
    <div className="space-y-5">
      {/* ── Inputs ────────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ssdi-career-avg">
            Career Average Annual Income
          </Label>
          <Input
            id="ssdi-career-avg"
            type="number"
            min={0}
            step={1000}
            prefix="$"
            value={careerAvg}
            onChange={handleChange(setCareerAvg)}
            placeholder="120000"
          />
          <p className="text-[11px] text-gray-500">
            SSA uses 35 best earning years. Use current income as a starting point, then
            adjust down for gaps or lower-income years.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ssdi-current-income">
            Income at Disability Onset
          </Label>
          <Input
            id="ssdi-current-income"
            type="number"
            min={0}
            step={1000}
            prefix="$"
            value={currentIncome}
            onChange={handleChange(setCurrentIncome)}
            placeholder="120000"
          />
          <p className="text-[11px] text-gray-500">
            Used to compute the income replacement rate and monthly gap.
          </p>
        </div>
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
              <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                Estimated Monthly SSDI Benefit
              </p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-blue-300 tracking-tight">
                  {formatCurrency(result.estimatedMonthlyBenefit)}
                </span>
                <span className="text-xl text-gray-400 font-normal">/mo</span>
              </div>
              <p className="text-xs text-gray-500">
                {formatCurrency(result.estimatedAnnualBenefit)}/yr{" · "}AIME: {formatCurrency(result.estimatedAime)}/mo
              </p>
            </CardContent>
          </Card>

          {/* Replacement rate vs gap */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="border-amber-800/50 bg-amber-950/20">
              <CardContent className="p-4 text-center space-y-0.5">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Gross Replacement Rate</p>
                <p className="text-3xl font-bold text-amber-300">
                  {formatPercent(result.replacementRateGross)}
                </p>
                <p className="text-[11px] text-gray-500">of pre-disability income</p>
              </CardContent>
            </Card>
            <Card className="border-red-800/50 bg-red-950/20">
              <CardContent className="p-4 text-center space-y-0.5">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Monthly Gap (SSDI only)</p>
                <p className="text-3xl font-bold text-red-300">
                  {formatCurrency(result.monthlyGap)}
                </p>
                <p className="text-[11px] text-gray-500">uncovered each month</p>
              </CardContent>
            </Card>
          </div>

          {/* PIA waterfall */}
          <Card className="border-gray-800">
            <CardContent className="p-4 space-y-2 text-sm">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-3">
                PIA Formula Breakdown (2025 Bend Points)
              </p>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="text-gray-400">Estimated AIME</span>
                <span className="font-mono font-semibold text-gray-200">
                  {formatCurrency(result.estimatedAime)}/mo
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="text-gray-400">90% × AIME up to $1,226</span>
                <span className="font-mono text-blue-300">+{formatCurrency(result.piaComponents.tier1)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="text-gray-400">32% × AIME $1,226–$7,391</span>
                <span className="font-mono text-blue-300">+{formatCurrency(result.piaComponents.tier2)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="text-gray-400">15% × AIME above $7,391</span>
                <span className="font-mono text-blue-300">+{formatCurrency(result.piaComponents.tier3)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="font-semibold text-gray-200">Estimated Monthly Benefit</span>
                <span className="font-mono font-bold text-blue-300">
                  {formatCurrency(result.estimatedMonthlyBenefit)}/mo
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 5-month waiting period */}
          <Card className="border-orange-900/40 bg-orange-950/10">
            <CardContent className="p-4 flex items-start gap-3">
              <RiArrowDownLine className="size-4 text-orange-400 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">
                  SSA {SSDI_WAITING_MONTHS}-Month Waiting Period
                </p>
                <p className="text-sm font-bold text-orange-300">
                  {formatCurrency(result.waitingPeriodIncomeLoss)} in income lost before the first check arrives
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Social Security imposes a mandatory 5-month elimination period. Private DI can fill this gap.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-gray-800/60 bg-gray-900/20">
            <CardContent className="p-3 flex items-start gap-2">
              <RiInformationLine className="size-4 text-gray-500 mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-xs text-gray-500">
                <strong className="text-gray-400">Estimate only.</strong> Actual SSDI is calculated from your
                complete inflation-indexed earnings record. Visit{" "}
                <strong className="text-gray-400">ssa.gov/myaccount</strong> for your official statement.
                Benefits may also be subject to federal income tax at higher income levels.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
