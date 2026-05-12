import { UnemploymentInputForm } from "@/features/risk-modules/unemployment/components/UnemploymentInputForm"
import { UnemploymentOutputView } from "@/features/risk-modules/unemployment/components/UnemploymentOutputView"
import { calculateUnemploymentGap } from "@/features/risk-modules/unemployment/calculations/calculateUnemploymentGap"
import { DisclaimerBlock } from "@/components/global/DisclaimerBlock"
import { Button } from "@/components/Button"
import { RiSaveLine } from "@remixicon/react"
import { useAppStore } from "@/lib/store"
import { useParams } from "react-router-dom"

export function UnemploymentModulePage() {
  const { scenarioId } = useParams()
  const moduleState = useAppStore((state) =>
    scenarioId ? state.moduleRecordsByScenarioId[scenarioId]?.unemployment : undefined,
  )
  const updateInputs = useAppStore((state) => state.updateUnemploymentInputs)
  const saveCalculation = useAppStore((state) => state.saveUnemploymentCalculation)

  if (!scenarioId || !moduleState) {
    return (
      <div className="rounded-xl border border-dashed border-gray-800 p-8 text-center">
        <p className="text-sm text-gray-400">
          Unemployment module is not included in this scenario.
        </p>
      </div>
    )
  }

  const inputs = moduleState.inputs
  const outputs = calculateUnemploymentGap(inputs)

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-50">Unemployment & Liquidity Risk</h2>
          <p className="text-sm text-gray-400 mt-1">If I lose my job, how long can my reserves support my household?</p>
        </div>
        <Button
          variant="secondary"
          className="gap-2 w-full sm:w-auto"
          onClick={() => saveCalculation(scenarioId, outputs)}
        >
          <RiSaveLine className="size-4" aria-hidden="true" /> Save Scenario
        </Button>
      </div>

      <div className="grid xl:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
        <div className="xl:col-span-5 w-full">
          <UnemploymentInputForm inputs={inputs} onChange={(next) => updateInputs(scenarioId, next)} />
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
