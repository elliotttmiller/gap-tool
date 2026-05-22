// @ts-ignore -- workspace tsconfig does not expose node:* type resolution
import { readFileSync } from "fs";
// @ts-ignore -- workspace tsconfig does not expose node:* type resolution
import { dirname, resolve } from "path";
// @ts-ignore -- workspace tsconfig does not expose node:* type resolution
import { fileURLToPath } from "url";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertContains(content: string, pattern: string | RegExp, context: string) {
  const matched = typeof pattern === "string" ? content.includes(pattern) : pattern.test(content);
  assert(matched, `${context}: missing ${String(pattern)}`);
}

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = resolve(dirname(currentFile), "../..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

function checkAppRoutesCoverage() {
  const app = readProjectFile("src/App.tsx");

  const requiredRoutes = [
    'path="/"',
    'path="clients/:clientId/overview"',
    'path="scenarios/:scenarioId"',
    'path="disability"',
    'path="life"',
    'path="unemployment"',
    'path="liability"',
    'path="/present/:scenarioId"',
    'path="settings"',
    'path="*"',
  ];

  for (const route of requiredRoutes) {
    assertContains(app, route, "App route coverage");
  }
}

function checkScenarioAndBuilderTabCoverage() {
  const scenarioDetail = readProjectFile("src/pages/ScenarioDetail.tsx");
  const riskModulePage = readProjectFile("src/pages/RiskModulePage.tsx");
  const presentation = readProjectFile("src/pages/Presentation.tsx");

  const requiredModules = ["life", "disability", "unemployment", "liability"] as const;
  for (const module of requiredModules) {
    assertContains(scenarioDetail, new RegExp(`${module}:\\s*\\{\\s*label:`), "Scenario detail tabs");
    assertContains(riskModulePage, new RegExp(`${module}:\\s*\\{\\s*label:`), "Risk module tabs");
    assertContains(presentation, new RegExp(`${module}:\\s*\\{\\s*title:`), "Presentation module copy");
  }
}

function checkModulePageCalculationBindings() {
  const life = readProjectFile("src/pages/LifeModulePage.tsx");
  assertContains(life, "calculateLifeInsuranceGap", "Life page calculator binding");
  assertContains(life, "calculateIncomeGapScenarios", "Life page income gap binding");
  assertContains(life, "saveLifeCalculation", "Life page store persistence");

  const disability = readProjectFile("src/pages/DisabilityModulePage.tsx");
  assertContains(disability, "calculateDisabilityGap", "Disability page calculator binding");
  assertContains(disability, "saveDisabilityCalculation", "Disability page store persistence");

  const unemployment = readProjectFile("src/pages/UnemploymentModulePage.tsx");
  assertContains(unemployment, "calculateUnemploymentGap", "Unemployment page calculator binding");
  assertContains(unemployment, "saveUnemploymentCalculation", "Unemployment page store persistence");

  const liability = readProjectFile("src/pages/LiabilityModulePage.tsx");
  assertContains(liability, "calculateLiabilityGap", "Liability page calculator binding");
  assertContains(liability, "saveLiabilityCalculation", "Liability page store persistence");
}

function checkOutputTabCoverage() {
  const lifeOutput = readProjectFile("src/features/risk-modules/life/components/LifeOutputView.tsx");
  assertContains(lifeOutput, 'setActiveTab("safe")', "Life output safe tab");
  assertContains(lifeOutput, 'setActiveTab("max")', "Life output max tab");
  assertContains(lifeOutput, "Module1Boxes", "Life output module 1 rendering");
  assertContains(lifeOutput, "Module2Boxes", "Life output module 2 rendering");

  const disabilityOutput = readProjectFile("src/features/risk-modules/disability/components/DisabilityOutputView.tsx");
  assertContains(disabilityOutput, 'value: "incomeGap"', "Disability visualization tab: income gap");
  assertContains(disabilityOutput, 'value: "premiumVsSelfInsured"', "Disability visualization tab: premium vs self-insured");
  assertContains(disabilityOutput, 'value: "jobComparison"', "Disability visualization tab: job comparison");
  assertContains(disabilityOutput, "PremiumVsSelfInsuredModule", "Disability premium-vs-self-insured module rendering");
  assertContains(disabilityOutput, "JobComparisonModule", "Disability job-comparison module rendering");
}

function checkFormulaRegistryCoverage() {
  const registry = readProjectFile("src/features/risk-modules/core/registry.ts");
  assertContains(registry, "life-v1.0.0", "Formula registry life version");
  assertContains(registry, "di-v1.0.0", "Formula registry disability version");
  assertContains(registry, "unemployment-v1.0.0", "Formula registry unemployment version");
  assertContains(registry, "liability-v1.0.0", "Formula registry liability version");
}

function checkScenarioSummaryBindings() {
  const summary = readProjectFile("src/lib/scenarioMetrics.ts");
  const explicitBranchModules = ["life", "disability", "unemployment"] as const;
  for (const module of explicitBranchModules) {
    assertContains(summary, `module === "${module}"`, "Scenario summary gap mapping");
  }
  assertContains(summary, "record.liability?.output?.exposureGap", "Scenario summary liability fallback mapping");
  assertContains(summary, "getLargestScenarioGap", "Scenario summary largest gap utility");
}

function runNorthstarSurfaceCoverageCheck() {
  checkAppRoutesCoverage();
  checkScenarioAndBuilderTabCoverage();
  checkModulePageCalculationBindings();
  checkOutputTabCoverage();
  checkFormulaRegistryCoverage();
  checkScenarioSummaryBindings();
  console.log("Northstar surface coverage check passed.");
}

runNorthstarSurfaceCoverageCheck();
