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
  reserveStatus: "danger" | "minimum" | "ideal" | "strong";
  breakEvenSearchDurationMonths: number;
  reserveDepletionMonth: number;
  totalUncoveredShortfall: number;
  currentReserveLevel: number;
  optimalReserveTarget: number;
  minimumReserveTarget: number;
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
