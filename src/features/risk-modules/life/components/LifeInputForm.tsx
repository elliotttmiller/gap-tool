import { LifeInputs } from "../types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface LifeInputFormProps {
  inputs: LifeInputs
  onChange: (inputs: LifeInputs) => void
}

export function LifeInputForm({ inputs, onChange }: LifeInputFormProps) {
  const handleChange = (field: keyof LifeInputs, value: string) => {
    const numericValue = value === "" ? 0 : Number(value)
    onChange({ ...inputs, [field]: numericValue })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Income & Timeline</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="currentAge">Current Age</Label>
            <Input
              id="currentAge"
              type="number"
              value={inputs.currentAge || ""}
              onChange={(e) => handleChange("currentAge", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retirementAge">Desired Retirement Age</Label>
            <Input
              id="retirementAge"
              type="number"
              value={inputs.retirementAge || ""}
              onChange={(e) => handleChange("retirementAge", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="annualIncome">Current Annual Income ($)</Label>
            <Input
              id="annualIncome"
              type="number"
              value={inputs.annualIncome || ""}
              onChange={(e) => handleChange("annualIncome", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="incomeReplacementYears">Income Replacement Needs (Years)</Label>
            <Input
              id="incomeReplacementYears"
              type="number"
              value={inputs.incomeReplacementYears || ""}
              onChange={(e) => handleChange("incomeReplacementYears", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Obligations & Goals</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="debtsTotal">Outstanding Debts ($)</Label>
            <Input
              id="debtsTotal"
              type="number"
              value={inputs.debtsTotal || ""}
              onChange={(e) => handleChange("debtsTotal", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="educationGoal">Education Funding Goal ($)</Label>
            <Input
              id="educationGoal"
              type="number"
              value={inputs.educationGoal || ""}
              onChange={(e) => handleChange("educationGoal", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="finalExpenses">Final Expenses ($)</Label>
            <Input
              id="finalExpenses"
              type="number"
              value={inputs.finalExpenses || ""}
              onChange={(e) => handleChange("finalExpenses", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Existing Protection</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="groupLifeCoverage">Existing Group Life ($)</Label>
            <Input
              id="groupLifeCoverage"
              type="number"
              value={inputs.groupLifeCoverage || ""}
              onChange={(e) => handleChange("groupLifeCoverage", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="privateLifeCoverage">Existing Private Life ($)</Label>
            <Input
              id="privateLifeCoverage"
              type="number"
              value={inputs.privateLifeCoverage || ""}
              onChange={(e) => handleChange("privateLifeCoverage", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
