export interface LiabilityInputs {
  /** Advisor-reference projected household income risk through retirement. */
  annualIncome?: number;
  spouseAnnualIncome?: number;
  currentAge?: number;
  spouseCurrentAge?: number;
  retirementAge?: number;
  nonQualifiedAssets?: number;
  businessOwnershipValue?: number;
  /** Wage garnishment rate as decimal (e.g., 0.25 = 25%). Applied to disposableIncome, not gross. */
  garnishmentRate?: number;
  /** Annual income growth rate as decimal (e.g., 0.03 = 3%). */
  incomeGrowthRate?: number;
  /**
   * Disposable income ratio used as a proxy for take-home pay (e.g., 0.65 = 65% of gross).
   * Garnishment is applied to disposableIncome = grossIncome × disposableIncomeRatio.
   * Default: 0.65.
   */
  disposableIncomeRatio?: number;

  /**
   * Direct home equity input. When provided, used directly instead of computing
   * from homeValue and mortgageBalance.
   */
  homeEquity?: number;

  investmentAssets: number;
  savingsAssets: number;
  autoLiabilityLimit: number;
  umbrellaCoverage: number;
}

export interface LiabilityOutputs {
  exposureSchedule: Array<{
    yearIndex: number;
    age: number;
    grossIncome: number;
    disposableIncome: number;
    garnishableIncome: number;
    cumulativeExposure: number;
  }>;
  homeEquity: number;
  totalAtRiskAssets: number;
  primaryCoverage: number;
  totalCoverage: number;
  exposureGap: number;
  /** Portion of at-risk assets that would be eroded to satisfy a judgment (min of gap vs assets) */
  erodedAssets: number;
  wealthErosionPercentage: number;

  /** Advisor-reference lawsuit outputs. */
  householdWageGarnishmentRisk: number;
  nonQualifiedAssetsAtRisk: number;
  totalHouseholdLiabilityRisk: number;
  householdAutoLiabilityCoverage: number;
  householdUmbrellaCoverage: number;
  householdTotalCoverage: number;
  householdLiabilityGap: number;

  /** Additional umbrella coverage needed, rounded up to a $1M policy block. */
  neededUmbrellaCoverage: number;

  /**
   * Existing umbrella coverage plus neededUmbrellaCoverage.
   * Retained for saved-output and export compatibility.
   */
  illustrativeUmbrellaCoverageLevel: number;
  /** @deprecated Use neededUmbrellaCoverage. */
  umbrellaCoverageShortfall: number;

  assumptionGarnishmentRate: number;
  assumptionIncomeGrowthRate: number;
  assumptionDisposableIncomeRatio: number;
}
