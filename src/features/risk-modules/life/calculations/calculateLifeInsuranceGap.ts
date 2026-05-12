import { LifeInputs, LifeAssumptions, LifeOutputs, LifeYearlyBreakdown } from "../types";
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

  // Build year-by-year breakdown: for each age from currentAge to retirementAge-1,
  // model "if death occurred at this age, what is the total income need vs coverage?"
  const yearlyBreakdown: LifeYearlyBreakdown[] = [];
  const gli = nonNegative(inputs.groupLifeCoverage);
  const privateLife = nonNegative(inputs.privateLifeCoverage);

  for (let age = inputs.currentAge; age < inputs.retirementAge; age++) {
    const yearsRemaining = inputs.retirementAge - age;
    let totalNeed: number;
    if (assumptions.usePresentValue) {
      let pv = 0;
      for (let yr = 1; yr <= yearsRemaining; yr++) {
        pv += (annualReplacementNeed * Math.pow(1 + assumptions.incomeGrowthRateAnnual, yr))
          / Math.pow(1 + assumptions.discountRateAnnual, yr);
      }
      totalNeed = pv;
    } else {
      totalNeed = annualReplacementNeed * yearsRemaining;
    }
    const gliCovered = Math.min(gli, totalNeed);
    const privateCovered = Math.min(privateLife, Math.max(0, totalNeed - gliCovered));
    const survivorGap = Math.max(0, totalNeed - gliCovered - privateCovered);
    yearlyBreakdown.push({
      age,
      totalNeed: roundCurrency(totalNeed),
      gliCovered: roundCurrency(gliCovered),
      privateCovered: roundCurrency(privateCovered),
      survivorGap: roundCurrency(survivorGap),
    });
  }

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
    yearlyBreakdown,
  };
}
