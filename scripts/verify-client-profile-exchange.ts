import { readFileSync } from "node:fs"
import { parseClientProfileFile } from "../src/lib/clientProfileExchange"

const sample = readFileSync(new URL("../examples/realistic-client-profile-import.json", import.meta.url), "utf8")
const validResult = parseClientProfileFile(sample)

if (!validResult.ok) throw new Error(`Example import failed validation: ${validResult.errors.join("; ")}`)
if (validResult.clients.length !== 1) throw new Error("Example import should contain exactly one client")
if (validResult.clients[0].annualIncome !== 300000) throw new Error("Example annual income was not preserved")
if (validResult.clients[0].ltdCoveragePercent !== 0.6) throw new Error("Decimal percentage units were not preserved")

const invalidResult = parseClientProfileFile(JSON.stringify({
  kind: "gap-tool-client-profiles",
  schemaVersion: 1,
  clients: [{ firstName: "Invalid", lastName: "Projection", age: 65, expectedRetirementAge: 60, annualIncome: 100000 }],
}))

if (invalidResult.ok) throw new Error("An invalid projection age range was accepted")

console.log("Client profile exchange checks passed")
