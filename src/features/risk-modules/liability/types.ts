export interface LiabilityInputs {
  /** Advisor-reference projected household income risk through retirement. */
  annualIncome?: number;
  spouseAnnualIncome?: number;
  currentAge?: number;
  spouseCurrentAge?: number;
  retirementAge?: number;
  nonQualifiedAssets?: number;

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
  householdLiabilityGap: number;
}
