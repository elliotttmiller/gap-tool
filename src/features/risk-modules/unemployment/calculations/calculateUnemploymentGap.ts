import { UnemploymentInputs, UnemploymentOutputs } from "../types";
import { defaultUnemploymentMethodologyAssumptions } from "@/domain/assumptions/defaultAssumptions";

/**
 * Maps remaining income coverage percentage to an ideal reserve target in months.
 * Households where remaining income covers less of monthly expenses after the
 * highest earner loses income need a larger emergency reserve.
 *
 * Bands:
 *   < 33% remaining coverage → 6 months
 *   < 50% remaining coverage → 5 months
 *   < 67% remaining coverage → 4 months
 *   ≥ 67% remaining coverage → 3 months
 */
function mapCoverageToIdealMonths(remainingCoveragePct: number): number {
  const bands = defaultUnemploymentMethodologyAssumptions.reserveCoverageBands;
  if (remainingCoveragePct < 0.33) return bands.under33;
  if (remainingCoveragePct < 0.50) return bands.under50;
  if (remainingCoveragePct < 0.67) return bands.under67;
  return bands.over67;
}

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

  // ── Dynamic reserve targets ──────────────────────────────────────────────
  // Assume the highest earner loses income; the lower earner's net income remains.
  const incomeAtRisk = Math.max(annualIncome, spouseIncome);
  const remainingGrossAnnualIncome = annualIncome >= spouseIncome ? spouseIncome : annualIncome;
  const remainingIncome = (remainingGrossAnnualIncome / 12) * netIncomeRatio;
  const remainingIncomeCoveragePct = monthlyBurnRate > 0 ? remainingIncome / monthlyBurnRate : 1;

  const idealReserveMonths = mapCoverageToIdealMonths(remainingIncomeCoveragePct);
  const minimumReserveMonths = defaultUnemploymentMethodologyAssumptions.minimumReserveMonths;
  const minimumReserveTarget = monthlyBurnRate * minimumReserveMonths;
  const idealReserveTarget = monthlyBurnRate * idealReserveMonths;
  const reserveGap = Math.max(0, idealReserveTarget - emergencySavings);
  const excessReserve = Math.max(0, emergencySavings - idealReserveTarget);

  const dangerThreshold = monthlyBurnRate * 1.5;

  const monthsOfRunwayRaw = monthlyBurnRate > 0 ? emergencySavings / monthlyBurnRate : 0;
  const reserveCoveragePct = idealReserveTarget > 0 ? (emergencySavings / idealReserveTarget) * 100 : 0;

  let reserveStatus: UnemploymentOutputs["reserveStatus"];
  if (emergencySavings > idealReserveTarget) {
    reserveStatus = "above-target";
  } else if (monthsOfRunwayRaw < minimumReserveMonths) {
    reserveStatus = "danger";
  } else if (monthsOfRunwayRaw < idealReserveMonths * 0.75) {
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
  const effectiveRunwayMonths = monthlyBurnRate > 0
    ? timeline.reduce((months, point) => months + (point.shortfall > 0 ? 0 : 1), 0)
    : 0;
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
    monthlyGapAtDepletion: monthlyBurnRate,
    timeline,
  };
}
