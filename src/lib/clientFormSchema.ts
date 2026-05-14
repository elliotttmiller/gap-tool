import { z } from "zod"
import type { LifePolicyType } from "@/features/risk-modules/life/types"
import type { ClientRecord, CreateClientPayload } from "@/lib/store-types"
import { toNumber, numberToInput } from "@/lib/utils"

// ── Shared form state type ────────────────────────────────────────────────────

export type ClientFormState = {
  clientType: "individual" | "couple"
  firstName: string
  lastName: string
  displayName: string
  age: string
  annualIncome: string
  monthlyExpenses: string
  groupLifeCoverage: string
  privateLifeCoverage: string
  privateLifePolicyType: LifePolicyType
  privateLifeTermYears: string
  nonQualifiedAssets: string
  spouseName: string
  spouseAge: string
  spouseAnnualIncome: string
  spouseGroupLifeCoverage: string
  spousePrivateLifeCoverage: string
  spousePrivateLifePolicyType: LifePolicyType
  spousePrivateLifeTermYears: string
  spouseNonQualifiedAssets: string
  autoLiabilityLimit: string
}

// ── Empty/default form state ──────────────────────────────────────────────────

export const emptyClientForm: ClientFormState = {
  clientType: "individual",
  firstName: "",
  lastName: "",
  displayName: "",
  age: "",
  annualIncome: "",
  monthlyExpenses: "",
  groupLifeCoverage: "",
  privateLifeCoverage: "",
  privateLifePolicyType: "term",
  privateLifeTermYears: "20",
  nonQualifiedAssets: "",
  spouseName: "",
  spouseAge: "",
  spouseAnnualIncome: "",
  spouseGroupLifeCoverage: "",
  spousePrivateLifeCoverage: "",
  spousePrivateLifePolicyType: "term",
  spousePrivateLifeTermYears: "15",
  spouseNonQualifiedAssets: "",
  autoLiabilityLimit: "",
}

// ── Populate form from a stored ClientRecord ──────────────────────────────────

export function formFromClient(client: ClientRecord): ClientFormState {
  return {
    clientType: client.profile.clientType ?? "individual",
    firstName: client.firstName,
    lastName: client.lastName,
    displayName: client.displayName,
    age: numberToInput(client.profile.currentAge),
    annualIncome: numberToInput(client.profile.annualEarnedIncome),
    monthlyExpenses: numberToInput(client.profile.monthlyHouseholdExpenses),
    groupLifeCoverage: numberToInput(client.profile.groupLifeCoverage),
    privateLifeCoverage: numberToInput(client.profile.privateLifeCoverage),
    privateLifePolicyType: client.profile.privateLifePolicyType ?? "term",
    privateLifeTermYears: numberToInput(client.profile.privateLifeTermYears),
    nonQualifiedAssets: numberToInput(client.profile.nonQualifiedAssets),
    spouseName: client.profile.spouseIncomeEarnerName ?? "",
    spouseAge: numberToInput(client.profile.spouseCurrentAge),
    spouseAnnualIncome: numberToInput(client.profile.spouseAnnualIncome),
    spouseGroupLifeCoverage: numberToInput(client.profile.spouseGroupLifeCoverage),
    spousePrivateLifeCoverage: numberToInput(client.profile.spousePrivateLifeCoverage),
    spousePrivateLifePolicyType: client.profile.spousePrivateLifePolicyType ?? "term",
    spousePrivateLifeTermYears: numberToInput(client.profile.spousePrivateLifeTermYears),
    spouseNonQualifiedAssets: numberToInput(client.profile.spouseNonQualifiedAssets),
    autoLiabilityLimit: numberToInput(client.profile.autoLiabilityLimit),
  }
}

// ── Convert form state to store payload ───────────────────────────────────────

export function formToPayload(form: ClientFormState): CreateClientPayload {
  return {
    clientType: form.clientType,
    firstName: form.firstName,
    lastName: form.lastName,
    displayName: form.displayName || undefined,
    age: toNumber(form.age),
    annualIncome: toNumber(form.annualIncome),
    monthlyExpenses: toNumber(form.monthlyExpenses),
    groupLifeCoverage: toNumber(form.groupLifeCoverage),
    privateLifeCoverage: toNumber(form.privateLifeCoverage),
    privateLifePolicyType: form.privateLifePolicyType,
    privateLifeTermYears: toNumber(form.privateLifeTermYears),
    nonQualifiedAssets: toNumber(form.nonQualifiedAssets),
    spouseName: form.spouseName || undefined,
    spouseAge: toNumber(form.spouseAge),
    spouseAnnualIncome: toNumber(form.spouseAnnualIncome),
    spouseGroupLifeCoverage: toNumber(form.spouseGroupLifeCoverage),
    spousePrivateLifeCoverage: toNumber(form.spousePrivateLifeCoverage),
    spousePrivateLifePolicyType: form.spousePrivateLifePolicyType,
    spousePrivateLifeTermYears: toNumber(form.spousePrivateLifeTermYears),
    spouseNonQualifiedAssets: toNumber(form.spouseNonQualifiedAssets),
    autoLiabilityLimit: toNumber(form.autoLiabilityLimit),
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
  annualIncome: z.string()
    .min(1, "Annual income is required")
    .refine(
      (v) => { const n = Number(v); return Number.isFinite(n) && n >= 0 },
      "Annual income must be 0 or greater",
    ),
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
