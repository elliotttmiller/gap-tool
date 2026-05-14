import { UnemploymentInputs } from "../types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface UnemploymentInputFormProps {
  inputs: UnemploymentInputs
  onChange: (inputs: UnemploymentInputs) => void
}

export function UnemploymentInputForm({ inputs, onChange }: UnemploymentInputFormProps) {
  const handleChange = (field: keyof UnemploymentInputs, value: string) => {
    const numericValue = value === "" ? 0 : Number(value)
    onChange({ ...inputs, [field]: numericValue })
  }

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Baseline Finances</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="annualIncome">Current Annual Income</Label>
            <Input id="annualIncome" type="number" prefix="$" value={inputs.annualIncome || ""} className="w-full" onChange={(e) => handleChange("annualIncome", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="spouseIncome">Spouse Annual Income</Label>
            <Input id="spouseIncome" type="number" prefix="$" value={inputs.spouseIncome || ""} className="w-full" onChange={(e) => handleChange("spouseIncome", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="monthlyExpenses">Monthly Burn Rate</Label>
            <Input id="monthlyExpenses" type="number" prefix="$" value={inputs.monthlyExpenses || ""} className="w-full" onChange={(e) => handleChange("monthlyExpenses", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="emergencySavings">Liquid Emergency Savings</Label>
            <Input id="emergencySavings" type="number" prefix="$" value={inputs.emergencySavings || ""} className="w-full" onChange={(e) => handleChange("emergencySavings", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transition Offsets</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="severanceMonths">Expected Severance</Label>
            <Input id="severanceMonths" type="number" suffix="mo" value={inputs.severanceMonths || ""} className="w-full" onChange={(e) => handleChange("severanceMonths", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="unemploymentBenefitMonthly">Expected Unemployment Benefit</Label>
            <Input id="unemploymentBenefitMonthly" type="number" prefix="$" suffix="/mo" value={inputs.unemploymentBenefitMonthly || ""} className="w-full" onChange={(e) => handleChange("unemploymentBenefitMonthly", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="unemploymentBenefitDurationMonths">Benefit Duration</Label>
            <Input id="unemploymentBenefitDurationMonths" type="number" suffix="mo" value={inputs.unemploymentBenefitDurationMonths || ""} className="w-full" onChange={(e) => handleChange("unemploymentBenefitDurationMonths", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="estimatedJobSearchMonths">Estimated Search Duration</Label>
            <Input id="estimatedJobSearchMonths" type="number" suffix="mo" value={inputs.estimatedJobSearchMonths || ""} className="w-full" onChange={(e) => handleChange("estimatedJobSearchMonths", e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
