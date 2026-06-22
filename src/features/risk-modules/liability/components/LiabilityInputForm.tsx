import { LiabilityInputs } from "../types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CollapsibleInputSection } from "@/components/ui/collapsible-input-section"
import { Info } from "lucide-react"

interface LiabilityInputFormProps {
  inputs: LiabilityInputs
  onChange: (inputs: LiabilityInputs) => void
}

export function LiabilityInputForm({ inputs, onChange }: LiabilityInputFormProps) {
  const autoLiabilityLimitNeedsReview = inputs.autoLiabilityLimit > 0 && inputs.autoLiabilityLimit < 100_000

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
      <CollapsibleInputSection title="Household Liability Inputs" contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4 sm:grid-cols-2">
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
            <div className="flex items-center gap-1.5">
              <Label htmlFor="autoLiabilityLimit" className="whitespace-nowrap">Auto Liability Limit</Label>
              <span className="group relative inline-flex">
                <button
                  type="button"
                  aria-label="About the auto liability limit"
                  aria-describedby="auto-liability-limit-help"
                  className={`rounded-full p-0.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500/70 ${autoLiabilityLimitNeedsReview ? "text-amber-500 hover:text-amber-400" : "text-slate-500 hover:text-cyan-400"}`}
                >
                  <Info className="size-3.5" aria-hidden="true" />
                </button>
                <span
                  id="auto-liability-limit-help"
                  role="tooltip"
                  className={`pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-64 translate-y-1 rounded-lg border bg-slate-950/95 px-3 py-2.5 text-[10px] font-normal leading-relaxed opacity-0 shadow-xl backdrop-blur-sm transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 ${autoLiabilityLimitNeedsReview ? "border-amber-700/70 text-amber-400" : "border-slate-700/80 text-slate-300"}`}
                >
                  Enter the household per-occurrence liability limit from the policy declarations; confirm this is not a deductible or property-damage sublimit.
                  <span className={`absolute -bottom-1 right-2.5 size-2 rotate-45 border-b border-r bg-slate-950 ${autoLiabilityLimitNeedsReview ? "border-amber-700/70" : "border-slate-700/80"}`} aria-hidden="true" />
                </span>
              </span>
            </div>
            <Input id="autoLiabilityLimit" type="number" min={0} step={50_000} prefix="$" value={inputs.autoLiabilityLimit || ""} className="w-full" onChange={(e) => handleChange("autoLiabilityLimit", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="umbrellaCoverage" className="whitespace-nowrap">Existing Umbrella Coverage</Label>
            <Input id="umbrellaCoverage" type="number" min={0} step={1_000_000} prefix="$" value={inputs.umbrellaCoverage || ""} className="w-full" onChange={(e) => handleChange("umbrellaCoverage", e.target.value)} />
          </div>
      </CollapsibleInputSection>

      <CollapsibleInputSection title="Optional Extended Asset Inputs" defaultOpen={false} contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="homeEquity" className="whitespace-nowrap">Home Equity</Label>
            <Input id="homeEquity" type="number" prefix="$" value={inputs.homeEquity || ""} className="w-full" onChange={(e) => handleChange("homeEquity", e.target.value)} />
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
      </CollapsibleInputSection>
    </div>
  )
}
