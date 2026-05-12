export interface LiabilityInputs {
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
  wealthErosionPercentage: number;
}
