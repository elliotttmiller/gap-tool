import { LiabilityInputs } from "../types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface LiabilityInputFormProps {
  inputs: LiabilityInputs
  onChange: (inputs: LiabilityInputs) => void
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-gray-500 mt-0.5">{children}</p>
}

export function LiabilityInputForm({ inputs, onChange }: LiabilityInputFormProps) {
  const handleChange = (field: keyof LiabilityInputs, value: string) => {
    const numericValue = value === "" ? 0 : Number(value)
    onChange({ ...inputs, [field]: numericValue })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Advisor Reference Lawsuit Inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="annualIncome">Primary Earner Annual Income ($)</Label>
            <Input id="annualIncome" type="number" value={inputs.annualIncome || ""} onChange={(e) => handleChange("annualIncome", e.target.value)} />
            <FieldHint>Used to model 25% of projected income to age 65.</FieldHint>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentAge">Primary Earner Current Age</Label>
            <Input id="currentAge" type="number" value={inputs.currentAge || ""} onChange={(e) => handleChange("currentAge", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spouseAnnualIncome">Secondary Earner Annual Income ($)</Label>
            <Input id="spouseAnnualIncome" type="number" value={inputs.spouseAnnualIncome || ""} onChange={(e) => handleChange("spouseAnnualIncome", e.target.value)} />
            <FieldHint>Optional; included for couple/household calculations.</FieldHint>
          </div>
          <div className="space-y-2">
            <Label htmlFor="spouseCurrentAge">Secondary Earner Current Age</Label>
            <Input id="spouseCurrentAge" type="number" value={inputs.spouseCurrentAge || ""} onChange={(e) => handleChange("spouseCurrentAge", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retirementAge">Projection End Age</Label>
            <Input id="retirementAge" type="number" value={inputs.retirementAge || ""} onChange={(e) => handleChange("retirementAge", e.target.value)} />
            <FieldHint>Advisor reference uses age 65.</FieldHint>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nonQualifiedAssets">Non-Qualified Assets ($)</Label>
            <Input id="nonQualifiedAssets" type="number" value={inputs.nonQualifiedAssets || ""} onChange={(e) => handleChange("nonQualifiedAssets", e.target.value)} />
            <FieldHint>Taxable brokerage, savings, real estate equity, etc.</FieldHint>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="autoLiabilityLimit">Household Auto Liability Limit ($)</Label>
            <Input id="autoLiabilityLimit" type="number" value={inputs.autoLiabilityLimit || ""} onChange={(e) => handleChange("autoLiabilityLimit", e.target.value)} />
            <FieldHint>Single underlying auto liability limit covering the household.</FieldHint>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Optional Extended Asset Inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="homeValue">Primary Home Value ($)</Label>
            <Input id="homeValue" type="number" value={inputs.homeValue || ""} onChange={(e) => handleChange("homeValue", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mortgageBalance">Mortgage Balance ($)</Label>
            <Input id="mortgageBalance" type="number" value={inputs.mortgageBalance || ""} onChange={(e) => handleChange("mortgageBalance", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="investmentAssets">Non-Qualified Investments ($)</Label>
            <Input id="investmentAssets" type="number" value={inputs.investmentAssets || ""} onChange={(e) => handleChange("investmentAssets", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="savingsAssets">Liquid Savings ($)</Label>
            <Input id="savingsAssets" type="number" value={inputs.savingsAssets || ""} onChange={(e) => handleChange("savingsAssets", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homeLiabilityLimit">Current Home Liability Limit ($)</Label>
            <Input id="homeLiabilityLimit" type="number" value={inputs.homeLiabilityLimit || ""} onChange={(e) => handleChange("homeLiabilityLimit", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="umbrellaCoverage">Umbrella Policy ($)</Label>
            <Input id="umbrellaCoverage" type="number" value={inputs.umbrellaCoverage || ""} onChange={(e) => handleChange("umbrellaCoverage", e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="estimatedLawsuitExposure">Modeled Lawsuit Exposure ($)</Label>
            <Input id="estimatedLawsuitExposure" type="number" value={inputs.estimatedLawsuitExposure || ""} onChange={(e) => handleChange("estimatedLawsuitExposure", e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
