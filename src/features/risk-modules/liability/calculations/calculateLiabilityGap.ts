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
      age: primaryCurrentAge + yearIndex,
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

  const businessOwnershipValue = Math.max(inputs.businessOwnershipValue ?? 0, 0);
  const nonQualifiedAssetsAtRisk = Math.max(
    inputs.nonQualifiedAssets ?? inputs.investmentAssets + inputs.savingsAssets + businessOwnershipValue,
    0,
  );
  const totalHouseholdLiabilityRisk = householdWageGarnishmentRisk + nonQualifiedAssetsAtRisk;
  const householdAutoLiabilityCoverage = Math.max(inputs.autoLiabilityLimit ?? 0, 0);
  const householdUmbrellaCoverage = Math.max(inputs.umbrellaCoverage ?? 0, 0);
  const householdTotalCoverage = householdAutoLiabilityCoverage + householdUmbrellaCoverage;
  const householdLiabilityGap = Math.max(totalHouseholdLiabilityRisk - householdTotalCoverage, 0);

  const homeEquity = Math.max(inputs.homeEquity ?? 0, 0);
  const totalAtRiskAssets = Math.max(
    homeEquity + (inputs.investmentAssets ?? 0) + (inputs.savingsAssets ?? 0) + businessOwnershipValue,
    nonQualifiedAssetsAtRisk,
  );
  const primaryCoverage = householdAutoLiabilityCoverage;
  const totalCoverage = primaryCoverage + householdUmbrellaCoverage;
  const totalExposure = totalHouseholdLiabilityRisk;
  const coverageGap = Math.max(totalExposure - totalCoverage, 0);
  const erodedAssets = Math.min(coverageGap, totalAtRiskAssets);
  const wealthErosionPercentage = totalAtRiskAssets > 0 ? erodedAssets / totalAtRiskAssets : 0;

  const netWorthAtRisk = Math.max(nonQualifiedAssetsAtRisk + homeEquity, 0);
  const incomeMultipleTarget = Math.max((inputs.annualIncome ?? 0) * 5, 0);
  const modeledExposureAfterAuto = Math.max(totalHouseholdLiabilityRisk - householdAutoLiabilityCoverage, 0);
  const rawIllustrativeNeed = Math.max(
    modeledExposureAfterAuto,
    netWorthAtRisk,
    incomeMultipleTarget,
    umbrellaBlockSize,
  );
  const illustrativeUmbrellaCoverageLevel =
    Math.ceil(rawIllustrativeNeed / umbrellaBlockSize) * umbrellaBlockSize;
  const umbrellaCoverageShortfall = Math.max(illustrativeUmbrellaCoverageLevel - householdUmbrellaCoverage, 0);

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
    nonQualifiedAssetsAtRisk,
    totalHouseholdLiabilityRisk,
    householdAutoLiabilityCoverage,
    householdUmbrellaCoverage,
    householdTotalCoverage,
    householdLiabilityGap,
    illustrativeUmbrellaCoverageLevel,
    umbrellaCoverageShortfall,
    assumptionGarnishmentRate: garnishmentRate,
    assumptionIncomeGrowthRate: incomeGrowthRate,
    assumptionDisposableIncomeRatio: disposableIncomeRatio,
  };
}