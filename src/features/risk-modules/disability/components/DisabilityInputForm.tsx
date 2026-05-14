import { DisabilityInputs, DiBenefitPeriod } from "../types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface DisabilityInputFormProps {
  inputs: DisabilityInputs
  onChange: (inputs: DisabilityInputs) => void
}

const selectClass =
  "flex h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-1 text-sm text-gray-50 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-gray-500 mt-0.5">{children}</p>
}

const BENEFIT_PERIOD_OPTIONS: { value: DiBenefitPeriod | ""; label: string }[] = [
  { value: "", label: "Select a period…" },
  { value: "2y", label: "2 Years" },
  { value: "5y", label: "5 Years" },
  { value: "10y", label: "10 Years" },
  { value: "A65", label: "To Age 65" },
  { value: "A67", label: "To Age 67" },
  { value: "A70", label: "To Age 70" },
]

export function DisabilityInputForm({ inputs, onChange }: DisabilityInputFormProps) {
  const handleNumber = (field: keyof DisabilityInputs, value: string) => {
    onChange({ ...inputs, [field]: value === "" ? 0 : Number(value) })
  }

  const handlePercent = (field: keyof DisabilityInputs, value: string) => {
    onChange({ ...inputs, [field]: value === "" ? 0 : Number(value) / 100 })
  }

  const handleBoolean = (field: keyof DisabilityInputs, value: string) => {
    onChange({ ...inputs, [field]: value === "true" })
  }

  // Compute the current-year monthly LTD benefit for the inline preview
  const annualIncome = inputs.annualEarnedIncome || 0
  const coveragePercent = inputs.ltdCoveragePercent || 0
  const monthlyCap = inputs.ltdMonthlyCap || 0
  const grossMonthly = coveragePercent > 0
    ? (monthlyCap > 0
      ? Math.min(annualIncome * coveragePercent / 12, monthlyCap)
      : annualIncome * coveragePercent / 12)
    : 0
  const netMonthly = inputs.ltdTaxable ? grossMonthly * 0.70 : grossMonthly

  return (
    <div className="space-y-6">
      {/* ── Income Profile ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Income Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="annualEarnedIncome">Annual Earned Income ($)</Label>
            <Input
              id="annualEarnedIncome"
              type="number"
              value={inputs.annualEarnedIncome || ""}
              onChange={(e) => handleNumber("annualEarnedIncome", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="currentAge">Current Age</Label>
            <Input
              id="currentAge"
              type="number"
              min={18}
              max={80}
              value={inputs.currentAge || ""}
              onChange={(e) => handleNumber("currentAge", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="retirementAge">Income Projection End Age</Label>
            <Input
              id="retirementAge"
              type="number"
              min={40}
              max={80}
              value={inputs.retirementAge || ""}
              onChange={(e) => handleNumber("retirementAge", e.target.value)}
            />
            <FieldHint>Income grows at 3 %/yr through this age.</FieldHint>
          </div>
        </CardContent>
      </Card>

      {/* ── Group Long Term Disability ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Group Long Term Disability (LTD)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="ltdCoveragePercent">Coverage % of Income</Label>
            <div className="relative">
              <Input
                id="ltdCoveragePercent"
                type="number"
                min={0}
                max={100}
                step={1}
                value={inputs.ltdCoveragePercent ? Math.round(inputs.ltdCoveragePercent * 100) : ""}
                onChange={(e) => handlePercent("ltdCoveragePercent", e.target.value)}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
            </div>
            <FieldHint>e.g. enter 60 for a 60% benefit.</FieldHint>
          </div>
          <div className="space-y-1">
            <Label htmlFor="ltdMonthlyCap">Monthly Benefit Cap ($)</Label>
            <Input
              id="ltdMonthlyCap"
              type="number"
              value={inputs.ltdMonthlyCap || ""}
              onChange={(e) => handleNumber("ltdMonthlyCap", e.target.value)}
            />
            <FieldHint>Leave 0 for no cap.</FieldHint>
          </div>
          <div className="space-y-1">
            <Label htmlFor="ltdTaxable">Is Benefit Taxable?</Label>
            <select
              id="ltdTaxable"
              value={inputs.ltdTaxable ? "true" : "false"}
              onChange={(e) => handleBoolean("ltdTaxable", e.target.value)}
              className={selectClass}
            >
              <option value="true">Yes — taxable (70% of gross shown)</option>
              <option value="false">No — non-taxable (full benefit shown)</option>
            </select>
          </div>

          {/* Computed benefit preview */}
          {grossMonthly > 0 && (
            <div className="md:col-span-2 rounded-md bg-gray-800/60 border border-gray-700 px-4 py-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Computed Monthly Benefit</p>
              <div className="flex gap-6 flex-wrap">
                <div>
                  <span className="text-xs text-gray-500">Gross </span>
                  <span className="text-sm font-semibold text-gray-100">
                    ${Math.round(grossMonthly).toLocaleString()}/mo
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Net ({inputs.ltdTaxable ? "taxable" : "non-taxable"}) </span>
                  <span className="text-sm font-semibold text-blue-300">
                    ${Math.round(netMonthly).toLocaleString()}/mo
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Individual Disability Insurance ──────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Individual Disability Insurance</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="privateDiBenefitMonthly">Monthly Benefit ($)</Label>
            <Input
              id="privateDiBenefitMonthly"
              type="number"
              value={inputs.privateDiBenefitMonthly || ""}
              onChange={(e) => handleNumber("privateDiBenefitMonthly", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="privateDiBenefitPeriod">Benefit Period</Label>
            <select
              id="privateDiBenefitPeriod"
              value={inputs.privateDiBenefitPeriod}
              onChange={(e) => onChange({ ...inputs, privateDiBenefitPeriod: e.target.value as DiBenefitPeriod | "" })}
              className={selectClass}
            >
              {BENEFIT_PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <FieldHint>Individual DI benefit will be shown through the selected period.</FieldHint>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
