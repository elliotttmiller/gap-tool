import type { LifeInputs } from "../types"

function finiteOrFallback(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function nonNegativeFinite(value: unknown, fallback: number): number {
  return Math.max(0, finiteOrFallback(value, fallback))
}

export function sanitizeLifeInputs(inputs: LifeInputs): LifeInputs {
  const targetIncomeSupportPct = nonNegativeFinite(
    inputs.targetIncomeSupportPct ?? inputs.safeIncomeCoveragePct ?? 0.85,
    0.85,
  )

  return {
    ...inputs,
    currentAge: nonNegativeFinite(inputs.currentAge, 40),
    retirementAge: nonNegativeFinite(inputs.retirementAge, 65),
    annualIncome: nonNegativeFinite(inputs.annualIncome, 0),
    spouseAnnualIncome: nonNegativeFinite(inputs.spouseAnnualIncome, 0),
    incomeReplacementYears: nonNegativeFinite(inputs.incomeReplacementYears, 0),
    incomeReplacementRatio: nonNegativeFinite(inputs.incomeReplacementRatio, 0.7),
    groupLifeCoverage: nonNegativeFinite(inputs.groupLifeCoverage, 0),
    privateLifeCoverage: nonNegativeFinite(inputs.privateLifeCoverage, 0),
    privateLifeTermYears: nonNegativeFinite(inputs.privateLifeTermYears ?? 0, 0),
    nonQualifiedAssets: nonNegativeFinite(inputs.nonQualifiedAssets ?? 0, 0),
    debtsTotal: nonNegativeFinite(inputs.debtsTotal, 0),
    educationGoal: nonNegativeFinite(inputs.educationGoal, 0),
    finalExpenses: nonNegativeFinite(inputs.finalExpenses, 0),
    liquidAssetsAllocated: nonNegativeFinite(inputs.liquidAssetsAllocated ?? 0, 0),
    targetIncomeSupportPct,
    safeIncomeCoveragePct: targetIncomeSupportPct,
    maxCoverageRoi: nonNegativeFinite(inputs.maxCoverageRoi ?? 0.06, 0.06),
    incomeGapRoi: nonNegativeFinite(inputs.incomeGapRoi ?? 0.05, 0.05),
  }
}