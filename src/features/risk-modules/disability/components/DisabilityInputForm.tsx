import { DisabilityInputs } from "../types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface DisabilityInputFormProps {
  inputs: DisabilityInputs
  onChange: (inputs: DisabilityInputs) => void
}

export function DisabilityInputForm({ inputs, onChange }: DisabilityInputFormProps) {
  const handleChange = (field: keyof DisabilityInputs, value: string) => {
    const numericValue = value === "" ? 0 : Number(value)
    onChange({ ...inputs, [field]: numericValue })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Income & Expenses</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="annualEarnedIncome">Current Annual Income ($)</Label>
            <Input
              id="annualEarnedIncome"
              type="number"
              value={inputs.annualEarnedIncome || ""}
              onChange={(e) => handleChange("annualEarnedIncome", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spouseMonthlyIncome">Spouse Monthly Income ($)</Label>
            <Input
              id="spouseMonthlyIncome"
              type="number"
              value={inputs.spouseMonthlyIncome || ""}
              onChange={(e) => handleChange("spouseMonthlyIncome", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlyExpenses">Monthly Household Expenses ($)</Label>
            <Input
              id="monthlyExpenses"
              type="number"
              value={inputs.monthlyExpenses || ""}
              onChange={(e) => handleChange("monthlyExpenses", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencySavings">Emergency Savings ($)</Label>
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
          <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Existing Protection</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="stdBenefitMonthly">Employer Short-Term Benefit ($/mo)</Label>
            <Input
              id="stdBenefitMonthly"
              type="number"
              value={inputs.stdBenefitMonthly || ""}
              onChange={(e) => handleChange("stdBenefitMonthly", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ltdBenefitMonthly">Employer Long-Term Benefit ($/mo)</Label>
            <Input
              id="ltdBenefitMonthly"
              type="number"
              value={inputs.ltdBenefitMonthly || ""}
              onChange={(e) => handleChange("ltdBenefitMonthly", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="privateDiBenefitMonthly">Private DI Coverage ($/mo)</Label>
            <Input
              id="privateDiBenefitMonthly"
              type="number"
              value={inputs.privateDiBenefitMonthly || ""}
              onChange={(e) => handleChange("privateDiBenefitMonthly", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stateBenefitMonthly">State Benefits ($/mo)</Label>
            <Input
              id="stateBenefitMonthly"
              type="number"
              value={inputs.stateBenefitMonthly || ""}
              onChange={(e) => handleChange("stateBenefitMonthly", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assumptions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ltdWaitingPeriodDays">LTD Waiting Period (Days)</Label>
            <Input
              id="ltdWaitingPeriodDays"
              type="number"
              value={inputs.ltdWaitingPeriodDays || ""}
              onChange={(e) => handleChange("ltdWaitingPeriodDays", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modeledDurationMonths">Modeled Duration (Months)</Label>
            <Input
              id="modeledDurationMonths"
              type="number"
              value={inputs.modeledDurationMonths || ""}
              onChange={(e) => handleChange("modeledDurationMonths", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
