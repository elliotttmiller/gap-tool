import { useEffect, useMemo } from "react"
import { DisabilityInputForm } from "@/features/risk-modules/disability/components/DisabilityInputForm"
import { DisabilityOutputView } from "@/features/risk-modules/disability/components/DisabilityOutputView"
import { calculateDisabilityGap } from "@/features/risk-modules/disability/calculations/calculateDisabilityGap"
import { useAppStore } from "@/lib/store"
import { useParams } from "react-router-dom"
import { RiskModulePage, ModuleNotIncluded } from "./RiskModulePage"

export function DisabilityModulePage() {
  const { scenarioId } = useParams()
  const moduleState = useAppStore((state) =>
    scenarioId ? state.moduleRecordsByScenarioId[scenarioId]?.disability : undefined,
  )
  const updateInputs = useAppStore((state) => state.updateDisabilityInputs)
  const saveCalculation = useAppStore((state) => state.saveDisabilityCalculation)

  const outputs = useMemo(
    () => moduleState ? calculateDisabilityGap(moduleState.inputs, moduleState.assumptions) : null,
    [moduleState?.inputs, moduleState?.assumptions],
  )

  useEffect(() => {
    if (scenarioId && outputs) {
      saveCalculation(scenarioId, outputs)
    }
  }, [scenarioId, outputs, saveCalculation])

  if (!scenarioId || !moduleState || !outputs) {
    return <ModuleNotIncluded moduleName="Disability" />
  }

  return (
    <RiskModulePage
      title="Disability Insurance Risk Analysis"
      subtitle="If I cannot work due to illness or injury, how does my financial plan change?"
      formSlot={<DisabilityInputForm inputs={moduleState.inputs} onChange={(next) => updateInputs(scenarioId, next)} />}
      outputSlot={(inputsOpen, setInputsOpen) => (
        <DisabilityOutputView
          outputs={outputs}
          inputs={moduleState.inputs}
          formOpen={inputsOpen}
          onVisualizationChange={(v) => {
            if (v === "premiumVsSelfInsured" || v === "jobComparison") {
              setInputsOpen(false)
            } else {
              setInputsOpen(true)
            }
          }}
        />
      )}
    />
  )
}
