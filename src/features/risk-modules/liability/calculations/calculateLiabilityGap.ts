import { LiabilityInputs, LiabilityOutputs } from "../types";

export function calculateLiabilityGap(inputs: LiabilityInputs): LiabilityOutputs {
  const homeEquity = Math.max(inputs.homeValue - inputs.mortgageBalance, 0);
  
  // Note: qualified retirement accounts sometimes protected by ERISA, 
  // but we assume standard taxable investments here for MVP simplicity.
  const totalAtRiskAssets = homeEquity + inputs.investmentAssets + inputs.savingsAssets;
  
  // Choose the max of auto/home to represent "base" liability coverage in a worst-case scenario
  // Usually lawsuits target the specific policy + umbrella
  const primaryCoverage = Math.max(inputs.autoLiabilityLimit, inputs.homeLiabilityLimit);
  
  const totalCoverage = primaryCoverage + inputs.umbrellaCoverage;
  
  const totalExposure = inputs.estimatedLawsuitExposure;
  const coverageGap = Math.max(totalExposure - totalCoverage, 0);
  
  // If there's a gap, it comes out of at-risk assets
  const erodedAssets = Math.min(coverageGap, totalAtRiskAssets);
  const wealthErosionPercentage = totalAtRiskAssets > 0 ? (erodedAssets / totalAtRiskAssets) : 0;
  
  return {
    homeEquity,
    totalAtRiskAssets,
    primaryCoverage,
    totalCoverage,
    exposureGap: coverageGap,
    erodedAssets,
    wealthErosionPercentage,
  };
}
