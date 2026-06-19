import { useState, useMemo, useCallback } from "react"
import { RiAlertLine, RiCheckboxCircleLine, RiInformationLine } from "@remixicon/react"
import { calculateBenefitTax, type FilingStatus } from "./calculateBenefitTax"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { ThemedSelect } from "@/components/ThemedSelect"


function toFloat(s: string): number {
  return parseFloat(s) || 0
}

function validatePositive(s: string, setter: (v: string) => void) {
  const n = parseFloat(s)
  if (s === "" || (!isNaN(n) && n >= 0)) setter(s)
}

const FILING_STATUS_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "mfj", label: "Married Filing Jointly" },
  { value: "mfs", label: "Married Filing Separately" },
  { value: "hoh", label: "Head of Household" },
]

interface BenefitTaxCalculatorProps {
  /** Pre-fill from the disability module inputs when available. */
  defaultAnnualIncome?: number
  defaultGrossMonthlyBenefit?: number
  defaultCoveragePercent?: number
  defaultLtdTaxable?: boolean
}

export function BenefitTaxCalculator({
  defaultAnnualIncome,
  defaultGrossMonthlyBenefit,
  defaultCoveragePercent,
  defaultLtdTaxable,
}: BenefitTaxCalculatorProps) {
  const [annualIncome, setAnnualIncome] = useState(
    defaultAnnualIncome ? String(defaultAnnualIncome) : "150000",
  )
  const [grossMonthly, setGrossMonthly] = useState(
    defaultGrossMonthlyBenefit ? String(Math.round(defaultGrossMonthlyBenefit)) : "7500",
  )
  const [coveragePct, setCoveragePct] = useState(
    defaultCoveragePercent !== undefined
      ? String(Math.round(defaultCoveragePercent * 100))
      : "60",
  )
  const [employerPaid, setEmployerPaid] = useState<boolean>(defaultLtdTaxable ?? true)
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single")
  const [stateTaxPct, setStateTaxPct] = useState("5")

  const handleChange = useCallback(
    (setter: (v: string) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        validatePositive(e.target.value, setter),
    [],
  )

  const result = useMemo(
    () =>
      calculateBenefitTax({
        annualIncome: toFloat(annualIncome),
        grossMonthlyBenefit: toFloat(grossMonthly),
        coveragePercent: toFloat(coveragePct) / 100,
        employerPaidPremium: employerPaid,
        filingStatus,
        stateTaxRate: toFloat(stateTaxPct) / 100,
      }),
    [annualIncome, grossMonthly, coveragePct, employerPaid, filingStatus, stateTaxPct],
  )

  return (
    <div className="space-y-5">
      {/* ── Inputs ────────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="btx-income">Pre-Disability Annual Income</Label>
          <Input
            id="btx-income"
            type="number"
            min={0}
            step={1000}
            prefix="$"
            value={annualIncome}
            onChange={handleChange(setAnnualIncome)}
            placeholder="150000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="btx-gross-monthly">Gross Monthly LTD Benefit</Label>
          <Input
            id="btx-gross-monthly"
            type="number"
            min={0}
            step={100}
            prefix="$"
            value={grossMonthly}
            onChange={handleChange(setGrossMonthly)}
            placeholder="7500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="btx-coverage">Coverage Percent (label)</Label>
          <Input
            id="btx-coverage"
            type="number"
            min={0}
            max={100}
            step={1}
            suffix="%"
            value={coveragePct}
            onChange={handleChange(setCoveragePct)}
            placeholder="60"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="btx-employer-paid">Premium Payer</Label>
          <ThemedSelect id="btx-employer-paid" ariaLabel="Premium Payer" value={employerPaid ? "employer" : "employee"} onValueChange={(value) => setEmployerPaid(value === "employer")} options={[{ value: "employer", label: "Employer-paid (benefits taxable)" }, { value: "employee", label: "Employee-paid after-tax (benefits tax-free)" }]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="btx-filing">Filing Status</Label>
          <ThemedSelect id="btx-filing" ariaLabel="Filing Status" value={filingStatus} onValueChange={(value) => setFilingStatus(value as FilingStatus)} options={FILING_STATUS_OPTIONS} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="btx-state-tax">State Income Tax Rate</Label>
          <Input
            id="btx-state-tax"
            type="number"
            min={0}
            max={20}
            step={0.5}
            suffix="%"
            value={stateTaxPct}
            onChange={handleChange(setStateTaxPct)}
            placeholder="5"
          />
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
          {/* Primary KPI: Gross vs Net benefit */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="border-gray-700/50 bg-gray-900/40">
              <CardContent className="p-4 text-center space-y-0.5">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                  Gross Monthly Benefit
                </p>
                <p className="text-3xl font-bold text-gray-200">
                  {formatCurrency(toFloat(grossMonthly))}
                </p>
                <p className="text-[11px] text-gray-500">
                  {formatPercent(result.grossReplacementRate)} gross replacement
                </p>
              </CardContent>
            </Card>
            <Card className="border-blue-700/40 bg-gradient-to-br from-blue-950/40 to-[#090E1A]">
              <CardContent className="p-4 text-center space-y-0.5">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                  Net Monthly Benefit (After Tax)
                </p>
                <p className="text-3xl font-bold text-blue-300">
                  {formatCurrency(result.netMonthlyBenefit)}
                </p>
                <p className="text-[11px] text-gray-500">
                  {formatPercent(result.netReplacementRate)} true replacement
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Alert: true replacement rate */}
          {result.netReplacementRate < 0.5 ? (
            <Card className="border-red-700/40 bg-red-950/20">
              <CardContent className="p-4 flex items-start gap-3">
                <RiAlertLine className="size-5 mt-0.5 shrink-0 text-red-400" aria-hidden="true" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">
                    True Replacement Gap
                  </p>
                  <p className="font-bold text-base text-red-300">
                    This policy only nets {formatPercent(result.netReplacementRate)} of take-home pay
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    A "60% coverage" policy pays{" "}
                    <strong className="text-red-300">
                      {formatPercent(result.netReplacementRate)}
                    </strong>{" "}
                    of real after-tax income once federal and state taxes are applied.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-700/40 bg-green-950/20">
              <CardContent className="p-4 flex items-start gap-3">
                <RiCheckboxCircleLine className="size-5 mt-0.5 shrink-0 text-green-400" aria-hidden="true" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">
                    Net Replacement Rate
                  </p>
                  <p className="font-bold text-base text-green-300">
                    {formatPercent(result.netReplacementRate)} of after-tax income is covered
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    After taxes, this policy provides a solid income replacement.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Breakdown */}
          <Card className="border-gray-800">
            <CardContent className="p-4 space-y-2 text-sm">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-3">
                Monthly Breakdown
              </p>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="text-gray-400">Gross Monthly LTD Benefit</span>
                <span className="font-mono font-semibold text-gray-200">
                  {formatCurrency(toFloat(grossMonthly))}
                </span>
              </div>
              {result.federalTaxableBenefitAnnual > 0 ? (
                <>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                    <span className="text-gray-400">
                      Federal Tax ({formatPercent(result.marginalFederalRate)} marginal)
                    </span>
                    <span className="font-mono font-bold text-red-400">
                      −{formatCurrency(result.monthlyFederalTax)}
                    </span>
                  </div>
                  {result.monthlyStateTax > 0 && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                      <span className="text-gray-400">
                        State Tax ({toFloat(stateTaxPct)}%)
                      </span>
                      <span className="font-mono font-bold text-red-400">
                        −{formatCurrency(result.monthlyStateTax)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                    <span className="text-gray-400">Effective Tax Rate on Benefits</span>
                    <span className="font-mono text-amber-400">
                      {formatPercent(result.effectiveTaxRateOnBenefit)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                  <span className="text-gray-400">Tax on Benefits</span>
                  <span className="font-mono text-green-400">$0 (employee-paid, tax-free)</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="font-semibold text-gray-200">Net Monthly Benefit</span>
                <span className="font-mono font-bold text-blue-300">
                  {formatCurrency(result.netMonthlyBenefit)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="text-gray-400">Pre-Disability Take-Home</span>
                <span className="font-mono text-gray-300">
                  {formatCurrency(result.preTaxMonthlyIncome)}/mo
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="font-semibold text-gray-200">True Replacement Rate</span>
                <span className={`font-mono font-bold ${result.netReplacementRate < 0.5 ? "text-red-300" : "text-green-300"}`}>
                  {formatPercent(result.netReplacementRate)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-gray-800/60 bg-gray-900/20">
            <CardContent className="p-3 flex items-start gap-2">
              <RiInformationLine className="size-4 text-gray-500 mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-xs text-gray-500">
                Federal tax uses 2025 brackets. Modelled as LTD benefit being the sole income during
                disability; actual tax liability may differ based on other income sources. State tax
                treatment varies — consult a tax advisor.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
