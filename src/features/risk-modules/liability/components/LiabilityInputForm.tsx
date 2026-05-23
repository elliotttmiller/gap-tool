import { LiabilityInputs } from "../types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CollapsibleInputSection } from "@/components/ui/collapsible-input-section"

interface LiabilityInputFormProps {
  inputs: LiabilityInputs
  onChange: (inputs: LiabilityInputs) => void
}

export function LiabilityInputForm({ inputs, onChange }: LiabilityInputFormProps) {
  const handleChange = (field: keyof LiabilityInputs, value: string) => {
    const numericValue = value === "" ? 0 : Number(value)
    onChange({ ...inputs, [field]: numericValue })
  }
  const handlePercentChange = (field: keyof LiabilityInputs, value: string) => {
    const numericValue = value === "" ? 0 : Number(value) / 100
    onChange({ ...inputs, [field]: numericValue })
  }

  return (
    <div className="space-y-4">
      <CollapsibleInputSection title="Reference Lawsuit Inputs" contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="annualIncome" className="whitespace-nowrap">Primary Annual Income</Label>
            <Input id="annualIncome" type="number" prefix="$" value={inputs.annualIncome || ""} className="w-full" onChange={(e) => handleChange("annualIncome", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentAge" className="whitespace-nowrap">Primary Current Age</Label>
            <Input id="currentAge" type="number" value={inputs.currentAge || ""} className="w-full" onChange={(e) => handleChange("currentAge", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="spouseAnnualIncome" className="whitespace-nowrap">Secondary Annual Income</Label>
            <Input id="spouseAnnualIncome" type="number" prefix="$" value={inputs.spouseAnnualIncome || ""} className="w-full" onChange={(e) => handleChange("spouseAnnualIncome", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="spouseCurrentAge" className="whitespace-nowrap">Secondary Current Age</Label>
            <Input id="spouseCurrentAge" type="number" value={inputs.spouseCurrentAge || ""} className="w-full" onChange={(e) => handleChange("spouseCurrentAge", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="retirementAge" className="whitespace-nowrap">Projection End Age</Label>
            <Input id="retirementAge" type="number" value={inputs.retirementAge || ""} className="w-full" onChange={(e) => handleChange("retirementAge", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="garnishmentRate" className="whitespace-nowrap">Garnishment Rate</Label>
            <Input
              id="garnishmentRate"
              type="number"
              suffix="%"
              value={inputs.garnishmentRate !== undefined ? inputs.garnishmentRate * 100 : ""}
              className="w-full"
              onChange={(e) => handlePercentChange("garnishmentRate", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="incomeGrowthRate" className="whitespace-nowrap">Income Growth Rate</Label>
            <Input
              id="incomeGrowthRate"
              type="number"
              suffix="%"
              value={inputs.incomeGrowthRate !== undefined ? inputs.incomeGrowthRate * 100 : ""}
              className="w-full"
              onChange={(e) => handlePercentChange("incomeGrowthRate", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="nonQualifiedAssets" className="whitespace-nowrap">Non-Qualified Assets</Label>
            <Input id="nonQualifiedAssets" type="number" prefix="$" value={inputs.nonQualifiedAssets || ""} className="w-full" onChange={(e) => handleChange("nonQualifiedAssets", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="autoLiabilityLimit" className="whitespace-nowrap">Auto Liability Limit</Label>
            <Input id="autoLiabilityLimit" type="number" prefix="$" value={inputs.autoLiabilityLimit || ""} className="w-full" onChange={(e) => handleChange("autoLiabilityLimit", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="umbrellaCoverage" className="whitespace-nowrap">Existing Umbrella Coverage</Label>
            <Input id="umbrellaCoverage" type="number" prefix="$" value={inputs.umbrellaCoverage || ""} className="w-full" onChange={(e) => handleChange("umbrellaCoverage", e.target.value)} />
          </div>
      </CollapsibleInputSection>

      <CollapsibleInputSection title="Optional Extended Asset Inputs" defaultOpen={false} contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="homeValue" className="whitespace-nowrap">Primary Home Value</Label>
            <Input id="homeValue" type="number" prefix="$" value={inputs.homeValue || ""} className="w-full" onChange={(e) => handleChange("homeValue", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="mortgageBalance" className="whitespace-nowrap">Mortgage Balance</Label>
            <Input id="mortgageBalance" type="number" prefix="$" value={inputs.mortgageBalance || ""} className="w-full" onChange={(e) => handleChange("mortgageBalance", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="investmentAssets" className="whitespace-nowrap">Investment / Taxable Accounts</Label>
            <Input id="investmentAssets" type="number" prefix="$" value={inputs.investmentAssets || ""} className="w-full" onChange={(e) => handleChange("investmentAssets", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="businessOwnershipValue" className="whitespace-nowrap">Business Ownership Value</Label>
            <Input id="businessOwnershipValue" type="number" prefix="$" value={inputs.businessOwnershipValue || ""} className="w-full" onChange={(e) => handleChange("businessOwnershipValue", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="savingsAssets" className="whitespace-nowrap">Liquid Savings</Label>
            <Input id="savingsAssets" type="number" prefix="$" value={inputs.savingsAssets || ""} className="w-full" onChange={(e) => handleChange("savingsAssets", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="homeLiabilityLimit" className="whitespace-nowrap">Home Liability Limit</Label>
            <Input id="homeLiabilityLimit" type="number" prefix="$" value={inputs.homeLiabilityLimit || ""} className="w-full" onChange={(e) => handleChange("homeLiabilityLimit", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="estimatedLawsuitExposure" className="whitespace-nowrap">Lawsuit Exposure</Label>
            <Input id="estimatedLawsuitExposure" type="number" prefix="$" value={inputs.estimatedLawsuitExposure || ""} className="w-full" onChange={(e) => handleChange("estimatedLawsuitExposure", e.target.value)} />
          </div>
      </CollapsibleInputSection>
    </div>
  )
}
