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
  /** Total assets available for income replacement (death benefit + investments).
   *  Pre-fills from nonQualifiedAssets. Used as the asset base for both withdrawal modules. */
  assetBase?: number;
  /** Safe withdrawal rate for Module 1 (4% rule). e.g. 0.04 = 4%. Default: 0.04 */
  safeWithdrawalRate?: number;
  /** Aggressive asset return / max withdrawal rate for Module 2.
   *  Represents the annual investment return on the asset base while drawing full income. Default: 0.06 */
  maxWithdrawalRate?: number;
  /** ROI used for the Death Benefit Needed (Box 5) capital-needs calculation.
   *  Falls back to assumptions.deathBenefitIncomeYieldAnnual if not set. Default: 0.05 */
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
  age: number;
  /** Projected annual income need for this year (grows at incomeGrowthRate). */
  projectedIncome: number;
  /** Module 1: flat safe withdrawal amount (same every year = assetBase × safeWithdrawalRate). */
  safeWD: number;
  /** Module 1: survivor income gap for this year = max(0, projectedIncome − safeWD). */
  incomeGap: number;
  /** Module 2: income actually covered this year — projectedIncome if covered, 0 if depleted. */
  maxCovered: number;
  /** Module 2: whether this year has full income coverage. */
  isCoveredMax: boolean;
}

/** Results for Module 1 — Safe Withdrawal Rate scenario. */
export interface IncomeGapModule1 {
  yearlyData: IncomeGapYearlyPoint[];
  /** Box 1 — Sum of all projected annual net income from current age to retirement age. */
  projectedNetIncomeTotal: number;
  /** Box 2 — Annual safe withdrawal dollar amount (flat, same every year = assetBase × safeWithdrawalRate). */
  annualSafeWD: number;
  /** Box 3 — Total income replaced = annualSafeWD × yearsToRetirement. */
  totalIncomeReplaced: number;
  /** Box 4 — Survivor gap = Box 1 − Box 3. */
  survivorGap: number;
  /** Box 5 — Death benefit needed to fill the survivor gap via capital-needs / PV-annuity formula at the configured ROI. */
  deathBenefitNeeded: number;
  safeWithdrawalRate: number;
  roi: number;
}

/** Results for Module 2 — Max Withdrawal Rate scenario. */
export interface IncomeGapModule2 {
  yearlyData: IncomeGapYearlyPoint[];
  /** Box 1 — Same total projected net income as Module 1. */
  projectedNetIncomeTotal: number;
  /** Box 2 — Number of years the asset base fully covers income at the aggressive draw rate. */
  yearsOfMaxWD: number;
  /** First age with full coverage (used for sub-label). */
  startCoverageAge: number;
  /** Last age with full coverage (used for sub-label). */
  endCoverageAge: number;
  /** Box 3 — Sum of income during covered (green) years only. */
  totalIncomeReplaced: number;
  /** Box 4 — Survivor gap = Box 1 − Box 3. */
  survivorGap: number;
  /** Box 5 — Death benefit needed using same PV-annuity formula as Module 1. */
  deathBenefitNeeded: number;
  maxWithdrawalRate: number;
  roi: number;
}

/** Top-level container returned by calculateIncomeGapScenarios(). */
export interface IncomeGapOutputs {
  module1: IncomeGapModule1;
  module2: IncomeGapModule2;
  yearsToRetirement: number;
}
