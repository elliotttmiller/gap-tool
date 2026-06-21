/**
 * calculateIncomeGapScenarios
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared calculation engine for the two Income Gap Analysis panels on the Life
 * Insurance page.
 *
 * Module 1 — Safe Income Coverage
 *   Advisor-adherence interpretation of the review notes:
 *   - The entered death benefit/resource pool should drive the displayed coverage
 *     support rate.
 *   - “Fully Covered” must use the SAME threshold as the displayed capital need.
 *   - The Net Income Factor converts gross annual income to modeled net income.
 *   - Capital Required Today is the present value of the growing annual income
 *     support stream using the configured PV Reference Rate. This reproduces the
 *     advisor example calculations using the configured net income factor,
 *     return rate, growth rate, and projection horizon.
 *
 *   Target stream:
 *     projectedNetIncomeNeed[year] = annualIncome × netIncomeFactor − spouseIncome
 *
 *   Advisor-facing capital required:
 *     targetDeathBenefitNeed = PV(targetIncomeNeed[year], incomeGapRoi)
 *
 *   Entered-resource support rate:
 *     coverageSupportRate = enteredResources ÷ targetDeathBenefitNeed, capped at 100%
 *
 *   Annual gaps are derived from the same target stream and same support rate, so
 *   the chart, cards, narrative, and “Fully Covered” state cannot contradict each other.
 *
 * Module 2 — Coverage Runway Scenario
 *   Entered death benefits (group + private life coverage) are invested at
 *   maxCoverageRoi. Each year attempts to fund the full projected net income
 *   need from the grown balance. Covered income produces green bars; any amount
 *   the remaining pool cannot fund produces red gap bars.
 *
 * Net income assumption: income figures use modeled net income need
 * (annualIncome × netIncomeFactor − spouseAnnualIncome offset).
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

  // Converts gross annual income to the modeled net income need.
  // `safeIncomeCoveragePct` is kept as a backward-compatible persisted-field alias.
  const targetIncomeSupportPct = clampRate(
    requireNonNegativeNumber(
      inputs.targetIncomeSupportPct ?? inputs.safeIncomeCoveragePct ?? 0.85,
      "inputs.targetIncomeSupportPct"
    ),
    1
  );

  // maxCoverageRoi: annual return applied to existing death-benefit pool in Module 2 runway scenario.
  const maxCoverageRoi = nonNegative(
    requireNonNegativeNumber(
      inputs.maxCoverageRoi ?? 0.06,
      "inputs.maxCoverageRoi"
    )
  );

  // Income Replacement belongs to the core life-insurance need calculation. The
  // income-gap scenarios use this factor directly so projected net income is not
  // reduced by two independent percentages.
  const annualNetIncomeNeed = Math.max(
    0,
    nonNegative(requireNonNegativeNumber(inputs.annualIncome, "inputs.annualIncome")) *
      targetIncomeSupportPct -
      nonNegative(requireNonNegativeNumber(inputs.spouseAnnualIncome, "inputs.spouseAnnualIncome"))
  );

  const projectedIncomeStream = Array.from({ length: yearsToRetirement }, (_, i) => {
    return annualNetIncomeNeed * Math.pow(1 + incomeGrowthRate, i);
  });
  const targetIncomeStream = projectedIncomeStream;
  const projectedNetIncomeTotal = projectedIncomeStream.reduce((sum, amount) => sum + amount, 0);
  const targetIncomeSupportTotal = targetIncomeStream.reduce((sum, amount) => sum + amount, 0);
  const targetDeathBenefitNeed = presentValueOfAnnualStream(targetIncomeStream, roi);
  const coverageSupportRate = targetDeathBenefitNeed > 0
    ? Math.min(1, existingPool / targetDeathBenefitNeed)
    : 1;
  const additionalDeathBenefitNeeded = Math.max(0, targetDeathBenefitNeed - existingPool);
  const pvOfTargetNeed = targetDeathBenefitNeed;

  // ── Build yearly data — a single schedule drives both modules ─────────────
  const yearlyData: IncomeGapYearlyPoint[] = [];
  let m1TotalReplaced = 0;
  let m1CumulativeGap = 0;
  let module2Balance = existingPool;
  let m2TotalReplaced = 0;
  let m2CumulativeGap = 0;

  const m2GapStream: number[] = [];

  for (let i = 0; i < yearsToRetirement; i++) {
    // Label each annual period by the age attained at its end. A 40-to-65
    // projection therefore remains 25 periods while the chart ends at age 65.
    const age = currentAge + i + 1;

    const projectedNetIncome = projectedIncomeStream[i] ?? 0;
    const targetIncomeNeed = targetIncomeStream[i] ?? 0;

    // ── Module 1: Safe Income Coverage target ───────────────────────────────
    // The same capital-required threshold determines annual support, gap, cards,
    // narrative, and fully-covered state.
    const safeIncomeCoverage = Math.min(
      targetIncomeNeed * coverageSupportRate,
      targetIncomeNeed
    );
    const incomeGap = Math.max(0, targetIncomeNeed - safeIncomeCoverage);

    m1TotalReplaced += safeIncomeCoverage;
    m1CumulativeGap += incomeGap;

    // ── Module 2: Coverage Runway Scenario ──────────────────────────────────
    // Apply annual return first, then attempt to fund the full projected net
    // income need. This is a resource-runway model, not the Safe Income target.
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

  // ── Module 2 metrics ──────────────────────────────────────────────────────
  const m2DeathBenefitNeeded = presentValueOfAnnualStream(m2GapStream, roi);
  const m2SurvivorGap = m2CumulativeGap;

  const coveredPoints = yearlyData.filter((p) => p.isCoveredMax);
  const yearsOfMaxWD = coveredPoints.length;
  const startCoverageAge = coveredPoints[0]?.age ?? currentAge + 1;
  const endCoverageAge = coveredPoints[coveredPoints.length - 1]?.age ?? currentAge + 1;

  return {
    module1: {
      yearlyData,
      projectedNetIncomeTotal,
      targetIncomeSupportPct,
      targetIncomeSupportTotal,
      targetDeathBenefitNeed,
      coverageSupportRate,
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
    isM1FullyCovered: additionalDeathBenefitNeeded <= 0 && m1ScheduleSummary.isFullyCovered,
    m1SurvivorGap,
  };
}
