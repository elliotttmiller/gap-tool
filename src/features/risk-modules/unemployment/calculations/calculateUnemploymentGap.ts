import { UnemploymentInputs, UnemploymentOutputs } from "../types";

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

  const monthlyIncome = annualIncome / 12;
  const spouseMonthlyIncomeReference = spouseIncome / 12;
  const monthlyCashFlowRaw = monthlyIncome - monthlyBurnRate;
  const cashFlowStatus: UnemploymentOutputs["cashFlowStatus"] =
    monthlyCashFlowRaw > 0 ? "positive" : monthlyCashFlowRaw < 0 ? "negative" : "breakeven";

  const minimumReserveTarget = monthlyBurnRate * 3;
  const optimalReserveTarget = monthlyBurnRate * 6;
  const dangerThreshold = monthlyBurnRate * 1.5;

  const monthsOfRunwayRaw = monthlyBurnRate > 0 ? emergencySavings / monthlyBurnRate : 0;
  const reserveCoveragePct = optimalReserveTarget > 0 ? (emergencySavings / optimalReserveTarget) * 100 : 0;
  const reserveStatus: UnemploymentOutputs["reserveStatus"] =
    monthsOfRunwayRaw < 3 ? "danger" : monthsOfRunwayRaw < 4.5 ? "minimum" : monthsOfRunwayRaw <= 6 ? "ideal" : "strong";

  const monthlyOffset = severanceMonthly + unemploymentBenefitMonthly;
  const monthlyNetBurn = monthlyBurnRate - monthlyOffset;

  const severanceTotal = severanceMonthly * severanceDurationMonths;
  const unemploymentBenefitTotal = unemploymentBenefitMonthly * unemploymentBenefitDurationMonths;
  const totalOffsetPool = severanceTotal + unemploymentBenefitTotal;

  const totalExpensesDuringSearch = monthlyBurnRate * estimatedJobSearchMonths;
  const overlapMonths = Math.min(unemploymentBenefitDurationMonths, estimatedJobSearchMonths);
  const totalOffsetDuringSearch = monthlyOffset * overlapMonths;
  const netCashNeeded = Math.max(0, totalExpensesDuringSearch - totalOffsetDuringSearch);
  const coveredBySavings = Math.min(emergencySavings, netCashNeeded);
  const remainingShortfall = Math.max(0, netCashNeeded - emergencySavings);

  const availableAtOnset = emergencySavings + totalOffsetPool;
  const effectiveRunwayMonths = monthlyBurnRate > 0 ? availableAtOnset / monthlyBurnRate : 0;
  const fullyFundedForSearch = effectiveRunwayMonths >= estimatedJobSearchMonths;
  const breakEvenSearchDurationMonths = effectiveRunwayMonths;

  const timeline: UnemploymentOutputs["timeline"] = [];
  let reserveBalance = emergencySavings;
  let reserveDepletionMonth = -1;
  let totalUncoveredShortfall = 0;

  for (let month = 1; month <= estimatedJobSearchMonths; month++) {
    const severanceActive = month <= severanceDurationMonths;
    const ubActive = month <= unemploymentBenefitDurationMonths;
    const offsetIncome = (severanceActive ? severanceMonthly : 0) + (ubActive ? unemploymentBenefitMonthly : 0);
    const requiredFromSavings = Math.max(0, monthlyBurnRate - offsetIncome);
    const coveredByReserve = Math.min(reserveBalance, requiredFromSavings);
    const shortfall = Math.max(0, requiredFromSavings - reserveBalance);
    reserveBalance = Math.max(0, reserveBalance - requiredFromSavings);
    totalUncoveredShortfall += shortfall;

    if (shortfall > 0 && reserveDepletionMonth === -1) {
      reserveDepletionMonth = month;
    }

    let coverageSource: "offset" | "savings" | "shortfall" = "offset";
    if (requiredFromSavings > 0 && coveredByReserve > 0 && shortfall === 0) coverageSource = "savings";
    if (shortfall > 0) coverageSource = "shortfall";

    timeline.push({
      month,
      offsetIncome,
      expenses: monthlyBurnRate,
      reserveBalance,
      shortfall,
      coverageSource,
    });
  }

  return {
    monthlyBurnRate,
    monthlyIncome,
    spouseMonthlyIncomeReference,
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
    optimalReserveTarget,
    minimumReserveTarget,
    annualIncomeAtRisk: annualIncome,
    reserveMonthsCurrent: monthsOfRunwayRaw,
    monthlyGapAtDepletion: monthlyBurnRate,
    timeline,
  };
}
