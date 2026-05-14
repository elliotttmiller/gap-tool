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
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Baseline Finances</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="annualIncome">Current Annual Income ($)</Label>
            <Input
              id="annualIncome"
              type="number"
              value={inputs.annualIncome || ""}
              onChange={(e) => handleChange("annualIncome", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="spouseIncome">Spouse Annual Income ($)</Label>
            <Input
              id="spouseIncome"
              type="number"
              value={inputs.spouseIncome || ""}
              onChange={(e) => handleChange("spouseIncome", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="monthlyExpenses">Monthly Burn Rate ($)</Label>
            <Input
              id="monthlyExpenses"
              type="number"
              value={inputs.monthlyExpenses || ""}
              onChange={(e) => handleChange("monthlyExpenses", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="emergencySavings">Liquid Emergency Savings ($)</Label>
            <Input
              id="emergencySavings"
              type="number"
              value={inputs.emergencySavings || ""}
              onChange={(e) => handleChange("emergencySavings", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transition Offsets</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="severanceMonths">Expected Severance (Months)</Label>
            <Input
              id="severanceMonths"
              type="number"
              value={inputs.severanceMonths || ""}
              onChange={(e) => handleChange("severanceMonths", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="unemploymentBenefitMonthly">Expected Unemployment Benefit ($/mo)</Label>
            <Input
              id="unemploymentBenefitMonthly"
              type="number"
              value={inputs.unemploymentBenefitMonthly || ""}
              onChange={(e) => handleChange("unemploymentBenefitMonthly", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="unemploymentBenefitDurationMonths">Benefit Duration (Months)</Label>
            <Input
              id="unemploymentBenefitDurationMonths"
              type="number"
              value={inputs.unemploymentBenefitDurationMonths || ""}
              onChange={(e) => handleChange("unemploymentBenefitDurationMonths", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="estimatedJobSearchMonths">Estimated Search Duration (Months)</Label>
            <Input
              id="estimatedJobSearchMonths"
              type="number"
              value={inputs.estimatedJobSearchMonths || ""}
              onChange={(e) => handleChange("estimatedJobSearchMonths", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
