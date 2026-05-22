import type { ClientFormState } from "../lib/clientFormSchema";
import type { LifeInputs, LifeAssumptions } from "../features/risk-modules/life/types";
import type { DisabilityInputs, DisabilityAssumptions } from "../features/risk-modules/disability/types";
import type { UnemploymentInputs } from "../features/risk-modules/unemployment/types";
import type { LiabilityInputs } from "../features/risk-modules/liability/types";
import type { BreakEvenInputs } from "../features/risk-modules/disability/calculators/calculateBreakEven";
import type { BenefitTaxInputs } from "../features/risk-modules/disability/calculators/calculateBenefitTax";
import type { SsdiInputs } from "../features/risk-modules/disability/calculators/calculateSsdi";
import type { SavingsBridgeInputs } from "../features/risk-modules/disability/calculators/calculateSavingsBridge";

/**
 * Northstar Golden Test Client
 * ────────────────────────────
 * This fixture is intentionally deterministic. It starts with every currently
 * available client setup form field populated, then defines the exact module
 * inputs used for the complete end-to-end golden calculation workflow.
 *
 * Do not change these values casually. Any change requires regenerating and
 * reviewing the answer key in northstarGoldenAnswerKey.ts and the Markdown
 * testing reference in docs/testing/northstar-golden-test-answer-key.md.
 */

export const NORTHSTAR_GOLDEN_IDS = {
  advisorId: "advisor-northstar-golden",
  clientId: "client-northstar-golden",
  scenarioId: "scenario-northstar-golden",
} as const;

export const northstarGoldenClientSetupForm = {
  clientType: "couple",
  firstName: "Jordan",
  lastName: "Walker",
  displayName: "Jordan & Taylor Walker",
  age: "40",
  annualIncome: "150000",
  monthlyExpenses: "8000",

  groupLifeCoverage: "300000",
  privateLifeCoverage: "500000",
  privateLifePolicyType: "term",
  privateLifeTermYears: "20",
  nonQualifiedAssets: "500000",

  ltdCoveragePercent: "60",
  ltdMonthlyCap: "8000",
  ltdTaxable: true,
  privateDisabilityBenefitMonthly: "4000",
  privateDisabilityMonthlyPremium: "250",
  privateDisabilityBenefitPeriod: "A65",
  disabilityBreakEvenRateOfReturn: "6",
  disabilityBreakEvenMonthsWithoutIncome: "12",

  spouseName: "Taylor Walker",
  spouseAge: "38",
  spouseAnnualIncome: "50000",
  spouseGroupLifeCoverage: "0",
  spousePrivateLifeCoverage: "0",
  spousePrivateLifePolicyType: "term",
  spousePrivateLifeTermYears: "15",
  spouseNonQualifiedAssets: "0",

  autoLiabilityLimit: "250000",
} satisfies ClientFormState;

export const northstarGoldenClientSetupPayloadExpected = {
  clientType: "couple",
  firstName: "Jordan",
  lastName: "Walker",
  displayName: "Jordan & Taylor Walker",
  age: 40,
  annualIncome: 150000,
  monthlyExpenses: 8000,
  groupLifeCoverage: 300000,
  privateLifeCoverage: 500000,
  privateLifePolicyType: "term",
  privateLifeTermYears: 20,
  nonQualifiedAssets: 500000,
  ltdCoveragePercent: 0.6,
  ltdMonthlyCap: 8000,
  ltdTaxable: true,
  privateDisabilityBenefitMonthly: 4000,
  privateDisabilityMonthlyPremium: 250,
  privateDisabilityBenefitPeriod: "A65",
  disabilityBreakEvenRateOfReturn: 0.06,
  disabilityBreakEvenMonthsWithoutIncome: 12,
  spouseName: "Taylor Walker",
  spouseAge: 38,
  spouseAnnualIncome: 50000,
  spouseGroupLifeCoverage: 0,
  spousePrivateLifeCoverage: 0,
  spousePrivateLifePolicyType: "term",
  spousePrivateLifeTermYears: 15,
  spouseNonQualifiedAssets: 0,
  autoLiabilityLimit: 250000,
} as const;

export const northstarGoldenLifeAssumptions = {
  inflationRateAnnual: 0.03,
  discountRateAnnual: 0.04,
  incomeGrowthRateAnnual: 0.03,
  usePresentValue: false,
  includeLiquidAssetsOffset: false,
  deathBenefitTaxTreatment: "generally_income_tax_free",
  deathBenefitIncomeYieldAnnual: 0.05,
} satisfies LifeAssumptions;

export const northstarGoldenDisabilityAssumptions = {
  incomeGrowthRateAnnual: 0.03,
} satisfies DisabilityAssumptions;

export const northstarGoldenLifeInputs = {
  advisorId: NORTHSTAR_GOLDEN_IDS.advisorId,
  clientId: NORTHSTAR_GOLDEN_IDS.clientId,
  scenarioId: NORTHSTAR_GOLDEN_IDS.scenarioId,
  earnerName: "Jordan Walker",
  currentAge: 40,
  retirementAge: 65,
  annualIncome: 150000,
  spouseAnnualIncome: 50000,
  incomeReplacementYears: 25,
  incomeReplacementRatio: 1.0,
  groupLifeCoverage: 300000,
  privateLifeCoverage: 500000,
  privateLifePolicyType: "term",
  privateLifeTermYears: 20,
  nonQualifiedAssets: 500000,
  debtsTotal: 100000,
  educationGoal: 80000,
  finalExpenses: 25000,
  liquidAssetsAllocated: 30000,
  assetBase: 500000,
  safeWithdrawalRate: 0.04,
  maxWithdrawalRate: 0.06,
  incomeGapRoi: 0.05,
} satisfies LifeInputs;

export const northstarGoldenDisabilityInputs = {
  advisorId: NORTHSTAR_GOLDEN_IDS.advisorId,
  clientId: NORTHSTAR_GOLDEN_IDS.clientId,
  scenarioId: NORTHSTAR_GOLDEN_IDS.scenarioId,
  annualEarnedIncome: 150000,
  currentAge: 40,
  retirementAge: 65,
  ltdCoveragePercent: 0.6,
  ltdMonthlyCap: 8000,
  ltdTaxable: true,
  privateDiBenefitMonthly: 4000,
  privateDiBenefitPeriod: "A65",
  privateDiMonthlyPremium: 250,
  breakEvenRateOfReturn: 0.06,
  breakEvenMonthsWithoutIncome: 12,
} satisfies DisabilityInputs;

export const northstarGoldenUnemploymentInputs = {
  annualIncome: 150000,
  monthlyExpenses: 8000,
  emergencySavings: 30000,
  severanceMonths: 1,
  unemploymentBenefitMonthly: 2500,
  unemploymentBenefitDurationMonths: 6,
  estimatedJobSearchMonths: 9,
  spouseIncome: 50000,
} satisfies UnemploymentInputs;

export const northstarGoldenLiabilityInputs = {
  annualIncome: 150000,
  spouseAnnualIncome: 50000,
  currentAge: 40,
  spouseCurrentAge: 38,
  retirementAge: 65,
  nonQualifiedAssets: 500000,
  homeValue: 650000,
  mortgageBalance: 350000,
  investmentAssets: 500000,
  savingsAssets: 30000,
  autoLiabilityLimit: 250000,
  homeLiabilityLimit: 500000,
  umbrellaCoverage: 1000000,
  estimatedLawsuitExposure: 1500000,
} satisfies LiabilityInputs;

export const northstarGoldenBreakEvenInputs = {
  monthlyPremium: 250,
  monthlyBenefit: 4000,
  annualRateOfReturn: 0.06,
  monthsWithoutIncome: 12,
} satisfies BreakEvenInputs;

export const northstarGoldenBenefitTaxInputs = {
  annualIncome: 150000,
  grossMonthlyBenefit: 7500,
  coveragePercent: 0.6,
  employerPaidPremium: true,
  filingStatus: "mfj",
  stateTaxRate: 0.0495,
} satisfies BenefitTaxInputs;

export const northstarGoldenSsdiInputs = {
  careerAvgAnnualIncome: 150000,
  annualIncomeAtDisability: 150000,
} satisfies SsdiInputs;

export const northstarGoldenSavingsBridgeInputs = {
  monthlyTakeHomeIncome: 8750,
  monthlyExpenses: 8000,
  liquidSavings: 30000,
  eliminationPeriodDays: 90,
  monthlyLtdBenefit: 9250,
} satisfies SavingsBridgeInputs;
