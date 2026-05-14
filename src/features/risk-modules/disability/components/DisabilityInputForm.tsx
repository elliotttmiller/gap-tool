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
    <div className="space-y-4">
      {/* ── Income Profile ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="px-4 pt-3 pb-0">
          <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Income Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 px-4 pt-2 pb-3">
          <div className="space-y-1">
            <Label htmlFor="annualEarnedIncome" title="Client's current annual earned income">Annual Income ($)</Label>
            <Input
              id="annualEarnedIncome"
              type="number"
              value={inputs.annualEarnedIncome || ""}
              onChange={(e) => handleNumber("annualEarnedIncome", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="currentAge" title="Client's current age">Current Age</Label>
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
            <Label htmlFor="retirementAge" title="Age at which income projection ends; income grows at 3%/yr through this age">Projection End Age</Label>
            <Input
              id="retirementAge"
              type="number"
              min={40}
              max={80}
              value={inputs.retirementAge || ""}
              onChange={(e) => handleNumber("retirementAge", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Group Long Term Disability ────────────────────────────────────── */}
      <Card>
        <CardHeader className="px-4 pt-3 pb-0">
          <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Group Long Term Disability (LTD)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 px-4 pt-2 pb-3">
          <div className="space-y-1">
            <Label htmlFor="ltdCoveragePercent" title="e.g. enter 60 for a 60% benefit">Coverage % of Income</Label>
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
          </div>
          <div className="space-y-1">
            <Label htmlFor="ltdMonthlyCap" title="Leave 0 for no cap">Monthly Cap ($)</Label>
            <Input
              id="ltdMonthlyCap"
              type="number"
              value={inputs.ltdMonthlyCap || ""}
              onChange={(e) => handleNumber("ltdMonthlyCap", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ltdTaxable">Taxable?</Label>
            <select
              id="ltdTaxable"
              value={inputs.ltdTaxable ? "true" : "false"}
              onChange={(e) => handleBoolean("ltdTaxable", e.target.value)}
              className={selectClass}
            >
              <option value="true">Yes — 70% of gross</option>
              <option value="false">No — full benefit</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* ── Individual Disability Insurance ──────────────────────────────── */}
      <Card>
        <CardHeader className="px-4 pt-3 pb-0">
          <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Individual Disability Insurance</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 px-4 pt-2 pb-3">
          <div className="space-y-1">
            <Label htmlFor="privateDiBenefitMonthly">Monthly Benefit ($)</Label>
            <Input
              id="privateDiBenefitMonthly"
              type="number"
              min={0}
              value={inputs.privateDiBenefitMonthly || ""}
              onChange={(e) => handleNumber("privateDiBenefitMonthly", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="privateDiMonthlyPremium" title="Monthly premium paid for the individual DI policy">Monthly Premium ($)</Label>
            <Input
              id="privateDiMonthlyPremium"
              type="number"
              min={0}
              value={inputs.privateDiMonthlyPremium || ""}
              onChange={(e) => handleNumber("privateDiMonthlyPremium", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="privateDiBenefitPeriod" title="Individual DI benefit will be shown through the selected period">Benefit Period</Label>
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
