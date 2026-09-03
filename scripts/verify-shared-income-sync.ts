class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()

  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

Object.defineProperty(globalThis, "localStorage", { value: new MemoryStorage() })

const { useAppStore } = await import("../src/lib/store")

const clientId = useAppStore.getState().createClient({
  firstName: "Shared",
  lastName: "Income",
  age: 40,
  expectedRetirementAge: 65,
  annualIncome: 100_000,
})
const scenarioId = useAppStore.getState().createScenario({
  clientId,
  name: "Shared income regression",
  includedModules: ["life", "disability", "unemployment", "liability"],
  activeModule: "life",
})

function assertIncome(expected: number, source: string) {
  const records = useAppStore.getState().moduleRecordsByScenarioId[scenarioId]
  const actual = {
    life: records.life?.inputs.annualIncome,
    disability: records.disability?.inputs.annualEarnedIncome,
    unemployment: records.unemployment?.inputs.annualIncome,
    liability: records.liability?.inputs.annualIncome,
  }
  for (const [module, value] of Object.entries(actual)) {
    if (value !== expected) throw new Error(`${source} update did not sync ${module}: expected ${expected}, received ${value}`)
  }
}

const updates = useAppStore.getState()
const initial = updates.moduleRecordsByScenarioId[scenarioId]
updates.updateLifeInputs(scenarioId, { ...initial.life!.inputs, annualIncome: 110_000 })
assertIncome(110_000, "Life")

updates.updateDisabilityInputs(scenarioId, { ...useAppStore.getState().moduleRecordsByScenarioId[scenarioId].disability!.inputs, annualEarnedIncome: 120_000 })
assertIncome(120_000, "Disability")

updates.updateUnemploymentInputs(scenarioId, { ...useAppStore.getState().moduleRecordsByScenarioId[scenarioId].unemployment!.inputs, annualIncome: 130_000 })
assertIncome(130_000, "Unemployment")

updates.updateLiabilityInputs(scenarioId, { ...useAppStore.getState().moduleRecordsByScenarioId[scenarioId].liability!.inputs, annualIncome: 140_000 })
assertIncome(140_000, "Liability")

console.log("Shared annual income synchronization checks passed")
