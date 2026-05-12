import { LifeInputs, LifePolicyType } from "../types"
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
  const handleNumberChange = (field: keyof LifeInputs, value: string) => {
    const numericValue = value === "" ? 0 : Number(value)
    onChange({ ...inputs, [field]: numericValue })
  }

  const handleTextChange = (field: keyof LifeInputs, value: string) => {
    onChange({ ...inputs, [field]: value })
  }

  const handlePolicyTypeChange = (value: LifePolicyType) => {
    onChange({ ...inputs, privateLifePolicyType: value })
  }

  const yearsToRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge)
  const policyType = inputs.privateLifePolicyType ?? "term"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Income Earner Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="earnerName">Full Name</Label>
            <Input
              id="earnerName"
              value={inputs.earnerName ?? ""}
              onChange={(e) => handleTextChange("earnerName", e.target.value)}
              placeholder="Primary Earner"
            />
            <FieldHint>Matches the advisor reference Client Setup earner block.</FieldHint>
          </div>
          <div className="space-y-1">
            <Label htmlFor="currentAge">Current Age</Label>
            <Input id="currentAge" type="number" min={18} max={64} value={inputs.currentAge || ""} onChange={(e) => handleNumberChange("currentAge", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="annualIncome">Annual Income ($)</Label>
            <Input id="annualIncome" type="number" value={inputs.annualIncome || ""} onChange={(e) => handleNumberChange("annualIncome", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="retirementAge">Income Projection End Age</Label>
            <Input id="retirementAge" type="number" value={inputs.retirementAge || ""} onChange={(e) => handleNumberChange("retirementAge", e.target.value)} />
            {yearsToRetirement > 0 && <FieldHint>Advisor reference projects income to age 65. Current: {yearsToRetirement} years.</FieldHint>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="incomeReplacementRatio">Income Replacement %</Label>
            <div className="relative">
              <Input id="incomeReplacementRatio" type="number" min={0} max={125} step={5} value={Math.round((inputs.incomeReplacementRatio ?? 1) * 100) || ""} onChange={(e) => onChange({ ...inputs, incomeReplacementRatio: (e.target.value === "" ? 0 : Number(e.target.value)) / 100 })} />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
            </div>
            <FieldHint>Use 100% to mirror the advisor HTML death-tab logic.</FieldHint>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Existing Coverage</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="groupLifeCoverage">Group Life (GLI) Death Benefit ($)</Label>
            <Input id="groupLifeCoverage" type="number" value={inputs.groupLifeCoverage || ""} onChange={(e) => handleNumberChange("groupLifeCoverage", e.target.value)} />
            <FieldHint>Employer-provided life benefit.</FieldHint>
          </div>
          <div className="space-y-1">
            <Label htmlFor="privateLifeCoverage">Private Life Insurance Death Benefit ($)</Label>
            <Input id="privateLifeCoverage" type="number" value={inputs.privateLifeCoverage || ""} onChange={(e) => handleNumberChange("privateLifeCoverage", e.target.value)} />
            <FieldHint>Individually owned life coverage.</FieldHint>
          </div>
          <div className="space-y-1">
            <Label htmlFor="privateLifePolicyType">Policy Type</Label>
            <select
              id="privateLifePolicyType"
              value={policyType}
              onChange={(e) => handlePolicyTypeChange(e.target.value as LifePolicyType)}
              className="flex h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-1 text-sm text-gray-50 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
            >
              <option value="term">Term</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>
          {policyType === "term" ? (
            <div className="space-y-1">
              <Label htmlFor="privateLifeTermYears">Term Length (years)</Label>
              <Input id="privateLifeTermYears" type="number" value={inputs.privateLifeTermYears || ""} onChange={(e) => handleNumberChange("privateLifeTermYears", e.target.value)} />
              <FieldHint>Private coverage stops after this term in the yearly gap chart.</FieldHint>
            </div>
          ) : null}
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="nonQualifiedAssets">Non-Qualified Assets ($)</Label>
            <Input id="nonQualifiedAssets" type="number" value={inputs.nonQualifiedAssets || ""} onChange={(e) => handleNumberChange("nonQualifiedAssets", e.target.value)} />
            <FieldHint>Taxable brokerage, savings, real estate equity, etc. Used by the advisor-reference lawsuit model.</FieldHint>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Optional Advanced Life Needs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="debtsTotal">Outstanding Debts ($)</Label>
            <Input id="debtsTotal" type="number" value={inputs.debtsTotal || ""} onChange={(e) => handleNumberChange("debtsTotal", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="educationGoal">Education Funding Goal ($)</Label>
            <Input id="educationGoal" type="number" value={inputs.educationGoal || ""} onChange={(e) => handleNumberChange("educationGoal", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="finalExpenses">Final Expenses ($)</Label>
            <Input id="finalExpenses" type="number" value={inputs.finalExpenses || ""} onChange={(e) => handleNumberChange("finalExpenses", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="spouseAnnualIncome">Spouse / Partner Annual Income ($)</Label>
            <Input id="spouseAnnualIncome" type="number" value={inputs.spouseAnnualIncome || ""} onChange={(e) => handleNumberChange("spouseAnnualIncome", e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
