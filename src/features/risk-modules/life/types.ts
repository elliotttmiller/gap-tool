export interface LifeInputs {
  advisorId?: string;
  clientId?: string;
  scenarioId?: string;

  currentAge: number;
  retirementAge: number;
  annualIncome: number;
  /** Annual income of surviving spouse/partner. Reduces the income replacement need. */
  spouseAnnualIncome: number;

  incomeReplacementYears: number;
  /** Fraction of client income to replace (e.g. 1.0 = 100%). Typical: 0.70–1.00 */
  incomeReplacementRatio: number;

  groupLifeCoverage: number;
  privateLifeCoverage: number;

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
}
