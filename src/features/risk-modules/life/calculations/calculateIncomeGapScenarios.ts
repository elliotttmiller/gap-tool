/**
 * calculateIncomeGapScenarios
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared calculation engine for the two Income Gap Analysis panels on the Life
 * Insurance page.
 *
 * Module 1 — Safe Income Coverage
 *   Advisor-adherence interpretation of the review notes:
 *   - The entered death benefit/resource pool is translated into a growing annual
 *     withdrawal stream using the asset return rate and the income-growth/COLA
 *     assumption.
 *   - The “Fully Covered” state, chart, cards, and narrative all use the same
 *     capital-required basis so a $5.0M resource pool cannot show as fully covered
 *     against a higher displayed capital requirement.
 *   - The Safe Income Coverage target defaults to 85% of modeled annual net
 *     income need, grown annually with income.
 *
 *   Target stream:
 *     targetIncomeNeed[year] = projectedNetIncomeNeed[year] × targetIncomeSupportPct
 *
 *   Required capital:
 *     capitalRequired = PV of targetIncomeNeed using assetReturnRate and incomeGrowthRate
 *
 *   Entered-resource support:
 *     startingAnnualWithdrawal = enteredResources ÷ growingAnnuityFactor
 *     safeWithdrawalRate = startingAnnualWithdrawal ÷ targetIncomeNeed[0]
 *
 * Module 2 — Coverage Runway Scenario
 *   Existing coverage resources (group + private + non-qualified assets) are
 *   invested at maxCoverageRoi each year. The survivor draws the FULL projected
 *   net income need each year until the balance runs out.
 *   Covered years → green bars. Gap years → red bars.
 *
 * Net income assumption: income figures use modeled net income need
 * (annualIncome × incomeReplacementRatio − spouseAnnualIncome offset).
 * Death benefits are generally income-tax-free; no gross-to-net conversion is
 * applied to benefit amounts.
 */

import {
  LifeInputs,
  LifeAssumptions,
  IncomeGapOutputs,
  IncomeGapYearlyPoint,
} from "../types";
import { nonNegative } from "@/lib/math";
import { presentValueOfAnnualStream } from "@/domain/financial/presentValue";
import { summarizeAnnualGapSchedule } from "@/domain/gap-analysis/gapSchedule";

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

function clampRate(value: number, max = 1.25): number {
  return Math.max(0, Math.min(max, value));
}

/**
 * Present value factor for a growing end-of-year withdrawal stream.
 * If r === g, the standard growing-annuity formula resolves to n / (1 + r).
 */
function growingAnnuityFactor(years: number, returnRate: number, growthRate: number): number {
  if (years <= 0) return 0;
  const r = Math.max(returnRate, 0);
  const g = Math.max(growthRate, 0);

  if (Math.abs(r - g) < 0.000001) {
    return years / (1 + r);
  }

  return (1 - Math.pow((1 + g) / (1 + r), years)) / (r - g);
}

function startingWithdrawalFromCapital(
  capital: number,
  years: number,
  returnRate: number,
  growthRate: number,
): number {
  const factor = growingAnnuityFactor(years, returnRate, growthRate);
  return factor > 0 ? capital / factor : 0;
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

  // Module 1 target: advisor-indicated safe income support defaults to 85%.
  // `safeIncomeCoveragePct` is kept as a backward-compatible persisted-field alias.
  const targetIncomeSupportPct = clampRate(
    requireNonNegativeNumber(
      inputs.targetIncomeSupportPct ?? inputs.safeIncomeCoveragePct ?? 0.85,
      "inputs.targetIncomeSupportPct"
    ),
    1
  );

  // maxCoverageRoi: asset return applied to the resource pool in both income-gap panels.
  const maxCoverageRoi = nonNegative(
    requireNonNegativeNumber(
      inputs.maxCoverageRoi ?? 0.06,
      "inputs.maxCoverageRoi"
    )
  );

  // Modeled annual net income need before the Safe Income target is applied.
  const annualNetIncomeNeed = Math.max(
    0,
    nonNegative(requireNonNegativeNumber(inputs.annualIncome, "inputs.annualIncome")) *
      nonNegative(requireNonNegativeNumber(inputs.incomeReplacementRatio, "inputs.incomeReplacementRatio")) -
      nonNegative(requireNonNegativeNumber(inputs.spouseAnnualIncome, "inputs.spouseAnnualIncome"))
  );

  const projectedIncomeStream = Array.from({ length: yearsToRetirement }, (_, i) => {
    return annualNetIncomeNeed * Math.pow(1 + incomeGrowthRate, i);
  });
  const targetIncomeStream = projectedIncomeStream.map((need) => need * targetIncomeSupportPct);
  const projectedNetIncomeTotal = projectedIncomeStream.reduce((sum, amount) => sum + amount, 0);
  const targetIncomeSupportTotal = targetIncomeStream.reduce((sum, amount) => sum + amount, 0);

  const targetIncomeYear1 = targetIncomeStream[0] ?? 0;
  const annuityFactor = growingAnnuityFactor(yearsToRetirement, maxCoverageRoi, incomeGrowthRate);

  // Capital required today to fund the target stream using the same return/growth basis
  // that drives the Safe Withdrawal Rate and yearly coverage schedule.
  const targetDeathBenefitNeed = targetIncomeYear1 > 0
    ? targetIncomeYear1 * annuityFactor
    : 0;
  const startingAnnualWithdrawal = startingWithdrawalFromCapital(
    existingPool,
    yearsToRetirement,
    maxCoverageRoi,
    incomeGrowthRate,
  );
  const safeWithdrawalRate = targetIncomeYear1 > 0 ? startingAnnualWithdrawal / targetIncomeYear1 : 1;
  const additionalDeathBenefitNeeded = Math.max(0, targetDeathBenefitNeed - existingPool);
  const pvOfTargetNeed = presentValueOfAnnualStream(targetIncomeStream, roi);

  // ── Build yearly data — a single schedule drives both modules ─────────────
  const yearlyData: IncomeGapYearlyPoint[] = [];
  let m1TotalReplaced = 0;
  let m1CumulativeGap = 0;
  let module2Balance = existingPool;
  let m2TotalReplaced = 0;
  let m2CumulativeGap = 0;

  const m2GapStream: number[] = [];

  for (let i = 0; i < yearsToRetirement; i++) {
    const age = currentAge + i;

    const projectedNetIncome = projectedIncomeStream[i] ?? 0;
    const targetIncomeNeed = targetIncomeStream[i] ?? 0;

    // ── Module 1: Safe Income Coverage target ───────────────────────────────
    // Each year: support the advisor-modeled target income stream using the
    // annual withdrawal that the entered resource pool can sustain.
    const annualWithdrawalCapacity = startingAnnualWithdrawal * Math.pow(1 + incomeGrowthRate, i);
    const safeIncomeCoverage = Math.min(annualWithdrawalCapacity, targetIncomeNeed);
    const incomeGap = Math.max(0, targetIncomeNeed - safeIncomeCoverage);

    m1TotalReplaced += safeIncomeCoverage;
    m1CumulativeGap += incomeGap;

    // ── Module 2: Coverage Runway Scenario ──────────────────────────────────
    // Apply annual return to balance first, then draw full modeled income need.
    module2Balance *= 1 + maxCoverageRoi;
    const maxCovered = Math.min(module2Balance, projectedNetIncome);
    const isCoveredMax = maxCovered >= projectedNetIncome && projectedNetIncome > 0;
    module2Balance = Math.max(0, module2Balance - maxCovered);
    m2TotalReplaced += maxCovered;
    const m2AnnualGap = Math.max(0, projectedNetIncome - maxCovered);
    m2GapStream.push(m2AnnualGap);
    m2CumulativeGap += m2AnnualGap;

    yearlyData.push({
      yearIndex: i,
      age,
      projectedIncome: projectedNetIncome,
      targetIncomeNeed,
      safeIncomeCoverage,
      incomeGap,
      cumulativeIncomeGap: m1CumulativeGap,
      maxCovered,
      maxCoverageGap: m2AnnualGap,
      cumulativeMaxCoverageGap: m2CumulativeGap,
      isCoveredMax,
    });
  }

  // ── Module 1 metrics ──────────────────────────────────────────────────────
  const m1ScheduleSummary = summarizeAnnualGapSchedule(
    yearlyData.map((point) => ({
      yearIndex: point.yearIndex,
      age: point.age,
      projectedNeed: point.targetIncomeNeed ?? point.projectedIncome,
      availableCoverage: point.safeIncomeCoverage,
      annualGap: point.incomeGap,
      cumulativeGap: point.cumulativeIncomeGap,
    }))
  );
  const m1SurvivorGap = m1ScheduleSummary.survivorGap;
  const coverageSupportRate = targetDeathBenefitNeed > 0
    ? Math.min(1, existingPool / targetDeathBenefitNeed)
    : 1;

  // ── Module 2 metrics ──────────────────────────────────────────────────────
  const m2DeathBenefitNeeded = presentValueOfAnnualStream(m2GapStream, roi);
  const m2SurvivorGap = m2CumulativeGap;

  const coveredPoints = yearlyData.filter((p) => p.isCoveredMax);
  const yearsOfMaxWD = coveredPoints.length;
  const startCoverageAge = coveredPoints[0]?.age ?? currentAge;
  const endCoverageAge = coveredPoints[coveredPoints.length - 1]?.age ?? currentAge;

  return {
    module1: {
      yearlyData,
      projectedNetIncomeTotal,
      targetIncomeSupportPct,
      targetIncomeSupportTotal,
      targetDeathBenefitNeed,
      coverageSupportRate,
      startingAnnualWithdrawal,
      safeWithdrawalRate,
      safeWithdrawalGrowthRate: incomeGrowthRate,
      safeWithdrawalReturnRate: maxCoverageRoi,
      // Backward-compatible alias used by the current view layer.
      safeIncomeCoveragePct: coverageSupportRate,
      annualCoverageYear1: yearlyData[0]?.safeIncomeCoverage ?? 0,
      totalIncomeReplaced: m1TotalReplaced,
      existingCoverageResources: existingPool,
      pvOfProjectedNeed: pvOfTargetNeed,
      pvOfTargetNeed,
      pvOfCoverageStream: presentValueOfAnnualStream(yearlyData.map((point) => point.safeIncomeCoverage), roi),
      deathBenefitNeeded: additionalDeathBenefitNeeded,
      additionalDeathBenefitNeeded,
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
    isM1FullyCovered: m1ScheduleSummary.isFullyCovered && additionalDeathBenefitNeeded <= 0,
    m1SurvivorGap,
  };
}
