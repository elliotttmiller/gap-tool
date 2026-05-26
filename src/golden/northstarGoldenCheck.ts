import { formToPayload, isClientFormValid } from "../lib/clientFormSchema";
import { calculateLifeInsuranceGap } from "../features/risk-modules/life/calculations/calculateLifeInsuranceGap";
import { calculateIncomeGapScenarios } from "../features/risk-modules/life/calculations/calculateIncomeGapScenarios";
import { calculateDisabilityGap } from "../features/risk-modules/disability/calculations/calculateDisabilityGap";
import { calculateBreakEven } from "../features/risk-modules/disability/calculators/calculateBreakEven";
import { calculateBenefitTax } from "../features/risk-modules/disability/calculators/calculateBenefitTax";
import { calculateSsdi } from "../features/risk-modules/disability/calculators/calculateSsdi";
import { calculateSavingsBridge } from "../features/risk-modules/disability/calculators/calculateSavingsBridge";
import { calculateUnemploymentGap } from "../features/risk-modules/unemployment/calculations/calculateUnemploymentGap";
import { calculateLiabilityGap } from "../features/risk-modules/liability/calculations/calculateLiabilityGap";
import { transformDisabilityChartData } from "../features/risk-modules/disability/transformers/transformDisabilityChartData";
import { transformLiabilityChartData } from "../features/risk-modules/liability/transformers/transformLiabilityChartData";
import { formatGapCurrency, getLargestScenarioGap, getModuleGapValue } from "../lib/scenarioMetrics";
import type { ScenarioModuleRecords } from "../lib/store-types";
import {
  northstarGoldenBenefitTaxInputs,
  northstarGoldenBreakEvenInputs,
  northstarGoldenClientSetupForm,
  northstarGoldenClientSetupPayloadExpected,
  northstarGoldenDisabilityAssumptions,
  northstarGoldenDisabilityInputs,
  northstarGoldenLiabilityInputs,
  northstarGoldenLifeAssumptions,
  northstarGoldenLifeInputs,
  northstarGoldenSavingsBridgeInputs,
  northstarGoldenSsdiInputs,
  northstarGoldenUnemploymentInputs,
} from "./northstarGoldenTestClient";
import { northstarGoldenAnswerKey } from "./northstarGoldenAnswerKey";

const DEFAULT_TOLERANCE = 1e-6;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertNumberClose(actual: number, expected: number, path: string, tolerance = DEFAULT_TOLERANCE) {
  if (!Number.isFinite(expected)) {
    assert(Object.is(actual, expected), `${path}: expected ${expected}, received ${actual}`);
    return;
  }
  assert(
    Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    `${path}: expected ${expected}, received ${actual}`,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertDeepClose(actual: unknown, expected: unknown, path = "value") {
  if (typeof expected === "number") {
    assert(typeof actual === "number", `${path}: expected number, received ${typeof actual}`);
    assertNumberClose(actual, expected, path);
    return;
  }
  if (typeof expected === "string" || typeof expected === "boolean" || expected === null) {
    assert(Object.is(actual, expected), `${path}: expected ${String(expected)}, received ${String(actual)}`);
    return;
  }
  if (Array.isArray(expected)) {
    assert(Array.isArray(actual), `${path}: expected array, received ${typeof actual}`);
    assert(actual.length === expected.length, `${path}: expected length ${expected.length}, received ${actual.length}`);
    expected.forEach((item, index) => assertDeepClose(actual[index], item, `${path}[${index}]`));
    return;
  }
  if (isRecord(expected)) {
    assert(isRecord(actual), `${path}: expected object, received ${typeof actual}`);
    for (const key of Object.keys(expected)) {
      assert(key in actual, `${path}: missing key "${key}"`);
      assertDeepClose(actual[key], expected[key], `${path}.${key}`);
    }
    return;
  }
  throw new Error(`${path}: unsupported expected value ${String(expected)}`);
}

function expectThrows(fn: () => unknown, message: string) {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  assert(threw, message);
}

function oracleRoundCurrency(value: number): number {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function oraclePayoutAnnuityWithdrawal(principal: number, rate: number, years: number): number {
  const pv = Math.max(0, principal);
  const n = Math.max(0, Math.floor(years));
  if (!pv || !n) return 0;
  if (rate === 0) return pv / n;
  return (pv * rate) / (1 - Math.pow(1 + rate, -n));
}

function oraclePresentValueLevelGap(totalGap: number, rate: number, years: number): number {
  const gap = Math.max(0, totalGap);
  const n = Math.max(0, Math.floor(years));
  if (!gap || !n) return 0;
  const annualGap = gap / n;
  if (rate === 0) return annualGap * n;
  return (annualGap * (1 - Math.pow(1 + rate, -n))) / rate;
}

function assertLifeIncomeGapOracle(
  actual: ReturnType<typeof calculateIncomeGapScenarios>,
  inputs: typeof northstarGoldenLifeInputs,
  assumptions: typeof northstarGoldenLifeAssumptions
) {
  const currentAge = Math.max(0, inputs.currentAge);
  const retirementAge = Math.max(0, inputs.retirementAge);
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const incomeGrowthRate = Math.max(0, assumptions.incomeGrowthRateAnnual);
  const roi = Math.max(0, inputs.incomeGapRoi);
  const coveragePool = Math.max(0, inputs.groupLifeCoverage) + Math.max(0, inputs.privateLifeCoverage);
  const totalPool = coveragePool + Math.max(0, inputs.nonQualifiedAssets ?? 0);
  const safeWithdrawalRate = Math.max(0, inputs.safeWithdrawalRate);
  const maxWithdrawalRate = Math.max(0, inputs.maxWithdrawalRate);
  const annualBaseNeed = Math.max(
    0,
    Math.max(0, inputs.annualIncome) * Math.max(0, inputs.incomeReplacementRatio) -
      Math.max(0, inputs.spouseAnnualIncome)
  );

  const annualSafeWD = oraclePayoutAnnuityWithdrawal(totalPool, safeWithdrawalRate, yearsToRetirement);
  let projectedNetIncomeTotal = 0;
  let module2Balance = totalPool;
  let m2TotalReplacedGreenOnly = 0;

  for (let i = 0; i < yearsToRetirement; i++) {
    const projectedIncome = annualBaseNeed * Math.pow(1 + incomeGrowthRate, i);
    module2Balance *= 1 + maxWithdrawalRate;
    const maxCovered = Math.min(module2Balance, projectedIncome);
    const isCoveredMax = maxCovered >= projectedIncome && projectedIncome > 0;
    module2Balance = Math.max(0, module2Balance - maxCovered);
    if (isCoveredMax) m2TotalReplacedGreenOnly += projectedIncome;

    projectedNetIncomeTotal += projectedIncome;
    const actualPoint = actual.module1.yearlyData[i];
    assert(actualPoint !== undefined, `lifeIncomeGap.oracle.yearlyData missing point at index ${i}`);
    assertNumberClose(actualPoint.projectedIncome, oracleRoundCurrency(projectedIncome), `lifeIncomeGap.oracle.yearlyData[${i}].projectedIncome`, 1);
    assertNumberClose(actualPoint.safeWD, oracleRoundCurrency(annualSafeWD), `lifeIncomeGap.oracle.yearlyData[${i}].safeWD`, 1);
    assertNumberClose(actualPoint.maxCovered, oracleRoundCurrency(maxCovered), `lifeIncomeGap.oracle.yearlyData[${i}].maxCovered`, 1);
    assert(Object.is(actualPoint.isCoveredMax, isCoveredMax), `lifeIncomeGap.oracle.yearlyData[${i}].isCoveredMax mismatch`);
  }

  const expectedM1TotalReplaced = annualSafeWD * yearsToRetirement;
  const expectedM1SurvivorGap = Math.max(0, projectedNetIncomeTotal - expectedM1TotalReplaced);
  const expectedM1DeathBenefitNeeded = oraclePresentValueLevelGap(
    expectedM1SurvivorGap,
    roi,
    yearsToRetirement
  );

  const expectedM2SurvivorGap = Math.max(0, projectedNetIncomeTotal - m2TotalReplacedGreenOnly);
  const expectedM2DeathBenefitNeeded = oraclePresentValueLevelGap(
    expectedM2SurvivorGap,
    roi,
    yearsToRetirement
  );

  assertNumberClose(actual.yearsToRetirement, yearsToRetirement, "lifeIncomeGap.oracle.yearsToRetirement");
  assertNumberClose(actual.module1.projectedNetIncomeTotal, oracleRoundCurrency(projectedNetIncomeTotal), "lifeIncomeGap.oracle.module1.projectedNetIncomeTotal", 1);
  assertNumberClose(actual.module1.annualSafeWD, oracleRoundCurrency(annualSafeWD), "lifeIncomeGap.oracle.module1.annualSafeWD", 1);
  assertNumberClose(actual.module1.totalIncomeReplaced, oracleRoundCurrency(expectedM1TotalReplaced), "lifeIncomeGap.oracle.module1.totalIncomeReplaced", 1);
  assertNumberClose(actual.module1.survivorGap, oracleRoundCurrency(expectedM1SurvivorGap), "lifeIncomeGap.oracle.module1.survivorGap", 1);
  assertNumberClose(actual.module1.deathBenefitNeeded, oracleRoundCurrency(expectedM1DeathBenefitNeeded), "lifeIncomeGap.oracle.module1.deathBenefitNeeded", 1);

  assertNumberClose(actual.module2.projectedNetIncomeTotal, oracleRoundCurrency(projectedNetIncomeTotal), "lifeIncomeGap.oracle.module2.projectedNetIncomeTotal", 1);
  assertNumberClose(actual.module2.totalIncomeReplaced, oracleRoundCurrency(m2TotalReplacedGreenOnly), "lifeIncomeGap.oracle.module2.totalIncomeReplaced", 1);
  assertNumberClose(actual.module2.survivorGap, oracleRoundCurrency(expectedM2SurvivorGap), "lifeIncomeGap.oracle.module2.survivorGap", 1);
  assertNumberClose(actual.module2.deathBenefitNeeded, oracleRoundCurrency(expectedM2DeathBenefitNeeded), "lifeIncomeGap.oracle.module2.deathBenefitNeeded", 1);
}

function calculateDisabilityDisplay(outputs: ReturnType<typeof calculateDisabilityGap>) {
  const totalProjectedIncomeGross = outputs.incomeProjection.reduce((sum, point) => sum + point.annualIncome, 0);
  const totalGroupLTDCoverageGross = outputs.incomeProjection.reduce((sum, point) => sum + point.ltdAnnualBenefitGross, 0);
  const totalCoverageGross = outputs.incomeProjection.reduce(
    (sum, point) => sum + point.ltdAnnualBenefitGross + point.individualDIAnnualBenefit,
    0,
  );
  const net = {
    projectedIncomeDisplay: outputs.totalProjectedIncome,
    groupLTDDisplay: outputs.totalGroupLTDCoverage,
    totalIncomeReplacedDisplay: outputs.totalCoverage,
    incomeGap1Display: outputs.totalProjectedIncome - outputs.totalGroupLTDCoverage,
    incomeGap2Display: outputs.totalProjectedIncome - outputs.totalCoverage,
    incomeGapDiffDisplay:
      (outputs.totalProjectedIncome - outputs.totalGroupLTDCoverage) -
      (outputs.totalProjectedIncome - outputs.totalCoverage),
  };
  const gross = {
    projectedIncomeDisplay: totalProjectedIncomeGross,
    groupLTDDisplay: totalGroupLTDCoverageGross,
    totalIncomeReplacedDisplay: totalCoverageGross,
    incomeGap1Display: totalProjectedIncomeGross - totalGroupLTDCoverageGross,
    incomeGap2Display: totalProjectedIncomeGross - totalCoverageGross,
    incomeGapDiffDisplay:
      (totalProjectedIncomeGross - totalGroupLTDCoverageGross) -
      (totalProjectedIncomeGross - totalCoverageGross),
  };
  return { net, gross };
}

function calculatePremiumVsSelfInsuredDerived() {
  const currentAge = northstarGoldenDisabilityInputs.currentAge;
  const retirementAge = northstarGoldenDisabilityInputs.privateDiBenefitPeriod === "A65" ? 65 : northstarGoldenDisabilityInputs.retirementAge;
  const yearsToRetirement = Math.max(retirementAge - currentAge, 0);
  const monthlyRate = northstarGoldenBreakEvenInputs.annualRateOfReturn / 12;
  const nMonths = yearsToRetirement * 12;
  const investedPremiumFV = monthlyRate > 0
    ? northstarGoldenBreakEvenInputs.monthlyPremium * ((Math.pow(1 + monthlyRate, nMonths) - 1) / monthlyRate)
    : northstarGoldenBreakEvenInputs.monthlyPremium * nMonths;
  const monthsOfCoverage = investedPremiumFV / northstarGoldenBreakEvenInputs.monthlyBenefit;
  const breakEven = calculateBreakEven(northstarGoldenBreakEvenInputs);
  assert(breakEven.ok, "Premium vs self-insured derived values require a valid break-even result.");
  return {
    investedPremiumFV,
    monthsOfCoverage,
    yearsOfCoverage: monthsOfCoverage / 12,
    yearOneFund: breakEven.schedule[11]?.investmentBalance ?? 0,
    chartEndMonth: 240,
  };
}

function formatAdvisorCurrency(value: number): string {
  return `$${Math.round(value / 1000)}K`;
}

function formatLiabilityMetric(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getMonthlyStatsAtAgeForGolden(outputs: ReturnType<typeof calculateDisabilityGap>, age: number) {
  const point = outputs.incomeProjection.find((p) => p.age === age);
  if (!point) {
    const startingPoint = outputs.incomeProjection[0];
    const incomeGrossMonthly = (startingPoint?.annualIncome ?? 0) / 12;
    const incomeNetMonthly = (startingPoint?.annualIncomeNet ?? 0) / 12;
    const totalGrossMonthly = outputs.ltdComputedMonthlyBenefit + outputs.privateDiMonthlyBenefit;
    return {
      age,
      ltdNetMonthly: outputs.ltdNetMonthlyBenefit,
      ltdGrossMonthly: outputs.ltdComputedMonthlyBenefit,
      individualDIMonthly: outputs.privateDiMonthlyBenefit,
      totalNetMonthly: outputs.totalNetMonthlyBenefit,
      totalGrossMonthly,
      incomeGrossMonthly,
      incomeNetMonthly,
      incomeLossNet: incomeNetMonthly - outputs.totalNetMonthlyBenefit,
      incomeLossGross: incomeGrossMonthly - totalGrossMonthly,
    };
  }

  const ltdNetMonthly = point.ltdAnnualBenefit / 12;
  const ltdGrossMonthly = point.ltdAnnualBenefitGross / 12;
  const individualDIMonthly = point.individualDIAnnualBenefit / 12;
  const totalNetMonthly = point.totalAnnualBenefit / 12;
  const totalGrossMonthly = ltdGrossMonthly + individualDIMonthly;
  const incomeGrossMonthly = point.annualIncome / 12;
  const incomeNetMonthly = point.annualIncomeNet / 12;

  return {
    age,
    ltdNetMonthly,
    ltdGrossMonthly,
    individualDIMonthly,
    totalNetMonthly,
    totalGrossMonthly,
    incomeGrossMonthly,
    incomeNetMonthly,
    incomeLossNet: incomeNetMonthly - totalNetMonthly,
    incomeLossGross: incomeGrossMonthly - totalGrossMonthly,
  };
}

function calculateJobComparisonDerived() {
  const salary = northstarGoldenDisabilityInputs.annualEarnedIncome;
  const groupPct = Math.round(northstarGoldenDisabilityInputs.ltdCoveragePercent * 100);
  const groupCap = northstarGoldenDisabilityInputs.ltdMonthlyCap;
  const calcGroupLTDAnnual = (s: number) => Math.min(s * (groupPct / 100), groupCap * 12);
  const groupLTD_A = calcGroupLTDAnnual(salary);
  const totalBar_A = salary;
  const incomeGap_A = Math.max(totalBar_A - groupLTD_A, 0);
  const annualPremium_B = northstarGoldenDisabilityInputs.privateDiMonthlyPremium! * 12;
  const annualIDI_B = northstarGoldenDisabilityInputs.privateDiBenefitMonthly * 12;
  const groupLTD_B = calcGroupLTDAnnual(salary);
  const totalBar_B = Math.max(salary - annualPremium_B, 0);
  const incomeGap_B = Math.max(totalBar_B - groupLTD_B - annualIDI_B, 0);
  return {
    jobA: {
      salary,
      groupPct,
      groupCap,
      hasIdi: false,
      monthlyPremium: 0,
      idiBenefit: 0,
      groupLTDAnnual: groupLTD_A,
      annualIDI: 0,
      annualPremium: 0,
      totalBar: totalBar_A,
      incomeGap: incomeGap_A,
    },
    jobB: {
      salary,
      groupPct,
      groupCap,
      hasIdi: true,
      monthlyPremium: northstarGoldenDisabilityInputs.privateDiMonthlyPremium,
      idiBenefit: northstarGoldenDisabilityInputs.privateDiBenefitMonthly,
      groupLTDAnnual: groupLTD_B,
      annualIDI: annualIDI_B,
      annualPremium: annualPremium_B,
      totalBar: totalBar_B,
      incomeGap: incomeGap_B,
    },
    chartData: [
      { name: "Job A", "Group LTD": Math.round(groupLTD_A), "IDI Benefit": 0, "Income Gap": Math.round(incomeGap_A) },
      { name: "Job B", "Group LTD": Math.round(groupLTD_B), "IDI Benefit": Math.round(annualIDI_B), "Income Gap": Math.round(incomeGap_B) },
    ],
    sideMetrics: {
      idiBenefitAnnual: annualIDI_B,
      incomeDifference: Math.abs(salary - totalBar_B),
      gapDifference: Math.abs(incomeGap_A - incomeGap_B),
    },
  };
}

function runGoldenCheck() {
  assert(isClientFormValid(northstarGoldenClientSetupForm), "Golden client setup form should pass required-field validation.");
  assertDeepClose(formToPayload(northstarGoldenClientSetupForm), northstarGoldenClientSetupPayloadExpected, "clientSetupPayload");
  assertDeepClose(formToPayload(northstarGoldenClientSetupForm), northstarGoldenAnswerKey.clientSetupPayload, "clientSetupPayloadAnswerKey");

  const lifeCore = calculateLifeInsuranceGap(northstarGoldenLifeInputs, northstarGoldenLifeAssumptions);
  const lifeCoreForKey = {
    ...lifeCore,
    yearlyBreakdownCheckpoints: {
      first: lifeCore.yearlyBreakdown[0],
      age50: lifeCore.yearlyBreakdown.find((p) => p.age === 50),
      age60: lifeCore.yearlyBreakdown.find((p) => p.age === 60),
      last: lifeCore.yearlyBreakdown.at(-1),
      count: lifeCore.yearlyBreakdown.length,
    },
  };
  assertDeepClose(lifeCoreForKey, northstarGoldenAnswerKey.lifeCore, "lifeCore");

  const incomeGap = calculateIncomeGapScenarios(northstarGoldenLifeInputs, northstarGoldenLifeAssumptions);
  assertLifeIncomeGapOracle(incomeGap, northstarGoldenLifeInputs, northstarGoldenLifeAssumptions);
  // Invariants: Box arithmetic and spec policy alignment for life income-gap modules.
  assertNumberClose(
    incomeGap.module1.survivorGap,
    incomeGap.module1.projectedNetIncomeTotal - incomeGap.module1.totalIncomeReplaced,
    "lifeIncomeGap.module1.survivorGapIdentity",
    1
  );
  assertNumberClose(
    incomeGap.module2.survivorGap,
    incomeGap.module2.projectedNetIncomeTotal - incomeGap.module2.totalIncomeReplaced,
    "lifeIncomeGap.module2.survivorGapIdentity",
    1
  );
  const m2GreenBarsSum = incomeGap.module2.yearlyData
    .filter((p) => p.isCoveredMax)
    .reduce((sum, p) => sum + p.projectedIncome, 0);
  assertNumberClose(
    incomeGap.module2.totalIncomeReplaced,
    m2GreenBarsSum,
    "lifeIncomeGap.module2.greenBarsOnlyTotalIncomeReplaced",
    1
  );

  // Strict-required contract: missing required inputs should throw instead of defaulting.
  expectThrows(
    () =>
      calculateIncomeGapScenarios(
        { ...northstarGoldenLifeInputs, safeWithdrawalRate: undefined },
        northstarGoldenLifeAssumptions
      ),
    "lifeIncomeGap.strictRequired.safeWithdrawalRate should throw when missing"
  );
  expectThrows(
    () =>
      calculateIncomeGapScenarios(
        { ...northstarGoldenLifeInputs, incomeGapRoi: undefined },
        northstarGoldenLifeAssumptions
      ),
    "lifeIncomeGap.strictRequired.incomeGapRoi should throw when missing"
  );
  expectThrows(
    () =>
      calculateIncomeGapScenarios(
        { ...northstarGoldenLifeInputs, nonQualifiedAssets: -1 },
        northstarGoldenLifeAssumptions
      ),
    "lifeIncomeGap.strictRequired.nonQualifiedAssets should throw when negative"
  );
  expectThrows(
    () =>
      calculateIncomeGapScenarios(
        northstarGoldenLifeInputs,
        { ...northstarGoldenLifeAssumptions, incomeGrowthRateAnnual: undefined }
      ),
    "lifeIncomeGap.strictRequired.incomeGrowthRateAnnual should throw when missing"
  );

  const incomeGapForKey = {
    yearsToRetirement: incomeGap.yearsToRetirement,
    module1: {
      ...incomeGap.module1,
      yearlyDataCheckpoints: {
        first: incomeGap.module1.yearlyData[0],
        age44: incomeGap.module1.yearlyData.find((p) => p.age === 44),
        age45: incomeGap.module1.yearlyData.find((p) => p.age === 45),
        last: incomeGap.module1.yearlyData.at(-1),
        count: incomeGap.module1.yearlyData.length,
      },
    },
    module2: incomeGap.module2,
  };
  assertDeepClose(incomeGapForKey, northstarGoldenAnswerKey.lifeIncomeGap, "lifeIncomeGap");

  const disabilityCore = calculateDisabilityGap(northstarGoldenDisabilityInputs, northstarGoldenDisabilityAssumptions);
  const disabilityCoreForKey = {
    ...disabilityCore,
    incomeProjectionCheckpoints: {
      first: disabilityCore.incomeProjection[0],
      age50: disabilityCore.incomeProjection.find((p) => p.age === 50),
      last: disabilityCore.incomeProjection.at(-1),
      count: disabilityCore.incomeProjection.length,
    },
  };
  assertDeepClose(disabilityCoreForKey, northstarGoldenAnswerKey.disabilityCore, "disabilityCore");
  assertDeepClose(calculateDisabilityDisplay(disabilityCore), northstarGoldenAnswerKey.disabilityDisplay, "disabilityDisplay");
  const disabilityChartData = transformDisabilityChartData(disabilityCore);
  assertDeepClose(
    {
      count: disabilityChartData.projectionChartData.length,
      first: disabilityChartData.projectionChartData[0],
      last: disabilityChartData.projectionChartData.at(-1),
      animationKey: disabilityChartData.animationKey,
    },
    northstarGoldenAnswerKey.uiDisplaySnapshots.disabilityIncomeGapTab.chartData,
    "uiDisplaySnapshots.disabilityIncomeGapTab.chartData",
  );
  assertDeepClose(
    getMonthlyStatsAtAgeForGolden(disabilityCore, disabilityCore.incomeProjection[0]?.age ?? northstarGoldenDisabilityInputs.currentAge),
    northstarGoldenAnswerKey.uiDisplaySnapshots.disabilityIncomeGapTab.monthlyStatsAtStartAge,
    "uiDisplaySnapshots.disabilityIncomeGapTab.monthlyStatsAtStartAge",
  );

  const breakEven = calculateBreakEven(northstarGoldenBreakEvenInputs);
  assert(breakEven.ok, "Break-even calculator should return ok.");
  const { schedule, ...breakEvenScalars } = breakEven;
  assertDeepClose(
    {
      ...breakEvenScalars,
      scheduleCheckpoints: { 1: schedule[0], 12: schedule[11], 135: schedule[134], 240: schedule[239], 300: schedule[299] },
    },
    northstarGoldenAnswerKey.breakEven,
    "breakEven",
  );
  assertDeepClose(calculatePremiumVsSelfInsuredDerived(), northstarGoldenAnswerKey.premiumVsSelfInsured, "premiumVsSelfInsured");
  assertDeepClose(calculateJobComparisonDerived(), northstarGoldenAnswerKey.jobComparison, "jobComparison");

  const benefitTax = calculateBenefitTax(northstarGoldenBenefitTaxInputs);
  assert(benefitTax.ok, "Benefit tax calculator should return ok.");
  assertDeepClose(benefitTax, northstarGoldenAnswerKey.benefitTax, "benefitTax");

  const ssdi = calculateSsdi(northstarGoldenSsdiInputs);
  assert(ssdi.ok, "SSDI calculator should return ok.");
  assertDeepClose(ssdi, northstarGoldenAnswerKey.ssdi, "ssdi");

  const savingsBridge = calculateSavingsBridge(northstarGoldenSavingsBridgeInputs);
  assert(savingsBridge.ok, "Savings bridge calculator should return ok.");
  assertDeepClose(savingsBridge, northstarGoldenAnswerKey.savingsBridge, "savingsBridge");

  const unemployment = calculateUnemploymentGap(northstarGoldenUnemploymentInputs);
  assertDeepClose(unemployment, northstarGoldenAnswerKey.unemployment, "unemployment");
  assertDeepClose(
    {
      monthlyIncomeDisplay: formatAdvisorCurrency(unemployment.monthlyIncome),
      minimumReserveDisplay: formatAdvisorCurrency(unemployment.minimumReserveTarget),
      optimalReserveDisplay: formatAdvisorCurrency(unemployment.optimalReserveTarget),
      annualIncomeAtRiskDisplay: formatAdvisorCurrency(unemployment.annualIncomeAtRisk),
    },
    northstarGoldenAnswerKey.uiDisplaySnapshots.unemploymentDashboard,
    "uiDisplaySnapshots.unemploymentDashboard",
  );

  const liability = calculateLiabilityGap(northstarGoldenLiabilityInputs);
  assertDeepClose(liability, northstarGoldenAnswerKey.liability, "liability");
  const liabilityChartData = transformLiabilityChartData(liability);
  const totalRisk = liability.totalHouseholdLiabilityRisk || liability.householdAutoLiabilityCoverage + liability.householdLiabilityGap;
  const coveragePctRaw = totalRisk > 0 ? Math.min(100, (liability.householdAutoLiabilityCoverage / totalRisk) * 100) : 0;
  assertDeepClose(
    {
      totalRisk,
      coveragePctRaw,
      coveragePctRoundedDisplay: `${coveragePctRaw.toFixed(0)}%`,
      chartData: liabilityChartData,
      metricDisplays: {
        wageGarnishmentRisk: formatLiabilityMetric(liability.householdWageGarnishmentRisk),
        nonQualifiedAssetsAtRisk: formatLiabilityMetric(liability.nonQualifiedAssetsAtRisk),
        totalLiabilityExposure: formatLiabilityMetric(totalRisk),
        autoLiabilityCoverage: formatLiabilityMetric(liability.householdAutoLiabilityCoverage),
        unprotectedLiabilityGap: formatLiabilityMetric(liability.householdLiabilityGap),
      },
    },
    northstarGoldenAnswerKey.uiDisplaySnapshots.liabilityDashboard,
    "uiDisplaySnapshots.liabilityDashboard",
  );

  const scenarioRecord: ScenarioModuleRecords = {
    life: { inputs: northstarGoldenLifeInputs, assumptions: northstarGoldenLifeAssumptions, output: lifeCore, updatedAt: "2026-05-22T00:00:00.000Z" },
    disability: { inputs: northstarGoldenDisabilityInputs, assumptions: northstarGoldenDisabilityAssumptions, output: disabilityCore, updatedAt: "2026-05-22T00:00:00.000Z" },
    unemployment: { inputs: northstarGoldenUnemploymentInputs, output: unemployment, updatedAt: "2026-05-22T00:00:00.000Z" },
    liability: { inputs: northstarGoldenLiabilityInputs, output: liability, updatedAt: "2026-05-22T00:00:00.000Z" },
  };
  const scenarioSummary = {
    lifeGapValue: getModuleGapValue("life", scenarioRecord),
    disabilityGapValue: getModuleGapValue("disability", scenarioRecord),
    unemploymentGapValue: getModuleGapValue("unemployment", scenarioRecord),
    liabilityGapValue: getModuleGapValue("liability", scenarioRecord),
    largestScenarioGap: getLargestScenarioGap(scenarioRecord),
  };
  assertDeepClose(scenarioSummary, northstarGoldenAnswerKey.scenarioSummary, "scenarioSummary");
  assertDeepClose(
    {
      life: formatGapCurrency(scenarioSummary.lifeGapValue),
      disability: formatGapCurrency(scenarioSummary.disabilityGapValue),
      unemployment: formatGapCurrency(scenarioSummary.unemploymentGapValue),
      liability: formatGapCurrency(scenarioSummary.liabilityGapValue),
      largest: formatGapCurrency(scenarioSummary.largestScenarioGap),
    },
    northstarGoldenAnswerKey.uiDisplaySnapshots.presentationModeGapLabels,
    "uiDisplaySnapshots.presentationModeGapLabels",
  );
  console.log("Northstar golden calculation check passed.");
}

runGoldenCheck();
