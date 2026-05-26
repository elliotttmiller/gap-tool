/**
 * calculateIncomeGapScenarios
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared calculation engine for the two Income Gap Analysis modules on the Life
 * Insurance page.
 *
 * Module 1 — Safe Withdrawal Rate
 *   The survivor draws a FLAT annual income from existing life coverage
 *   (group + private death benefit + non-qualified assets) to retirement.
 *   This uses a payout-annuity model (ordinary annuity / end-of-year payment):
 *     annualWithdrawal = coverageFundingBase × r / (1 − (1+r)^−N)
 *   where r = safeWithdrawalRate and N = yearsToRetirement.
 *   This is a finite-horizon drawdown model (principal is consumed by retirement).
 *   Chart: flat bars, same height every year.
 *
 * Module 2 — Max Withdrawal Rate (Filling More Bars)
 *   Existing coverage resources (group + private + non-qualified assets) are invested aggressively
 *   (at maxWithdrawalRate as annual ROI)
 *   and the survivor draws the FULL projected income each year until the balance
 *   runs out.  Covered years → tall green bars.  Gap years → empty red bars.
 *   Chart: first N bars full height (green), then truncation (red / empty).
 *
 * Box 5 formula (Death Benefit Needed) — level-gap present value:
 *   Convert the survivor gap to an equivalent level annual gap, then discount
 *   as an ordinary annuity (end-of-year timing):
 *     annualGap = survivorGap / yearsToRetirement
 *     DB = annualGap × (1 − (1+roi)^−N) / roi
 *   When roi = 0: DB = survivorGap.
 *   This is equivalent to Excel PV(rate, nper, payment, 0, 0) by sign convention.
 *
 * Net income assumption: all income figures use NET income as configured in the
 * LifeInputs (annualIncome × incomeReplacementRatio − spouseAnnualIncome offset).
 * Death benefits are tax-free by law, so no gross-to-net conversion is applied.
 */

import {
  LifeInputs,
  LifeAssumptions,
  IncomeGapOutputs,
  IncomeGapYearlyPoint,
} from "../types";
import { nonNegative } from "@/lib/math";

/**
 * Present value of an ordinary annuity.
 * Returns the lump-sum today that funds `annualPayment` for `years` at `rate`.
 */
function requireFiniteNumber(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`calculateIncomeGapScenarios: ${fieldName} must be a finite number.`);
  }
  return value;
}

function requireNonNegativeNumber(value: unknown, fieldName: string): number {
  const numeric = requireFiniteNumber(value, fieldName);
  if (numeric < 0) {
    throw new Error(`calculateIncomeGapScenarios: ${fieldName} must be >= 0.`);
  }
  return numeric;
}

function presentValueLevelGap(totalGap: number, rate: number, years: number): number {
  const gap = Math.max(0, totalGap);
  const n = Math.max(0, Math.floor(years));
  if (!gap || !n) return 0;
  const annualGap = gap / n;
  if (rate === 0) return annualGap * n;
  return (annualGap * (1 - Math.pow(1 + rate, -n))) / rate;
}

/**
 * Level annual withdrawal that depletes `principal` over `years`
 * at annual return `rate` (ordinary annuity / end-of-year withdrawals).
 */
function payoutAnnuityWithdrawal(
  principal: number,
  rate: number,
  years: number
): number {
  const pv = nonNegative(principal);
  const n = Math.max(0, Math.floor(years));
  if (!pv || !n) return 0;
  if (rate === 0) return pv / n;
  return (pv * rate) / (1 - Math.pow(1 + rate, -n));
}

export function calculateIncomeGapScenarios(
  inputs: LifeInputs,
  assumptions: LifeAssumptions
): IncomeGapOutputs {
  const currentAge = nonNegative(requireNonNegativeNumber(inputs.currentAge, "inputs.currentAge"));
  const retirementAge = nonNegative(requireNonNegativeNumber(inputs.retirementAge, "inputs.retirementAge"));
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);

  const incomeGrowthRate = nonNegative(
    requireNonNegativeNumber(
      assumptions.incomeGrowthRateAnnual,
      "assumptions.incomeGrowthRateAnnual"
    )
  );
  const roi = nonNegative(requireNonNegativeNumber(inputs.incomeGapRoi, "inputs.incomeGapRoi"));
  const groupLifeCoverage = nonNegative(
    requireNonNegativeNumber(inputs.groupLifeCoverage, "inputs.groupLifeCoverage")
  );
  const privateLifeCoverage = nonNegative(
    requireNonNegativeNumber(inputs.privateLifeCoverage, "inputs.privateLifeCoverage")
  );
  const nonQualifiedAssets = nonNegative(
    requireNonNegativeNumber(inputs.nonQualifiedAssets ?? 0, "inputs.nonQualifiedAssets")
  );
  const coverageFundingBase = groupLifeCoverage + privateLifeCoverage + nonQualifiedAssets;
  const safeWithdrawalRate = nonNegative(requireNonNegativeNumber(inputs.safeWithdrawalRate, "inputs.safeWithdrawalRate"));
  // maxWithdrawalRate doubles as the annual investment return on the coverage funding base
  // in Module 2's aggressive draw-down scenario.
  const maxWithdrawalRate = nonNegative(requireNonNegativeNumber(inputs.maxWithdrawalRate, "inputs.maxWithdrawalRate"));

  // Net annual income need (consistent with the existing coverage calculator).
  // Uses NET income only — life insurance death benefits are already tax-free.
  const annualNetIncomeNeed = Math.max(
    0,
    nonNegative(requireNonNegativeNumber(inputs.annualIncome, "inputs.annualIncome")) *
      nonNegative(requireNonNegativeNumber(inputs.incomeReplacementRatio, "inputs.incomeReplacementRatio")) -
      nonNegative(requireNonNegativeNumber(inputs.spouseAnnualIncome, "inputs.spouseAnnualIncome"))
  );

  // Module 1: flat annual withdrawal sized to last exactly to retirement.
  const annualSafeWD = payoutAnnuityWithdrawal(
    coverageFundingBase,
    safeWithdrawalRate,
    yearsToRetirement
  );

  // Build yearly data — a single pass builds both modules simultaneously
  const yearlyData: IncomeGapYearlyPoint[] = [];
  let projectedNetIncomeTotal = 0;
  let module2Balance = coverageFundingBase;
  let m2TotalReplaced = 0;

  for (let i = 0; i < yearsToRetirement; i++) {
    const age = currentAge + i;
    // Project annual NET income need forward at the income growth rate.
    const projectedNetIncome = annualNetIncomeNeed * Math.pow(1 + incomeGrowthRate, i);

    // Module 2: apply investment return first (aggressive compounding), then
    // attempt to fund full NET income need for this year.
    module2Balance *= 1 + maxWithdrawalRate;
    const maxCovered = Math.min(module2Balance, projectedNetIncome);
    const isCoveredMax = maxCovered >= projectedNetIncome && projectedNetIncome > 0;
    module2Balance = Math.max(0, module2Balance - maxCovered);
    if (isCoveredMax) {
      m2TotalReplaced += projectedNetIncome;
    }

    projectedNetIncomeTotal += projectedNetIncome;
    yearlyData.push({
      age,
      projectedIncome: projectedNetIncome,
      safeWD: annualSafeWD,
      incomeGap: Math.max(0, projectedNetIncome - annualSafeWD),
      maxCovered,
      isCoveredMax,
    });
  }

  // ── Module 1 metrics ────────────────────────────────────────────────────────
  const m1TotalReplaced = annualSafeWD * yearsToRetirement;
  const m1SurvivorGap = Math.max(0, projectedNetIncomeTotal - m1TotalReplaced);
  const m1DeathBenefitNeeded = presentValueLevelGap(
    m1SurvivorGap,
    roi,
    yearsToRetirement
  );

  // ── Module 2 metrics ────────────────────────────────────────────────────────
  const coveredPoints = yearlyData.filter((p) => p.isCoveredMax);
  const m2SurvivorGap = Math.max(0, projectedNetIncomeTotal - m2TotalReplaced);
  const m2DeathBenefitNeeded = presentValueLevelGap(
    m2SurvivorGap,
    roi,
    yearsToRetirement
  );
  const yearsOfMaxWD = coveredPoints.length;
  const startCoverageAge = coveredPoints[0]?.age ?? currentAge;
  const endCoverageAge =
    coveredPoints[coveredPoints.length - 1]?.age ?? currentAge;

  return {
    module1: {
      yearlyData,
      projectedNetIncomeTotal,
      annualSafeWD,
      totalIncomeReplaced: m1TotalReplaced,
      survivorGap: m1SurvivorGap,
      deathBenefitNeeded: m1DeathBenefitNeeded,
      safeWithdrawalRate,
      roi,
    },
    module2: {
      yearlyData,
      projectedNetIncomeTotal,
      yearsOfMaxWD,
      startCoverageAge,
      endCoverageAge,
      totalIncomeReplaced: m2TotalReplaced,
      survivorGap: m2SurvivorGap,
      deathBenefitNeeded: m2DeathBenefitNeeded,
      maxWithdrawalRate,
      roi,
    },
    yearsToRetirement,
  };
}
