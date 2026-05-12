export type RiskModuleType = "life" | "disability" | "unemployment" | "liability";

export type ClientProfile = {
  id: string;
  advisorId: string;
  firstName: string;
  lastName: string;
  age: number;
  householdStatus: "single" | "married" | "partnered" | "divorced" | "widowed";
  dependents: number;
  annualEarnedIncome: number;
  spouseAnnualIncome?: number;
  monthlyExpenses: number;
  emergencySavings: number;
  liquidAssets?: number;
  investmentAssets?: number;
  debtsTotal?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type ScenarioStatus = "draft" | "ready_for_review" | "presented" | "archived";

export type Scenario = {
  id: string;
  advisorId: string;
  clientId: string;
  name: string;
  description?: string;
  moduleType: RiskModuleType;
  status: ScenarioStatus;
  createdAt: string;
  updatedAt: string;
};

export type AssumptionSourceType =
  | "system_default"
  | "advisor_input"
  | "client_provided"
  | "policy_document"
  | "imported_estimate";

export type ModelingAssumption<T = number | string | boolean> = {
  key: string;
  label: string;
  value: T;
  sourceType: AssumptionSourceType;
  description: string;
  editable: boolean;
  visibleInReport: boolean;
};

export type CalculationRun = {
  id: string;
  advisorId: string;
  clientId: string;
  scenarioId: string;
  moduleType: RiskModuleType;
  formulaVersion: string;
  inputSnapshot: Record<string, unknown>;
  assumptionSnapshot: Record<string, unknown>;
  outputSnapshot: Record<string, unknown>;
  chartDataSnapshot: Record<string, unknown>;
  narrativeSnapshot: Record<string, unknown>;
  disclaimerVersion: string;
  staticCopyVersion: string;
  createdAt: string;
  createdBy: string;
};

export type FormulaVersionMetadata = {
  moduleType: RiskModuleType;
  version: string;
  effectiveDate: string;
  description: string;
  changeSummary: string;
  deprecated: boolean;
};
