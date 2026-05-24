import { UnemploymentInputs } from "../types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CollapsibleInputSection } from "@/components/ui/collapsible-input-section"

interface UnemploymentInputFormProps {
  inputs: UnemploymentInputs
  onChange: (inputs: UnemploymentInputs) => void
}

export function UnemploymentInputForm({ inputs, onChange }: UnemploymentInputFormProps) {
  const toNonNegative = (value: string) => {
    if (value === "") return 0
    const parsed = Number(value)
    return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0
  }

  const toWholeMonths = (value: string, max = 60) => {
    const normalized = Math.floor(toNonNegative(value))
    return Math.min(normalized, max)
  }

  const toWholeDollar = (value: string) => {
    return Math.round(toNonNegative(value))
  }

  const handleCurrency = (field: keyof UnemploymentInputs, value: string) => {
    onChange({ ...inputs, [field]: toNonNegative(value) })
  }

  const handleMonths = (field: keyof UnemploymentInputs, value: string, max = 60) => {
    onChange({ ...inputs, [field]: toWholeMonths(value, max) })
  }

  return (
    <div className="space-y-4">
      <CollapsibleInputSection title="Baseline Finances" contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="annualIncome">Current Annual Income</Label>
            <Input id="annualIncome" type="number" min={0} prefix="$" value={inputs.annualIncome || ""} className="w-full" onChange={(e) => handleCurrency("annualIncome", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="spouseIncome">Spouse Annual Income</Label>
            <Input id="spouseIncome" type="number" min={0} prefix="$" value={inputs.spouseIncome || ""} className="w-full" onChange={(e) => handleCurrency("spouseIncome", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="monthlyExpenses">Monthly Burn Rate</Label>
            <Input
              id="monthlyExpenses"
              type="number"
              min={0}
              step={1}
              prefix="$"
              value={inputs.monthlyExpenses || ""}
              className="w-full"
              onChange={(e) => onChange({ ...inputs, monthlyExpenses: toWholeDollar(e.target.value) })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="emergencySavings">Liquid Emergency Savings</Label>
            <Input id="emergencySavings" type="number" min={0} prefix="$" value={inputs.emergencySavings || ""} className="w-full" onChange={(e) => handleCurrency("emergencySavings", e.target.value)} />
          </div>
      </CollapsibleInputSection>

      <CollapsibleInputSection title="Transition Offsets" contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2">
            <Label htmlFor="severanceMonthly">Severance Amount</Label>
            <Input id="severanceMonthly" type="number" min={0} prefix="$" suffix="/mo" value={inputs.severanceMonthly || ""} className="w-full" onChange={(e) => handleCurrency("severanceMonthly", e.target.value)} />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <Label htmlFor="severanceDurationMonths">Severance Duration</Label>
            <Input id="severanceDurationMonths" type="number" min={0} max={60} step={1} suffix="mo" value={inputs.severanceDurationMonths || ""} className="w-full" onChange={(e) => handleMonths("severanceDurationMonths", e.target.value)} />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <Label htmlFor="unemploymentBenefitMonthly" className="whitespace-nowrap">Unemployment Benefit</Label>
            <Input id="unemploymentBenefitMonthly" type="number" min={0} prefix="$" suffix="/mo" value={inputs.unemploymentBenefitMonthly || ""} className="w-full" onChange={(e) => handleCurrency("unemploymentBenefitMonthly", e.target.value)} />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <Label htmlFor="unemploymentBenefitDurationMonths">Benefit Duration</Label>
            <Input id="unemploymentBenefitDurationMonths" type="number" min={0} max={60} step={1} suffix="mo" value={inputs.unemploymentBenefitDurationMonths || ""} className="w-full" onChange={(e) => handleMonths("unemploymentBenefitDurationMonths", e.target.value)} />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <Label htmlFor="estimatedJobSearchMonths">Search Duration</Label>
            <Input id="estimatedJobSearchMonths" type="number" min={0} max={60} step={1} suffix="mo" value={inputs.estimatedJobSearchMonths || ""} className="w-full" onChange={(e) => handleMonths("estimatedJobSearchMonths", e.target.value)} />
          </div>
      </CollapsibleInputSection>
    </div>
  )
}
