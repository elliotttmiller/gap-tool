import { formatGroupedNumberInput, normalizeGroupedNumberInput } from "../src/lib/numberInput"

const cases = [
  { input: 75_555, formatted: "75,555" },
  { input: "544554", formatted: "544,554" },
  { input: "4620.50", formatted: "4,620.50" },
] as const

for (const testCase of cases) {
  const actual = formatGroupedNumberInput(testCase.input)
  if (actual !== testCase.formatted) {
    throw new Error(`Expected ${String(testCase.input)} to format as ${testCase.formatted}, received ${actual}`)
  }
}

const normalized = normalizeGroupedNumberInput("$ 544,554.25")
if (normalized !== "544554.25") {
  throw new Error(`Expected pasted currency to normalize to 544554.25, received ${normalized}`)
}

console.log("Number input formatting checks passed")
