import { useMemo } from "react"
import { LifeInputForm } from "@/features/risk-modules/life/components/LifeInputForm"
import { LifeOutputView } from "@/features/risk-modules/life/components/LifeOutputView"
import { calculateLifeInsuranceGap } from "@/features/risk-modules/life/calculations/calculateLifeInsuranceGap"
import { useAppStore } from "@/lib/store"
import { useParams } from "react-router-dom"
import { RiskModulePage, ModuleNotIncluded } from "./RiskModulePage"

export function LifeModulePage() {
  const { scenarioId } = useParams()
  const moduleState = useAppStore((state) =>
    scenarioId ? state.moduleRecordsByScenarioId[scenarioId]?.life : undefined,
  )
  const updateInputs = useAppStore((state) => state.updateLifeInputs)
  const saveCalculation = useAppStore((state) => state.saveLifeCalculation)

  const outputs = useMemo(
    () => moduleState ? calculateLifeInsuranceGap(moduleState.inputs, moduleState.assumptions) : null,
    [moduleState],
  )

  if (!scenarioId || !moduleState || !outputs) {
    return <ModuleNotIncluded moduleName="Life" />
  }

  return (
    <RiskModulePage
      title="Life Insurance Risk Analysis"
      subtitle="If I die prematurely, what financial support disappears for my family?"
      onSave={() => saveCalculation(scenarioId, outputs)}
      formSlot={<LifeInputForm inputs={moduleState.inputs} onChange={(next) => updateInputs(scenarioId, next)} />}
      outputSlot={<LifeOutputView outputs={outputs} />}
    />
  )
}
