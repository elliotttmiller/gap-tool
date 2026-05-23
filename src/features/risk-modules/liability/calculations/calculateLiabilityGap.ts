import { LiabilityInputs, LiabilityOutputs } from "../types";

const DEFAULT_RETIREMENT_AGE = 65;
const DEFAULT_INCOME_GROWTH = 0.03;
const WAGE_GARNISHMENT_RISK_RATE = 0.25;

function projectedIncomeRiskToRetirement(
  income: number,
  currentAge: number,
  retirementAge: number,
  incomeGrowthRate: number,
  garnishmentRate: number,
): number {
  const years = Math.max(0, retirementAge - currentAge);
  let risk = 0;
  for (let year = 0; year < years; year++) {
    risk += Math.max(0, income) * Math.pow(1 + incomeGrowthRate, year) * garnishmentRate;
  }
  return risk;
}

export function calculateLiabilityGap(inputs: LiabilityInputs): LiabilityOutputs {
  const retirementAge = inputs.retirementAge ?? DEFAULT_RETIREMENT_AGE;
  const garnishmentRate = Math.max(0, Math.min(1, inputs.garnishmentRate ?? WAGE_GARNISHMENT_RISK_RATE));
  const incomeGrowthRate = Math.max(0, Math.min(1, inputs.incomeGrowthRate ?? DEFAULT_INCOME_GROWTH));
  const primaryIncomeRisk = projectedIncomeRiskToRetirement(
    inputs.annualIncome ?? 0,
    inputs.currentAge ?? 40,
    retirementAge,
    incomeGrowthRate,
    garnishmentRate,
  );
  const spouseIncomeRisk = projectedIncomeRiskToRetirement(
    inputs.spouseAnnualIncome ?? 0,
    inputs.spouseCurrentAge ?? inputs.currentAge ?? 40,
    retirementAge,
    incomeGrowthRate,
    garnishmentRate,
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

  const homeEquity = Math.max((inputs.homeValue ?? 0) - (inputs.mortgageBalance ?? 0), 0);
  const totalAtRiskAssets = Math.max(homeEquity + (inputs.investmentAssets ?? 0) + (inputs.savingsAssets ?? 0) + businessOwnershipValue, nonQualifiedAssetsAtRisk);
  const primaryCoverage = Math.max(inputs.autoLiabilityLimit ?? 0, inputs.homeLiabilityLimit ?? 0);
  const totalCoverage = primaryCoverage + (inputs.umbrellaCoverage ?? 0);
  const totalExposure = Math.max(inputs.estimatedLawsuitExposure ?? 0, totalHouseholdLiabilityRisk);
  const coverageGap = Math.max(totalExposure - totalCoverage, 0);
  const erodedAssets = Math.min(coverageGap, totalAtRiskAssets);
  const wealthErosionPercentage = totalAtRiskAssets > 0 ? erodedAssets / totalAtRiskAssets : 0;

  const netWorthAtRisk = Math.max(nonQualifiedAssetsAtRisk + homeEquity, 0);
  const incomeMultipleTarget = Math.max((inputs.annualIncome ?? 0) * 5, 0);
  const recommendedUmbrellaCoverage = Math.max(netWorthAtRisk, incomeMultipleTarget, 1_000_000);
  const umbrellaCoverageShortfall = Math.max(recommendedUmbrellaCoverage - householdUmbrellaCoverage, 0);

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
    recommendedUmbrellaCoverage,
    umbrellaCoverageShortfall,
    assumptionGarnishmentRate: garnishmentRate,
    assumptionIncomeGrowthRate: incomeGrowthRate,
  };
}
