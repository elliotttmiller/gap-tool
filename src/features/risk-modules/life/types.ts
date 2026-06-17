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
   * Advisor-facing income support target for Module 1.
   * Default: 0.85 = model 85% of projected net income need.
   */
  targetIncomeSupportPct?: number;
  /** @deprecated Use targetIncomeSupportPct. Kept for persisted local-storage compatibility. */
  safeIncomeCoveragePct?: number;
  /**
   * Annual asset return rate used in the income-gap modules.
   * Module 1 uses this to translate entered coverage resources into a growing
   * annual withdrawal stream. Module 2 uses it for resource-pool drawdown.
   * Default: 0.06 (6%).
   */
  maxCoverageRoi?: number;
  /**
   * ROI / discount rate used only for PV reference figures and Module 2 annual-gap
   * capital-needs math. Default: 0.05 (5%).
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
  /** Projected annual NET income need before the Safe Income target is applied. */
  projectedIncome: number;
  /** Module 1: advisor-modeled target income support for this year. */
  targetIncomeNeed?: number;
  /**
   * Module 1: annual target income covered by entered coverage resources.
   * Uses a growing withdrawal stream from the entered coverage pool, capped at
   * the annual target income need.
   */
  safeIncomeCoverage: number;
  /** Module 1: survivor income gap for this year = targetIncomeNeed − safeIncomeCoverage. */
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
  /** Advisor target percentage, e.g. 0.85 means model 85% of projected income need. */
  targetIncomeSupportPct: number;
  /** Sum of annual target income support amounts. This is the advisor-facing income target. */
  targetIncomeSupportTotal: number;
  /** Capital required today to support the target income stream using the safe-withdrawal assumptions. */
  targetDeathBenefitNeed: number;
  /** Entered resources divided by the capital required, capped at 100%. */
  coverageSupportRate: number;
  /** Starting annual withdrawal supported by entered coverage resources. */
  startingAnnualWithdrawal: number;
  /** Starting annual withdrawal divided by year-1 target income support. Can exceed 100% when overfunded. */
  safeWithdrawalRate: number;
  /** Annual growth rate applied to the withdrawal stream. */
  safeWithdrawalGrowthRate: number;
  /** Asset return rate used to convert resources into annual withdrawals. */
  safeWithdrawalReturnRate: number;
  /** @deprecated Backward-compatible alias of coverageSupportRate for existing chart copy. */
  safeIncomeCoveragePct: number;
  /** Box 2b — Year-1 covered amount (for display reference; each subsequent year grows with income). */
  annualCoverageYear1: number;
  /** Box 3 — Total income covered = sum of safeIncomeCoverage across all years (undiscounted). */
  totalIncomeReplaced: number;
  /** Entered coverage resources used for the Safe Income Coverage calculation. */
  existingCoverageResources: number;
  /** Present value reference of target income support stream. Not the fully-covered threshold. */
  pvOfProjectedNeed: number;
  /** Present value reference of target income support stream. */
  pvOfTargetNeed: number;
  /** Box 4 — PV of the supported income coverage stream at the configured ROI. */
  pvOfCoverageStream: number;
  /** Additional coverage resources needed = targetDeathBenefitNeed − entered resources, floored at zero. */
  deathBenefitNeeded: number;
  /** Alias of deathBenefitNeeded for clearer consuming code. */
  additionalDeathBenefitNeeded: number;
  roi: number;
}

/** Results for Module 2 — Coverage Runway Scenario (asset return draw). */
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
  /** Box 3 — Total draws supported by the resource pool, including investment earnings during drawdown. */
  totalIncomeReplaced: number;
  /** Box 4 — Survivor gap = Box 1 − Box 3. */
  survivorGap: number;
  /** Box 5 — Additional capital needed using annual-gap PV logic. */
  deathBenefitNeeded: number;
  maxCoverageRoi: number;
  roi: number;
}

/** Top-level container returned by calculateIncomeGapScenarios(). */
export interface IncomeGapOutputs {
  module1: IncomeGapModule1;
  module2: IncomeGapModule2;
  yearsToRetirement: number;
  /** True when entered resources meet or exceed the Module 1 capital need. */
  isM1FullyCovered: boolean;
  /** Module 1 undiscounted survivor gap against the advisor target stream. */
  m1SurvivorGap: number;
}
