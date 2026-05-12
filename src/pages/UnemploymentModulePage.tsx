import { UnemploymentInputForm } from "@/features/risk-modules/unemployment/components/UnemploymentInputForm"
import { UnemploymentOutputView } from "@/features/risk-modules/unemployment/components/UnemploymentOutputView"
import { calculateUnemploymentGap } from "@/features/risk-modules/unemployment/calculations/calculateUnemploymentGap"
import { DisclaimerBlock } from "@/components/global/DisclaimerBlock"
import { Button } from "@/components/Button"
import { RiSaveLine } from "@remixicon/react"
import { useScenarioStore } from "@/lib/store"

export function UnemploymentModulePage() {
  const inputs = useScenarioStore((state) => state.unemploymentInputs)
  const setInputs = useScenarioStore((state) => state.setUnemploymentInputs)
  
  const outputs = calculateUnemploymentGap(inputs)

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Unemployment & Liquidity Risk</h2>
          <p className="text-sm text-slate-500 mt-1">If I lose my job, how long will my reserves last before I run out of cash?</p>
        </div>
        <Button variant="secondary" className="gap-2 w-full sm:w-auto">
          <RiSaveLine className="size-4" aria-hidden="true" /> Save Scenario
        </Button>
      </div>

      <div className="grid xl:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
        <div className="xl:col-span-5 w-full">
          <UnemploymentInputForm inputs={inputs} onChange={setInputs} />
        </div>
        <div className="xl:col-span-7 xl:sticky xl:top-6 w-full">
          <UnemploymentOutputView outputs={outputs} />
        </div>
      </div>

      <div className="pt-6 sm:pt-8">
        <DisclaimerBlock />
      </div>
    </div>
  )
}
