import { LiabilityInputs } from "../types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">At-Risk Assets</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="homeValue">Primary Home Value ($)</Label>
            <Input
              id="homeValue"
              type="number"
              value={inputs.homeValue || ""}
              onChange={(e) => handleChange("homeValue", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mortgageBalance">Mortgage Balance ($)</Label>
            <Input
              id="mortgageBalance"
              type="number"
              value={inputs.mortgageBalance || ""}
              onChange={(e) => handleChange("mortgageBalance", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="investmentAssets">Non-Qualified Investments ($)</Label>
            <Input
              id="investmentAssets"
              type="number"
              value={inputs.investmentAssets || ""}
              onChange={(e) => handleChange("investmentAssets", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="savingsAssets">Liquid Savings ($)</Label>
            <Input
              id="savingsAssets"
              type="number"
              value={inputs.savingsAssets || ""}
              onChange={(e) => handleChange("savingsAssets", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Liability Protection & Exposure</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="homeLiabilityLimit">Current Home Liability Limit ($)</Label>
            <Input
              id="homeLiabilityLimit"
              type="number"
              value={inputs.homeLiabilityLimit || ""}
              onChange={(e) => handleChange("homeLiabilityLimit", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="autoLiabilityLimit">Current Auto Liability Limit ($)</Label>
            <Input
              id="autoLiabilityLimit"
              type="number"
              value={inputs.autoLiabilityLimit || ""}
              onChange={(e) => handleChange("autoLiabilityLimit", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="umbrellaCoverage">Umbrella Policy ($)</Label>
            <Input
              id="umbrellaCoverage"
              type="number"
              value={inputs.umbrellaCoverage || ""}
              onChange={(e) => handleChange("umbrellaCoverage", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimatedLawsuitExposure">Modeled Lawsuit Exposure ($)</Label>
            <Input
              id="estimatedLawsuitExposure"
              type="number"
              value={inputs.estimatedLawsuitExposure || ""}
              onChange={(e) => handleChange("estimatedLawsuitExposure", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
