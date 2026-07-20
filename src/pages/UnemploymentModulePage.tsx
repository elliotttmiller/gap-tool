import { useEffect, useMemo } from "react"
import { UnemploymentInputForm } from "@/features/risk-modules/unemployment/components/UnemploymentInputForm"
import { UnemploymentOutputView } from "@/features/risk-modules/unemployment/components/UnemploymentOutputView"
import { calculateUnemploymentGap } from "@/features/risk-modules/unemployment/calculations/calculateUnemploymentGap"
import { useAppStore } from "@/lib/store"
import { useParams } from "react-router-dom"
import { RiskModulePage, ModuleNotIncluded } from "./RiskModulePage"

export function UnemploymentModulePage() {
  const { scenarioId } = useParams()
  const moduleState = useAppStore((state) =>
    scenarioId ? state.moduleRecordsByScenarioId[scenarioId]?.unemployment : undefined,
  )
  const updateInputs = useAppStore((state) => state.updateUnemploymentInputs)
  const saveCalculation = useAppStore((state) => state.saveUnemploymentCalculation)

  const outputs = useMemo(
    () => moduleState ? calculateUnemploymentGap(moduleState.inputs) : null,
    [moduleState?.inputs],
  )

  useEffect(() => {
    if (scenarioId && outputs) {
      saveCalculation(scenarioId, outputs)
    }
  }, [scenarioId, outputs, saveCalculation])

  if (!scenarioId || !moduleState || !outputs) {
    return <ModuleNotIncluded moduleName="Unemployment" />
  }

  return (
    <RiskModulePage
      title="Unemployment & Liquidity Risk"
      subtitle="If I lose my job, how long can my reserves support my household?"
      formSlot={<UnemploymentInputForm inputs={moduleState.inputs} onChange={(next) => updateInputs(scenarioId, next)} />}
      outputSlot={(
        <UnemploymentOutputView
          outputs={outputs}
          onReserveLevelChange={(emergencySavings) =>
            updateInputs(scenarioId, { ...moduleState.inputs, emergencySavings })
          }
        />
      )}
    />
  )
}
