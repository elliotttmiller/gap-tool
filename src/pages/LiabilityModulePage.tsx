import { LiabilityInputForm } from "@/features/risk-modules/liability/components/LiabilityInputForm"
import { LiabilityOutputView } from "@/features/risk-modules/liability/components/LiabilityOutputView"
import { calculateLiabilityGap } from "@/features/risk-modules/liability/calculations/calculateLiabilityGap"
import { DisclaimerBlock } from "@/components/global/DisclaimerBlock"
import { Button } from "@/components/Button"
import { RiSaveLine } from "@remixicon/react"
import { useScenarioStore } from "@/lib/store"

export function LiabilityModulePage() {
  const inputs = useScenarioStore((state) => state.liabilityInputs)
  const setInputs = useScenarioStore((state) => state.setLiabilityInputs)
  
  const outputs = calculateLiabilityGap(inputs)

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-50">Liability & Asset Protection</h2>
          <p className="text-sm text-gray-400 mt-1">If I am sued, how much of my wealth is exposed and unprotected?</p>
        </div>
        <Button variant="secondary" className="gap-2 w-full sm:w-auto">
          <RiSaveLine className="size-4" aria-hidden="true" /> Save Scenario
        </Button>
      </div>

      <div className="grid xl:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
        <div className="xl:col-span-5 w-full">
          <LiabilityInputForm inputs={inputs} onChange={setInputs} />
        </div>
        <div className="xl:col-span-7 xl:sticky xl:top-6 w-full">
          <LiabilityOutputView outputs={outputs} />
        </div>
      </div>

      <div className="pt-6 sm:pt-8">
        <DisclaimerBlock />
      </div>
    </div>
  )
}
