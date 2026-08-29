import { readFileSync } from "node:fs"
import { parseClientProfileCsv } from "../src/lib/clientProfileCsv"
import { parseClientProfileFile } from "../src/lib/clientProfileExchange"

const sample = readFileSync(new URL("../examples/realistic-client-profile-import.json", import.meta.url), "utf8")
const validResult = parseClientProfileFile(sample)

if (!validResult.ok) throw new Error(`Example import failed validation: ${validResult.errors.join("; ")}`)
if (validResult.clients.length !== 1) throw new Error("Example import should contain exactly one client")
if (validResult.clients[0].annualIncome !== 300000) throw new Error("Example annual income was not preserved")
if (validResult.clients[0].ltdCoveragePercent !== 0.6) throw new Error("Decimal percentage units were not preserved")

const csvResult = parseClientProfileCsv([
  "firstName,lastName,clientType,age,expectedRetirementAge,annualIncome,ltdCoveragePercent,ltdTaxable,spouseName,spouseAge,spouseAnnualIncome",
  'Jordan,Morgan,couple,41,65,"$300,000",60,yes,Casey Morgan,39,85000',
].join("\n"))

if (!csvResult.ok) throw new Error(`CSV import failed validation: ${csvResult.errors.join("; ")}`)
if (csvResult.clients.length !== 1) throw new Error("CSV import should contain exactly one client")
if (csvResult.clients[0].annualIncome !== 300000) throw new Error("CSV currency normalization failed")
if (csvResult.clients[0].ltdCoveragePercent !== 0.6) throw new Error("CSV percentage normalization failed")
if (csvResult.clients[0].ltdTaxable !== true) throw new Error("CSV boolean normalization failed")

const invalidResult = parseClientProfileFile(JSON.stringify({
  kind: "gap-tool-client-profiles",
  schemaVersion: 1,
  clients: [{ firstName: "Invalid", lastName: "Projection", age: 65, expectedRetirementAge: 60, annualIncome: 100000 }],
}))

if (invalidResult.ok) throw new Error("An invalid projection age range was accepted")

console.log("Client profile exchange checks passed")
