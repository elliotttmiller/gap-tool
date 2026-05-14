import { useMemo } from "react"
import { LiabilityInputForm } from "@/features/risk-modules/liability/components/LiabilityInputForm"
import { LiabilityOutputView } from "@/features/risk-modules/liability/components/LiabilityOutputView"
import { calculateLiabilityGap } from "@/features/risk-modules/liability/calculations/calculateLiabilityGap"
import { useAppStore } from "@/lib/store"
import { useParams } from "react-router-dom"
import { RiskModulePage, ModuleNotIncluded } from "./RiskModulePage"

export function LiabilityModulePage() {
  const { scenarioId } = useParams()
  const moduleState = useAppStore((state) =>
    scenarioId ? state.moduleRecordsByScenarioId[scenarioId]?.liability : undefined,
  )
  const updateInputs = useAppStore((state) => state.updateLiabilityInputs)
  const saveCalculation = useAppStore((state) => state.saveLiabilityCalculation)

  const outputs = useMemo(
    () => moduleState ? calculateLiabilityGap(moduleState.inputs) : null,
    [moduleState],
  )

  if (!scenarioId || !moduleState || !outputs) {
    return <ModuleNotIncluded moduleName="Liability" />
  }

  return (
    <RiskModulePage
      title="Liability / Lawsuit Risk Analysis"
      subtitle="If I face a lawsuit, what assets or wealth could be exposed?"
      onSave={() => saveCalculation(scenarioId, outputs)}
      formSlot={<LiabilityInputForm inputs={moduleState.inputs} onChange={(next) => updateInputs(scenarioId, next)} />}
      outputSlot={<LiabilityOutputView outputs={outputs} />}
    />
  )
}
