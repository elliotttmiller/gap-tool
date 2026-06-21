import assert from "node:assert/strict"
import { calculateLiabilityGap } from "../src/features/risk-modules/liability/calculations/calculateLiabilityGap"
import { calculateUnemploymentGap } from "../src/features/risk-modules/unemployment/calculations/calculateUnemploymentGap"
import { calculateIncomeGapScenarios } from "../src/features/risk-modules/life/calculations/calculateIncomeGapScenarios"

function approximately(actual: number, expected: number, tolerance = 0.01): void {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`,
  )
}

const lifeBaseInputs = {
  currentAge: 40,
  retirementAge: 65,
  annualIncome: 200_000,
  spouseAnnualIncome: 0,
  incomeReplacementYears: 25,
  incomeReplacementRatio: 0.7,
  groupLifeCoverage: 300_000,
  privateLifeCoverage: 500_000,
  privateLifePolicyType: "term" as const,
  privateLifeTermYears: 20,
  nonQualifiedAssets: 0,
  debtsTotal: 0,
  educationGoal: 0,
  finalExpenses: 0,
  targetIncomeSupportPct: 0.85,
  maxCoverageRoi: 0.06,
  incomeGapRoi: 0.06,
}
const lifeAssumptions = {
  inflationRateAnnual: 0.03,
  discountRateAnnual: 0.04,
  incomeGrowthRateAnnual: 0.03,
  usePresentValue: true,
  includeLiquidAssetsOffset: false,
  deathBenefitTaxTreatment: "generally_income_tax_free" as const,
}
const lifeAt70 = calculateIncomeGapScenarios(lifeBaseInputs, lifeAssumptions)
const lifeAt80 = calculateIncomeGapScenarios({ ...lifeBaseInputs, incomeReplacementRatio: 0.8 }, lifeAssumptions)
assert.ok(lifeAt80.module1.projectedNetIncomeTotal > lifeAt70.module1.projectedNetIncomeTotal)
assert.ok(lifeAt80.module1.targetIncomeSupportTotal > lifeAt70.module1.targetIncomeSupportTotal)
approximately(lifeAt70.module1.yearlyData[0].projectedIncome, 140_000)
approximately(lifeAt70.module1.yearlyData[0].targetIncomeNeed, 119_000)

const unemployment = calculateUnemploymentGap({
  annualIncome: 300_000,
  spouseIncome: 100_000,
  monthlyExpenses: 20_000,
  emergencySavings: 60_000,
  severanceMonthly: 0,
  severanceDurationMonths: 0,
  unemploymentBenefitMonthly: 0,
  unemploymentBenefitDurationMonths: 0,
  estimatedJobSearchMonths: 6,
  netIncomeRatio: 0.65,
})

approximately(unemployment.remainingIncome, 5_416.67)
approximately(unemployment.monthlyExpenseReplacement, 14_583.33)
approximately(unemployment.minimumReserveTarget, 43_750)
approximately(unemployment.idealReserveTarget, 87_500)
assert.equal(unemployment.idealReserveMonths, 6)
approximately(unemployment.reserveMonthsCurrent, 60_000 / 14_583.333333333334)

for (const [spouseIncome, expectedMonths] of [
  [122_000, 5],
  [185_000, 4],
  [250_000, 3],
] as const) {
  const tieredResult = calculateUnemploymentGap({
    ...{
      annualIncome: 300_000,
      monthlyExpenses: 20_000,
      emergencySavings: 60_000,
      severanceMonthly: 0,
      severanceDurationMonths: 0,
      unemploymentBenefitMonthly: 0,
      unemploymentBenefitDurationMonths: 0,
      estimatedJobSearchMonths: 6,
      netIncomeRatio: 0.65,
    },
    spouseIncome,
  })
  assert.equal(tieredResult.idealReserveMonths, expectedMonths)
  approximately(
    tieredResult.idealReserveTarget,
    tieredResult.monthlyExpenseReplacement * expectedMonths,
  )
}

const liabilityInputs = {
  annualIncome: 0,
  spouseAnnualIncome: 0,
  currentAge: 40,
  spouseCurrentAge: 40,
  retirementAge: 65,
  homeEquity: 2_800_000,
  investmentAssets: 0,
  savingsAssets: 0,
  businessOwnershipValue: 0,
  nonQualifiedAssets: 0,
  autoLiabilityLimit: 500_000,
  umbrellaCoverage: 1_000_000,
}

const liability = calculateLiabilityGap(liabilityInputs)
assert.equal(liability.householdTotalCoverage, 1_500_000)
assert.equal(liability.householdLiabilityGap, 1_300_000)
assert.equal(liability.neededUmbrellaCoverage, 2_000_000)
assert.equal(liability.umbrellaCoverageShortfall, liability.neededUmbrellaCoverage)

const fullyCoveredLiability = calculateLiabilityGap({
  ...liabilityInputs,
  homeEquity: 0,
})
assert.equal(fullyCoveredLiability.totalHouseholdLiabilityRisk, 0)
assert.equal(fullyCoveredLiability.householdLiabilityGap, 0)
assert.equal(fullyCoveredLiability.neededUmbrellaCoverage, 0)

console.log("Advisor formula regression checks passed.")
