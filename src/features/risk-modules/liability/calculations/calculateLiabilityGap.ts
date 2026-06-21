import { LiabilityInputs, LiabilityOutputs } from "../types";
import { defaultLiabilityMethodologyAssumptions } from "@/domain/assumptions/defaultAssumptions";
import type { LiabilityExposurePoint } from "@/domain/gap-analysis/gapSchedule";

const DEFAULT_RETIREMENT_AGE = 65;

/**
 * Projects wage exposure from current age to retirement.
 * Applied to estimated disposable income, not gross income.
 */
function buildHouseholdExposureSchedule(
  primaryGrossIncome: number,
  primaryCurrentAge: number,
  spouseGrossIncome: number,
  spouseCurrentAge: number,
  retirementAge: number,
  incomeGrowthRate: number,
  garnishmentRate: number,
  disposableIncomeRatio: number,
): LiabilityExposurePoint[] {
  const primaryYears = Math.max(0, retirementAge - primaryCurrentAge);
  const spouseYears = Math.max(0, retirementAge - spouseCurrentAge);
  const years = Math.max(primaryYears, spouseYears);
  const schedule: LiabilityExposurePoint[] = [];
  let cumulativeExposure = 0;

  for (let yearIndex = 0; yearIndex < years; yearIndex++) {
    const growthFactor = Math.pow(1 + incomeGrowthRate, yearIndex);
    const primaryIncome = yearIndex < primaryYears ? Math.max(0, primaryGrossIncome) * growthFactor : 0;
    const spouseIncome = yearIndex < spouseYears ? Math.max(0, spouseGrossIncome) * growthFactor : 0;
    const grossIncome = primaryIncome + spouseIncome;
    const disposableIncome = grossIncome * disposableIncomeRatio;
    const garnishableIncome = disposableIncome * garnishmentRate;
    cumulativeExposure += garnishableIncome;

    schedule.push({
      yearIndex,
      // Label exposure by attained age at the end of the annual period.
      age: primaryCurrentAge + yearIndex + 1,
      grossIncome,
      disposableIncome,
      garnishableIncome,
      cumulativeExposure,
    });
  }

  return schedule;
}

export function calculateLiabilityGap(inputs: LiabilityInputs): LiabilityOutputs {
  const retirementAge = inputs.retirementAge ?? DEFAULT_RETIREMENT_AGE;
  const garnishmentRate = Math.max(0, Math.min(1, inputs.garnishmentRate ?? defaultLiabilityMethodologyAssumptions.wageGarnishmentRate));
  const incomeGrowthRate = Math.max(0, Math.min(1, inputs.incomeGrowthRate ?? defaultLiabilityMethodologyAssumptions.incomeGrowthRate));
  const disposableIncomeRatio = Math.max(0, Math.min(1, inputs.disposableIncomeRatio ?? defaultLiabilityMethodologyAssumptions.disposableIncomeRatio));
  const umbrellaBlockSize = defaultLiabilityMethodologyAssumptions.umbrellaBlockSize;

  const exposureSchedule = buildHouseholdExposureSchedule(
    inputs.annualIncome ?? 0,
    inputs.currentAge ?? 40,
    inputs.spouseAnnualIncome ?? 0,
    inputs.spouseCurrentAge ?? inputs.currentAge ?? 40,
    retirementAge,
    incomeGrowthRate,
    garnishmentRate,
    disposableIncomeRatio,
  );
  const householdWageGarnishmentRisk = exposureSchedule.at(-1)?.cumulativeExposure ?? 0;

  const homeEquity = Math.max(inputs.homeEquity ?? 0, 0);
  const investmentAssets = Math.max(inputs.investmentAssets ?? 0, 0);
  const savingsAssets = Math.max(inputs.savingsAssets ?? 0, 0);
  const businessOwnershipValue = Math.max(inputs.businessOwnershipValue ?? 0, 0);
  const extendedAssetsAtRisk = homeEquity + investmentAssets + savingsAssets + businessOwnershipValue;
  const legacyNonQualifiedAssets = Math.max(inputs.nonQualifiedAssets ?? 0, 0);
  const otherAssetsAtRisk = extendedAssetsAtRisk > 0 ? extendedAssetsAtRisk : legacyNonQualifiedAssets;

  const totalHouseholdLiabilityRisk = householdWageGarnishmentRisk + otherAssetsAtRisk;
  const householdAutoLiabilityCoverage = Math.max(inputs.autoLiabilityLimit ?? 0, 0);
  const householdUmbrellaCoverage = Math.max(inputs.umbrellaCoverage ?? 0, 0);
  const householdTotalCoverage = householdAutoLiabilityCoverage + householdUmbrellaCoverage;
  const householdLiabilityGap = Math.max(totalHouseholdLiabilityRisk - householdTotalCoverage, 0);

  const totalAtRiskAssets = otherAssetsAtRisk;
  const primaryCoverage = householdAutoLiabilityCoverage;
  const totalCoverage = primaryCoverage + householdUmbrellaCoverage;
  const totalExposure = totalHouseholdLiabilityRisk;
  const coverageGap = Math.max(totalExposure - totalCoverage, 0);
  const erodedAssets = Math.min(coverageGap, totalAtRiskAssets);
  const wealthErosionPercentage = totalAtRiskAssets > 0 ? erodedAssets / totalAtRiskAssets : 0;

  // Additional umbrella need is the remaining gap rounded up to the next
  // purchasable $1M policy block. A fully covered household has no added need.
  const neededUmbrellaCoverage = householdLiabilityGap > 0
    ? Math.ceil(householdLiabilityGap / umbrellaBlockSize) * umbrellaBlockSize
    : 0;
  const illustrativeUmbrellaCoverageLevel = householdUmbrellaCoverage + neededUmbrellaCoverage;
  const umbrellaCoverageShortfall = neededUmbrellaCoverage;

  return {
    exposureSchedule,
    homeEquity,
    totalAtRiskAssets,
    primaryCoverage,
    totalCoverage,
    exposureGap: coverageGap,
    erodedAssets,
    wealthErosionPercentage,
    householdWageGarnishmentRisk,
    nonQualifiedAssetsAtRisk: otherAssetsAtRisk,
    totalHouseholdLiabilityRisk,
    householdAutoLiabilityCoverage,
    householdUmbrellaCoverage,
    householdTotalCoverage,
    householdLiabilityGap,
    neededUmbrellaCoverage,
    illustrativeUmbrellaCoverageLevel,
    umbrellaCoverageShortfall,
    assumptionGarnishmentRate: garnishmentRate,
    assumptionIncomeGrowthRate: incomeGrowthRate,
    assumptionDisposableIncomeRatio: disposableIncomeRatio,
  };
}
