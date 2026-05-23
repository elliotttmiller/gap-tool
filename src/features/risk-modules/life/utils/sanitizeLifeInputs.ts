import type { LifeInputs } from "../types"

function finiteOrFallback(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function nonNegativeFinite(value: unknown, fallback: number): number {
  return Math.max(0, finiteOrFallback(value, fallback))
}

/**
 * Guards Life inputs against persisted/typed NaN values that can crash strict
 * calculators (notably income-gap ROI and withdrawal rates).
 */
export function sanitizeLifeInputs(inputs: LifeInputs): LifeInputs {
  return {
    ...inputs,
    currentAge: nonNegativeFinite(inputs.currentAge, 40),
    retirementAge: nonNegativeFinite(inputs.retirementAge, 65),
    annualIncome: nonNegativeFinite(inputs.annualIncome, 0),
    spouseAnnualIncome: nonNegativeFinite(inputs.spouseAnnualIncome, 0),
    incomeReplacementYears: nonNegativeFinite(inputs.incomeReplacementYears, 0),
    incomeReplacementRatio: nonNegativeFinite(inputs.incomeReplacementRatio, 1),
    groupLifeCoverage: nonNegativeFinite(inputs.groupLifeCoverage, 0),
    privateLifeCoverage: nonNegativeFinite(inputs.privateLifeCoverage, 0),
    privateLifeTermYears: nonNegativeFinite(inputs.privateLifeTermYears ?? 0, 0),
    nonQualifiedAssets: nonNegativeFinite(inputs.nonQualifiedAssets ?? 0, 0),
    debtsTotal: nonNegativeFinite(inputs.debtsTotal, 0),
    educationGoal: nonNegativeFinite(inputs.educationGoal, 0),
    finalExpenses: nonNegativeFinite(inputs.finalExpenses, 0),
    liquidAssetsAllocated: nonNegativeFinite(inputs.liquidAssetsAllocated ?? 0, 0),
    assetBase: nonNegativeFinite(inputs.assetBase ?? 0, 0),
    safeWithdrawalRate: nonNegativeFinite(inputs.safeWithdrawalRate ?? 0.04, 0.04),
    maxWithdrawalRate: nonNegativeFinite(inputs.maxWithdrawalRate ?? 0.06, 0.06),
    incomeGapRoi: nonNegativeFinite(inputs.incomeGapRoi ?? 0.05, 0.05),
  }
}
