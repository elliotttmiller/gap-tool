import { DisabilityInputForm } from "@/features/risk-modules/disability/components/DisabilityInputForm"
import { DisabilityOutputView } from "@/features/risk-modules/disability/components/DisabilityOutputView"
import { calculateDisabilityGap } from "@/features/risk-modules/disability/calculations/calculateDisabilityGap"
import { DisclaimerBlock } from "@/components/global/DisclaimerBlock"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { useScenarioStore } from "@/lib/store"

export function DisabilityModulePage() {
  const inputs = useScenarioStore((state) => state.disabilityInputs)
  const setInputs = useScenarioStore((state) => state.setDisabilityInputs)
  const assumptions = useScenarioStore((state) => state.disabilityAssumptions)

  const outputs = calculateDisabilityGap(inputs, assumptions)

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Disability Insurance Risk Analysis</h2>
          <p className="text-sm text-slate-500 mt-1">If I cannot work due to illness or injury, how does my financial plan change?</p>
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto shadow-sm">
          <Save className="w-4 h-4 text-slate-400" /> Save Scenario
        </Button>
      </div>

      <div className="grid xl:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
        <div className="xl:col-span-5 w-full">
          <DisabilityInputForm inputs={inputs} onChange={setInputs} />
        </div>
        <div className="xl:col-span-7 xl:sticky xl:top-6 w-full">
          <DisabilityOutputView outputs={outputs} />
        </div>
      </div>

      <div className="pt-6 sm:pt-8">
        <DisclaimerBlock />
      </div>
    </div>
  )
}
