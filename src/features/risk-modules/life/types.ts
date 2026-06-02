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

  // ── Income Gap Analysis inputs ────────────────────────────────────────────
  /**
   * Safe Income Coverage percentage (Module 1).
   * The fraction of projected annual net income need modeled as "safely covered."
   * The Death Benefit Needed is the PV of the coverage stream minus existing resources.
   * Default: 0.85 (85%).
   */
  safeIncomeCoveragePct?: number;
  /**
   * Annual asset return rate used in Module 2 (Full Coverage Scenario).
   * Models the existing coverage pool invested at this rate while drawing full
   * projected income each year until the balance runs out. Default: 0.06 (6%).
   */
  maxCoverageRoi?: number;
  /**
   * ROI / discount rate used for the Death Benefit Needed capital-needs PV
   * calculation in both modules. Default: 0.05 (5%).
   */
  incomeGapRoi?: number;
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

// ── Income Gap Analysis types ──────────────────────────────────────────────────

/** Per-year data point shared by both income-gap modules. */
export interface IncomeGapYearlyPoint {
  yearIndex: number;
  age: number;
  /** Projected annual NET income need for this year (grows at incomeGrowthRate). */
  projectedIncome: number;
  /**
   * Module 1: annual income covered by the Safe Income Coverage model.
   * = projectedIncome × safeIncomeCoveragePct (e.g. 85% of income need).
   */
  safeIncomeCoverage: number;
  /** Module 1: survivor income gap for this year = projectedIncome − safeIncomeCoverage. */
  incomeGap: number;
  /** Running total of Module 1 income gaps. */
  cumulativeIncomeGap: number;
  /** Module 2: income actually covered this year — projectedIncome if covered, partial if depleted. */
  maxCovered: number;
  /** Module 2: annual income gap after the existing coverage pool is depleted. */
  maxCoverageGap: number;
  /** Running total of Module 2 income gaps. */
  cumulativeMaxCoverageGap: number;
  /** Module 2: whether this year has full income coverage. */
  isCoveredMax: boolean;
}

/** Results for Module 1 — Safe Income Coverage scenario. */
export interface IncomeGapModule1 {
  yearlyData: IncomeGapYearlyPoint[];
  /** Box 1 — Sum of all projected annual net income from current age to retirement age (undiscounted). */
  projectedNetIncomeTotal: number;
  /**
   * Box 2 — Safe Income Coverage percentage applied each year (e.g. 0.85 = 85%).
   * Annual covered amount grows with income at the income growth rate.
   */
  safeIncomeCoveragePct: number;
  /** Box 2b — Year-1 covered amount (for display reference; each subsequent year grows with income). */
  annualCoverageYear1: number;
  /** Box 3 — Total income covered = sum of safeIncomeCoverage across all years (undiscounted). */
  totalIncomeReplaced: number;
  /** Box 4 — PV of the safe income coverage stream at the configured ROI. */
  pvOfCoverageStream: number;
  /**
   * Box 5 — Death benefit needed = PV of the annual income-gap stream.
   * Zero means every modeled annual gap is zero.
   */
  deathBenefitNeeded: number;
  roi: number;
}

/** Results for Module 2 — Full Coverage Scenario (aggressive asset return draw). */
export interface IncomeGapModule2 {
  yearlyData: IncomeGapYearlyPoint[];
  /** Box 1 — Same total projected net income as Module 1. */
  projectedNetIncomeTotal: number;
  /** Box 2 — Number of years the existing-coverage resource pool fully covers net income at the selected ROI. */
  yearsOfMaxWD: number;
  /** First age with full coverage (used for sub-label). */
  startCoverageAge: number;
  /** Last age with full coverage (used for sub-label). */
  endCoverageAge: number;
  /** Box 3 — Sum of income during fully covered (green) years only. */
  totalIncomeReplaced: number;
  /** Box 4 — Survivor gap = Box 1 − Box 3. */
  survivorGap: number;
  /** Box 5 — Death benefit needed using same PV-annuity formula as Module 1. */
  deathBenefitNeeded: number;
  maxCoverageRoi: number;
  roi: number;
}

/** Top-level container returned by calculateIncomeGapScenarios(). */
export interface IncomeGapOutputs {
  module1: IncomeGapModule1;
  module2: IncomeGapModule2;
  yearsToRetirement: number;
  /** True when existing pool fully funds the Module 1 coverage stream. */
  isM1FullyCovered: boolean;
  /** Module 1 undiscounted survivor gap (total need − total covered). */
  m1SurvivorGap: number;
}
