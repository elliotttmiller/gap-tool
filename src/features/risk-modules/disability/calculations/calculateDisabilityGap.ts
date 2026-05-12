import { DisabilityInputs, DisabilityAssumptions, DisabilityOutputs, DisabilityTimelinePoint, ActiveBenefit } from "../types";
import { nonNegative, clamp, roundCurrency, safeDivide, roundPercent } from "@/lib/math";

export type BenefitStream = {
  label: string;
  monthlyAmount: number;
  startMonth: number;
  endMonth: number | null;
  taxable: boolean;
};

export function waitingPeriodDaysToStartMonth(days: number): number {
  return Math.max(1, Math.ceil(nonNegative(days) / 30));
}

export function isBenefitActive(month: number, stream: BenefitStream): boolean {
  if (month < stream.startMonth) return false;
  if (stream.endMonth === null) return true;
  return month <= stream.endMonth;
}

export function netBenefitAmount({
  amount,
  taxable,
  effectiveTaxRate,
  useAfterTaxBenefits,
}: {
  amount: number;
  taxable: boolean;
  effectiveTaxRate: number;
  useAfterTaxBenefits: boolean;
}): number {
  if (!useAfterTaxBenefits) return nonNegative(amount);
  if (!taxable) return nonNegative(amount);

  return roundCurrency(nonNegative(amount) * (1 - clamp(effectiveTaxRate, 0, 0.6)));
}

export function buildDisabilityBenefitStreams(inputs: DisabilityInputs): BenefitStream[] {
  const streams: BenefitStream[] = [];

  if (inputs.stdBenefitMonthly > 0) {
    const startMonth = waitingPeriodDaysToStartMonth(inputs.stdWaitingPeriodDays);
    streams.push({
      label: "Employer STD",
      monthlyAmount: nonNegative(inputs.stdBenefitMonthly),
      startMonth,
      endMonth: startMonth + nonNegative(inputs.stdDurationMonths) - 1,
      taxable: inputs.stdTaxable,
    });
  }

  if (inputs.ltdBenefitMonthly > 0) {
    const startMonth = waitingPeriodDaysToStartMonth(inputs.ltdWaitingPeriodDays);
    streams.push({
      label: "Employer LTD",
      monthlyAmount: nonNegative(inputs.ltdBenefitMonthly),
      startMonth,
      endMonth: startMonth + nonNegative(inputs.ltdDurationMonths) - 1,
      taxable: inputs.ltdTaxable,
    });
  }

  if (inputs.privateDiBenefitMonthly > 0) {
    const startMonth = waitingPeriodDaysToStartMonth(inputs.privateDiWaitingPeriodDays);
    streams.push({
      label: "Private DI",
      monthlyAmount: nonNegative(inputs.privateDiBenefitMonthly),
      startMonth,
      endMonth: startMonth + nonNegative(inputs.privateDiDurationMonths) - 1,
      taxable: inputs.privateDiTaxable,
    });
  }

  if (inputs.stateBenefitMonthly > 0) {
    const startMonth = Math.max(1, inputs.stateBenefitStartMonth);
    streams.push({
      label: "State Benefit",
      monthlyAmount: nonNegative(inputs.stateBenefitMonthly),
      startMonth,
      endMonth: startMonth + nonNegative(inputs.stateBenefitDurationMonths) - 1,
      taxable: inputs.stateBenefitTaxable,
    });
  }

  if (inputs.includeSsdi && inputs.ssdiMonthlyBenefit > 0) {
    streams.push({
      label: "SSDI",
      monthlyAmount: nonNegative(inputs.ssdiMonthlyBenefit),
      startMonth: Math.max(1, inputs.ssdiStartMonth),
      endMonth: null,
      taxable: inputs.ssdiTaxable,
    });
  }

  return streams;
}

export function calculateDisabilityTimeline(
  inputs: DisabilityInputs,
  assumptions: DisabilityAssumptions
): DisabilityTimelinePoint[] {
  const baselineMonthlyIncome = nonNegative(inputs.annualEarnedIncome) / 12;

  const retainedIncomePercent =
    assumptions.scenarioType === "partial"
      ? clamp(inputs.partialDisabilityEarnedIncomePercent, 0, 1)
      : clamp(inputs.totalDisabilityEarnedIncomePercent, 0, 1);

  const benefitStreams = buildDisabilityBenefitStreams(inputs);

  let reserveBalance = nonNegative(inputs.emergencySavings);

  const modeledDurationMonths = Math.max(
    1,
    Math.min(nonNegative(inputs.modeledDurationMonths), 600)
  );

  const points: DisabilityTimelinePoint[] = [];

  for (let month = 1; month <= modeledDurationMonths; month++) {
    const earnedIncomeAfterDisability = baselineMonthlyIncome * retainedIncomePercent;

    const activeBenefits = benefitStreams.map((stream) => {
      const grossAmount = isBenefitActive(month, stream) ? stream.monthlyAmount : 0;
      const netAmount = netBenefitAmount({
        amount: grossAmount,
        taxable: stream.taxable,
        effectiveTaxRate: assumptions.effectiveTaxRate,
        useAfterTaxBenefits: assumptions.useAfterTaxBenefits,
      });

      return {
        label: stream.label,
        grossAmount: roundCurrency(grossAmount),
        netAmount: roundCurrency(netAmount),
      };
    });

    const totalNetBenefits = activeBenefits.reduce((sum, benefit) => sum + benefit.netAmount, 0);

    const availableIncome =
      earnedIncomeAfterDisability +
      nonNegative(inputs.spouseMonthlyIncome) +
      totalNetBenefits;

    const monthlyGap = Math.max(nonNegative(inputs.monthlyExpenses) - availableIncome, 0);

    const startingReserve = reserveBalance;
    reserveBalance = Math.max(reserveBalance - monthlyGap, 0);

    points.push({
      month,
      baselineMonthlyIncome: roundCurrency(baselineMonthlyIncome),
      earnedIncomeAfterDisability: roundCurrency(earnedIncomeAfterDisability),
      spouseMonthlyIncome: roundCurrency(inputs.spouseMonthlyIncome),
      activeBenefits,
      availableIncome: roundCurrency(availableIncome),
      monthlyExpenses: roundCurrency(inputs.monthlyExpenses),
      monthlyGap: roundCurrency(monthlyGap),
      startingReserve: roundCurrency(startingReserve),
      endingReserve: roundCurrency(reserveBalance),
      reserveDepleted: startingReserve > 0 && reserveBalance === 0 && monthlyGap > 0,
    });
  }

  return points;
}

export function aggregateDisabilityOutputs(timeline: DisabilityTimelinePoint[]): DisabilityOutputs {
  const totalUncoveredGap = timeline.reduce((sum, point) => sum + point.monthlyGap, 0);
  const reserveDepletionPoint = timeline.find((point) => point.reserveDepleted);
  
  const totalBenefitsReceived = timeline.reduce(
    (sum, point) =>
      sum +
      point.activeBenefits.reduce((benefitSum, benefit) => benefitSum + benefit.netAmount, 0),
    0
  );

  const averageMonthlyGap = timeline.length > 0 ? totalUncoveredGap / timeline.length : 0;
  
  const averageMonthlyExpenses = timeline.length > 0
    ? timeline.reduce((sum, point) => sum + point.monthlyExpenses, 0) / timeline.length
    : 0;

  const lifestyleCompressionRequired = safeDivide(averageMonthlyGap, averageMonthlyExpenses);

  return {
    totalUncoveredGap: roundCurrency(totalUncoveredGap),
    reserveDepletionMonth: reserveDepletionPoint?.month ?? null,
    totalBenefitsReceived: roundCurrency(totalBenefitsReceived),
    averageMonthlyGap: roundCurrency(averageMonthlyGap),
    lifestyleCompressionRequired: roundPercent(lifestyleCompressionRequired),
    timeline,
  };
}

export function calculateDisabilityGap(
  inputs: DisabilityInputs,
  assumptions: DisabilityAssumptions
): DisabilityOutputs {
  const timeline = calculateDisabilityTimeline(inputs, assumptions);
  return aggregateDisabilityOutputs(timeline);
}
