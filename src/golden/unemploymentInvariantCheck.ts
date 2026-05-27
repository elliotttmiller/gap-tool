import { calculateUnemploymentGap } from "../features/risk-modules/unemployment/calculations/calculateUnemploymentGap";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEqual(actual: number, expected: number, label: string) {
  assert(actual === expected, `${label}: expected ${expected}, received ${actual}`);
}

function runUnemploymentInvariantCheck() {
  const severanceOnly = calculateUnemploymentGap({
    annualIncome: 100000,
    monthlyExpenses: 8000,
    emergencySavings: 20000,
    severanceMonthly: 5000,
    severanceDurationMonths: 3,
    unemploymentBenefitMonthly: 0,
    unemploymentBenefitDurationMonths: 0,
    estimatedJobSearchMonths: 6,
    spouseIncome: 0,
  });
  assertEqual(severanceOnly.totalOffsetDuringSearch, 15000, "severanceOnly.totalOffsetDuringSearch");
  assertEqual(severanceOnly.netCashNeeded, 33000, "severanceOnly.netCashNeeded");

  const mixedOffsets = calculateUnemploymentGap({
    annualIncome: 150000,
    monthlyExpenses: 8000,
    emergencySavings: 30000,
    severanceMonthly: 12500,
    severanceDurationMonths: 1,
    unemploymentBenefitMonthly: 2500,
    unemploymentBenefitDurationMonths: 6,
    estimatedJobSearchMonths: 9,
    spouseIncome: 50000,
  });
  assertEqual(mixedOffsets.totalOffsetDuringSearch, 27500, "mixedOffsets.totalOffsetDuringSearch");
  assertEqual(mixedOffsets.netCashNeeded, 44500, "mixedOffsets.netCashNeeded");
}

runUnemploymentInvariantCheck();
console.log("✅ unemploymentInvariantCheck passed");
