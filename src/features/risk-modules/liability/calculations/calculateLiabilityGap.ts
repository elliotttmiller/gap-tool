import { LiabilityInputs, LiabilityOutputs } from "../types";

const DEFAULT_RETIREMENT_AGE = 65;
const DEFAULT_INCOME_GROWTH = 0.03;
const DEFAULT_GARNISHMENT_RATE = 0.25;
const DEFAULT_DISPOSABLE_INCOME_RATIO = 0.65;
const UMBRELLA_BLOCK_SIZE = 1_000_000;

/**
 * Projects the wage garnishment exposure from current age to retirement.
 *
 * Garnishment is applied to DISPOSABLE income (a proxy for take-home pay),
 * not to gross income. Disposable income = grossIncome × disposableIncomeRatio.
 * Income grows at incomeGrowthRate each year.
 */
function projectedIncomeRiskToRetirement(
  grossIncome: number,
  currentAge: number,
  retirementAge: number,
  incomeGrowthRate: number,
  garnishmentRate: number,
  disposableIncomeRatio: number,
): number {
  const years = Math.max(0, retirementAge - currentAge);
  const disposableIncome = Math.max(0, grossIncome) * disposableIncomeRatio;
  let risk = 0;
  for (let year = 0; year < years; year++) {
    risk += disposableIncome * Math.pow(1 + incomeGrowthRate, year) * garnishmentRate;
  }
  return risk;
}

export function calculateLiabilityGap(inputs: LiabilityInputs): LiabilityOutputs {
  const retirementAge = inputs.retirementAge ?? DEFAULT_RETIREMENT_AGE;
  const garnishmentRate = Math.max(0, Math.min(1, inputs.garnishmentRate ?? DEFAULT_GARNISHMENT_RATE));
  const incomeGrowthRate = Math.max(0, Math.min(1, inputs.incomeGrowthRate ?? DEFAULT_INCOME_GROWTH));
  const disposableIncomeRatio = Math.max(0, Math.min(1, inputs.disposableIncomeRatio ?? DEFAULT_DISPOSABLE_INCOME_RATIO));

  const primaryIncomeRisk = projectedIncomeRiskToRetirement(
    inputs.annualIncome ?? 0,
    inputs.currentAge ?? 40,
    retirementAge,
    incomeGrowthRate,
    garnishmentRate,
    disposableIncomeRatio,
  );
  const spouseIncomeRisk = projectedIncomeRiskToRetirement(
    inputs.spouseAnnualIncome ?? 0,
    inputs.spouseCurrentAge ?? inputs.currentAge ?? 40,
    retirementAge,
    incomeGrowthRate,
    garnishmentRate,
    disposableIncomeRatio,
  );
  const householdWageGarnishmentRisk = primaryIncomeRisk + spouseIncomeRisk;

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

  // Home equity: use direct homeEquity input when provided; otherwise default to 0.
  const homeEquity = Math.max(inputs.homeEquity ?? 0, 0);

  const totalAtRiskAssets = Math.max(homeEquity + (inputs.investmentAssets ?? 0) + (inputs.savingsAssets ?? 0) + businessOwnershipValue, nonQualifiedAssetsAtRisk);
  const primaryCoverage = Math.max(inputs.autoLiabilityLimit ?? 0, 0);
  const totalCoverage = primaryCoverage + (inputs.umbrellaCoverage ?? 0);
  const totalExposure = totalHouseholdLiabilityRisk;
  const coverageGap = Math.max(totalExposure - totalCoverage, 0);
  const erodedAssets = Math.min(coverageGap, totalAtRiskAssets);
  const wealthErosionPercentage = totalAtRiskAssets > 0 ? erodedAssets / totalAtRiskAssets : 0;

  const netWorthAtRisk = Math.max(nonQualifiedAssetsAtRisk + homeEquity, 0);
  const incomeMultipleTarget = Math.max((inputs.annualIncome ?? 0) * 5, 0);
  // Raw illustrative umbrella need, then rounded UP to the nearest $1M block.
  const rawIllustrativeNeed = Math.max(netWorthAtRisk, incomeMultipleTarget, UMBRELLA_BLOCK_SIZE);
  const illustrativeUmbrellaCoverageLevel =
    Math.ceil(rawIllustrativeNeed / UMBRELLA_BLOCK_SIZE) * UMBRELLA_BLOCK_SIZE;
  const umbrellaCoverageShortfall = Math.max(illustrativeUmbrellaCoverageLevel - householdUmbrellaCoverage, 0);

  return {
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
