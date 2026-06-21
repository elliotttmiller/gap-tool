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
  primaryNetMonthlyIncome: number;
  secondaryNetMonthlyIncome: number;
  incomeAtRisk: number;
  remainingIncome: number;
  monthlyExpenseReplacement: number;
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

  // ── Reserve target outputs ────────────────────────────────────────────────
  /** Minimum reserve target: 3 months of monthly expense replacement. */
  minimumReserveTarget: number;
  /** Tiered ideal reserve months based on remaining-income coverage: 6, 5, 4, or 3. */
  idealReserveMonths: number;
  /** Ideal reserve target: monthlyExpenseReplacement × idealReserveMonths. */
  idealReserveTarget: number;
  /** Fraction of monthly expenses covered by remaining net income. */
  remainingIncomeCoveragePct: number;
  /** Gap = max(0, idealReserveTarget − currentReserveLevel). */
  reserveGap: number;
  /** Excess = max(0, currentReserveLevel − idealReserveTarget). */
  excessReserve: number;

  /** Advisor-reference metric: current annual income exposed by transition. */
  annualIncomeAtRisk: number;
  /** Advisor-reference metric: reserve runway in months currently held. */
  reserveMonthsCurrent: number;
  /** Advisor-reference metric: ongoing monthly replacement need. */
  monthlyGapAtDepletion: number;
  timeline: Array<{
    month: number;
    remainingIncome: number;
    severance: number;
    unemploymentBenefit: number;
    requiredSavingsDraw: number;
    endingReserveBalance: number;
    offsetIncome: number;
    expenses: number;
    reserveBalance: number;
    shortfall: number;
    coverageSource: "offset" | "savings" | "shortfall";
  }>;
}
