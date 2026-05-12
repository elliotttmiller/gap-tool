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
  /** Portion of at-risk assets that would be eroded to satisfy a judgment (min of gap vs assets) */
  erodedAssets: number;
  wealthErosionPercentage: number;
}
