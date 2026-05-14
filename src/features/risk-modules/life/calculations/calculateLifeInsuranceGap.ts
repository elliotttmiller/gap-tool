import { LifeInputs, LifeAssumptions, LifeOutputs, LifeYearlyBreakdown } from "../types";
import { clamp, nonNegative, safeDivide, roundCurrency, roundPercent } from "@/lib/math";

function annuityPayment(presentValue: number, annualRate: number, years: number): number {
  const pv = nonNegative(presentValue);
  const n = Math.max(0, Math.floor(nonNegative(years)));
  if (!pv || !n) return 0;
  if (annualRate === 0) return pv / n;
  return (pv * annualRate) / (1 - Math.pow(1 + annualRate, -n));
}

export function calculateLifeInsuranceGap(
  inputs: LifeInputs,
  assumptions: LifeAssumptions
): LifeOutputs {
  const currentAge = nonNegative(inputs.currentAge);
  const retirementAge = nonNegative(inputs.retirementAge || 65);
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const replacementYears = Math.max(
    0,
    Math.min(nonNegative(inputs.incomeReplacementYears || yearsToRetirement), yearsToRetirement)
  );

  const incomeReplacementRatio = clamp(inputs.incomeReplacementRatio, 0, 1.25);
  const annualClientNeed = nonNegative(inputs.annualIncome) * incomeReplacementRatio;
  const annualSpouseOffset = nonNegative(inputs.spouseAnnualIncome ?? 0);
  const annualReplacementNeed = Math.max(0, annualClientNeed - annualSpouseOffset);

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

  const existingCoverageTotal = nonNegative(inputs.groupLifeCoverage) + nonNegative(inputs.privateLifeCoverage);
  const liquidAssetOffset = assumptions.includeLiquidAssetsOffset ? nonNegative(inputs.liquidAssetsAllocated) : 0;
  const availableResources = existingCoverageTotal + liquidAssetOffset;
  const remainingGap = Math.max(baseProtectionNeed - availableResources, 0);
  const coverageOffsetPercentage = safeDivide(availableResources, baseProtectionNeed);

  const yearlyBreakdown: LifeYearlyBreakdown[] = [];
  const gli = nonNegative(inputs.groupLifeCoverage);
  const privateLife = nonNegative(inputs.privateLifeCoverage);
  const incomeGrowth = assumptions.incomeGrowthRateAnnual ?? 0.03;
  const incomeYield = assumptions.deathBenefitIncomeYieldAnnual ?? 0.05;
  const privateLifeCoverageYears = inputs.privateLifePolicyType === "permanent"
    ? yearsToRetirement
    : Math.min(nonNegative(inputs.privateLifeTermYears ?? yearsToRetirement), yearsToRetirement);
  const groupLifeCoverageYears = yearsToRetirement;
  const groupLifeAnnualIncome = annuityPayment(gli, incomeYield, Math.max(1, groupLifeCoverageYears));
  const privateLifeAnnualIncome = annuityPayment(privateLife, incomeYield, Math.max(1, privateLifeCoverageYears));

  let projectedIncomeToRetirement = 0;
  let cumulativeSurvivorGap = 0;

  for (let yearIndex = 0; yearIndex < yearsToRetirement; yearIndex++) {
    const age = currentAge + yearIndex;
    const projectedIncome = nonNegative(inputs.annualIncome) * Math.pow(1 + incomeGrowth, yearIndex);
    const gliCovered = yearIndex < groupLifeCoverageYears ? Math.min(groupLifeAnnualIncome, projectedIncome) : 0;
    const privateCovered = yearIndex < privateLifeCoverageYears
      ? Math.min(privateLifeAnnualIncome, Math.max(0, projectedIncome - gliCovered))
      : 0;
    const survivorGap = Math.max(0, projectedIncome - gliCovered - privateCovered);

    projectedIncomeToRetirement += projectedIncome;
    cumulativeSurvivorGap += survivorGap;

    yearlyBreakdown.push({
      age,
      totalNeed: roundCurrency(projectedIncome),
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
    remainingGap: roundCurrency(cumulativeSurvivorGap || remainingGap),
    coverageOffsetPercentage: roundPercent(coverageOffsetPercentage),
    yearlyBreakdown,
    projectedIncomeToRetirement: roundCurrency(projectedIncomeToRetirement),
  groupLifeCoverageYears: Math.round(groupLifeCoverageYears),
  groupLifeBenefit: roundCurrency(gli),
    groupLifeAnnualIncome: roundCurrency(groupLifeAnnualIncome),
    privateLifeAnnualIncome: roundCurrency(privateLifeAnnualIncome),
  privateLifeBenefit: roundCurrency(privateLife),
    privateLifePolicyType: inputs.privateLifePolicyType ?? "term",
    privateLifeCoverageYears: Math.round(privateLifeCoverageYears),
    totalDeathBenefit: roundCurrency(existingCoverageTotal),
    cumulativeSurvivorGap: roundCurrency(cumulativeSurvivorGap),
    lifetimeIncomeUncoveredPercentage: roundPercent(safeDivide(cumulativeSurvivorGap, projectedIncomeToRetirement)),
    deathBenefitIncomeYieldAnnual: incomeYield,
  };
}
