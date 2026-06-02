export interface UnemploymentInputs {
  annualIncome: number;
  monthlyExpenses: number;
  emergencySavings: number;
  severanceMonthly: number;
  severanceDurationMonths: number;
  unemploymentBenefitMonthly: number;
  unemploymentBenefitDurationMonths: number;
  estimatedJobSearchMonths: number;
  spouseIncome: number;
  /**
   * Net income proxy ratio. Applied to gross income to estimate take-home pay
   * for the remaining-income coverage calculation. Default: 0.65.
   */
  netIncomeRatio?: number;
}

export interface UnemploymentOutputs {
  monthlyBurnRate: number;
  monthlyIncome: number;
  spouseMonthlyIncomeReference: number;
  monthlyCashFlow: number;
  cashFlowStatus: "positive" | "negative" | "breakeven";
  dangerThreshold: number;
  severanceTotal: number;
  unemploymentBenefitTotal: number;
  totalOffsetPool: number;
  monthlyOffset: number;
  monthlyNetBurn: number;
  totalExpensesDuringSearch: number;
  totalOffsetDuringSearch: number;
  netCashNeeded: number;
  coveredBySavings: number;
  remainingShortfall: number;
  availableAtOnset: number;
  effectiveRunwayMonths: number;
  fullyFundedForSearch: boolean;
  reserveCoveragePct: number;
  reserveStatus: "danger" | "minimum" | "ideal" | "strong" | "above-target";
  breakEvenSearchDurationMonths: number;
  reserveDepletionMonth: number;
  totalUncoveredShortfall: number;
  currentReserveLevel: number;

  // ── Dynamic reserve targets ────────────────────────────────────────────────
  /** Minimum reserve target: always 3 months of household expenses. */
  minimumReserveTarget: number;
  /**
   * Ideal reserve target months (3–6), determined by remaining income coverage %.
   * Higher household income concentration = more months needed.
   */
  idealReserveMonths: number;
  /** Ideal reserve target: monthlyExpenses × idealReserveMonths. */
  idealReserveTarget: number;
  /**
   * Fraction of monthly expenses covered by remaining (secondary) net income
   * if the highest earner loses income. Drives ideal reserve band selection.
   */
  remainingIncomeCoveragePct: number;
  /** Gap = max(0, idealReserveTarget − currentReserveLevel). */
  reserveGap: number;
  /** Excess = max(0, currentReserveLevel − idealReserveTarget). */
  excessReserve: number;

  /** Advisor-reference metric: current annual income exposed by job loss. */
  annualIncomeAtRisk: number;
  /** Advisor-reference metric: reserve runway in months currently held. */
  reserveMonthsCurrent: number;
  /** Advisor-reference metric: ongoing monthly gap after offsets are exhausted. */
  monthlyGapAtDepletion: number;
  timeline: Array<{
    month: number;
    offsetIncome: number;
    expenses: number;
    reserveBalance: number;
    shortfall: number;
    coverageSource: "offset" | "savings" | "shortfall";
  }>;
}
