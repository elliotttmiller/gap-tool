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
const moneyInputClass = "max-w-40"
const shortInputClass = "max-w-24"
const selectInputClass = "max-w-56"

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

  return (
    <div className="space-y-3">
      {/* ── Income Profile ────────────────────────────────────────────────── */}
      <Card className="w-fit max-w-full">
        <CardHeader className="px-5 pt-4 pb-1">
          <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Income Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-[max-content_max-content] px-5 pt-3 pb-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="annualEarnedIncome">Annual Income</Label>
            <Input
              id="annualEarnedIncome"
              type="number"
              prefix="$"
              value={inputs.annualEarnedIncome || ""}
              className={moneyInputClass}
              onChange={(e) => handleNumber("annualEarnedIncome", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentAge">Current Age</Label>
            <Input
              id="currentAge"
              type="number"
              min={18}
              max={80}
              value={inputs.currentAge || ""}
              className={shortInputClass}
              onChange={(e) => handleNumber("currentAge", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="retirementAge">Projection End Age</Label>
            <Input
              id="retirementAge"
              type="number"
              min={40}
              max={80}
              value={inputs.retirementAge || ""}
              className={shortInputClass}
              onChange={(e) => handleNumber("retirementAge", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Group Long Term Disability ────────────────────────────────────── */}
      <Card className="w-fit max-w-full">
        <CardHeader className="px-5 pt-4 pb-1">
          <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Group Long Term Disability (LTD)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-[max-content_max-content] px-5 pt-3 pb-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ltdCoveragePercent">Coverage of Income</Label>
            <Input
              id="ltdCoveragePercent"
              type="number"
              min={0}
              max={100}
              step={1}
              suffix="%"
              value={inputs.ltdCoveragePercent ? Math.round(inputs.ltdCoveragePercent * 100) : ""}
              className={shortInputClass}
              onChange={(e) => handlePercent("ltdCoveragePercent", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ltdMonthlyCap">Monthly Cap</Label>
            <Input
              id="ltdMonthlyCap"
              type="number"
              prefix="$"
              value={inputs.ltdMonthlyCap || ""}
              className={moneyInputClass}
              onChange={(e) => handleNumber("ltdMonthlyCap", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ltdTaxable">Taxable?</Label>
            <select
              id="ltdTaxable"
              value={inputs.ltdTaxable ? "true" : "false"}
              onChange={(e) => handleBoolean("ltdTaxable", e.target.value)}
              className={`${selectClass} ${selectInputClass}`}
            >
              <option value="true">Yes — 70% of gross</option>
              <option value="false">No — full benefit</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* ── Individual Disability Insurance ──────────────────────────────── */}
      <Card className="w-fit max-w-full">
        <CardHeader className="px-5 pt-4 pb-1">
          <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Individual Disability Insurance</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-[max-content_max-content] px-5 pt-3 pb-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="privateDiBenefitMonthly">Monthly Benefit</Label>
            <Input
              id="privateDiBenefitMonthly"
              type="number"
              min={0}
              prefix="$"
              value={inputs.privateDiBenefitMonthly || ""}
              className={moneyInputClass}
              onChange={(e) => handleNumber("privateDiBenefitMonthly", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="privateDiMonthlyPremium">Monthly Premium</Label>
            <Input
              id="privateDiMonthlyPremium"
              type="number"
              min={0}
              prefix="$"
              value={inputs.privateDiMonthlyPremium || ""}
              className={moneyInputClass}
              onChange={(e) => handleNumber("privateDiMonthlyPremium", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="privateDiBenefitPeriod">Benefit Period</Label>
            <select
              id="privateDiBenefitPeriod"
              value={inputs.privateDiBenefitPeriod}
              onChange={(e) => onChange({ ...inputs, privateDiBenefitPeriod: e.target.value as DiBenefitPeriod | "" })}
              className={`${selectClass} ${selectInputClass}`}
            >
              {BENEFIT_PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
