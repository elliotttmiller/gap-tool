import { UnemploymentInputs } from "../types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const moneyInputClass = "max-w-40"
const shortInputClass = "max-w-24"

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
      <Card className="w-fit max-w-full">
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Baseline Finances</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-[max-content_max-content]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="annualIncome">Current Annual Income</Label>
            <Input
              id="annualIncome"
              type="number"
              prefix="$"
              value={inputs.annualIncome || ""}
              className={moneyInputClass}
              onChange={(e) => handleChange("annualIncome", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="spouseIncome">Spouse Annual Income</Label>
            <Input
              id="spouseIncome"
              type="number"
              prefix="$"
              value={inputs.spouseIncome || ""}
              className={moneyInputClass}
              onChange={(e) => handleChange("spouseIncome", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="monthlyExpenses">Monthly Burn Rate</Label>
            <Input
              id="monthlyExpenses"
              type="number"
              prefix="$"
              value={inputs.monthlyExpenses || ""}
              className={moneyInputClass}
              onChange={(e) => handleChange("monthlyExpenses", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="emergencySavings">Liquid Emergency Savings</Label>
            <Input
              id="emergencySavings"
              type="number"
              prefix="$"
              value={inputs.emergencySavings || ""}
              className={moneyInputClass}
              onChange={(e) => handleChange("emergencySavings", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="w-fit max-w-full">
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transition Offsets</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-[max-content_max-content]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="severanceMonths">Expected Severance</Label>
            <Input
              id="severanceMonths"
              type="number"
              suffix="mo"
              value={inputs.severanceMonths || ""}
              className={shortInputClass}
              onChange={(e) => handleChange("severanceMonths", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="unemploymentBenefitMonthly">Expected Unemployment Benefit</Label>
            <Input
              id="unemploymentBenefitMonthly"
              type="number"
              prefix="$"
              suffix="/mo"
              value={inputs.unemploymentBenefitMonthly || ""}
              className={moneyInputClass}
              onChange={(e) => handleChange("unemploymentBenefitMonthly", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="unemploymentBenefitDurationMonths">Benefit Duration</Label>
            <Input
              id="unemploymentBenefitDurationMonths"
              type="number"
              suffix="mo"
              value={inputs.unemploymentBenefitDurationMonths || ""}
              className={shortInputClass}
              onChange={(e) => handleChange("unemploymentBenefitDurationMonths", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="estimatedJobSearchMonths">Estimated Search Duration</Label>
            <Input
              id="estimatedJobSearchMonths"
              type="number"
              suffix="mo"
              value={inputs.estimatedJobSearchMonths || ""}
              className={shortInputClass}
              onChange={(e) => handleChange("estimatedJobSearchMonths", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
