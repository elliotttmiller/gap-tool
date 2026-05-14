/**
 * Shared utility types for the risk-module formula engine.
 * Domain-level types (ClientRecord, ScenarioRecord, RiskModuleType, etc.)
 * live in src/lib/store-types.ts to avoid duplication.
 */

import type { RiskModuleType } from "@/lib/store-types"

export type AssumptionSourceType =
  | "system_default"
  | "advisor_input"
  | "client_provided"
  | "policy_document"
  | "imported_estimate"

export type ModelingAssumption<T = number | string | boolean> = {
  key: string
  label: string
  value: T
  sourceType: AssumptionSourceType
  description: string
  editable: boolean
  visibleInReport: boolean
}

export type FormulaVersionMetadata = {
  moduleType: RiskModuleType
  version: string
  effectiveDate: string
  description: string
  changeSummary: string
  deprecated: boolean
}
