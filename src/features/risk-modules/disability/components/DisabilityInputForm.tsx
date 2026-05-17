import { DisabilityInputs, DiBenefitPeriod } from "../types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CollapsibleInputSection } from "@/components/ui/collapsible-input-section"

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
    <div className="space-y-3">
      {/* ── Income Profile ────────────────────────────────────────────────── */}
      <CollapsibleInputSection title="Income Profile" contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="annualEarnedIncome">Annual Income</Label>
            <Input
              id="annualEarnedIncome"
              type="number"
              prefix="$"
              value={inputs.annualEarnedIncome || ""}
              className="w-full"
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
              className="w-full"
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
              className="w-full"
              onChange={(e) => handleNumber("retirementAge", e.target.value)}
            />
          </div>
      </CollapsibleInputSection>

      {/* ── Group Long Term Disability ────────────────────────────────────── */}
      <CollapsibleInputSection title="Group Long Term Disability (LTD)" contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4 sm:grid-cols-2">
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
              className="w-full"
              onChange={(e) => handlePercent("ltdCoveragePercent", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
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
      </CollapsibleInputSection>

      {/* ── Individual Disability Insurance ──────────────────────────────── */}
      <CollapsibleInputSection title="Individual Disability Insurance" contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="privateDiBenefitMonthly">Monthly Benefit</Label>
            <Input
              id="privateDiBenefitMonthly"
              type="number"
              min={0}
              prefix="$"
              value={inputs.privateDiBenefitMonthly || ""}
              className="w-full"
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
              className="w-full"
              onChange={(e) => handleNumber("privateDiMonthlyPremium", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="breakEvenRateOfReturn">Break-Even Rate of Return</Label>
            <Input
              id="breakEvenRateOfReturn"
              type="number"
              min={0}
              max={30}
              step={0.1}
              suffix="%"
              value={inputs.breakEvenRateOfReturn !== undefined ? Math.round(inputs.breakEvenRateOfReturn * 1000) / 10 : ""}
              className="w-full"
              onChange={(e) => handlePercent("breakEvenRateOfReturn", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="breakEvenMonthsWithoutIncome">Months Without Income</Label>
            <Input
              id="breakEvenMonthsWithoutIncome"
              type="number"
              min={1}
              step={1}
              value={inputs.breakEvenMonthsWithoutIncome || ""}
              className="w-full"
              onChange={(e) => handleNumber("breakEvenMonthsWithoutIncome", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
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
          </div>
      </CollapsibleInputSection>
    </div>
  )
}
