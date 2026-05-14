export type LifePolicyType = "term" | "permanent";

export interface LifeInputs {
  advisorId?: string;
  clientId?: string;
  scenarioId?: string;

  earnerName?: string;
  currentAge: number;
  retirementAge: number;
  annualIncome: number;
  /** Annual income of surviving spouse/partner. Reduces the income replacement need in advanced mode. */
  spouseAnnualIncome: number;

  incomeReplacementYears: number;
  /** Fraction of client income to replace (e.g. 1.0 = 100%). Typical: 0.70–1.00 */
  incomeReplacementRatio: number;

  groupLifeCoverage: number;
  privateLifeCoverage: number;
  privateLifePolicyType?: LifePolicyType;
  privateLifeTermYears?: number;
  nonQualifiedAssets?: number;

  debtsTotal: number;
  educationGoal: number;
  finalExpenses: number;

  liquidAssetsAllocated?: number;
}

export interface LifeAssumptions {
  inflationRateAnnual: number;
  discountRateAnnual: number;
  incomeGrowthRateAnnual: number;
  usePresentValue: boolean;
  includeLiquidAssetsOffset: boolean;
  deathBenefitTaxTreatment: "generally_income_tax_free" | "not_modeled";
  /** Advisor-reference annualized return used to translate death benefit into annual replacement income. */
  deathBenefitIncomeYieldAnnual?: number;
}

export interface LifeYearlyBreakdown {
  age: number;
  totalNeed: number;
  gliCovered: number;
  privateCovered: number;
  survivorGap: number;
}

export interface LifeOutputs {
  replacementYears: number;
  annualReplacementNeed: number;
  futureIncomeLost: number;
  baseProtectionNeed: number;
  existingCoverageTotal: number;
  liquidAssetOffset: number;
  availableResources: number;
  remainingGap: number;
  coverageOffsetPercentage: number;
  yearlyBreakdown: LifeYearlyBreakdown[];

  /** Advisor-reference outputs from the original HTML prototype. */
  projectedIncomeToRetirement: number;
  groupLifeCoverageYears: number;
  groupLifeBenefit: number;
  groupLifeAnnualIncome: number;
  privateLifeAnnualIncome: number;
  privateLifeCoverageYears: number;
  privateLifePolicyType: LifePolicyType;
  privateLifeBenefit: number;
  totalDeathBenefit: number;
  cumulativeSurvivorGap: number;
  lifetimeIncomeUncoveredPercentage: number;
  deathBenefitIncomeYieldAnnual: number;
}
