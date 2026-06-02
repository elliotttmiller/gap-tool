/**
 * calculateIncomeGapScenarios
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared calculation engine for the two Income Gap Analysis modules on the Life
 * Insurance page.
 *
 * Module 1 — Safe Income Coverage
 *   Each year a percentage of projected net income need (safeIncomeCoveragePct,
 *   default 85%) is modeled as "safely covered."  Coverage grows with income at
 *   the incomeGrowthRate so it tracks the actual need each year.
 *
 *   Death Benefit Needed = max(0, PV(coverage stream) − existingPool)
 *   where PV uses end-of-year discounting at the selected ROI.
 *
 *   Because coverage is per-year and capped at that year's need, early-year
 *   "surplus" never offsets later shortfalls. isFullyCovered is true only when
 *   deathBenefitNeeded ≤ 0.
 *
 * Module 2 — Full Coverage Scenario
 *   Existing coverage resources (group + private + non-qualified assets) are
 *   invested at maxCoverageRoi each year. The survivor draws the FULL projected
 *   net income need each year until the balance runs out.
 *   Covered years → green bars. Gap years → red bars.
 *
 *   Death Benefit Needed = PV of actual annual gap stream (end-of-year).
 *   This avoids the "level-gap approximation" error.
 *
 * Net income assumption: all income figures use NET income as configured in the
 * LifeInputs (annualIncome × incomeReplacementRatio − spouseAnnualIncome offset).
 * Death benefits are tax-free by law; no gross-to-net conversion is applied.
 */

import {
  LifeInputs,
  LifeAssumptions,
  IncomeGapOutputs,
  IncomeGapYearlyPoint,
} from "../types";
import { nonNegative } from "@/lib/math";

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

/**
 * Present value of a stream of annual cash flows discounted at `rate`
 * using end-of-year timing. Each element in `cashFlows` is year i+1.
 */
function presentValueStream(cashFlows: number[], rate: number): number {
  return cashFlows.reduce((pv, cf, i) => {
    return pv + cf / Math.pow(1 + rate, i + 1);
  }, 0);
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
  const existingPool = groupLifeCoverage + privateLifeCoverage + nonQualifiedAssets;

  // safeIncomeCoveragePct: fraction of projected annual income modeled as covered (default 0.85).
  const safeIncomeCoveragePct = nonNegative(
    requireNonNegativeNumber(
      inputs.safeIncomeCoveragePct ?? 0.85,
      "inputs.safeIncomeCoveragePct"
    )
  );

  // maxCoverageRoi: annual return applied to existing pool in Module 2 aggressive scenario (default 0.06).
  const maxCoverageRoi = nonNegative(
    requireNonNegativeNumber(
      inputs.maxCoverageRoi ?? 0.06,
      "inputs.maxCoverageRoi"
    )
  );

  // Net annual income need (consistent with the existing coverage calculator).
  // Uses NET income only — life insurance death benefits are already tax-free.
  const annualNetIncomeNeed = Math.max(
    0,
    nonNegative(requireNonNegativeNumber(inputs.annualIncome, "inputs.annualIncome")) *
      nonNegative(requireNonNegativeNumber(inputs.incomeReplacementRatio, "inputs.incomeReplacementRatio")) -
      nonNegative(requireNonNegativeNumber(inputs.spouseAnnualIncome, "inputs.spouseAnnualIncome"))
  );

  // ── Build yearly data — a single pass drives both modules ─────────────────
  const yearlyData: IncomeGapYearlyPoint[] = [];
  let projectedNetIncomeTotal = 0;
  let m1TotalReplaced = 0;
  let module2Balance = existingPool;
  let m2TotalReplaced = 0;

  const m1CoverageStream: number[] = [];
  const m2GapStream: number[] = [];

  for (let i = 0; i < yearsToRetirement; i++) {
    const age = currentAge + i;

    // Project annual NET income need forward at the income growth rate.
    const projectedNetIncome = annualNetIncomeNeed * Math.pow(1 + incomeGrowthRate, i);

    // ── Module 1: Safe Income Coverage ─────────────────────────────────────
    // Each year: covered amount = projectedNeed × safeIncomeCoveragePct.
    // Capped at projectedNeed so we never "over-cover" a year.
    const safeIncomeCoverage = Math.min(
      projectedNetIncome * safeIncomeCoveragePct,
      projectedNetIncome
    );
    const incomeGap = Math.max(0, projectedNetIncome - safeIncomeCoverage);

    m1CoverageStream.push(safeIncomeCoverage);
    m1TotalReplaced += safeIncomeCoverage;

    // ── Module 2: Full Coverage Scenario ───────────────────────────────────
    // Apply annual return to balance first, then draw full income need.
    module2Balance *= 1 + maxCoverageRoi;
    const maxCovered = Math.min(module2Balance, projectedNetIncome);
    const isCoveredMax = maxCovered >= projectedNetIncome && projectedNetIncome > 0;
    module2Balance = Math.max(0, module2Balance - maxCovered);
    if (isCoveredMax) {
      m2TotalReplaced += projectedNetIncome;
    }
    const m2AnnualGap = Math.max(0, projectedNetIncome - maxCovered);
    m2GapStream.push(m2AnnualGap);

    projectedNetIncomeTotal += projectedNetIncome;
    yearlyData.push({
      age,
      projectedIncome: projectedNetIncome,
      safeIncomeCoverage,
      incomeGap,
      maxCovered,
      isCoveredMax,
    });
  }

  // ── Module 1 metrics ──────────────────────────────────────────────────────
  // PV of the entire coverage stream that needs to be funded.
  const pvCoverageStream = presentValueStream(m1CoverageStream, roi);
  // Additional death benefit needed = max(0, PV of coverage stream − existing pool).
  const m1DeathBenefitNeeded = Math.max(0, pvCoverageStream - existingPool);
  const m1SurvivorGap = Math.max(0, projectedNetIncomeTotal - m1TotalReplaced);

  // ── Module 2 metrics ──────────────────────────────────────────────────────
  // Death Benefit Needed = PV of actual annual gap stream (not a level-gap approximation).
  const m2DeathBenefitNeeded = presentValueStream(m2GapStream, roi);
  const m2SurvivorGap = Math.max(0, projectedNetIncomeTotal - m2TotalReplaced);

  const coveredPoints = yearlyData.filter((p) => p.isCoveredMax);
  const yearsOfMaxWD = coveredPoints.length;
  const startCoverageAge = coveredPoints[0]?.age ?? currentAge;
  const endCoverageAge = coveredPoints[coveredPoints.length - 1]?.age ?? currentAge;

  return {
    module1: {
      yearlyData,
      projectedNetIncomeTotal,
      safeIncomeCoveragePct,
      annualCoverageYear1: m1CoverageStream[0] ?? 0,
      totalIncomeReplaced: m1TotalReplaced,
      pvOfCoverageStream: pvCoverageStream,
      deathBenefitNeeded: m1DeathBenefitNeeded,
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
      maxCoverageRoi,
      roi,
    },
    yearsToRetirement,
    // Convenience summary — charts and metrics should use isFullyCovered from here.
    isM1FullyCovered: m1DeathBenefitNeeded <= 0,
    m1SurvivorGap,
  };
}
