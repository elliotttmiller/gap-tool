export interface LiabilityInputs {
  /** Advisor-reference projected household income risk through retirement. */
  annualIncome?: number;
  spouseAnnualIncome?: number;
  currentAge?: number;
  spouseCurrentAge?: number;
  retirementAge?: number;
  nonQualifiedAssets?: number;
  businessOwnershipValue?: number;
  /** Wage garnishment rate as decimal (e.g., 0.25 = 25%). */
  garnishmentRate?: number;
  /** Annual income growth rate as decimal (e.g., 0.03 = 3%). */
  incomeGrowthRate?: number;

  homeValue: number;
  mortgageBalance: number;
  investmentAssets: number;
  savingsAssets: number;
  autoLiabilityLimit: number;
  homeLiabilityLimit: number;
  umbrellaCoverage: number;
  estimatedLawsuitExposure: number;
}

export interface LiabilityOutputs {
  homeEquity: number;
  totalAtRiskAssets: number;
  primaryCoverage: number;
  totalCoverage: number;
  exposureGap: number;
  /** Portion of at-risk assets that would be eroded to satisfy a judgment (min of gap vs assets) */
  erodedAssets: number;
  wealthErosionPercentage: number;

  /** Advisor-reference lawsuit outputs from the original HTML prototype. */
  householdWageGarnishmentRisk: number;
  nonQualifiedAssetsAtRisk: number;
  totalHouseholdLiabilityRisk: number;
  householdAutoLiabilityCoverage: number;
  householdUmbrellaCoverage: number;
  householdTotalCoverage: number;
  householdLiabilityGap: number;

  recommendedUmbrellaCoverage: number;
  umbrellaCoverageShortfall: number;

  assumptionGarnishmentRate: number;
  assumptionIncomeGrowthRate: number;
}
