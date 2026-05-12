export interface LifeInputs {
  advisorId?: string;
  clientId?: string;
  scenarioId?: string;

  currentAge: number;
  retirementAge: number;
  annualIncome: number;

  incomeReplacementYears: number;
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
}
