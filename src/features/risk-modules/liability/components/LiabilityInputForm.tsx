import { LiabilityInputs } from "../types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const moneyInputClass = "max-w-40"
const shortInputClass = "max-w-24"

interface LiabilityInputFormProps {
  inputs: LiabilityInputs
  onChange: (inputs: LiabilityInputs) => void
}

export function LiabilityInputForm({ inputs, onChange }: LiabilityInputFormProps) {
  const handleChange = (field: keyof LiabilityInputs, value: string) => {
    const numericValue = value === "" ? 0 : Number(value)
    onChange({ ...inputs, [field]: numericValue })
  }

  return (
    <div className="space-y-4">
      <Card className="w-fit max-w-full">
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Advisor Reference Lawsuit Inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-[max-content_max-content]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="annualIncome">Primary Earner Annual Income</Label>
            <Input id="annualIncome" type="number" prefix="$" value={inputs.annualIncome || ""} className={moneyInputClass} onChange={(e) => handleChange("annualIncome", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentAge">Primary Earner Current Age</Label>
            <Input id="currentAge" type="number" value={inputs.currentAge || ""} className={shortInputClass} onChange={(e) => handleChange("currentAge", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="spouseAnnualIncome">Secondary Earner Annual Income</Label>
            <Input id="spouseAnnualIncome" type="number" prefix="$" value={inputs.spouseAnnualIncome || ""} className={moneyInputClass} onChange={(e) => handleChange("spouseAnnualIncome", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="spouseCurrentAge">Secondary Earner Current Age</Label>
            <Input id="spouseCurrentAge" type="number" value={inputs.spouseCurrentAge || ""} className={shortInputClass} onChange={(e) => handleChange("spouseCurrentAge", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="retirementAge">Projection End Age</Label>
            <Input id="retirementAge" type="number" value={inputs.retirementAge || ""} className={shortInputClass} onChange={(e) => handleChange("retirementAge", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="nonQualifiedAssets">Non-Qualified Assets</Label>
            <Input id="nonQualifiedAssets" type="number" prefix="$" value={inputs.nonQualifiedAssets || ""} className={moneyInputClass} onChange={(e) => handleChange("nonQualifiedAssets", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="autoLiabilityLimit">Household Auto Liability Limit</Label>
            <Input id="autoLiabilityLimit" type="number" prefix="$" value={inputs.autoLiabilityLimit || ""} className={moneyInputClass} onChange={(e) => handleChange("autoLiabilityLimit", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="w-fit max-w-full">
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Optional Extended Asset Inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-[max-content_max-content]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="homeValue">Primary Home Value</Label>
            <Input id="homeValue" type="number" prefix="$" value={inputs.homeValue || ""} className={moneyInputClass} onChange={(e) => handleChange("homeValue", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="mortgageBalance">Mortgage Balance</Label>
            <Input id="mortgageBalance" type="number" prefix="$" value={inputs.mortgageBalance || ""} className={moneyInputClass} onChange={(e) => handleChange("mortgageBalance", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="investmentAssets">Non-Qualified Investments</Label>
            <Input id="investmentAssets" type="number" prefix="$" value={inputs.investmentAssets || ""} className={moneyInputClass} onChange={(e) => handleChange("investmentAssets", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="savingsAssets">Liquid Savings</Label>
            <Input id="savingsAssets" type="number" prefix="$" value={inputs.savingsAssets || ""} className={moneyInputClass} onChange={(e) => handleChange("savingsAssets", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="homeLiabilityLimit">Current Home Liability Limit</Label>
            <Input id="homeLiabilityLimit" type="number" prefix="$" value={inputs.homeLiabilityLimit || ""} className={moneyInputClass} onChange={(e) => handleChange("homeLiabilityLimit", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="umbrellaCoverage">Umbrella Policy</Label>
            <Input id="umbrellaCoverage" type="number" prefix="$" value={inputs.umbrellaCoverage || ""} className={moneyInputClass} onChange={(e) => handleChange("umbrellaCoverage", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="estimatedLawsuitExposure">Modeled Lawsuit Exposure</Label>
            <Input id="estimatedLawsuitExposure" type="number" prefix="$" value={inputs.estimatedLawsuitExposure || ""} className={moneyInputClass} onChange={(e) => handleChange("estimatedLawsuitExposure", e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
