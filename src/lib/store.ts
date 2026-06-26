import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { LifeInputs, LifeAssumptions, LifeOutputs } from "@/features/risk-modules/life/types"
import type { DisabilityInputs, DisabilityAssumptions, DisabilityOutputs } from "@/features/risk-modules/disability/types"
import type { UnemploymentInputs, UnemploymentOutputs } from "@/features/risk-modules/unemployment/types"
import type { LiabilityInputs, LiabilityOutputs } from "@/features/risk-modules/liability/types"
import { sanitizeLifeInputs } from "@/features/risk-modules/life/utils/sanitizeLifeInputs"
import type {
  ClientFinancialProfile,
  ClientRecord,
  ClientStatus,
  ClientType,
  CreateClientPayload,
  CreateScenarioPayload,
  DisabilityModuleRecord,
  LiabilityModuleRecord,
  LifeModuleRecord,
  PersistedAppData,
  ProfileCompletionStatus,
  RiskModuleType,
  ScenarioModuleRecords,
  ScenarioRecord,
  ScenarioStatus,
  UnemploymentModuleRecord,
} from "./store-types"

export type {
  RiskModuleType,
  ClientStatus,
  ProfileCompletionStatus,
  ScenarioStatus,
  ClientType,
  ClientFinancialProfile,
  ClientRecord,
  ScenarioRecord,
  LifeModuleRecord,
  DisabilityModuleRecord,
  UnemploymentModuleRecord,
  LiabilityModuleRecord,
  ScenarioModuleRecords,
  CreateClientPayload,
  PersistedAppData,
} from "./store-types"

const DEFAULT_ADVISOR_ID = "local-advisor"
const DEFAULT_RETIREMENT_AGE = 65

const defaultLifeAssumptions: LifeAssumptions = {
  inflationRateAnnual: 0.03,
  discountRateAnnual: 0.04,
  incomeGrowthRateAnnual: 0.03,
  usePresentValue: false,
  includeLiquidAssetsOffset: false,
  deathBenefitTaxTreatment: "generally_income_tax_free",
  deathBenefitIncomeYieldAnnual: 0.05,
}

const defaultDisabilityAssumptions: DisabilityAssumptions = {
  incomeGrowthRateAnnual: 0.03,
  colaMethod: "fixed",
  colaRate: 0.03,
}

function nowIso() { return new Date().toISOString() }
function toDisplayName(firstName: string, lastName: string, displayName?: string) {
  return displayName?.trim() || `${firstName.trim()} ${lastName.trim()}`.trim()
}

function getProfileCompletion(profile: ClientFinancialProfile): ProfileCompletionStatus {
  if (!profile.primaryIncomeEarnerName || !profile.currentAge || !profile.annualEarnedIncome) return "missing_required_info"
  if (
    profile.monthlyHouseholdExpenses !== undefined &&
    profile.emergencySavings !== undefined &&
    profile.groupLifeCoverage !== undefined &&
    profile.privateLifeCoverage !== undefined &&
    profile.nonQualifiedAssets !== undefined &&
    profile.homeEquity !== undefined &&
    profile.autoLiabilityLimit !== undefined &&
    profile.umbrellaCoverage !== undefined
  ) return "ready_full_analysis"
  return "ready_basic_analysis"
}

function getClientStatus(profile: ClientFinancialProfile): ClientStatus {
  return profile.annualEarnedIncome ? "active" : "draft"
}

function buildProfileFromPayload(id: string, payload: CreateClientPayload): ClientFinancialProfile {
  const firstName = payload.firstName.trim()
  const lastName = payload.lastName.trim()
  const clientType = payload.clientType ?? "individual"
  const nonQualifiedAssets = payload.nonQualifiedAssets ?? 0
  return {
    clientId: id,
    clientType,
    primaryIncomeEarnerName: `${firstName} ${lastName}`.trim(),
    currentAge: payload.age,
    expectedRetirementAge: payload.expectedRetirementAge ?? DEFAULT_RETIREMENT_AGE,
    annualEarnedIncome: payload.annualIncome,
    spouseIncomeEarnerName: clientType === "couple" ? payload.spouseName?.trim() : "",
    spouseCurrentAge: clientType === "couple" ? payload.spouseAge : undefined,
    spouseAnnualIncome: clientType === "couple" ? payload.spouseAnnualIncome ?? 0 : 0,
    monthlyHouseholdExpenses: payload.monthlyExpenses,
    emergencySavings: payload.emergencySavings ?? 0,
    dependents: 0,
    debtsTotal: 0,
    educationFundingGoal: 0,
    finalExpenses: 25000,
    groupLifeCoverage: payload.groupLifeCoverage ?? 0,
    privateLifeCoverage: payload.privateLifeCoverage ?? 0,
    privateLifePolicyType: payload.privateLifePolicyType ?? "term",
    privateLifeTermYears: payload.privateLifeTermYears ?? 20,
    spouseGroupLifeCoverage: clientType === "couple" ? payload.spouseGroupLifeCoverage ?? 0 : 0,
    spousePrivateLifeCoverage: clientType === "couple" ? payload.spousePrivateLifeCoverage ?? 0 : 0,
    spousePrivateLifePolicyType: payload.spousePrivateLifePolicyType ?? "term",
    spousePrivateLifeTermYears: payload.spousePrivateLifeTermYears ?? 15,
    nonQualifiedAssets,
    spouseNonQualifiedAssets: clientType === "couple" ? payload.spouseNonQualifiedAssets ?? 0 : 0,
    employerStdBenefitMonthly: 0,
    employerLtdBenefitMonthly: 0,
    ltdCoveragePercent: payload.ltdCoveragePercent ?? 0.60,
    ltdMonthlyCap: payload.ltdMonthlyCap ?? 0,
    ltdTaxable: payload.ltdTaxable ?? true,
    privateDisabilityBenefitMonthly: payload.privateDisabilityBenefitMonthly ?? 0,
    privateDisabilityMonthlyPremium: payload.privateDisabilityMonthlyPremium ?? 0,
    privateDisabilityBenefitPeriod: payload.privateDisabilityBenefitPeriod ?? "",
    disabilityBreakEvenRateOfReturn: payload.disabilityBreakEvenRateOfReturn ?? 0.06,
    disabilityBreakEvenMonthsWithoutIncome: payload.disabilityBreakEvenMonthsWithoutIncome ?? 12,
    stateBenefitEstimateMonthly: 0,
    homeValue: 0,
    mortgageBalance: 0,
    homeEquity: payload.homeEquity ?? 0,
    savingsAssets: payload.emergencySavings ?? 0,
    investmentAssets: nonQualifiedAssets,
    autoLiabilityLimit: payload.autoLiabilityLimit ?? 0,
    umbrellaCoverage: payload.umbrellaCoverage ?? 0,
  }
}

function buildUpdatedProfile(client: ClientRecord, updates: Partial<CreateClientPayload>, firstName: string, lastName: string): ClientFinancialProfile {
  const nextClientType = updates.clientType ?? client.profile.clientType ?? "individual"
  const nonQualifiedAssets = updates.nonQualifiedAssets ?? client.profile.nonQualifiedAssets ?? 0
  const homeEquity = updates.homeEquity ?? client.profile.homeEquity ?? Math.max(0, (client.profile.homeValue ?? 0) - (client.profile.mortgageBalance ?? 0))
  return {
    ...client.profile,
    clientType: nextClientType,
    primaryIncomeEarnerName: `${firstName} ${lastName}`.trim(),
    currentAge: updates.age ?? client.profile.currentAge,
    expectedRetirementAge: updates.expectedRetirementAge ?? client.profile.expectedRetirementAge ?? DEFAULT_RETIREMENT_AGE,
    annualEarnedIncome: updates.annualIncome ?? client.profile.annualEarnedIncome,
    monthlyHouseholdExpenses: updates.monthlyExpenses ?? client.profile.monthlyHouseholdExpenses,
    emergencySavings: updates.emergencySavings ?? client.profile.emergencySavings ?? 0,
    spouseIncomeEarnerName: nextClientType === "couple" ? updates.spouseName?.trim() ?? client.profile.spouseIncomeEarnerName : "",
    spouseCurrentAge: nextClientType === "couple" ? updates.spouseAge ?? client.profile.spouseCurrentAge : undefined,
    spouseAnnualIncome: nextClientType === "couple" ? updates.spouseAnnualIncome ?? client.profile.spouseAnnualIncome ?? 0 : 0,
    groupLifeCoverage: updates.groupLifeCoverage ?? client.profile.groupLifeCoverage,
    privateLifeCoverage: updates.privateLifeCoverage ?? client.profile.privateLifeCoverage,
    privateLifePolicyType: updates.privateLifePolicyType ?? client.profile.privateLifePolicyType,
    privateLifeTermYears: updates.privateLifeTermYears ?? client.profile.privateLifeTermYears,
    nonQualifiedAssets,
    spouseGroupLifeCoverage: nextClientType === "couple" ? updates.spouseGroupLifeCoverage ?? client.profile.spouseGroupLifeCoverage ?? 0 : 0,
    spousePrivateLifeCoverage: nextClientType === "couple" ? updates.spousePrivateLifeCoverage ?? client.profile.spousePrivateLifeCoverage ?? 0 : 0,
    spousePrivateLifePolicyType: updates.spousePrivateLifePolicyType ?? client.profile.spousePrivateLifePolicyType,
    spousePrivateLifeTermYears: updates.spousePrivateLifeTermYears ?? client.profile.spousePrivateLifeTermYears,
    spouseNonQualifiedAssets: nextClientType === "couple" ? updates.spouseNonQualifiedAssets ?? client.profile.spouseNonQualifiedAssets ?? 0 : 0,
    ltdCoveragePercent: updates.ltdCoveragePercent ?? client.profile.ltdCoveragePercent ?? 0.60,
    ltdMonthlyCap: updates.ltdMonthlyCap ?? client.profile.ltdMonthlyCap ?? 0,
    ltdTaxable: updates.ltdTaxable ?? client.profile.ltdTaxable ?? true,
    privateDisabilityBenefitMonthly: updates.privateDisabilityBenefitMonthly ?? client.profile.privateDisabilityBenefitMonthly ?? 0,
    privateDisabilityMonthlyPremium: updates.privateDisabilityMonthlyPremium ?? client.profile.privateDisabilityMonthlyPremium ?? 0,
    privateDisabilityBenefitPeriod: updates.privateDisabilityBenefitPeriod ?? client.profile.privateDisabilityBenefitPeriod ?? "",
    disabilityBreakEvenRateOfReturn: updates.disabilityBreakEvenRateOfReturn ?? client.profile.disabilityBreakEvenRateOfReturn ?? 0.06,
    disabilityBreakEvenMonthsWithoutIncome: updates.disabilityBreakEvenMonthsWithoutIncome ?? client.profile.disabilityBreakEvenMonthsWithoutIncome ?? 12,
    homeValue: 0,
    mortgageBalance: 0,
    homeEquity,
    savingsAssets: updates.emergencySavings ?? client.profile.emergencySavings ?? client.profile.savingsAssets ?? 0,
    investmentAssets: nonQualifiedAssets,
    autoLiabilityLimit: updates.autoLiabilityLimit ?? client.profile.autoLiabilityLimit ?? 0,
    umbrellaCoverage: updates.umbrellaCoverage ?? client.profile.umbrellaCoverage ?? 0,
  }
}

function prefillLifeInputs(profile: ClientFinancialProfile, clientId: string, scenarioId: string): LifeInputs {
  const yearsToRetirement = Math.max(0, (profile.expectedRetirementAge ?? DEFAULT_RETIREMENT_AGE) - (profile.currentAge ?? 40))
  return sanitizeLifeInputs({
    advisorId: DEFAULT_ADVISOR_ID,
    clientId,
    scenarioId,
    earnerName: profile.primaryIncomeEarnerName,
    currentAge: profile.currentAge ?? 40,
    retirementAge: profile.expectedRetirementAge ?? DEFAULT_RETIREMENT_AGE,
    annualIncome: profile.annualEarnedIncome ?? 0,
    spouseAnnualIncome: profile.clientType === "couple" ? profile.spouseAnnualIncome ?? 0 : 0,
    incomeReplacementYears: yearsToRetirement,
    incomeReplacementRatio: 0.70,
    groupLifeCoverage: profile.groupLifeCoverage ?? 0,
    privateLifeCoverage: profile.privateLifeCoverage ?? 0,
    privateLifePolicyType: profile.privateLifePolicyType ?? "term",
    privateLifeTermYears: profile.privateLifeTermYears ?? Math.min(20, yearsToRetirement || 20),
    nonQualifiedAssets: (profile.nonQualifiedAssets ?? 0) + (profile.spouseNonQualifiedAssets ?? 0),
    debtsTotal: profile.debtsTotal ?? 0,
    educationGoal: profile.educationFundingGoal ?? 0,
    finalExpenses: profile.finalExpenses ?? 25000,
    liquidAssetsAllocated: profile.savingsAssets ?? 0,
    targetIncomeSupportPct: 0.85,
    safeIncomeCoveragePct: 0.85,
    maxCoverageRoi: 0.06,
    incomeGapRoi: 0.05,
  })
}

function prefillDisabilityInputs(profile: ClientFinancialProfile, clientId: string, scenarioId: string): DisabilityInputs {
  return {
    advisorId: DEFAULT_ADVISOR_ID,
    clientId,
    scenarioId,
    annualEarnedIncome: profile.annualEarnedIncome ?? 0,
    currentAge: profile.currentAge ?? 40,
    retirementAge: profile.expectedRetirementAge ?? DEFAULT_RETIREMENT_AGE,
    ltdCoveragePercent: profile.ltdCoveragePercent ?? 0.60,
    ltdMonthlyCap: profile.ltdMonthlyCap ?? 0,
    ltdTaxable: profile.ltdTaxable ?? true,
    privateDiBenefitMonthly: profile.privateDisabilityBenefitMonthly ?? 0,
    privateDiBenefitPeriod: profile.privateDisabilityBenefitPeriod ?? "",
    privateDiMonthlyPremium: profile.privateDisabilityMonthlyPremium ?? 0,
    breakEvenRateOfReturn: profile.disabilityBreakEvenRateOfReturn ?? 0.06,
    breakEvenMonthsWithoutIncome: profile.disabilityBreakEvenMonthsWithoutIncome ?? 12,
  }
}

function prefillUnemploymentInputs(profile: ClientFinancialProfile): UnemploymentInputs {
  return {
    annualIncome: profile.annualEarnedIncome ?? 0,
    monthlyExpenses: profile.monthlyHouseholdExpenses ?? Math.round((profile.annualEarnedIncome ?? 0) / 12),
    emergencySavings: profile.emergencySavings ?? 0,
    severanceMonthly: 0,
    severanceDurationMonths: 0,
    unemploymentBenefitMonthly: 0,
    unemploymentBenefitDurationMonths: 0,
    estimatedJobSearchMonths: 6,
    spouseIncome: profile.clientType === "couple" ? profile.spouseAnnualIncome ?? 0 : 0,
  }
}

function prefillLiabilityInputs(profile: ClientFinancialProfile): LiabilityInputs {
  const nonQualifiedAssets = (profile.nonQualifiedAssets ?? 0) + (profile.spouseNonQualifiedAssets ?? 0)
  const legacyHomeEquity = Math.max(0, (profile.homeValue ?? 0) - (profile.mortgageBalance ?? 0))
  return {
    annualIncome: profile.annualEarnedIncome ?? 0,
    spouseAnnualIncome: profile.clientType === "couple" ? profile.spouseAnnualIncome ?? 0 : 0,
    currentAge: profile.currentAge ?? 40,
    spouseCurrentAge: profile.spouseCurrentAge ?? profile.currentAge ?? 40,
    retirementAge: profile.expectedRetirementAge ?? DEFAULT_RETIREMENT_AGE,
    garnishmentRate: 0.25,
    incomeGrowthRate: 0.03,
    disposableIncomeRatio: 0.65,
    nonQualifiedAssets,
    businessOwnershipValue: 0,
    homeEquity: profile.homeEquity ?? legacyHomeEquity,
    savingsAssets: profile.savingsAssets ?? profile.emergencySavings ?? 0,
    investmentAssets: nonQualifiedAssets,
    autoLiabilityLimit: profile.autoLiabilityLimit ?? 0,
    umbrellaCoverage: profile.umbrellaCoverage ?? 0,
  }
}
