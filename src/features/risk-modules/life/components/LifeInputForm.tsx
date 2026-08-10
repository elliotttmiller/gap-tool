import { LifeInputs } from "../types"
import { Label } from "@/components/ui/label"
import { Input, type InputProps } from "@/components/ui/input"
import { CollapsibleInputSection } from "@/components/ui/collapsible-input-section"


/** Convert a decimal rate (0.04) to a display percentage value (4). */
function toPercent(rate: number): number {
  return Math.round(rate * 1000) / 10
}

/** Convert a percentage input string ("4") back to a decimal rate (0.04). */
function fromPercent(value: string): number {
  if (value === "") return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed / 100 : 0
}

function parseFiniteOrZero(value: string): number {
  if (value === "") return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
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
    const numericValue = parseFiniteOrZero(value)
    onChange({ ...inputs, [field]: numericValue })
  }

  return (
    <div className="space-y-4">
      <CollapsibleInputSection title="Income Earner Information" contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4 sm:grid-cols-2">
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
            <AffixedInput id="incomeReplacementRatio" type="number" min={0} max={125} step={5} suffix="%" value={Math.round((inputs.incomeReplacementRatio ?? 0.7) * 100) || ""} className="w-full" onChange={(e) => onChange({ ...inputs, incomeReplacementRatio: fromPercent(e.target.value) })} />
          </div>
      </CollapsibleInputSection>

      <CollapsibleInputSection title="Existing Coverage" contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="groupLifeCoverage" className="whitespace-nowrap">Group Life Death Benefit</Label>
              <AffixedInput id="groupLifeCoverage" type="number" prefix="$" value={inputs.groupLifeCoverage || ""} className="w-full" onChange={(e) => handleNumberChange("groupLifeCoverage", e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="privateLifeCoverage" className="whitespace-nowrap">Private Life Death Benefit</Label>
              <AffixedInput id="privateLifeCoverage" type="number" prefix="$" value={inputs.privateLifeCoverage || ""} className="w-full" onChange={(e) => handleNumberChange("privateLifeCoverage", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nonQualifiedAssets" className="whitespace-nowrap">Non-Qualified Assets</Label>
              <AffixedInput id="nonQualifiedAssets" type="number" prefix="$" value={inputs.nonQualifiedAssets || ""} className="w-full" onChange={(e) => handleNumberChange("nonQualifiedAssets", e.target.value)} />
            </div>
          </div>
      </CollapsibleInputSection>

      <CollapsibleInputSection title="Income Gap Analysis" contentClassName="grid grid-cols-1 gap-3 px-5 pt-3 pb-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
                <Label htmlFor="netIncomeFactor">Net Income Factor</Label>
                <AffixedInput
                  id="netIncomeFactor"
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  suffix="%"
                  value={toPercent(inputs.netIncomeFactor ?? inputs.targetIncomeSupportPct ?? inputs.safeIncomeCoveragePct ?? 0.85) || ""}
                  className="w-full"
                  onChange={(e) => onChange({ ...inputs, netIncomeFactor: fromPercent(e.target.value) })}
                  placeholder="85"
                />
                <p className="text-[10px] leading-snug text-gray-500">Percentage of gross annual income used to calculate projected net income. Coverage support is then calculated from entered death benefit/resources.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="incomeGapRoi">PV Reference Rate</Label>
              <AffixedInput id="incomeGapRoi" type="number" min={0} max={25} step={0.5} suffix="%" value={toPercent(inputs.incomeGapRoi ?? 0.05) || ""} className="w-full" onChange={(e) => onChange({ ...inputs, incomeGapRoi: fromPercent(e.target.value) })} placeholder="5" />
              <p className="text-[10px] leading-snug text-gray-500">Used by both Safe Income Coverage and the Covered Runway Scenario.</p>
            </div>
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
            <Label htmlFor="spouseAnnualIncome">Spouse / Partner Income to Replace</Label>
            <AffixedInput id="spouseAnnualIncome" type="number" prefix="$" value={inputs.spouseAnnualIncome || ""} className="w-full" onChange={(e) => handleNumberChange("spouseAnnualIncome", e.target.value)} />
            <p className="text-[10px] leading-snug text-gray-500">Adds the spouse/partner's income to the modeled need when the plan should replace both incomes.</p>
          </div>
      </CollapsibleInputSection>
    </div>
  )
}
