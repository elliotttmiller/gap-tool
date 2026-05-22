/**
 * calculateIncomeGapScenarios
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared calculation engine for the two Income Gap Analysis modules on the Life
 * Insurance page.
 *
 * Module 1 — Safe Withdrawal Rate
 *   The survivor draws a FLAT, SUSTAINABLE annual income from the asset base.
 *   Annual safe withdrawal = assetBase × safeWithdrawalRate (e.g. 4% rule).
 *   Principal is never touched — income is perpetually funded by the yield.
 *   Chart: flat bars, same height every year.
 *
 * Module 2 — Max Withdrawal Rate (Filling More Bars)
 *   The asset base is invested aggressively (at maxWithdrawalRate as annual ROI)
 *   and the survivor draws the FULL projected income each year until the balance
 *   runs out.  Covered years → tall green bars.  Gap years → empty red bars.
 *   Chart: first N bars full height (green), then truncation (red / empty).
 *
 * Box 5 formula (Death Benefit Needed) — Capital-Needs / Present-Value Annuity:
 *   The death benefit (DB) is a lump sum invested at the configured ROI.
 *   It must generate N equal annual payments that collectively close the
 *   survivor gap.  Using the present-value-of-annuity formula:
 *     annualPayment = survivorGap / yearsToRetirement
 *     DB = annualPayment × (1 − (1+roi)^−N) / roi
 *   When roi = 0: DB = survivorGap (no investment return, full amount needed).
 *   Assumption: gap is distributed evenly across years — financially conservative
 *   and consistent with standard capital-needs analysis practice.
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
import { nonNegative, roundCurrency, safeDivide } from "@/lib/math";

/**
 * Present value of an ordinary annuity.
 * Returns the lump-sum today that funds `annualPayment` for `years` at `rate`.
 */
function presentValueAnnuity(
  annualPayment: number,
  rate: number,
  years: number
): number {
  const pmt = nonNegative(annualPayment);
  const n = Math.max(0, Math.floor(years));
  if (!pmt || !n) return 0;
  if (rate === 0) return pmt * n; // no return — need the full nominal amount
  return (pmt * (1 - Math.pow(1 + rate, -n))) / rate;
}

export function calculateIncomeGapScenarios(
  inputs: LifeInputs,
  assumptions: LifeAssumptions
): IncomeGapOutputs {
  const currentAge = nonNegative(inputs.currentAge);
  const retirementAge = nonNegative(inputs.retirementAge || 65);
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);

  // Rates — use input overrides, fall back to assumptions / sensible defaults
  const incomeGrowthRate = assumptions.incomeGrowthRateAnnual ?? 0.03;
  const roi =
    inputs.incomeGapRoi ??
    assumptions.deathBenefitIncomeYieldAnnual ??
    0.05;
  const assetBase = nonNegative(inputs.assetBase ?? inputs.nonQualifiedAssets ?? 0);
  const safeWithdrawalRate = nonNegative(inputs.safeWithdrawalRate ?? 0.04);
  // maxWithdrawalRate doubles as the annual investment return on the asset base
  // in Module 2's aggressive draw-down scenario.
  const maxWithdrawalRate = nonNegative(inputs.maxWithdrawalRate ?? 0.06);

  // Net annual income need (consistent with the existing coverage calculator).
  // Uses NET income only — life insurance death benefits are already tax-free.
  const annualBaseNeed = Math.max(
    0,
    nonNegative(inputs.annualIncome) *
      (inputs.incomeReplacementRatio ?? 1.0) -
      nonNegative(inputs.spouseAnnualIncome ?? 0)
  );

  // Module 1: flat safe withdrawal — same every year (4% rule)
  const annualSafeWD = assetBase * safeWithdrawalRate;

  // Build yearly data — a single pass builds both modules simultaneously
  const yearlyData: IncomeGapYearlyPoint[] = [];
  let projectedNetIncomeTotal = 0;
  let module2Balance = assetBase;

  for (let i = 0; i < yearsToRetirement; i++) {
    const age = currentAge + i;
    // Project annual income forward at the income growth rate (net)
    const projectedIncome = annualBaseNeed * Math.pow(1 + incomeGrowthRate, i);

    // Module 2: apply investment return first (aggressive compounding), then
    // attempt to fund full income for this year.
    module2Balance *= 1 + maxWithdrawalRate;
    const isCoveredMax = module2Balance >= projectedIncome && projectedIncome > 0;
    const maxCovered = isCoveredMax ? projectedIncome : 0;
    if (isCoveredMax) {
      module2Balance -= projectedIncome;
    } else {
      module2Balance = 0; // once depleted, stays at zero
    }

    projectedNetIncomeTotal += projectedIncome;

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
  // Distribute gap evenly across all working years for the annuity calculation
  const m1AnnualGap = safeDivide(m1SurvivorGap, Math.max(1, yearsToRetirement));
  const m1DeathBenefitNeeded = presentValueAnnuity(
    m1AnnualGap,
    roi,
    yearsToRetirement
  );

  // ── Module 2 metrics ────────────────────────────────────────────────────────
  const coveredPoints = yearlyData.filter((p) => p.isCoveredMax);
  const m2TotalReplaced = coveredPoints.reduce(
    (sum, p) => sum + p.projectedIncome,
    0
  );
  const m2SurvivorGap = Math.max(0, projectedNetIncomeTotal - m2TotalReplaced);
  const m2AnnualGap = safeDivide(m2SurvivorGap, Math.max(1, yearsToRetirement));
  const m2DeathBenefitNeeded = presentValueAnnuity(
    m2AnnualGap,
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
