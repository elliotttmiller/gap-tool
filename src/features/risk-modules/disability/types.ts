export type DisabilityInputs = {
  advisorId?: string;
  clientId?: string;
  scenarioId?: string;

  annualEarnedIncome: number;
  monthlyExpenses: number;
  emergencySavings: number;

  spouseMonthlyIncome: number;

  stdBenefitMonthly: number;
  stdWaitingPeriodDays: number;
  stdDurationMonths: number;
  stdTaxable: boolean;

  ltdBenefitMonthly: number;
  ltdWaitingPeriodDays: number;
  ltdDurationMonths: number;
  ltdTaxable: boolean;

  privateDiBenefitMonthly: number;
  privateDiWaitingPeriodDays: number;
  privateDiDurationMonths: number;
  privateDiTaxable: boolean;

  stateBenefitMonthly: number;
  stateBenefitStartMonth: number;
  stateBenefitDurationMonths: number;
  stateBenefitTaxable: boolean;

  includeSsdi: boolean;
  ssdiMonthlyBenefit: number;
  ssdiStartMonth: number;
  ssdiTaxable: boolean;

  partialDisabilityEarnedIncomePercent: number;
  totalDisabilityEarnedIncomePercent: number;

  modeledDurationMonths: number;
};

export type DisabilityAssumptions = {
  scenarioType: "partial" | "total";
  effectiveTaxRate: number;
  useAfterTaxBenefits: boolean;
  benefitTimingMode: "monthly";
  expenseInflationRateAnnual: number;
  ssdiModelingMode: "excluded" | "advisor_entered";
};

export type ActiveBenefit = {
  label: string;
  grossAmount: number;
  netAmount: number;
};

export type DisabilityTimelinePoint = {
  month: number;
  baselineMonthlyIncome: number;
  earnedIncomeAfterDisability: number;
  spouseMonthlyIncome: number;
  activeBenefits: ActiveBenefit[];
  availableIncome: number;
  monthlyExpenses: number;
  monthlyGap: number;
  startingReserve: number;
  endingReserve: number;
  reserveDepleted: boolean;
};

export type DisabilityOutputs = {
  totalUncoveredGap: number;
  reserveDepletionMonth: number | null;
  totalBenefitsReceived: number;
  averageMonthlyGap: number;
  lifestyleCompressionRequired: number;
  timeline: DisabilityTimelinePoint[];
};
