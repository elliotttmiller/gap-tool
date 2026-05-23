import { useEffect, useMemo, useState } from "react"
import { LifeInputForm } from "@/features/risk-modules/life/components/LifeInputForm"
import { LifeOutputView } from "@/features/risk-modules/life/components/LifeOutputView"
import { calculateLifeInsuranceGap } from "@/features/risk-modules/life/calculations/calculateLifeInsuranceGap"
import { calculateIncomeGapScenarios } from "@/features/risk-modules/life/calculations/calculateIncomeGapScenarios"
import { sanitizeLifeInputs } from "@/features/risk-modules/life/utils/sanitizeLifeInputs"
import { useAppStore } from "@/lib/store"
import { useParams } from "react-router-dom"
import { RiskModulePage, ModuleNotIncluded } from "./RiskModulePage"

export function LifeModulePage() {
  const [incomeGapTab, setIncomeGapTab] = useState<"safe" | "max">("safe")
  const { scenarioId } = useParams()
  const moduleState = useAppStore((state) =>
    scenarioId ? state.moduleRecordsByScenarioId[scenarioId]?.life : undefined,
  )
  const updateInputs = useAppStore((state) => state.updateLifeInputs)
  const saveCalculation = useAppStore((state) => state.saveLifeCalculation)

  const outputs = useMemo(
    () => moduleState ? calculateLifeInsuranceGap(sanitizeLifeInputs(moduleState.inputs), moduleState.assumptions) : null,
    [moduleState?.inputs, moduleState?.assumptions],
  )

  const incomeGapOutputs = useMemo(
    () => moduleState ? calculateIncomeGapScenarios(sanitizeLifeInputs(moduleState.inputs), moduleState.assumptions) : null,
    [moduleState?.inputs, moduleState?.assumptions],
  )

  useEffect(() => {
    if (scenarioId && outputs) {
      saveCalculation(scenarioId, outputs)
    }
  }, [scenarioId, outputs, saveCalculation])

  if (!scenarioId || !moduleState || !outputs || !incomeGapOutputs) {
    return <ModuleNotIncluded moduleName="Life" />
  }

  return (
    <RiskModulePage
      title="Life Insurance Risk Analysis"
      subtitle="If I die prematurely, what financial support disappears for my family?"
      formSlot={<LifeInputForm inputs={moduleState.inputs} onChange={(next) => updateInputs(scenarioId, next)} showMaxWithdrawalRateInput={incomeGapTab === "max"} />}
      outputSlot={<LifeOutputView outputs={outputs} inputs={moduleState.inputs} assumptions={moduleState.assumptions} incomeGapOutputs={incomeGapOutputs} activeTab={incomeGapTab} onActiveTabChange={setIncomeGapTab} />}
    />
  )
}
