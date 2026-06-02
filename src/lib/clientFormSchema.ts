import { z } from "zod"
import type { LifePolicyType } from "@/features/risk-modules/life/types"
import type { DiBenefitPeriod } from "@/features/risk-modules/disability/types"
import type { ClientRecord, CreateClientPayload } from "@/lib/store-types"
import { toNumber, numberToInput } from "@/lib/utils"

// ── Shared form state type ────────────────────────────────────────────────────

export type ClientFormState = {
  clientType: "individual" | "couple"
  firstName: string
  lastName: string
  displayName: string
  age: string
  expectedRetirementAge: string
  annualIncome: string
  monthlyExpenses: string
  emergencySavings: string
  groupLifeCoverage: string
  privateLifeCoverage: string
  privateLifePolicyType: LifePolicyType
  privateLifeTermYears: string
  nonQualifiedAssets: string
  ltdCoveragePercent: string
  ltdMonthlyCap: string
  ltdTaxable: boolean
  privateDisabilityBenefitMonthly: string
  privateDisabilityMonthlyPremium: string
  privateDisabilityBenefitPeriod: DiBenefitPeriod | ""
  disabilityBreakEvenRateOfReturn: string
  disabilityBreakEvenMonthsWithoutIncome: string
  spouseName: string
  spouseAge: string
  spouseAnnualIncome: string
  spouseGroupLifeCoverage: string
  spousePrivateLifeCoverage: string
  spousePrivateLifePolicyType: LifePolicyType
  spousePrivateLifeTermYears: string
  spouseNonQualifiedAssets: string
  homeEquity: string
  autoLiabilityLimit: string
  umbrellaCoverage: string
}

// ── Empty/default form state ──────────────────────────────────────────────────

export const emptyClientForm: ClientFormState = {
  clientType: "individual",
  firstName: "",
  lastName: "",
  displayName: "",
  age: "",
  expectedRetirementAge: "65",
  annualIncome: "",
  monthlyExpenses: "",
  emergencySavings: "",
  groupLifeCoverage: "",
  privateLifeCoverage: "",
  privateLifePolicyType: "term",
  privateLifeTermYears: "20",
  nonQualifiedAssets: "",
  ltdCoveragePercent: "60",
  ltdMonthlyCap: "",
  ltdTaxable: true,
  privateDisabilityBenefitMonthly: "",
  privateDisabilityMonthlyPremium: "",
  privateDisabilityBenefitPeriod: "",
  disabilityBreakEvenRateOfReturn: "6",
  disabilityBreakEvenMonthsWithoutIncome: "12",
  spouseName: "",
  spouseAge: "",
  spouseAnnualIncome: "",
  spouseGroupLifeCoverage: "",
  spousePrivateLifeCoverage: "",
  spousePrivateLifePolicyType: "term",
  spousePrivateLifeTermYears: "15",
  spouseNonQualifiedAssets: "",
  homeEquity: "",
  autoLiabilityLimit: "",
  umbrellaCoverage: "",
}

// ── Populate form from a stored ClientRecord ──────────────────────────────────

export function formFromClient(client: ClientRecord): ClientFormState {
  const legacyHomeEquity = Math.max(0, (client.profile.homeValue ?? 0) - (client.profile.mortgageBalance ?? 0))
  return {
    clientType: client.profile.clientType ?? "individual",
    firstName: client.firstName,
    lastName: client.lastName,
    displayName: client.displayName,
    age: numberToInput(client.profile.currentAge),
    expectedRetirementAge: numberToInput(client.profile.expectedRetirementAge ?? 65),
    annualIncome: numberToInput(client.profile.annualEarnedIncome),
    monthlyExpenses: numberToInput(client.profile.monthlyHouseholdExpenses),
    emergencySavings: numberToInput(client.profile.emergencySavings),
    groupLifeCoverage: numberToInput(client.profile.groupLifeCoverage),
    privateLifeCoverage: numberToInput(client.profile.privateLifeCoverage),
    privateLifePolicyType: client.profile.privateLifePolicyType ?? "term",
    privateLifeTermYears: numberToInput(client.profile.privateLifeTermYears),
    nonQualifiedAssets: numberToInput(client.profile.nonQualifiedAssets),
    ltdCoveragePercent: numberToInput((client.profile.ltdCoveragePercent ?? 0.60) * 100),
    ltdMonthlyCap: numberToInput(client.profile.ltdMonthlyCap),
    ltdTaxable: client.profile.ltdTaxable ?? true,
    privateDisabilityBenefitMonthly: numberToInput(client.profile.privateDisabilityBenefitMonthly),
    privateDisabilityMonthlyPremium: numberToInput(client.profile.privateDisabilityMonthlyPremium),
    privateDisabilityBenefitPeriod: client.profile.privateDisabilityBenefitPeriod ?? "",
    disabilityBreakEvenRateOfReturn: numberToInput((client.profile.disabilityBreakEvenRateOfReturn ?? 0.06) * 100),
    disabilityBreakEvenMonthsWithoutIncome: numberToInput(client.profile.disabilityBreakEvenMonthsWithoutIncome ?? 12),
    spouseName: client.profile.spouseIncomeEarnerName ?? "",
    spouseAge: numberToInput(client.profile.spouseCurrentAge),
    spouseAnnualIncome: numberToInput(client.profile.spouseAnnualIncome),
    spouseGroupLifeCoverage: numberToInput(client.profile.spouseGroupLifeCoverage),
    spousePrivateLifeCoverage: numberToInput(client.profile.spousePrivateLifeCoverage),
    spousePrivateLifePolicyType: client.profile.spousePrivateLifePolicyType ?? "term",
    spousePrivateLifeTermYears: numberToInput(client.profile.spousePrivateLifeTermYears),
    spouseNonQualifiedAssets: numberToInput(client.profile.spouseNonQualifiedAssets),
    homeEquity: numberToInput(client.profile.homeEquity ?? legacyHomeEquity),
    autoLiabilityLimit: numberToInput(client.profile.autoLiabilityLimit),
    umbrellaCoverage: numberToInput(client.profile.umbrellaCoverage),
  }
}

// ── Convert form state to store payload ───────────────────────────────────────

function toPercentNumber(value: string): number | undefined {
  const parsed = toNumber(value)
  return parsed === undefined ? undefined : parsed / 100
}

export function formToPayload(form: ClientFormState): CreateClientPayload {
  return {
    clientType: form.clientType,
    firstName: form.firstName,
    lastName: form.lastName,
    displayName: form.displayName || undefined,
    age: toNumber(form.age),
    expectedRetirementAge: toNumber(form.expectedRetirementAge),
    annualIncome: toNumber(form.annualIncome),
    monthlyExpenses: toNumber(form.monthlyExpenses),
    emergencySavings: toNumber(form.emergencySavings),
    groupLifeCoverage: toNumber(form.groupLifeCoverage),
    privateLifeCoverage: toNumber(form.privateLifeCoverage),
    privateLifePolicyType: form.privateLifePolicyType,
    privateLifeTermYears: toNumber(form.privateLifeTermYears),
    nonQualifiedAssets: toNumber(form.nonQualifiedAssets),
    ltdCoveragePercent: toPercentNumber(form.ltdCoveragePercent),
    ltdMonthlyCap: toNumber(form.ltdMonthlyCap),
    ltdTaxable: form.ltdTaxable,
    privateDisabilityBenefitMonthly: toNumber(form.privateDisabilityBenefitMonthly),
    privateDisabilityMonthlyPremium: toNumber(form.privateDisabilityMonthlyPremium),
    privateDisabilityBenefitPeriod: form.privateDisabilityBenefitPeriod,
    disabilityBreakEvenRateOfReturn: toPercentNumber(form.disabilityBreakEvenRateOfReturn),
    disabilityBreakEvenMonthsWithoutIncome: toNumber(form.disabilityBreakEvenMonthsWithoutIncome),
    spouseName: form.spouseName || undefined,
    spouseAge: toNumber(form.spouseAge),
    spouseAnnualIncome: toNumber(form.spouseAnnualIncome),
    spouseGroupLifeCoverage: toNumber(form.spouseGroupLifeCoverage),
    spousePrivateLifeCoverage: toNumber(form.spousePrivateLifeCoverage),
    spousePrivateLifePolicyType: form.spousePrivateLifePolicyType,
    spousePrivateLifeTermYears: toNumber(form.spousePrivateLifeTermYears),
    spouseNonQualifiedAssets: toNumber(form.spouseNonQualifiedAssets),
    homeEquity: toNumber(form.homeEquity),
    autoLiabilityLimit: toNumber(form.autoLiabilityLimit),
    umbrellaCoverage: toNumber(form.umbrellaCoverage),
  }
}

// ── Zod validation ────────────────────────────────────────────────────────────

const _requiredFieldSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  age: z.string()
    .min(1, "Age is required")
    .refine(
      (v) => { const n = Number(v); return Number.isFinite(n) && n >= 18 && n <= 100 },
      "Age must be between 18 and 100",
    ),
  expectedRetirementAge: z.string()
    .min(1, "Projection end age is required")
    .refine(
      (v) => { const n = Number(v); return Number.isFinite(n) && n >= 18 && n <= 100 },
      "Projection end age must be between 18 and 100",
    ),
  annualIncome: z.string()
    .min(1, "Annual income is required")
    .refine(
      (v) => { const n = Number(v); return Number.isFinite(n) && n >= 0 },
      "Annual income must be 0 or greater",
    ),
}).refine(
  (form) => Number(form.expectedRetirementAge) > Number(form.age),
  { message: "Projection end age must be greater than current age", path: ["expectedRetirementAge"] },
)

/** Returns true when the form passes all required-field validations. */
export function isClientFormValid(form: ClientFormState): boolean {
  return _requiredFieldSchema.safeParse(form).success
}

/** Returns an array of user-facing error messages (empty when the form is valid). */
export function validateClientForm(form: ClientFormState): string[] {
  const result = _requiredFieldSchema.safeParse(form)
  if (result.success) return []
  return result.error.errors.map((e) => e.message)
}
