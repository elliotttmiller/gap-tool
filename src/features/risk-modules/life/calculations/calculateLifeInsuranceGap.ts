import { LifeInputs, LifeAssumptions, LifeOutputs, LifeYearlyBreakdown } from "../types";
import { clamp, nonNegative, safeDivide, roundCurrency, roundPercent } from "@/lib/math";

/**
 * Core Life summary calculator.
 *
 * This now follows the same advisor-facing target support model used by the
 * Income Gap Analysis view so saved scenario gap values do not contradict the
 * visible Life Insurance page.
 */
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
  const targetIncomeSupportPct = clamp(inputs.targetIncomeSupportPct ?? inputs.safeIncomeCoveragePct ?? 0.85, 0, 1);
  const annualClientNeed = nonNegative(inputs.annualIncome) * incomeReplacementRatio;
  const annualSpouseOffset = nonNegative(inputs.spouseAnnualIncome ?? 0);
  const annualReplacementNeed = Math.max(0, annualClientNeed - annualSpouseOffset);
  const incomeGrowth = assumptions.incomeGrowthRateAnnual ?? 0.03;

  const yearlyBreakdown: LifeYearlyBreakdown[] = [];
  let projectedIncomeToRetirement = 0;
  let targetIncomeSupportTotal = 0;

  for (let yearIndex = 0; yearIndex < yearsToRetirement; yearIndex++) {
    const age = currentAge + yearIndex;
    const projectedIncome = annualReplacementNeed * Math.pow(1 + incomeGrowth, yearIndex);
    const targetNeed = projectedIncome * targetIncomeSupportPct;
    projectedIncomeToRetirement += projectedIncome;
    targetIncomeSupportTotal += targetNeed;

    yearlyBreakdown.push({
      age,
      totalNeed: roundCurrency(targetNeed),
      gliCovered: 0,
      privateCovered: 0,
      survivorGap: 0,
    });
  }

  const existingCoverageTotal = nonNegative(inputs.groupLifeCoverage) + nonNegative(inputs.privateLifeCoverage);
  const nonQualifiedAssets = nonNegative(inputs.nonQualifiedAssets ?? 0);
  const liquidAssetOffset = assumptions.includeLiquidAssetsOffset ? nonNegative(inputs.liquidAssetsAllocated) : 0;
  const availableResources = existingCoverageTotal + nonQualifiedAssets + liquidAssetOffset;

  const baseProtectionNeed =
    targetIncomeSupportTotal +
    nonNegative(inputs.debtsTotal) +
    nonNegative(inputs.educationGoal) +
    nonNegative(inputs.finalExpenses);

  const remainingGap = Math.max(baseProtectionNeed - availableResources, 0);
  const coverageOffsetPercentage = safeDivide(availableResources, baseProtectionNeed);

  // Allocate modeled coverage across yearly rows for legacy/presentation views.
  const coverageSupportRate = baseProtectionNeed > 0 ? Math.min(1, availableResources / baseProtectionNeed) : 1;
  let cumulativeSurvivorGap = 0;
  const allocatedBreakdown = yearlyBreakdown.map((point) => {
    const totalNeed = point.totalNeed;
    const covered = Math.min(totalNeed, totalNeed * coverageSupportRate);
    const groupShare = existingCoverageTotal > 0 ? nonNegative(inputs.groupLifeCoverage) / existingCoverageTotal : 0;
    const gliCovered = Math.min(covered * groupShare, totalNeed);
    const privateCovered = Math.min(covered - gliCovered, Math.max(0, totalNeed - gliCovered));
    const survivorGap = Math.max(0, totalNeed - covered);
    cumulativeSurvivorGap += survivorGap;
    return {
      age: point.age,
      totalNeed: roundCurrency(totalNeed),
      gliCovered: roundCurrency(gliCovered),
      privateCovered: roundCurrency(privateCovered),
      survivorGap: roundCurrency(survivorGap),
    };
  });

  return {
    replacementYears,
    annualReplacementNeed: roundCurrency(annualReplacementNeed),
    futureIncomeLost: roundCurrency(targetIncomeSupportTotal),
    baseProtectionNeed: roundCurrency(baseProtectionNeed),
    existingCoverageTotal: roundCurrency(existingCoverageTotal),
    liquidAssetOffset: roundCurrency(liquidAssetOffset + nonQualifiedAssets),
    availableResources: roundCurrency(availableResources),
    remainingGap: roundCurrency(remainingGap),
    coverageOffsetPercentage: roundPercent(coverageOffsetPercentage),
    yearlyBreakdown: allocatedBreakdown,
    projectedIncomeToRetirement: roundCurrency(projectedIncomeToRetirement),
    groupLifeCoverageYears: Math.round(yearsToRetirement),
    groupLifeBenefit: roundCurrency(nonNegative(inputs.groupLifeCoverage)),
    groupLifeAnnualIncome: roundCurrency(allocatedBreakdown[0]?.gliCovered ?? 0),
    privateLifeAnnualIncome: roundCurrency(allocatedBreakdown[0]?.privateCovered ?? 0),
    privateLifeBenefit: roundCurrency(nonNegative(inputs.privateLifeCoverage)),
    privateLifePolicyType: inputs.privateLifePolicyType ?? "term",
    privateLifeCoverageYears: Math.round(inputs.privateLifePolicyType === "permanent" ? yearsToRetirement : Math.min(nonNegative(inputs.privateLifeTermYears ?? yearsToRetirement), yearsToRetirement)),
    totalDeathBenefit: roundCurrency(existingCoverageTotal),
    cumulativeSurvivorGap: roundCurrency(cumulativeSurvivorGap || remainingGap),
    lifetimeIncomeUncoveredPercentage: roundPercent(safeDivide(cumulativeSurvivorGap || remainingGap, targetIncomeSupportTotal)),
    deathBenefitIncomeYieldAnnual: assumptions.deathBenefitIncomeYieldAnnual ?? 0.05,
  };
}