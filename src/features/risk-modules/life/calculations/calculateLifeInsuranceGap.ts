import { LifeInputs, LifeAssumptions, LifeOutputs } from "../types";
import { clamp, nonNegative, safeDivide, roundCurrency, roundPercent } from "@/lib/math";

export function calculateLifeInsuranceGap(
  inputs: LifeInputs, 
  assumptions: LifeAssumptions
): LifeOutputs {
  const replacementYears = Math.max(
    0,
    Math.min(
      nonNegative(inputs.incomeReplacementYears),
      nonNegative(inputs.retirementAge - inputs.currentAge)
    )
  );

  const incomeReplacementRatio = clamp(inputs.incomeReplacementRatio, 0, 1.25);
  const annualReplacementNeed = nonNegative(inputs.annualIncome) * incomeReplacementRatio;
  
  let futureIncomeLost = 0;
  if (assumptions.usePresentValue) {
    for (let year = 1; year <= replacementYears; year++) {
      const projectedNeed = annualReplacementNeed * Math.pow(1 + assumptions.incomeGrowthRateAnnual, year);
      const discountedNeed = projectedNeed / Math.pow(1 + assumptions.discountRateAnnual, year);
      futureIncomeLost += discountedNeed;
    }
  } else {
    futureIncomeLost = annualReplacementNeed * replacementYears;
  }

  const baseProtectionNeed =
    futureIncomeLost +
    nonNegative(inputs.debtsTotal) +
    nonNegative(inputs.educationGoal) +
    nonNegative(inputs.finalExpenses);

  const existingCoverageTotal =
    nonNegative(inputs.groupLifeCoverage) +
    nonNegative(inputs.privateLifeCoverage);

  const liquidAssetOffset = assumptions.includeLiquidAssetsOffset
    ? nonNegative(inputs.liquidAssetsAllocated)
    : 0;

  const availableResources = existingCoverageTotal + liquidAssetOffset;

  const remainingGap = Math.max(baseProtectionNeed - availableResources, 0);

  const coverageOffsetPercentage = safeDivide(availableResources, baseProtectionNeed);

  return {
    replacementYears,
    annualReplacementNeed: roundCurrency(annualReplacementNeed),
    futureIncomeLost: roundCurrency(futureIncomeLost),
    baseProtectionNeed: roundCurrency(baseProtectionNeed),
    existingCoverageTotal: roundCurrency(existingCoverageTotal),
    liquidAssetOffset: roundCurrency(liquidAssetOffset),
    availableResources: roundCurrency(availableResources),
    remainingGap: roundCurrency(remainingGap),
    coverageOffsetPercentage: roundPercent(coverageOffsetPercentage),
  };
}
