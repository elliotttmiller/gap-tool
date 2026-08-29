import { z } from "zod"
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
  nonQualifiedAssets: string
  ltdCoveragePercent: string
  ltdMonthlyCap: string
  ltdTaxable: boolean
  privateDisabilityBenefitMonthly: string
  privateDisabilityMonthlyPremium: string
  privateDisabilityBenefitPeriod: DiBenefitPeriod | ""
  disabilityBreakEvenRateOfReturn: string
  disabilityBreakEvenMonthsWithoutIncome: string
  spouseFirstName: string
  spouseLastName: string
  spouseAge: string
  spouseAnnualIncome: string
  spouseGroupLifeCoverage: string
  spousePrivateLifeCoverage: string
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
  nonQualifiedAssets: "",
  ltdCoveragePercent: "60",
  ltdMonthlyCap: "",
  ltdTaxable: true,
  privateDisabilityBenefitMonthly: "",
  privateDisabilityMonthlyPremium: "",
  privateDisabilityBenefitPeriod: "",
  disabilityBreakEvenRateOfReturn: "6",
  disabilityBreakEvenMonthsWithoutIncome: "12",
  spouseFirstName: "",
  spouseLastName: "",
  spouseAge: "",
  spouseAnnualIncome: "",
  spouseGroupLifeCoverage: "",
  spousePrivateLifeCoverage: "",
  spouseNonQualifiedAssets: "",
  homeEquity: "",
  autoLiabilityLimit: "",
  umbrellaCoverage: "",
}

// ── Populate form from a stored ClientRecord ──────────────────────────────────

export function formFromClient(client: ClientRecord): ClientFormState {
  const legacyHomeEquity = Math.max(0, (client.profile.homeValue ?? 0) - (client.profile.mortgageBalance ?? 0))
  const spouseNameParts = (client.profile.spouseIncomeEarnerName ?? "").trim().split(/\s+/).filter(Boolean)
  const spouseLastName = spouseNameParts.length > 1 ? spouseNameParts.pop() ?? "" : ""
  const spouseFirstName = spouseNameParts.join(" ")
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
    nonQualifiedAssets: numberToInput(client.profile.nonQualifiedAssets),
    ltdCoveragePercent: numberToInput((client.profile.ltdCoveragePercent ?? 0.60) * 100),
    ltdMonthlyCap: numberToInput(client.profile.ltdMonthlyCap),
    ltdTaxable: client.profile.ltdTaxable ?? true,
    privateDisabilityBenefitMonthly: numberToInput(client.profile.privateDisabilityBenefitMonthly),
    privateDisabilityMonthlyPremium: numberToInput(client.profile.privateDisabilityMonthlyPremium),
    privateDisabilityBenefitPeriod: client.profile.privateDisabilityBenefitPeriod ?? "",
    disabilityBreakEvenRateOfReturn: numberToInput((client.profile.disabilityBreakEvenRateOfReturn ?? 0.06) * 100),
    disabilityBreakEvenMonthsWithoutIncome: numberToInput(client.profile.disabilityBreakEvenMonthsWithoutIncome ?? 12),
    spouseFirstName,
    spouseLastName,
    spouseAge: numberToInput(client.profile.spouseCurrentAge),
    spouseAnnualIncome: numberToInput(client.profile.spouseAnnualIncome),
    spouseGroupLifeCoverage: numberToInput(client.profile.spouseGroupLifeCoverage),
    spousePrivateLifeCoverage: numberToInput(client.profile.spousePrivateLifeCoverage),
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
  const spouseName = [form.spouseFirstName.trim(), form.spouseLastName.trim()].filter(Boolean).join(" ")
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
    nonQualifiedAssets: toNumber(form.nonQualifiedAssets),
    ltdCoveragePercent: toPercentNumber(form.ltdCoveragePercent),
    ltdMonthlyCap: toNumber(form.ltdMonthlyCap),
    ltdTaxable: form.ltdTaxable,
    privateDisabilityBenefitMonthly: toNumber(form.privateDisabilityBenefitMonthly),
    privateDisabilityMonthlyPremium: toNumber(form.privateDisabilityMonthlyPremium),
    privateDisabilityBenefitPeriod: form.privateDisabilityBenefitPeriod,
    disabilityBreakEvenRateOfReturn: toPercentNumber(form.disabilityBreakEvenRateOfReturn),
    disabilityBreakEvenMonthsWithoutIncome: toNumber(form.disabilityBreakEvenMonthsWithoutIncome),
    spouseName: spouseName || undefined,
    spouseAge: toNumber(form.spouseAge),
    spouseAnnualIncome: toNumber(form.spouseAnnualIncome),
    spouseGroupLifeCoverage: toNumber(form.spouseGroupLifeCoverage),
    spousePrivateLifeCoverage: toNumber(form.spousePrivateLifeCoverage),
    spouseNonQualifiedAssets: toNumber(form.spouseNonQualifiedAssets),
    homeEquity: toNumber(form.homeEquity),
    autoLiabilityLimit: toNumber(form.autoLiabilityLimit),
    umbrellaCoverage: toNumber(form.umbrellaCoverage),
  }
}

// ── Zod validation ────────────────────────────────────────────────────────────

const _requiredFieldSchema = z.object({
  clientType: z.enum(["individual", "couple"]),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  spouseFirstName: z.string(),
  spouseLastName: z.string(),
  spouseAge: z.string(),
  spouseAnnualIncome: z.string(),
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
}).superRefine((form, context) => {
  if (Number(form.expectedRetirementAge) <= Number(form.age)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Projection end age must be greater than current age", path: ["expectedRetirementAge"] })
  }
  if (form.clientType === "couple" && !form.spouseFirstName.trim()) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Secondary earner first name is required", path: ["spouseFirstName"] })
  }
  if (form.clientType === "couple" && !form.spouseLastName.trim()) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Secondary earner last name is required", path: ["spouseLastName"] })
  }
  if (form.clientType === "couple") {
    const spouseAge = Number(form.spouseAge)
    if (!form.spouseAge.trim() || !Number.isFinite(spouseAge) || spouseAge < 18 || spouseAge > 100) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Secondary earner age must be between 18 and 100", path: ["spouseAge"] })
    }
    const spouseAnnualIncome = Number(form.spouseAnnualIncome)
    if (!form.spouseAnnualIncome.trim() || !Number.isFinite(spouseAnnualIncome) || spouseAnnualIncome < 0) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Secondary earner annual income must be 0 or greater", path: ["spouseAnnualIncome"] })
    }
  }
})

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
