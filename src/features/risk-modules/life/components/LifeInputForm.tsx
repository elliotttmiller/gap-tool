import { LifeInputs, LifePolicyType } from "../types"
import { Label } from "@/components/ui/label"
import { Input, type InputProps } from "@/components/ui/input"
import { CollapsibleInputSection } from "@/components/ui/collapsible-input-section"

const selectClass = "flex h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-1 text-sm text-gray-50 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"

/** Convert a decimal rate (0.04) to a display percentage value (4). */
function toPercent(rate: number): number {
  return Math.round(rate * 1000) / 10
}

/** Convert a percentage input string ("4") back to a decimal rate (0.04). */
function fromPercent(value: string): number {
  return value === "" ? 0 : Number(value) / 100
}

interface LifeInputFormProps {
  inputs: LifeInputs
  onChange: (inputs: LifeInputs) => void
}

function AffixedInput({
  prefix,
  suffix,
  className,
  inputClassName,
  ...props
}: InputProps & { prefix?: string; suffix?: string; inputClassName?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      {prefix ? <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-500">{prefix}</span> : null}
      <Input {...props} className={`${prefix ? "pl-6" : ""} ${suffix ? "pr-10" : ""} ${inputClassName ?? ""}`} />
      {suffix ? <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-500">{suffix}</span> : null}
    </div>
  )
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

  const policyType = inputs.privateLifePolicyType ?? "term"

  return (
    <div className="space-y-4">
      <CollapsibleInputSection title="Income Earner Information" contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="earnerName">Full Name</Label>
            <Input
              id="earnerName"
              value={inputs.earnerName ?? ""}
              className="w-full"
              onChange={(e) => handleTextChange("earnerName", e.target.value)}
              placeholder="Primary Earner"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentAge">Current Age</Label>
            <Input id="currentAge" type="number" min={18} max={64} value={inputs.currentAge || ""} className="w-full" onChange={(e) => handleNumberChange("currentAge", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="annualIncome">Annual Income</Label>
            <AffixedInput id="annualIncome" type="number" prefix="$" value={inputs.annualIncome || ""} className="w-full" onChange={(e) => handleNumberChange("annualIncome", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="retirementAge">Projection End Age</Label>
            <Input id="retirementAge" type="number" value={inputs.retirementAge || ""} className="w-full" onChange={(e) => handleNumberChange("retirementAge", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="incomeReplacementRatio">Income Replacement</Label>
            <AffixedInput id="incomeReplacementRatio" type="number" min={0} max={125} step={5} suffix="%" value={Math.round((inputs.incomeReplacementRatio ?? 1) * 100) || ""} className="w-full" onChange={(e) => onChange({ ...inputs, incomeReplacementRatio: (e.target.value === "" ? 0 : Number(e.target.value)) / 100 })} />
          </div>
      </CollapsibleInputSection>

      <CollapsibleInputSection title="Existing Coverage" contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="groupLifeCoverage">Group Life (GLI) Death Benefit</Label>
            <AffixedInput id="groupLifeCoverage" type="number" prefix="$" value={inputs.groupLifeCoverage || ""} className="w-full" onChange={(e) => handleNumberChange("groupLifeCoverage", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="privateLifeCoverage">Private Life Insurance Death Benefit</Label>
            <AffixedInput id="privateLifeCoverage" type="number" prefix="$" value={inputs.privateLifeCoverage || ""} className="w-full" onChange={(e) => handleNumberChange("privateLifeCoverage", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="privateLifePolicyType">Policy Type</Label>
            <select
              id="privateLifePolicyType"
              value={policyType}
              onChange={(e) => handlePolicyTypeChange(e.target.value as LifePolicyType)}
              className={selectClass}
            >
              <option value="term">Term</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>
          {policyType === "term" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="privateLifeTermYears">Term Length</Label>
              <AffixedInput id="privateLifeTermYears" type="number" suffix="yr" value={inputs.privateLifeTermYears || ""} className="w-full" onChange={(e) => handleNumberChange("privateLifeTermYears", e.target.value)} />
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="nonQualifiedAssets">Non-Qualified Assets</Label>
            <AffixedInput id="nonQualifiedAssets" type="number" prefix="$" value={inputs.nonQualifiedAssets || ""} className="w-full" onChange={(e) => handleNumberChange("nonQualifiedAssets", e.target.value)} />
          </div>
      </CollapsibleInputSection>

      <CollapsibleInputSection title="Optional Advanced Life Needs" defaultOpen={false} contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="debtsTotal">Outstanding Debts</Label>
            <AffixedInput id="debtsTotal" type="number" prefix="$" value={inputs.debtsTotal || ""} className="w-full" onChange={(e) => handleNumberChange("debtsTotal", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="educationGoal">Education Funding Goal</Label>
            <AffixedInput id="educationGoal" type="number" prefix="$" value={inputs.educationGoal || ""} className="w-full" onChange={(e) => handleNumberChange("educationGoal", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="finalExpenses">Final Expenses</Label>
            <AffixedInput id="finalExpenses" type="number" prefix="$" value={inputs.finalExpenses || ""} className="w-full" onChange={(e) => handleNumberChange("finalExpenses", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="spouseAnnualIncome">Spouse / Partner Annual Income</Label>
            <AffixedInput id="spouseAnnualIncome" type="number" prefix="$" value={inputs.spouseAnnualIncome || ""} className="w-full" onChange={(e) => handleNumberChange("spouseAnnualIncome", e.target.value)} />
          </div>
      </CollapsibleInputSection>

      <CollapsibleInputSection title="Income Gap Analysis" contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="assetBase">Asset Base (Available for Income Replacement)</Label>
            <AffixedInput id="assetBase" type="number" prefix="$" value={inputs.assetBase ?? ""} className="w-full" onChange={(e) => handleNumberChange("assetBase", e.target.value)} placeholder="Total assets at death (investments, policy value, etc.)" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="safeWithdrawalRate">Safe Withdrawal Rate</Label>
            <AffixedInput id="safeWithdrawalRate" type="number" min={0} max={25} step={0.5} suffix="%" value={toPercent(inputs.safeWithdrawalRate ?? 0.04) || ""} className="w-full" onChange={(e) => onChange({ ...inputs, safeWithdrawalRate: fromPercent(e.target.value) })} placeholder="4" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="maxWithdrawalRate">Max Return / Draw Rate (Module 2)</Label>
            <AffixedInput id="maxWithdrawalRate" type="number" min={0} max={25} step={0.5} suffix="%" value={toPercent(inputs.maxWithdrawalRate ?? 0.06) || ""} className="w-full" onChange={(e) => onChange({ ...inputs, maxWithdrawalRate: fromPercent(e.target.value) })} placeholder="6" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="incomeGapRoi">ROI for Death Benefit Calc</Label>
            <AffixedInput id="incomeGapRoi" type="number" min={0} max={25} step={0.5} suffix="%" value={toPercent(inputs.incomeGapRoi ?? 0.05) || ""} className="w-full" onChange={(e) => onChange({ ...inputs, incomeGapRoi: fromPercent(e.target.value) })} placeholder="5" />
          </div>
      </CollapsibleInputSection>
    </div>
  )
}
