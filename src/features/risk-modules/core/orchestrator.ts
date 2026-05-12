import { RiskModuleType, CalculationRun } from "./types";
import { formulaRegistry } from "./registry";
import { transformLifeProtectionStack } from "../life/transformers";

// A mock validation layer. In a real app we would use Zod matching the schemas.
function validateModuleInputs<T>(moduleType: RiskModuleType, inputs: any): T {
  return inputs as T;
}

function validateModuleAssumptions<T>(moduleType: RiskModuleType, assumptions: any): T {
  return assumptions as T;
}

function transformModuleChartData(moduleType: RiskModuleType, outputs: any) {
  if (moduleType === "life") {
    return transformLifeProtectionStack(outputs);
  }
  // TODO: add transformers for other modules
  return {};
}

function getStaticModuleNarrative(moduleType: RiskModuleType, outputs: any) {
  // In a real app we'd map to narrative templates.
  return {};
}

export function runRiskCalculation<TInput, TAssumptions>({
  moduleType,
  inputs,
  assumptions,
  formulaVersion,
}: {
  moduleType: RiskModuleType;
  inputs: TInput;
  assumptions: TAssumptions;
  formulaVersion?: string;
}): CalculationRun {
  const resolvedVersion = formulaVersion ?? formulaRegistry[moduleType].current;

  const validatedInputs = validateModuleInputs<TInput>(moduleType, inputs);
  const validatedAssumptions = validateModuleAssumptions<TAssumptions>(moduleType, assumptions);

  const calculationFunction = (formulaRegistry[moduleType].versions as any)[resolvedVersion];

  if (!calculationFunction) {
    throw new Error(
      `No calculation function registered for ${moduleType} version ${resolvedVersion}`
    );
  }

  const outputs = calculationFunction(validatedInputs, validatedAssumptions);

  const chartData = transformModuleChartData(moduleType, outputs);

  const narrative = getStaticModuleNarrative(moduleType, outputs);

  return {
    id: crypto.randomUUID(),
    advisorId: (validatedInputs as any).advisorId ?? "unknown",
    clientId: (validatedInputs as any).clientId ?? "unknown",
    scenarioId: (validatedInputs as any).scenarioId ?? "unknown",
    moduleType,
    formulaVersion: resolvedVersion,
    inputSnapshot: validatedInputs as Record<string, unknown>,
    assumptionSnapshot: validatedAssumptions as Record<string, unknown>,
    outputSnapshot: outputs,
    chartDataSnapshot: chartData,
    narrativeSnapshot: narrative,
    disclaimerVersion: "disclaimer-v1.0.0",
    staticCopyVersion: "copy-v1.0.0",
    createdAt: new Date().toISOString(),
    createdBy: (validatedInputs as any).advisorId ?? "unknown",
  };
}
