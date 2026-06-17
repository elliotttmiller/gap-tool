import { DisabilityInputs, DisabilityAssumptions, DisabilityOutputs, DisabilityIncomeProjectionPoint, DiBenefitPeriod } from "../types";
import { nonNegative, clamp, roundCurrency, safeDivide, roundPercent } from "@/lib/math";

/**
 * Computes the gross monthly LTD benefit:
 *   min(annualIncome × coveragePercent / 12, monthlyCap)
 * Returns 0 if coveragePercent is 0.
 */
function computeLtdMonthlyGross(annualIncome: number, coveragePercent: number, monthlyCap: number): number {
  if (coveragePercent <= 0) return 0;
  const percentBased = nonNegative(annualIncome) * clamp(coveragePercent, 0, 1) / 12;
  return monthlyCap > 0 ? Math.min(percentBased, monthlyCap) : percentBased;
}

/**
 * Maps a benefit period selector to the first age at which the individual DI policy is no longer active.
 * Returns null when the period is empty (treated as active through the projection end age).
 */
function benefitPeriodToEndAge(period: DiBenefitPeriod | "", currentAge: number): number | null {
  switch (period) {
    case "2y":  return currentAge + 2;
    case "5y":  return currentAge + 5;
    case "10y": return currentAge + 10;
    case "A65": return 65;
    case "A67": return 67;
    case "A70": return 70;
    default:    return null; // active through projection end
  }
}

export function calculateDisabilityGap(
  inputs: DisabilityInputs,
  assumptions: DisabilityAssumptions,
): DisabilityOutputs {
  const annualIncome = nonNegative(inputs.annualEarnedIncome);
  const currentAge = inputs.currentAge || 40;
  const retirementAge = Math.max(currentAge + 1, inputs.retirementAge || 65);
  const growthRate = clamp(assumptions.incomeGrowthRateAnnual ?? 0.03, 0, 0.20);
  const colaRate = clamp(assumptions.colaRate ?? 0, 0, 0.10);

  // ── Current-year monthly summary ──────────────────────────────────────────
  const ltdMonthlyGross = computeLtdMonthlyGross(annualIncome, inputs.ltdCoveragePercent, inputs.ltdMonthlyCap);
  const ltdNetMonthly = inputs.ltdTaxable ? ltdMonthlyGross * 0.70 : ltdMonthlyGross;
  const privateDiMonthly = nonNegative(inputs.privateDiBenefitMonthly);
  const totalNetMonthly = ltdNetMonthly + privateDiMonthly;

  // ── Individual DI benefit period ─────────────────────────────────────────
  const diEndAge = benefitPeriodToEndAge(inputs.privateDiBenefitPeriod, currentAge);

  // ── Yearly income projection ──────────────────────────────────────────────
  const projection: DisabilityIncomeProjectionPoint[] = [];
  const yearsToRetirement = retirementAge - currentAge;

  for (let year = 0; year < yearsToRetirement; year++) {
    const age = currentAge + year;
    const annualIncomeAtAge = roundCurrency(annualIncome * Math.pow(1 + growthRate, year));
    const annualIncomeNetAtAge = roundCurrency(annualIncomeAtAge * 0.70);

    // Group LTD re-applies the coverage percentage each year against the grown income
    // (still capped at the monthly cap), then applies the taxability factor.
    const ltdGrossAtAge = computeLtdMonthlyGross(annualIncomeAtAge, inputs.ltdCoveragePercent, inputs.ltdMonthlyCap);
    const ltdNetAtAge = inputs.ltdTaxable ? ltdGrossAtAge * 0.70 : ltdGrossAtAge;
    const ltdAnnualBenefitGross = roundCurrency(ltdGrossAtAge * 12);
    const ltdAnnualBenefit = roundCurrency(ltdNetAtAge * 12);

    // Individual DI: fixed base benefit, grown by COLA each projection year.
    // Active until, but not including, the benefit-period end age.
    const diIsActive = diEndAge === null ? privateDiMonthly > 0 : age < diEndAge;
    const diMonthlyAtAge = privateDiMonthly * Math.pow(1 + colaRate, year);
    const individualDIAnnualBenefit = diIsActive ? roundCurrency(diMonthlyAtAge * 12) : 0;

    const totalAnnualBenefit = roundCurrency(ltdAnnualBenefit + individualDIAnnualBenefit);
    const totalGrossAnnualBenefit = roundCurrency(ltdAnnualBenefitGross + individualDIAnnualBenefit);
    const annualGapNet = roundCurrency(Math.max(0, annualIncomeNetAtAge - totalAnnualBenefit));
    const annualGapGross = roundCurrency(Math.max(0, annualIncomeAtAge - totalGrossAnnualBenefit));

    projection.push({
      age,
      annualIncome: annualIncomeAtAge,
      annualIncomeNet: annualIncomeNetAtAge,
      ltdAnnualBenefitGross,
      ltdAnnualBenefit,
      individualDIAnnualBenefit,
      totalAnnualBenefit,
      annualGapNet,
      annualGapGross,
      annualGap: annualGapNet,
    });
  }

  // ── Aggregate stats ───────────────────────────────────────────────────────
  const projectedIncomeAtRetirement = projection.at(-1)?.annualIncomeNet ?? 0;
  const totalProjectedIncome = projection.reduce((s, p) => s + p.annualIncomeNet, 0);
  const totalProjectedIncomeGross = projection.reduce((s, p) => s + p.annualIncome, 0);
  const totalGroupLTDCoverage = projection.reduce((s, p) => s + p.ltdAnnualBenefit, 0);
  const totalIndividualDICoverage = projection.reduce((s, p) => s + p.individualDIAnnualBenefit, 0);
  const totalCoverage = totalGroupLTDCoverage + totalIndividualDICoverage;
  const totalCoverageGross = projection.reduce((s, p) => s + p.ltdAnnualBenefitGross + p.individualDIAnnualBenefit, 0);
  const totalGap = projection.reduce((s, p) => s + p.annualGapNet, 0);
  const totalGapGross = projection.reduce((s, p) => s + p.annualGapGross, 0);
  const averageCoverageRate = roundPercent(safeDivide(totalCoverage, totalProjectedIncome));

  // Income Loss (Net) at the starting year: net income / 12 − total net monthly benefit.
  const startingAnnualIncome = projection[0]?.annualIncome ?? annualIncome;
  const incomeLossNet = roundCurrency((startingAnnualIncome * 0.70 / 12) - totalNetMonthly);

  // Lifetime IDI Expense: premium × months from current age to retirement.
  // When a COLA rider is active, the premium carries a 20% load.
  const projectionMonths = yearsToRetirement * 12;
  const monthlyPremiumBase = nonNegative(inputs.privateDiMonthlyPremium ?? 0);
  const colaPremiumMultiplier = colaRate > 0 ? 1.2 : 1;
  const monthlyPremium = roundCurrency(monthlyPremiumBase * colaPremiumMultiplier);
  const lifetimeIDIExpense = roundCurrency(monthlyPremium * projectionMonths);

  return {
    ltdComputedMonthlyBenefit: roundCurrency(ltdMonthlyGross),
    ltdNetMonthlyBenefit: roundCurrency(ltdNetMonthly),
    privateDiMonthlyBenefit: roundCurrency(privateDiMonthly),
    totalNetMonthlyBenefit: roundCurrency(totalNetMonthly),
    incomeLossNet,
    incomeProjection: projection,
    projectedIncomeAtRetirement: roundCurrency(projectedIncomeAtRetirement),
    totalProjectedIncome: roundCurrency(totalProjectedIncome),
    totalGroupLTDCoverage: roundCurrency(totalGroupLTDCoverage),
    totalIndividualDICoverage: roundCurrency(totalIndividualDICoverage),
    totalCoverage: roundCurrency(totalCoverage),
    totalGap: roundCurrency(totalGap),
    totalProjectedIncomeGross: roundCurrency(totalProjectedIncomeGross),
    totalCoverageGross: roundCurrency(totalCoverageGross),
    totalGapGross: roundCurrency(totalGapGross),
    averageCoverageRate,
    lifetimeIDIExpense,
  };
}
