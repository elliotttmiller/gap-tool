import { calculateLifeInsuranceGap } from "../calculations/calculateLifeInsuranceGap";
import { LifeInputs, LifeAssumptions, LifeOutputs } from "../types";

export const lifeCase001 = {
  inputs: {
    advisorId: "advisor-001",
    clientId: "client-001",
    scenarioId: "scenario-001",
    currentAge: 40,
    retirementAge: 65,
    annualIncome: 100000,
    incomeReplacementYears: 20,
    incomeReplacementRatio: 1,
    groupLifeCoverage: 50000,
    privateLifeCoverage: 1000000,
    debtsTotal: 250000,
    educationGoal: 100000,
    finalExpenses: 25000,
    liquidAssetsAllocated: 0,
  } as LifeInputs,
  assumptions: {
    inflationRateAnnual: 0.03,
    discountRateAnnual: 0.04,
    incomeGrowthRateAnnual: 0.03,
    usePresentValue: false,
    includeLiquidAssetsOffset: false,
    deathBenefitTaxTreatment: "generally_income_tax_free",
  } as LifeAssumptions,
  expected: {
    replacementYears: 20,
    annualReplacementNeed: 100000,
    futureIncomeLost: 2000000,
    baseProtectionNeed: 2375000,
    existingCoverageTotal: 1050000,
    remainingGap: 1325000,
  },
};
