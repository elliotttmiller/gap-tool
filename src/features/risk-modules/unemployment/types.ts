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
  severanceTotal: number;
  reserveDepletionMonth: number;
  totalUncoveredShortfall: number;
  timeline: Array<{
    month: number;
    availableIncome: number;
    expenses: number;
    reserveBalance: number;
    shortfall: number;
  }>;
}
