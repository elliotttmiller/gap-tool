import { z } from "zod"
import type { ClientRecord, CreateClientPayload } from "@/lib/store-types"

export const CLIENT_PROFILE_FILE_KIND = "gap-tool-client-profiles" as const
export const CLIENT_PROFILE_SCHEMA_VERSION = 1 as const

const benefitPeriodSchema = z.enum(["2y", "5y", "10y", "A65", "A67", "A70"])

const optionalNonNegativeNumber = z.number().finite().nonnegative().optional()

const clientProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  displayName: z.string().trim().max(200).optional(),
  email: z.string().trim().email("Email must be valid").max(254).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional(),
  clientType: z.enum(["individual", "couple"]).default("individual"),
  age: z.number().int().min(18).max(100),
  expectedRetirementAge: z.number().int().min(18).max(100),
  annualIncome: z.number().finite().nonnegative(),
  monthlyExpenses: optionalNonNegativeNumber,
  emergencySavings: optionalNonNegativeNumber,
  groupLifeCoverage: optionalNonNegativeNumber,
  privateLifeCoverage: optionalNonNegativeNumber,
  nonQualifiedAssets: optionalNonNegativeNumber,
  ltdCoveragePercent: z.number().finite().min(0).max(1).optional(),
  ltdMonthlyCap: optionalNonNegativeNumber,
  ltdTaxable: z.boolean().optional(),
  privateDisabilityBenefitMonthly: optionalNonNegativeNumber,
  privateDisabilityMonthlyPremium: optionalNonNegativeNumber,
  privateDisabilityBenefitPeriod: benefitPeriodSchema.optional().or(z.literal("")),
  disabilityBreakEvenRateOfReturn: z.number().finite().min(0).max(1).optional(),
  disabilityBreakEvenMonthsWithoutIncome: z.number().int().positive().optional(),
  spouseName: z.string().trim().max(200).optional(),
  spouseAge: z.number().int().min(18).max(100).optional(),
  spouseAnnualIncome: optionalNonNegativeNumber,
  spouseGroupLifeCoverage: optionalNonNegativeNumber,
  spousePrivateLifeCoverage: optionalNonNegativeNumber,
  spouseNonQualifiedAssets: optionalNonNegativeNumber,
  homeEquity: optionalNonNegativeNumber,
  autoLiabilityLimit: optionalNonNegativeNumber,
  umbrellaCoverage: optionalNonNegativeNumber,
}).superRefine((profile, context) => {
  if (profile.expectedRetirementAge <= profile.age) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["expectedRetirementAge"], message: "Projection end age must be greater than current age" })
  }
  if (profile.clientType === "couple" && !profile.spouseName?.trim()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["spouseName"], message: "Secondary earner name is required for a couple" })
  }
})

const clientProfileFileSchema = z.object({
  kind: z.literal(CLIENT_PROFILE_FILE_KIND),
  schemaVersion: z.literal(CLIENT_PROFILE_SCHEMA_VERSION),
  exportedAt: z.string().datetime().optional(),
  clients: z.array(clientProfileSchema).min(1, "The file must contain at least one client").max(500),
}).strict()

export type ClientProfileFile = z.infer<typeof clientProfileFileSchema>

export type ClientProfileImportResult =
  | { ok: true; clients: CreateClientPayload[] }
  | { ok: false; errors: string[] }

function profileToPayload(client: ClientRecord): CreateClientPayload {
  const profile = client.profile
  const legacyHomeEquity = Math.max(0, (profile.homeValue ?? 0) - (profile.mortgageBalance ?? 0))
  return {
    firstName: client.firstName,
    lastName: client.lastName,
    displayName: client.displayName,
    email: client.email,
    phone: client.phone,
    clientType: profile.clientType ?? "individual",
    age: profile.currentAge,
    expectedRetirementAge: profile.expectedRetirementAge,
    annualIncome: profile.annualEarnedIncome,
    monthlyExpenses: profile.monthlyHouseholdExpenses,
    emergencySavings: profile.emergencySavings,
    groupLifeCoverage: profile.groupLifeCoverage,
    privateLifeCoverage: profile.privateLifeCoverage,
    nonQualifiedAssets: profile.nonQualifiedAssets,
    ltdCoveragePercent: profile.ltdCoveragePercent,
    ltdMonthlyCap: profile.ltdMonthlyCap,
    ltdTaxable: profile.ltdTaxable,
    privateDisabilityBenefitMonthly: profile.privateDisabilityBenefitMonthly,
    privateDisabilityMonthlyPremium: profile.privateDisabilityMonthlyPremium,
    privateDisabilityBenefitPeriod: profile.privateDisabilityBenefitPeriod,
    disabilityBreakEvenRateOfReturn: profile.disabilityBreakEvenRateOfReturn,
    disabilityBreakEvenMonthsWithoutIncome: profile.disabilityBreakEvenMonthsWithoutIncome,
    spouseName: profile.spouseIncomeEarnerName,
    spouseAge: profile.spouseCurrentAge,
    spouseAnnualIncome: profile.spouseAnnualIncome,
    spouseGroupLifeCoverage: profile.spouseGroupLifeCoverage,
    spousePrivateLifeCoverage: profile.spousePrivateLifeCoverage,
    spouseNonQualifiedAssets: profile.spouseNonQualifiedAssets,
    homeEquity: profile.homeEquity ?? legacyHomeEquity,
    autoLiabilityLimit: profile.autoLiabilityLimit,
    umbrellaCoverage: profile.umbrellaCoverage,
  }
}

export function createClientProfileFile(clients: ClientRecord[]): ClientProfileFile {
  return {
    kind: CLIENT_PROFILE_FILE_KIND,
    schemaVersion: CLIENT_PROFILE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    clients: clients.map(profileToPayload),
  }
}

export function parseClientProfileFile(contents: string): ClientProfileImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(contents)
  } catch {
    return { ok: false, errors: ["The selected file is not valid JSON."] }
  }

  const result = clientProfileFileSchema.safeParse(parsed)
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.issues.slice(0, 12).map((issue) => {
        const clientIndex = typeof issue.path[1] === "number" ? `Client ${issue.path[1] + 1}: ` : ""
        const fieldPath = issue.path.slice(typeof issue.path[1] === "number" ? 2 : 0).join(".")
        return `${clientIndex}${fieldPath ? `${fieldPath}: ` : ""}${issue.message}`
      }),
    }
  }

  const clients = result.data.clients as CreateClientPayload[]
  return { ok: true, clients }
}

function safeFileName(value?: string): string {
  const normalized = (value ?? "client").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return normalized || "client"
}

export function downloadClientProfileFile(clients: ClientRecord[], name = "clients"): void {
  const file = createClientProfileFile(clients)
  const url = URL.createObjectURL(new Blob([`${JSON.stringify(file, null, 2)}\n`], { type: "application/json" }))
  const link = document.createElement("a")
  link.href = url
  link.download = `gap-tool-${safeFileName(name)}-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}
