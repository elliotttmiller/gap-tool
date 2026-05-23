/**
 * calculateIncomeGapScenarios
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared calculation engine for the two Income Gap Analysis modules on the Life
 * Insurance page.
 *
 * Module 1 — Safe Withdrawal Rate
 *   The survivor draws a FLAT annual income from the asset base to retirement.
 *   This uses a payout-annuity model (ordinary annuity / end-of-year payment):
 *     annualWithdrawal = assetBase × r / (1 − (1+r)^−N)
 *   where r = safeWithdrawalRate and N = yearsToRetirement.
 *   This is a finite-horizon drawdown model (principal is consumed by retirement).
 *   Chart: flat bars, same height every year.
 *
 * Module 2 — Max Withdrawal Rate (Filling More Bars)
 *   The asset base is invested aggressively (at maxWithdrawalRate as annual ROI)
 *   and the survivor draws the FULL projected income each year until the balance
 *   runs out.  Covered years → tall green bars.  Gap years → empty red bars.
 *   Chart: first N bars full height (green), then truncation (red / empty).
 *
 * Box 5 formula (Death Benefit Needed) — discounted annual gap cash flows:
 *   The death benefit (DB) is the present value of the future income-gap stream
 *   at the configured ROI, discounted year-by-year:
 *     DB = Σ gap_t / (1 + roi)^t
 *   where t starts at 1 (end-of-year cash-flow timing).
 *   When roi = 0: DB = simple sum of annual gaps.
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
import { nonNegative, roundCurrency } from "@/lib/math";

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

function presentValueCashFlows(cashFlows: number[], rate: number): number {
  if (cashFlows.length === 0) return 0;
  if (rate === 0) return cashFlows.reduce((sum, cf) => sum + cf, 0);
  return cashFlows.reduce(
    (sum, cf, i) => sum + cf / Math.pow(1 + rate, i + 1),
    0
  );
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
  const assetBase = nonNegative(requireNonNegativeNumber(inputs.assetBase, "inputs.assetBase"));
  const safeWithdrawalRate = nonNegative(requireNonNegativeNumber(inputs.safeWithdrawalRate, "inputs.safeWithdrawalRate"));
  // maxWithdrawalRate doubles as the annual investment return on the asset base
  // in Module 2's aggressive draw-down scenario.
  const maxWithdrawalRate = nonNegative(requireNonNegativeNumber(inputs.maxWithdrawalRate, "inputs.maxWithdrawalRate"));

  // Net annual income need (consistent with the existing coverage calculator).
  // Uses NET income only — life insurance death benefits are already tax-free.
  const annualBaseNeed = Math.max(
    0,
    nonNegative(requireNonNegativeNumber(inputs.annualIncome, "inputs.annualIncome")) *
      nonNegative(requireNonNegativeNumber(inputs.incomeReplacementRatio, "inputs.incomeReplacementRatio")) -
      nonNegative(requireNonNegativeNumber(inputs.spouseAnnualIncome, "inputs.spouseAnnualIncome"))
  );

  // Module 1: flat annual withdrawal sized to last exactly to retirement.
  const annualSafeWD = payoutAnnuityWithdrawal(
    assetBase,
    safeWithdrawalRate,
    yearsToRetirement
  );

  // Build yearly data — a single pass builds both modules simultaneously
  const yearlyData: IncomeGapYearlyPoint[] = [];
  let projectedNetIncomeTotal = 0;
  let module2Balance = assetBase;
  let m2TotalReplaced = 0;
  const m1GapCashFlows: number[] = [];
  const m2GapCashFlows: number[] = [];

  for (let i = 0; i < yearsToRetirement; i++) {
    const age = currentAge + i;
    // Project annual income forward at the income growth rate (net)
    const projectedIncome = annualBaseNeed * Math.pow(1 + incomeGrowthRate, i);

    // Module 2: apply investment return first (aggressive compounding), then
    // attempt to fund full income for this year.
    module2Balance *= 1 + maxWithdrawalRate;
    const maxCovered = Math.min(module2Balance, projectedIncome);
    const isCoveredMax = maxCovered >= projectedIncome && projectedIncome > 0;
    module2Balance = Math.max(0, module2Balance - maxCovered);
    if (isCoveredMax) {
      m2TotalReplaced += projectedIncome;
    }

    projectedNetIncomeTotal += projectedIncome;
    m1GapCashFlows.push(Math.max(0, projectedIncome - annualSafeWD));
    m2GapCashFlows.push(isCoveredMax ? 0 : projectedIncome);

    yearlyData.push({
      age,
      projectedIncome: roundCurrency(projectedIncome),
      safeWD: roundCurrency(annualSafeWD),
      incomeGap: roundCurrency(Math.max(0, projectedIncome - annualSafeWD)),
      maxCovered: roundCurrency(maxCovered),
      isCoveredMax,
    });
  }

  // ── Module 1 metrics ────────────────────────────────────────────────────────
  const m1TotalReplaced = annualSafeWD * yearsToRetirement;
  const m1SurvivorGap = Math.max(0, projectedNetIncomeTotal - m1TotalReplaced);
  const m1DeathBenefitNeeded = presentValueCashFlows(m1GapCashFlows, roi);

  // ── Module 2 metrics ────────────────────────────────────────────────────────
  const coveredPoints = yearlyData.filter((p) => p.isCoveredMax);
  const m2SurvivorGap = Math.max(0, projectedNetIncomeTotal - m2TotalReplaced);
  const m2DeathBenefitNeeded = presentValueCashFlows(m2GapCashFlows, roi);
  const yearsOfMaxWD = coveredPoints.length;
  const startCoverageAge = coveredPoints[0]?.age ?? currentAge;
  const endCoverageAge =
    coveredPoints[coveredPoints.length - 1]?.age ?? currentAge;

  return {
    module1: {
      yearlyData,
      projectedNetIncomeTotal: roundCurrency(projectedNetIncomeTotal),
      annualSafeWD: roundCurrency(annualSafeWD),
      totalIncomeReplaced: roundCurrency(m1TotalReplaced),
      survivorGap: roundCurrency(m1SurvivorGap),
      deathBenefitNeeded: roundCurrency(m1DeathBenefitNeeded),
      safeWithdrawalRate,
      roi,
    },
    module2: {
      yearlyData,
      projectedNetIncomeTotal: roundCurrency(projectedNetIncomeTotal),
      yearsOfMaxWD,
      startCoverageAge,
      endCoverageAge,
      totalIncomeReplaced: roundCurrency(m2TotalReplaced),
      survivorGap: roundCurrency(m2SurvivorGap),
      deathBenefitNeeded: roundCurrency(m2DeathBenefitNeeded),
      maxWithdrawalRate,
      roi,
    },
    yearsToRetirement,
  };
}
