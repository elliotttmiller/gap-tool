export interface UnemploymentInputs {
  annualIncome: number;
  monthlyExpenses: number;
  emergencySavings: number;
  severanceMonths: number;
  unemploymentBenefitMonthly: number;
  unemploymentBenefitDurationMonths: number;
  estimatedJobSearchMonths: number;
  spouseIncome: number;
}

export interface UnemploymentOutputs {
  monthlyBurnRate: number;
  monthlyAvailableIncomeBase: number;
  monthlyIncome: number;
  severanceTotal: number;
  reserveDepletionMonth: number;
  totalUncoveredShortfall: number;
  currentReserveLevel: number;
  optimalReserveTarget: number;
  minimumReserveTarget: number;
  /** Advisor-reference metric: current annual income exposed by job loss. */
  annualIncomeAtRisk: number;
  /** Advisor-reference metric: reserve target in months currently held. */
  reserveMonthsCurrent: number;
  timeline: Array<{
    month: number;
    availableIncome: number;
    expenses: number;
    reserveBalance: number;
    shortfall: number;
  }>;
}
