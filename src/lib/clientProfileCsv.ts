import {
  CLIENT_PROFILE_FILE_KIND,
  CLIENT_PROFILE_SCHEMA_VERSION,
  parseClientProfileFile,
  type ClientProfileImportResult,
} from "@/lib/clientProfileExchange"

type CsvRow = Record<string, string>

const NUMBER_FIELDS = new Set([
  "age",
  "expectedRetirementAge",
  "annualIncome",
  "monthlyExpenses",
  "emergencySavings",
  "groupLifeCoverage",
  "privateLifeCoverage",
  "nonQualifiedAssets",
  "ltdCoveragePercent",
  "ltdMonthlyCap",
  "privateDisabilityBenefitMonthly",
  "privateDisabilityMonthlyPremium",
  "disabilityBreakEvenRateOfReturn",
  "disabilityBreakEvenMonthsWithoutIncome",
  "spouseAge",
  "spouseAnnualIncome",
  "spouseGroupLifeCoverage",
  "spousePrivateLifeCoverage",
  "spouseNonQualifiedAssets",
  "homeEquity",
  "autoLiabilityLimit",
  "umbrellaCoverage",
])

const PERCENT_DECIMAL_FIELDS = new Set(["ltdCoveragePercent", "disabilityBreakEvenRateOfReturn"])
const BOOLEAN_FIELDS = new Set(["ltdTaxable"])

function parseCsvRows(contents: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false

  for (let index = 0; index < contents.length; index += 1) {
    const char = contents[index]
    const next = contents[index + 1]

    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"'
        index += 1
      } else {
        quoted = !quoted
      }
      continue
    }

    if (char === "," && !quoted) {
      row.push(cell.trim())
      cell = ""
      continue
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1
      row.push(cell.trim())
      cell = ""
      if (row.some((value) => value.length > 0)) rows.push(row)
      row = []
      continue
    }

    cell += char
  }

  if (quoted) throw new Error("CSV contains an unterminated quoted field.")
  row.push(cell.trim())
  if (row.some((value) => value.length > 0)) rows.push(row)
  return rows
}

function toBoolean(value: string): boolean | undefined {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return undefined
  if (["true", "yes", "y", "1"].includes(normalized)) return true
  if (["false", "no", "n", "0"].includes(normalized)) return false
  throw new Error(`Expected true/false, yes/no, or 1/0 but received “${value}”.`)
}

function toNumber(field: string, value: string): number | undefined {
  const normalized = value.replace(/[$,%\s]/g, "").replace(/,/g, "")
  if (!normalized) return undefined
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) throw new Error(`Expected a numeric value but received “${value}”.`)
  if (PERCENT_DECIMAL_FIELDS.has(field) && parsed > 1 && parsed <= 100) return parsed / 100
  return parsed
}

function normalizeRow(row: CsvRow, rowNumber: number): Record<string, unknown> {
  const client: Record<string, unknown> = {}

  for (const [field, rawValue] of Object.entries(row)) {
    const value = rawValue.trim()
    if (!value) continue

    try {
      if (NUMBER_FIELDS.has(field)) {
        client[field] = toNumber(field, value)
      } else if (BOOLEAN_FIELDS.has(field)) {
        client[field] = toBoolean(value)
      } else {
        client[field] = value
      }
    } catch (error) {
      throw new Error(`Row ${rowNumber}, ${field}: ${error instanceof Error ? error.message : "Invalid value"}`)
    }
  }

  return client
}

export function parseClientProfileCsv(contents: string): ClientProfileImportResult {
  let rows: string[][]
  try {
    rows = parseCsvRows(contents.replace(/^\uFEFF/, ""))
  } catch (error) {
    return { ok: false, errors: [error instanceof Error ? error.message : "The selected CSV file could not be parsed."] }
  }

  if (rows.length < 2) return { ok: false, errors: ["CSV must include a header row and at least one client row."] }

  const headers = rows[0].map((header) => header.trim())
  const duplicateHeaders = headers.filter((header, index) => header && headers.indexOf(header) !== index)
  if (duplicateHeaders.length) return { ok: false, errors: [`CSV contains duplicate column headers: ${Array.from(new Set(duplicateHeaders)).join(", ")}.`] }

  const required = ["firstName", "lastName", "age", "expectedRetirementAge", "annualIncome"]
  const missing = required.filter((field) => !headers.includes(field))
  if (missing.length) return { ok: false, errors: [`CSV is missing required column${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}.`] }

  if (rows.length - 1 > 500) return { ok: false, errors: ["CSV may contain at most 500 client rows."] }

  const clients: Record<string, unknown>[] = []
  const errors: string[] = []

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const values = rows[rowIndex]
    const record: CsvRow = {}
    headers.forEach((header, columnIndex) => {
      if (header) record[header] = values[columnIndex] ?? ""
    })

    try {
      clients.push(normalizeRow(record, rowIndex + 1))
    } catch (error) {
      errors.push(error instanceof Error ? error.message : `Row ${rowIndex + 1}: invalid data.`)
      if (errors.length >= 12) break
    }
  }

  if (errors.length) return { ok: false, errors }

  return parseClientProfileFile(JSON.stringify({
    kind: CLIENT_PROFILE_FILE_KIND,
    schemaVersion: CLIENT_PROFILE_SCHEMA_VERSION,
    clients,
  }))
}
