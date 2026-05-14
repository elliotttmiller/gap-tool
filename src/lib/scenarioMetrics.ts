import { RiskModuleType, ScenarioModuleRecords } from "@/lib/store"

export function getModuleGapValue(module: RiskModuleType, record?: ScenarioModuleRecords): number | undefined {
  if (!record) return undefined
  if (module === "life") return record.life?.output?.remainingGap
  if (module === "disability") return record.disability?.output?.totalGap
  if (module === "unemployment") return record.unemployment?.output?.totalUncoveredShortfall
  return record.liability?.output?.exposureGap
}

export function getLargestScenarioGap(record?: ScenarioModuleRecords): number | undefined {
  if (!record) return undefined
  const values = [
    getModuleGapValue("life", record) ?? 0,
    getModuleGapValue("disability", record) ?? 0,
    getModuleGapValue("unemployment", record) ?? 0,
    getModuleGapValue("liability", record) ?? 0,
  ].filter((value) => value > 0)
  return values.length ? Math.max(...values) : undefined
}

export function formatGapCurrency(value?: number): string {
  if (typeof value !== "number") return "Not calculated"
  return `$${Math.round(value).toLocaleString()}`
}
