import { LifeInputs } from "../types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface LifeInputFormProps {
  inputs: LifeInputs
  onChange: (inputs: LifeInputs) => void
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-gray-500 mt-0.5">{children}</p>
}

export function LifeInputForm({ inputs, onChange }: LifeInputFormProps) {
  const handleChange = (field: keyof LifeInputs, value: string) => {
    const numericValue = value === "" ? 0 : Number(value)
    onChange({ ...inputs, [field]: numericValue })
  }

  const yearsToRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge)

  return (
    <div className="space-y-6">
      {/* SECTION 1 — Income & Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Income & Timeline</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="currentAge">Current Age</Label>
            <Input
              id="currentAge"
              type="number"
              value={inputs.currentAge || ""}
              onChange={(e) => handleChange("currentAge", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="retirementAge">Target Retirement Age</Label>
            <Input
              id="retirementAge"
              type="number"
              value={inputs.retirementAge || ""}
              onChange={(e) => handleChange("retirementAge", e.target.value)}
            />
            {yearsToRetirement > 0 && (
              <FieldHint>{yearsToRetirement} working years remaining</FieldHint>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="annualIncome">Annual Income ($)</Label>
            <Input
              id="annualIncome"
              type="number"
              value={inputs.annualIncome || ""}
              onChange={(e) => handleChange("annualIncome", e.target.value)}
            />
            <FieldHint>Client's current gross earned income</FieldHint>
          </div>
          <div className="space-y-1">
            <Label htmlFor="spouseAnnualIncome">Spouse / Partner Annual Income ($)</Label>
            <Input
              id="spouseAnnualIncome"
              type="number"
              value={inputs.spouseAnnualIncome || ""}
              onChange={(e) => handleChange("spouseAnnualIncome", e.target.value)}
            />
            <FieldHint>Surviving spouse income offsets the gap — enter 0 if none</FieldHint>
          </div>
          <div className="space-y-1">
            <Label htmlFor="incomeReplacementYears">Years of Income to Replace</Label>
            <Input
              id="incomeReplacementYears"
              type="number"
              value={inputs.incomeReplacementYears || ""}
              onChange={(e) => handleChange("incomeReplacementYears", e.target.value)}
            />
            <FieldHint>Typically matches years to retirement ({yearsToRetirement})</FieldHint>
          </div>
          <div className="space-y-1">
            <Label htmlFor="incomeReplacementRatio">Income Replacement % (0–100%)</Label>
            <div className="relative">
              <Input
                id="incomeReplacementRatio"
                type="number"
                min={0}
                max={125}
                step={5}
                value={Math.round((inputs.incomeReplacementRatio ?? 1) * 100) || ""}
                onChange={(e) => {
                  const pct = e.target.value === "" ? 0 : Number(e.target.value)
                  onChange({ ...inputs, incomeReplacementRatio: pct / 100 })
                }}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
            </div>
            <FieldHint>How much of lost income should be replaced? (typical: 70–100%)</FieldHint>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2 — Obligations & Goals (lump-sum needs added to protection total) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Obligations & Goals</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="debtsTotal">Outstanding Debts ($)</Label>
            <Input
              id="debtsTotal"
              type="number"
              value={inputs.debtsTotal || ""}
              onChange={(e) => handleChange("debtsTotal", e.target.value)}
            />
            <FieldHint>Mortgage, car loans, credit cards, etc.</FieldHint>
          </div>
          <div className="space-y-1">
            <Label htmlFor="educationGoal">Education Funding Goal ($)</Label>
            <Input
              id="educationGoal"
              type="number"
              value={inputs.educationGoal || ""}
              onChange={(e) => handleChange("educationGoal", e.target.value)}
            />
            <FieldHint>College / education funds for dependents</FieldHint>
          </div>
          <div className="space-y-1">
            <Label htmlFor="finalExpenses">Final Expenses ($)</Label>
            <Input
              id="finalExpenses"
              type="number"
              value={inputs.finalExpenses || ""}
              onChange={(e) => handleChange("finalExpenses", e.target.value)}
            />
            <FieldHint>Funeral, estate costs — typically $15k–$30k</FieldHint>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3 — Existing Protection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Existing Life Insurance</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="groupLifeCoverage">Group Life Insurance — GLI ($)</Label>
            <Input
              id="groupLifeCoverage"
              type="number"
              value={inputs.groupLifeCoverage || ""}
              onChange={(e) => handleChange("groupLifeCoverage", e.target.value)}
            />
            <FieldHint>Employer-provided benefit — often 1–2× salary</FieldHint>
          </div>
          <div className="space-y-1">
            <Label htmlFor="privateLifeCoverage">Private Life Insurance ($)</Label>
            <Input
              id="privateLifeCoverage"
              type="number"
              value={inputs.privateLifeCoverage || ""}
              onChange={(e) => handleChange("privateLifeCoverage", e.target.value)}
            />
            <FieldHint>Individually owned term or permanent coverage</FieldHint>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
