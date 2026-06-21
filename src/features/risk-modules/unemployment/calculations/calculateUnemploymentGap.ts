import { UnemploymentInputs, UnemploymentOutputs } from "../types";
import { defaultUnemploymentMethodologyAssumptions } from "@/domain/assumptions/defaultAssumptions";

const DANGER_RESERVE_MONTHS = 1.5;

export function calculateUnemploymentGap(inputs: UnemploymentInputs): UnemploymentOutputs {
  const annualIncome = Math.max(inputs.annualIncome ?? 0, 0);
  const spouseIncome = Math.max(inputs.spouseIncome ?? 0, 0);
  const monthlyBurnRate = Math.max(inputs.monthlyExpenses ?? 0, 0);
  const emergencySavings = Math.max(inputs.emergencySavings ?? 0, 0);
  const severanceMonthly = Math.max(inputs.severanceMonthly ?? 0, 0);
  const severanceDurationMonths = Math.max(Math.floor(inputs.severanceDurationMonths ?? 0), 0);
  const unemploymentBenefitMonthly = Math.max(inputs.unemploymentBenefitMonthly ?? 0, 0);
  const unemploymentBenefitDurationMonths = Math.max(Math.floor(inputs.unemploymentBenefitDurationMonths ?? 0), 0);
  const estimatedJobSearchMonths = Math.max(Math.floor(inputs.estimatedJobSearchMonths ?? 0), 0);
  const netIncomeRatio = Math.max(0, Math.min(1, inputs.netIncomeRatio ?? defaultUnemploymentMethodologyAssumptions.netIncomeRatio));

  const monthlyIncome = annualIncome / 12;
  const spouseMonthlyIncomeReference = spouseIncome / 12;
  const primaryNetMonthlyIncome = monthlyIncome * netIncomeRatio;
  const secondaryNetMonthlyIncome = spouseMonthlyIncomeReference * netIncomeRatio;
  const householdNetMonthlyIncome = primaryNetMonthlyIncome + secondaryNetMonthlyIncome;
  const monthlyCashFlowRaw = householdNetMonthlyIncome - monthlyBurnRate;
  const cashFlowStatus: UnemploymentOutputs["cashFlowStatus"] =
    monthlyCashFlowRaw > 0 ? "positive" : monthlyCashFlowRaw < 0 ? "negative" : "breakeven";

  // Advisor-updated reserve method:
  // If the highest income goes away, subtract the lower remaining net income from
  // monthly expenses. The reserve target is a tiered 3-6 multiples of that gap.
  const incomeAtRisk = Math.max(annualIncome, spouseIncome);
  const hasTwoIncomes = annualIncome > 0 && spouseIncome > 0;
  const lowestSpousalNetIncome = hasTwoIncomes
    ? Math.min(primaryNetMonthlyIncome, secondaryNetMonthlyIncome)
    : 0;
  const remainingIncome = lowestSpousalNetIncome;
  const monthlyExpenseReplacement = Math.max(0, monthlyBurnRate - remainingIncome);
  const remainingIncomeCoveragePct = monthlyBurnRate > 0 ? remainingIncome / monthlyBurnRate : 1;

  const minimumReserveMonths = defaultUnemploymentMethodologyAssumptions.minimumReserveMonths;
  const reserveBands = defaultUnemploymentMethodologyAssumptions.reserveCoverageBands;
  const idealReserveMonths = remainingIncomeCoveragePct < 0.33
    ? reserveBands.under33
    : remainingIncomeCoveragePct < 0.5
      ? reserveBands.under50
      : remainingIncomeCoveragePct < 0.67
        ? reserveBands.under67
        : reserveBands.over67;
  const minimumReserveTarget = monthlyExpenseReplacement * minimumReserveMonths;
  const idealReserveTarget = monthlyExpenseReplacement * idealReserveMonths;
  const reserveGap = Math.max(0, idealReserveTarget - emergencySavings);
  const excessReserve = Math.max(0, emergencySavings - idealReserveTarget);

  const dangerThreshold = monthlyExpenseReplacement * DANGER_RESERVE_MONTHS;
  const monthsOfRunwayRaw = monthlyExpenseReplacement > 0
    ? emergencySavings / monthlyExpenseReplacement
    : idealReserveTarget === 0
      ? idealReserveMonths
      : 0;
  const reserveCoveragePct = idealReserveTarget > 0 ? (emergencySavings / idealReserveTarget) * 100 : 100;

  let reserveStatus: UnemploymentOutputs["reserveStatus"];
  if (monthsOfRunwayRaw > idealReserveMonths) {
    reserveStatus = "above-target";
  } else if (monthsOfRunwayRaw < DANGER_RESERVE_MONTHS) {
    reserveStatus = "danger";
  } else if (monthsOfRunwayRaw < minimumReserveMonths) {
    reserveStatus = "minimum";
  } else if (monthsOfRunwayRaw < idealReserveMonths) {
    reserveStatus = "ideal";
  } else {
    reserveStatus = "strong";
  }

  const monthlyOffset = remainingIncome + severanceMonthly + unemploymentBenefitMonthly;
  const monthlyNetBurn = Math.max(0, monthlyBurnRate - monthlyOffset);

  const severanceTotal = severanceMonthly * severanceDurationMonths;
  const unemploymentBenefitTotal = unemploymentBenefitMonthly * unemploymentBenefitDurationMonths;
  const totalOffsetPool = severanceTotal + unemploymentBenefitTotal;

  const timeline: UnemploymentOutputs["timeline"] = [];
  let reserveBalance = emergencySavings;
  let reserveDepletionMonth = -1;
  let totalUncoveredShortfall = 0;
  let totalOffsetDuringSearch = 0;
  let netCashNeeded = 0;

  for (let month = 1; month <= estimatedJobSearchMonths; month++) {
    const severanceActive = month <= severanceDurationMonths;
    const ubActive = month <= unemploymentBenefitDurationMonths;
    const severance = severanceActive ? severanceMonthly : 0;
    const unemploymentBenefit = ubActive ? unemploymentBenefitMonthly : 0;
    const offsetIncome = remainingIncome + severance + unemploymentBenefit;
    const requiredFromSavings = Math.max(0, monthlyBurnRate - offsetIncome);
    const coveredByReserve = Math.min(reserveBalance, requiredFromSavings);
    const shortfall = Math.max(0, requiredFromSavings - reserveBalance);
    reserveBalance = Math.max(0, reserveBalance - requiredFromSavings);
    totalUncoveredShortfall += shortfall;
    totalOffsetDuringSearch += offsetIncome;
    netCashNeeded += requiredFromSavings;

    if (shortfall > 0 && reserveDepletionMonth === -1) {
      reserveDepletionMonth = month;
    }

    let coverageSource: "offset" | "savings" | "shortfall" = "offset";
    if (requiredFromSavings > 0 && coveredByReserve > 0 && shortfall === 0) coverageSource = "savings";
    if (shortfall > 0) coverageSource = "shortfall";

    timeline.push({
      month,
      remainingIncome,
      severance,
      unemploymentBenefit,
      requiredSavingsDraw: requiredFromSavings,
      endingReserveBalance: reserveBalance,
      offsetIncome,
      expenses: monthlyBurnRate,
      reserveBalance,
      shortfall,
      coverageSource,
    });
  }

  const totalExpensesDuringSearch = monthlyBurnRate * estimatedJobSearchMonths;
  const coveredBySavings = Math.min(emergencySavings, netCashNeeded);
  const remainingShortfall = Math.max(0, netCashNeeded - emergencySavings);

  const availableAtOnset = emergencySavings + totalOffsetPool;
  const effectiveRunwayMonths = monthlyExpenseReplacement > 0
    ? Math.min(monthsOfRunwayRaw, estimatedJobSearchMonths || monthsOfRunwayRaw)
    : estimatedJobSearchMonths;
  const fullyFundedForSearch = totalUncoveredShortfall <= 0;
  const breakEvenSearchDurationMonths = effectiveRunwayMonths;

  return {
    monthlyBurnRate,
    monthlyIncome,
    spouseMonthlyIncomeReference,
    primaryNetMonthlyIncome,
    secondaryNetMonthlyIncome,
    incomeAtRisk,
    remainingIncome,
    monthlyExpenseReplacement,
    monthlyCashFlow: monthlyCashFlowRaw,
    cashFlowStatus,
    dangerThreshold,
    severanceTotal,
    unemploymentBenefitTotal,
    totalOffsetPool,
    monthlyOffset,
    monthlyNetBurn,
    totalExpensesDuringSearch,
    totalOffsetDuringSearch,
    netCashNeeded,
    coveredBySavings,
    remainingShortfall,
    availableAtOnset,
    effectiveRunwayMonths,
    fullyFundedForSearch,
    reserveCoveragePct,
    reserveStatus,
    breakEvenSearchDurationMonths,
    reserveDepletionMonth,
    totalUncoveredShortfall,
    currentReserveLevel: emergencySavings,
    minimumReserveTarget,
    idealReserveMonths,
    idealReserveTarget,
    remainingIncomeCoveragePct,
    reserveGap,
    excessReserve,
    annualIncomeAtRisk: incomeAtRisk,
    reserveMonthsCurrent: monthsOfRunwayRaw,
    monthlyGapAtDepletion: monthlyExpenseReplacement,
    timeline,
  };
}
