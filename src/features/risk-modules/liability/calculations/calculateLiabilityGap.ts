import { LiabilityInputs, LiabilityOutputs } from "../types";

const DEFAULT_RETIREMENT_AGE = 65;
const DEFAULT_INCOME_GROWTH = 0.03;
const WAGE_GARNISHMENT_RISK_RATE = 0.25;

function projectedIncomeRiskToRetirement(income: number, currentAge: number, retirementAge: number): number {
  const years = Math.max(0, retirementAge - currentAge);
  let risk = 0;
  for (let year = 0; year < years; year++) {
    risk += Math.max(0, income) * Math.pow(1 + DEFAULT_INCOME_GROWTH, year) * WAGE_GARNISHMENT_RISK_RATE;
  }
  return risk;
}

export function calculateLiabilityGap(inputs: LiabilityInputs): LiabilityOutputs {
  const retirementAge = inputs.retirementAge ?? DEFAULT_RETIREMENT_AGE;
  const primaryIncomeRisk = projectedIncomeRiskToRetirement(inputs.annualIncome ?? 0, inputs.currentAge ?? 40, retirementAge);
  const spouseIncomeRisk = projectedIncomeRiskToRetirement(inputs.spouseAnnualIncome ?? 0, inputs.spouseCurrentAge ?? inputs.currentAge ?? 40, retirementAge);
  const householdWageGarnishmentRisk = primaryIncomeRisk + spouseIncomeRisk;

  const nonQualifiedAssetsAtRisk = Math.max(
    inputs.nonQualifiedAssets ?? inputs.investmentAssets + inputs.savingsAssets,
    0,
  );
  const totalHouseholdLiabilityRisk = householdWageGarnishmentRisk + nonQualifiedAssetsAtRisk;
  const householdAutoLiabilityCoverage = Math.max(inputs.autoLiabilityLimit, 0);
  const householdLiabilityGap = Math.max(totalHouseholdLiabilityRisk - householdAutoLiabilityCoverage, 0);

  const homeEquity = Math.max(inputs.homeValue - inputs.mortgageBalance, 0);
  const totalAtRiskAssets = Math.max(homeEquity + inputs.investmentAssets + inputs.savingsAssets, nonQualifiedAssetsAtRisk);
  const primaryCoverage = Math.max(inputs.autoLiabilityLimit, inputs.homeLiabilityLimit);
  const totalCoverage = primaryCoverage + inputs.umbrellaCoverage;
  const totalExposure = Math.max(inputs.estimatedLawsuitExposure, totalHouseholdLiabilityRisk);
  const coverageGap = Math.max(totalExposure - totalCoverage, 0);
  const erodedAssets = Math.min(coverageGap, totalAtRiskAssets);
  const wealthErosionPercentage = totalAtRiskAssets > 0 ? erodedAssets / totalAtRiskAssets : 0;

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
    householdLiabilityGap,
  };
}
