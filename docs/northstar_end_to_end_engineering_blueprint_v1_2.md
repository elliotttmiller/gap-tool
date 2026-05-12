# NorthStar Deterministic Logic Engine Blueprint  
## Formula, Assumption, Calculation, Visualization, Audit, and Engineering Specification

**Version:** 1.2.0  
**Date:** May 12, 2026  
**Revision:** Integrated advisor dashboard command-center strategy, Tremor Blocks/Tremor component source policy, dashboard view model, advisor usability rules, production-grade income gap analysis workspace structure, and unified visualization dependency policy.  
**Product:** NorthStar  
**Product category:** Advisor-focused risk-management visualization platform  
**Core directive:** Local deterministic logic engine only. No AI assist, no AI summaries, no AI interpretation, no AI-generated advisor language, no AI-driven predictions.

---

## 0. Executive Summary

NorthStar is a deterministic, advisor-facing risk visualization platform designed to help financial advisors, insurance advisors, disability insurance specialists, and risk-planning professionals explain high-impact financial disruption events to clients.

NorthStar is not a full financial planning suite. It is not an AI financial advisor. It is not a product recommendation engine. It is not an underwriting, legal, tax, actuarial opinion, or suitability system.

NorthStar’s purpose is to make risk exposure visible before any solution conversation begins.

The master product principle is:

> **Show the gap before selling the solution — using transparent local calculations, not AI-generated advice.**

This document defines the full engineering specification for NorthStar’s deterministic logic engine, including:

1. Source-of-truth hierarchy.
2. End-to-end calculation pipeline.
3. Formula versioning architecture.
4. Input validation rules.
5. Assumption governance.
6. Life Insurance module formulas.
7. Disability Insurance module formulas.
8. Unemployment module formulas.
9. Liability / Lawsuit module formulas.
10. Chart data transformation rules.
11. Static narrative templates.
12. Audit trail requirements.
13. Report snapshot requirements.
14. Compliance language controls.
15. Testing and regression framework.
16. MVP and production formula roadmaps.
17. Development implementation checklist.
18. UI/UX component ownership standards.
19. Phased implementation roadmap and production-readiness gates.
20. Advisor dashboard command center and Tremor-based UI/UX reference architecture.

NorthStar’s engine must be deterministic, transparent, auditable, version-controlled, and testable. Every calculated number must be traceable to:

```txt
validated input
+ explicit assumption
+ formula version
+ calculation function
+ output snapshot
+ chart transformer
+ report/disclaimer version
```

---

## 0.1 Integrated Reference Evaluation

The supplemental reference titled **NorthStrategic Architecture & Module Infrastructure Overview** was reviewed and incorporated where it added implementation value. The reference is strongest as an architecture consolidation document: it reinforces NorthStar’s deterministic product boundary, standard module infrastructure, Disability Insurance time-series architecture, chart transformer discipline, UI/component ownership strategy, phased implementation sequence, and quality/governance checklist.

The reference does not materially change the formula specification already defined in this blueprint. Its main value is operational hardening: it clarifies how the formulas, modules, UI layers, audit logs, and presentation surfaces should be organized and governed during development.

Useful additions integrated from the reference include:

```txt
1. Explicit UI/UX component ownership rules.
2. Module infrastructure standard including /types and /components as first-class layers.
3. Stronger statement that all calculations must be pure functions with zero side effects.
4. Clearer Disability Insurance time-series flagship framing.
5. Chart transformer responsibilities beyond data mapping, including annotations, comparative layouts, depletion markers, and responsive scaling.
6. Phased implementation roadmap with phase gates.
7. Production-readiness checklist for module release.
8. Stronger report/audit reconstruction language.
```

The reference is treated as an implementation-hardening layer, not as a source of new legal, tax, actuarial, or regulatory authority.

---

## 1. Authoritative Source Hierarchy

NorthStar must distinguish between official authority, professional standards, industry planning conventions, and internal product assumptions.

There is no single universal official formula that determines “the correct amount” of life insurance, disability insurance, umbrella coverage, or emergency protection for every client. NorthStar must not imply that its outputs are official required amounts. Instead, the platform uses transparent deterministic planning formulas and documents the assumptions behind each modeled scenario.

### 1.1 Tier 1 — Official and Professional Reference Layer

These sources inform disclosures, tax treatment, benefit eligibility, assumption transparency, consumer protection, and professional communication discipline.

| Area | Source | NorthStar Use |
|---|---|---|
| Life insurance and disability insurance federal tax treatment | IRS | Default tax assumptions and tax-related disclaimers |
| SSDI eligibility | Social Security Administration | Optional SSDI assumption rules; no automatic approval prediction |
| Employer disability benefits and benefit claims | Department of Labor / EBSA | Employer benefit plan context and disability benefit workflow awareness |
| Life insurance illustration consumer protection | NAIC | Disclosure discipline for illustrative outputs |
| Actuarial communication discipline | Actuarial Standards Board ASOP No. 41 | Assumption, method, data, and limitation disclosure framework |
| Advisor financial planning process | CFP Board practice standards | Client information, assumptions, analysis, and advisor review workflow |

### 1.2 Tier 2 — Industry Planning Methodology Layer

NorthStar’s formulas belong here. These are not official regulatory formulas. They are deterministic planning methodologies used for risk visualization.

Examples:

```txt
Needs analysis
Capital needs analysis
Human life value analysis
Income replacement analysis
Present value of future income stream
Benefit offset modeling
Emergency reserve runway modeling
Lifestyle compression modeling
Scenario comparison
Coverage gap modeling
Asset exposure modeling
```

### 1.3 Tier 3 — NorthStar Product Rules

NorthStar’s internal rules are strict:

```txt
No AI layer.
No AI-generated narrative.
No AI-generated recommendation.
No carrier recommendation.
No product recommendation.
No legal advice.
No tax advice.
No underwriting determination.
No guaranteed outcome.
All outputs are illustrative.
All assumptions are visible.
All calculations are reproducible.
All formulas are version-controlled.
All reports retain calculation snapshots.
Advisor judgment remains the interpretation layer.
```

---

## 2. Product and Modeling Philosophy

NorthStar should be engineered as a deterministic risk modeling kernel surrounded by validation, assumption governance, chart transformers, static templates, and immutable calculation snapshots.

### 2.1 Deterministic Engine Principle

```txt
All modeled outputs must be produced by deterministic formulas,
validated inputs,
explicit assumptions,
and version-controlled calculation logic.
```

### 2.2 The Four-Layer Intelligence Model

```txt
Formula Engine = Truth Layer
Visualization Layer = Comprehension Layer
Static Narrative Layer = Explanation Support Layer
Advisor = Judgment Layer
```

The software does not interpret the client’s best course of action. It visualizes risk exposure and gives the advisor a structured, compliant surface for discussion.

### 2.3 Universal Risk Formula Pattern

Every NorthStar module follows the same conceptual structure:

```txt
Current Financial Baseline
- Risk Event Impact
+ Existing Protection / Available Offsets
= Modeled Remaining Exposure
```

A more detailed workflow:

```txt
1. Identify risk event.
2. Establish current financial baseline.
3. Quantify existing protection.
4. Model disruption.
5. Account for available offsets.
6. Calculate remaining gap.
7. Convert result into chart-ready visual data.
8. Generate static explanatory template.
9. Snapshot the calculation.
10. Render advisor workspace and presentation/report mode.
```

---

## 3. Full End-to-End Pipeline

NorthStar’s pipeline must be explicitly structured. No page component should bypass this flow.

```txt
Advisor selects or creates client
  ↓
Advisor creates scenario
  ↓
Advisor selects risk module
  ↓
System loads module input schema
  ↓
Advisor enters client facts and module inputs
  ↓
System validates inputs
  ↓
System loads default or advisor-selected assumptions
  ↓
Advisor reviews or edits assumptions
  ↓
System resolves formula version
  ↓
System runs deterministic calculation engine
  ↓
System aggregates outputs
  ↓
System transforms outputs into chart data
  ↓
System generates static narrative blocks
  ↓
System creates calculation run snapshot
  ↓
System renders advisor output workspace
  ↓
System renders presentation/report mode
  ↓
Advisor interprets result with client
```

### 3.1 Pipeline Contracts

Every pipeline stage must have a contract:

| Stage | Contract |
|---|---|
| Input | Raw advisor-entered facts |
| Validation | Schema-validated, typed values |
| Assumptions | Explicit modeling parameters |
| Calculation | Pure deterministic function |
| Output | Numeric structured model output |
| Transformer | Chart-ready derived data |
| Narrative | Static text selected/interpolated from output |
| Snapshot | Immutable calculation record |
| Presentation | Client-facing display of outputs and assumptions |

---

## 3.2 Pipeline Hardening Rules

Every workflow phase must remain independently testable and replaceable. The platform must never allow page-level UI components, chart components, or presentation components to bypass validation or call raw formulas directly.

Mandatory pipeline controls:

```txt
Raw input must be validated before calculation.
Assumptions must be loaded, displayed, and snapshotted before calculation.
Formula versions must be resolved before any output is generated.
Calculation functions must be pure and side-effect free.
Chart data must be produced only by transformer functions.
Static narratives must be generated only after outputs are finalized.
Audit snapshots must capture inputs, assumptions, outputs, narratives, disclaimer versions, and chart data.
Presentation/report views must render from saved calculation outputs or snapshots, not recompute silently.
```

This rule prevents hidden recalculation drift between the advisor workspace, presentation mode, and exported reports.

---

## 4. Core Data Objects

### 4.1 Risk Module Type

```ts
export type RiskModuleType =
  | "life"
  | "disability"
  | "unemployment"
  | "liability";
```

### 4.2 Client Profile

```ts
export type ClientProfile = {
  id: string;
  advisorId: string;

  firstName: string;
  lastName: string;
  age: number;

  householdStatus:
    | "single"
    | "married"
    | "partnered"
    | "divorced"
    | "widowed";

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
```

### 4.3 Scenario

```ts
export type ScenarioStatus =
  | "draft"
  | "ready_for_review"
  | "presented"
  | "archived";

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
```

### 4.4 Modeling Assumption

```ts
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
```

### 4.5 Calculation Run

The `CalculationRun` object is the primary audit artifact.

```ts
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
```

---

## 5. Formula Versioning Architecture

Formula versioning is mandatory. Any change to output-producing logic must result in a version update.

### 5.1 Formula Registry

```ts
export type FormulaVersionMetadata = {
  moduleType: RiskModuleType;
  version: string;
  effectiveDate: string;
  description: string;
  changeSummary: string;
  deprecated: boolean;
};

export const formulaRegistry = {
  life: {
    current: "life-v1.0.0",
    versions: {
      "life-v1.0.0": calculateLifeOutputsV1,
    },
  },
  disability: {
    current: "di-v1.0.0",
    versions: {
      "di-v1.0.0": calculateDisabilityOutputsV1,
    },
  },
  unemployment: {
    current: "unemployment-v1.0.0",
    versions: {
      "unemployment-v1.0.0": calculateUnemploymentOutputsV1,
    },
  },
  liability: {
    current: "liability-v1.0.0",
    versions: {
      "liability-v1.0.0": calculateLiabilityOutputsV1,
    },
  },
} as const;
```

### 5.2 Versioning Rule

```txt
If a formula change can alter an output number, the formula version must change.
If a formula version changes, previous calculation runs remain untouched.
If historical outputs need to be displayed, use the historical snapshot.
Never recalculate historical reports using new formula versions unless explicitly creating a new calculation run.
```

### 5.3 Formula Metadata Example

```ts
export const lifeFormulaVersions: Record<string, FormulaVersionMetadata> = {
  "life-v1.0.0": {
    moduleType: "life",
    version: "life-v1.0.0",
    effectiveDate: "2026-05-12",
    description: "MVP capital needs model using income replacement, obligations, and available resources.",
    changeSummary: "Initial deterministic Life Insurance modeling version.",
    deprecated: false,
  },
};
```

---

## 6. Calculation Orchestrator

All risk modules must use the same calculation orchestrator.

```ts
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
  const resolvedVersion =
    formulaVersion ?? formulaRegistry[moduleType].current;

  const validatedInputs = validateModuleInputs(moduleType, inputs);
  const validatedAssumptions =
    validateModuleAssumptions(moduleType, assumptions);

  const calculationFunction =
    formulaRegistry[moduleType].versions[resolvedVersion];

  if (!calculationFunction) {
    throw new Error(
      `No calculation function registered for ${moduleType} version ${resolvedVersion}`
    );
  }

  const outputs = calculationFunction(
    validatedInputs,
    validatedAssumptions
  );

  const chartData = transformModuleChartData(moduleType, outputs);

  const narrative = getStaticModuleNarrative(moduleType, outputs);

  return {
    id: crypto.randomUUID(),
    advisorId: validatedInputs.advisorId,
    clientId: validatedInputs.clientId,
    scenarioId: validatedInputs.scenarioId,
    moduleType,
    formulaVersion: resolvedVersion,
    inputSnapshot: validatedInputs,
    assumptionSnapshot: validatedAssumptions,
    outputSnapshot: outputs,
    chartDataSnapshot: chartData,
    narrativeSnapshot: narrative,
    disclaimerVersion: "disclaimer-v1.0.0",
    staticCopyVersion: "copy-v1.0.0",
    createdAt: new Date().toISOString(),
    createdBy: validatedInputs.advisorId,
  };
}
```

---

## 7. Universal Math Safety Utilities

All calculations must use hardened math helpers.

```ts
export function nonNegative(value: number | null | undefined): number {
  if (!Number.isFinite(value ?? NaN)) return 0;
  return Math.max(value ?? 0, 0);
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export function safeDivide(
  numerator: number,
  denominator: number
): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
    return 0;
  }

  if (denominator === 0) return 0;

  return numerator / denominator;
}

export function roundCurrency(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

export function roundPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10000) / 10000;
}
```

---

## 8. Universal Validation Rules

Every module must enforce these rules:

```txt
Required identifiers must exist.
Currency fields must be non-negative.
Percent fields must be between 0 and 1.
Age fields must be reasonable.
Duration fields must be positive.
End age must exceed current age.
Coverage amounts cannot be negative.
Expenses cannot be negative.
Omitted optional benefits default to 0.
Division by zero must be guarded.
All outputs must be consistently rounded.
All assumptions must be report-visible if they materially affect output.
```

### 8.1 Suggested Validation Ranges

| Field | Suggested Range |
|---|---:|
| Current age | 18 to 100 |
| Retirement age | 50 to 80 |
| Income replacement ratio | 0 to 1.25 |
| Inflation rate | 0 to 0.12 |
| Discount rate | 0 to 0.15 |
| Tax rate | 0 to 0.60 |
| Disability modeled duration | 1 to 600 months |
| Unemployment job search duration | 1 to 60 months |
| Coverage amount | 0 or greater |
| Monthly expenses | 0 or greater |

---

## 9. Assumption Governance

Assumptions must be explicit, visible, editable where appropriate, and snapshotted.

### 9.1 Assumption Set

```ts
export type AssumptionSet = {
  id: string;
  advisorId: string;
  moduleType: RiskModuleType;
  name: string;
  assumptions: Record<string, ModelingAssumption>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### 9.2 Assumption Rules

```txt
Every assumption must have a label.
Every assumption must have a description.
Every assumption must have a source type.
Every assumption that materially changes output must be visible in the report.
No hidden default may materially affect an output.
Advisor-edited assumptions must be snapshotted.
System default assumptions must be versioned.
```

### 9.3 Examples

```ts
export const lifeDefaultAssumptions = {
  incomeReplacementRatio: {
    key: "incomeReplacementRatio",
    label: "Income Replacement Ratio",
    value: 1,
    sourceType: "system_default",
    description:
      "Percent of annual earned income modeled as needing replacement after premature death.",
    editable: true,
    visibleInReport: true,
  },
  usePresentValue: {
    key: "usePresentValue",
    label: "Use Present Value Income Stream",
    value: false,
    sourceType: "system_default",
    description:
      "When enabled, future income needs are discounted using growth and discount assumptions.",
    editable: true,
    visibleInReport: true,
  },
};
```

```ts
export const disabilityDefaultAssumptions = {
  effectiveTaxRate: {
    key: "effectiveTaxRate",
    label: "Effective Tax Rate",
    value: 0.22,
    sourceType: "system_default",
    description:
      "Used only when after-tax disability benefit modeling is enabled.",
    editable: true,
    visibleInReport: true,
  },
  useAfterTaxBenefits: {
    key: "useAfterTaxBenefits",
    label: "Model After-Tax Benefits",
    value: true,
    sourceType: "system_default",
    description:
      "Applies the taxability setting for each disability benefit stream.",
    editable: true,
    visibleInReport: true,
  },
};
```

---

# 10. Life Insurance Logic Engine

## 10.1 Client-Facing Question

```txt
If I die prematurely, what income and financial support disappears for my family?
```

## 10.2 Modeling Purpose

The Life Insurance module illustrates the potential protection gap caused by premature death of an income earner.

It models:

```txt
lost income support
outstanding obligations
education funding goal
final expenses
existing group life coverage
existing private life coverage
selected available resources
remaining modeled gap
coverage offset percentage
```

## 10.3 Inputs

```ts
export type LifeInputs = {
  advisorId: string;
  clientId: string;
  scenarioId: string;

  currentAge: number;
  retirementAge: number;
  annualIncome: number;

  incomeReplacementYears: number;
  incomeReplacementRatio: number;

  groupLifeCoverage: number;
  privateLifeCoverage: number;

  debtsTotal: number;
  educationGoal: number;
  finalExpenses: number;

  liquidAssetsAllocated?: number;
};
```

## 10.4 Assumptions

```ts
export type LifeAssumptions = {
  inflationRateAnnual: number;
  discountRateAnnual: number;
  incomeGrowthRateAnnual: number;

  usePresentValue: boolean;
  includeLiquidAssetsOffset: boolean;

  deathBenefitTaxTreatment:
    | "generally_income_tax_free"
    | "not_modeled";
};
```

### 10.4.1 Tax Treatment Assumption

The default assumption should be:

```txt
Life insurance death benefits are modeled as generally federally income-tax-free to the beneficiary.
```

Important caveat:

```txt
Interest, policy transfer, estate, inheritance, state-specific, and complex tax situations are outside the MVP model.
```

The model must not say life insurance is always tax-free.

## 10.5 MVP Formula

```txt
replacement_years =
  min(income_replacement_years, retirement_age - current_age)

annual_replacement_need =
  annual_income × income_replacement_ratio

future_income_lost =
  annual_replacement_need × replacement_years

base_protection_need =
  future_income_lost
  + debts_total
  + education_goal
  + final_expenses

existing_coverage_total =
  group_life_coverage
  + private_life_coverage

available_resources =
  existing_coverage_total
  + selected_liquid_asset_offset

remaining_gap =
  max(base_protection_need - available_resources, 0)

coverage_offset_percentage =
  available_resources / base_protection_need
```

## 10.6 TypeScript Implementation

```ts
export function calculateLifeOutputsV1(
  inputs: LifeInputs,
  assumptions: LifeAssumptions
): LifeOutputs {
  const replacementYears = Math.max(
    0,
    Math.min(
      nonNegative(inputs.incomeReplacementYears),
      nonNegative(inputs.retirementAge - inputs.currentAge)
    )
  );

  const incomeReplacementRatio = clamp(
    inputs.incomeReplacementRatio,
    0,
    1.25
  );

  const annualReplacementNeed =
    nonNegative(inputs.annualIncome) * incomeReplacementRatio;

  const futureIncomeLost =
    annualReplacementNeed * replacementYears;

  const baseProtectionNeed =
    futureIncomeLost +
    nonNegative(inputs.debtsTotal) +
    nonNegative(inputs.educationGoal) +
    nonNegative(inputs.finalExpenses);

  const existingCoverageTotal =
    nonNegative(inputs.groupLifeCoverage) +
    nonNegative(inputs.privateLifeCoverage);

  const liquidAssetOffset = assumptions.includeLiquidAssetsOffset
    ? nonNegative(inputs.liquidAssetsAllocated)
    : 0;

  const availableResources =
    existingCoverageTotal + liquidAssetOffset;

  const remainingGap =
    Math.max(baseProtectionNeed - availableResources, 0);

  const coverageOffsetPercentage =
    safeDivide(availableResources, baseProtectionNeed);

  return {
    replacementYears,
    annualReplacementNeed: roundCurrency(annualReplacementNeed),
    futureIncomeLost: roundCurrency(futureIncomeLost),
    baseProtectionNeed: roundCurrency(baseProtectionNeed),
    existingCoverageTotal: roundCurrency(existingCoverageTotal),
    liquidAssetOffset: roundCurrency(liquidAssetOffset),
    availableResources: roundCurrency(availableResources),
    remainingGap: roundCurrency(remainingGap),
    coverageOffsetPercentage: roundPercent(coverageOffsetPercentage),
  };
}
```

## 10.7 Present Value Formula for Production

For a more advanced deterministic version:

```txt
PV_income_need =
  Σ from t=1 to n [
    annual_replacement_need × (1 + income_growth_rate)^t
    ÷ (1 + discount_rate)^t
  ]
```

```ts
export function presentValueIncomeNeed({
  annualReplacementNeed,
  years,
  incomeGrowthRate,
  discountRate,
}: {
  annualReplacementNeed: number;
  years: number;
  incomeGrowthRate: number;
  discountRate: number;
}): number {
  let pv = 0;

  for (let year = 1; year <= years; year++) {
    const projectedNeed =
      annualReplacementNeed * Math.pow(1 + incomeGrowthRate, year);

    const discountedNeed =
      projectedNeed / Math.pow(1 + discountRate, year);

    pv += discountedNeed;
  }

  return roundCurrency(pv);
}
```

## 10.8 Life Outputs

```ts
export type LifeOutputs = {
  replacementYears: number;
  annualReplacementNeed: number;
  futureIncomeLost: number;
  baseProtectionNeed: number;
  existingCoverageTotal: number;
  liquidAssetOffset: number;
  availableResources: number;
  remainingGap: number;
  coverageOffsetPercentage: number;
};
```

## 10.9 Life Visual Outputs

```txt
Income Replacement Gap Chart
Coverage Offset Bar
Protection Need Stack
Survivor Financial Timeline
Protection Need Summary Cards
```

## 10.10 Life Chart Transformer

```ts
export function transformLifeProtectionStack(
  outputs: LifeOutputs
) {
  return [
    {
      label: "Existing Coverage",
      value: outputs.existingCoverageTotal,
    },
    {
      label: "Selected Asset Offset",
      value: outputs.liquidAssetOffset,
    },
    {
      label: "Remaining Modeled Gap",
      value: outputs.remainingGap,
    },
  ];
}
```

```ts
export function transformLifeNeedBreakdown(
  inputs: LifeInputs,
  outputs: LifeOutputs
) {
  return [
    {
      label: "Income Replacement",
      value: outputs.futureIncomeLost,
    },
    {
      label: "Debts",
      value: nonNegative(inputs.debtsTotal),
    },
    {
      label: "Education Goal",
      value: nonNegative(inputs.educationGoal),
    },
    {
      label: "Final Expenses",
      value: nonNegative(inputs.finalExpenses),
    },
  ];
}
```

## 10.11 Life Narrative Template

```ts
export function getLifeNarrative(outputs: LifeOutputs): string {
  return [
    `This scenario illustrates a modeled protection need of ${formatCurrency(outputs.baseProtectionNeed)} based on the income, obligation, coverage, and assumption inputs entered.`,
    `Existing coverage and selected available resources offset approximately ${formatPercent(outputs.coverageOffsetPercentage)} of the modeled need.`,
    `The remaining illustrated gap is ${formatCurrency(outputs.remainingGap)}.`,
    `This is not a recommendation or required coverage amount. It is an illustrative planning estimate for advisor-client discussion.`,
  ].join(" ");
}
```

---

# 11. Disability Insurance Logic Engine

## 11.1 Client-Facing Question

```txt
If I cannot work due to illness or injury, how does my financial plan change?
```

## 11.2 Modeling Purpose

The Disability Insurance module illustrates the financial effect of illness or injury that reduces or eliminates earned income.

Disability must be modeled as a timeline, not a single static monthly calculation.

Reason:

```txt
STD benefits may start after one waiting period.
LTD benefits may start after another waiting period.
Private DI may have its own elimination period.
Benefits may have different durations.
Benefit taxability may differ.
Spouse income may continue.
Partial work income may continue.
SSDI may be excluded, delayed, or advisor-entered.
Expenses may continue.
Emergency reserves deplete over time.
```

## 11.3 Inputs

```ts
export type DisabilityInputs = {
  advisorId: string;
  clientId: string;
  scenarioId: string;

  annualEarnedIncome: number;
  monthlyExpenses: number;
  emergencySavings: number;

  spouseMonthlyIncome: number;

  stdBenefitMonthly: number;
  stdWaitingPeriodDays: number;
  stdDurationMonths: number;
  stdTaxable: boolean;

  ltdBenefitMonthly: number;
  ltdWaitingPeriodDays: number;
  ltdDurationMonths: number;
  ltdTaxable: boolean;

  privateDiBenefitMonthly: number;
  privateDiWaitingPeriodDays: number;
  privateDiDurationMonths: number;
  privateDiTaxable: boolean;

  stateBenefitMonthly: number;
  stateBenefitStartMonth: number;
  stateBenefitDurationMonths: number;
  stateBenefitTaxable: boolean;

  includeSsdi: boolean;
  ssdiMonthlyBenefit: number;
  ssdiStartMonth: number;
  ssdiTaxable: boolean;

  partialDisabilityEarnedIncomePercent: number;
  totalDisabilityEarnedIncomePercent: number;

  modeledDurationMonths: number;
};
```

## 11.4 Assumptions

```ts
export type DisabilityAssumptions = {
  scenarioType: "partial" | "total";

  effectiveTaxRate: number;
  useAfterTaxBenefits: boolean;

  benefitTimingMode: "monthly";
  expenseInflationRateAnnual: number;

  ssdiModelingMode: "excluded" | "advisor_entered";
};
```

## 11.5 SSDI Rule

NorthStar must not predict SSDI approval.

Recommended defaults:

```txt
includeSsdi = false
ssdiModelingMode = "excluded"
```

If SSDI is included, it should be advisor-entered as an assumption:

```txt
SSDI amount: advisor-entered
SSDI start month: advisor-entered
SSDI taxability: advisor-entered
```

## 11.6 Benefit Stream Model

```ts
export type BenefitStream = {
  label: string;
  monthlyAmount: number;
  startMonth: number;
  endMonth: number | null;
  taxable: boolean;
};
```

```ts
export function waitingPeriodDaysToStartMonth(days: number): number {
  return Math.max(1, Math.ceil(nonNegative(days) / 30));
}
```

```ts
export function isBenefitActive(
  month: number,
  stream: BenefitStream
): boolean {
  if (month < stream.startMonth) return false;
  if (stream.endMonth === null) return true;
  return month <= stream.endMonth;
}
```

```ts
export function netBenefitAmount({
  amount,
  taxable,
  effectiveTaxRate,
  useAfterTaxBenefits,
}: {
  amount: number;
  taxable: boolean;
  effectiveTaxRate: number;
  useAfterTaxBenefits: boolean;
}): number {
  if (!useAfterTaxBenefits) return nonNegative(amount);
  if (!taxable) return nonNegative(amount);

  return roundCurrency(
    nonNegative(amount) * (1 - clamp(effectiveTaxRate, 0, 0.6))
  );
}
```

## 11.7 Build Benefit Streams

```ts
export function buildDisabilityBenefitStreams(
  inputs: DisabilityInputs
): BenefitStream[] {
  const streams: BenefitStream[] = [];

  if (inputs.stdBenefitMonthly > 0) {
    const startMonth = waitingPeriodDaysToStartMonth(
      inputs.stdWaitingPeriodDays
    );

    streams.push({
      label: "Employer STD",
      monthlyAmount: nonNegative(inputs.stdBenefitMonthly),
      startMonth,
      endMonth: startMonth + nonNegative(inputs.stdDurationMonths) - 1,
      taxable: inputs.stdTaxable,
    });
  }

  if (inputs.ltdBenefitMonthly > 0) {
    const startMonth = waitingPeriodDaysToStartMonth(
      inputs.ltdWaitingPeriodDays
    );

    streams.push({
      label: "Employer LTD",
      monthlyAmount: nonNegative(inputs.ltdBenefitMonthly),
      startMonth,
      endMonth: startMonth + nonNegative(inputs.ltdDurationMonths) - 1,
      taxable: inputs.ltdTaxable,
    });
  }

  if (inputs.privateDiBenefitMonthly > 0) {
    const startMonth = waitingPeriodDaysToStartMonth(
      inputs.privateDiWaitingPeriodDays
    );

    streams.push({
      label: "Private DI",
      monthlyAmount: nonNegative(inputs.privateDiBenefitMonthly),
      startMonth,
      endMonth:
        startMonth + nonNegative(inputs.privateDiDurationMonths) - 1,
      taxable: inputs.privateDiTaxable,
    });
  }

  if (inputs.stateBenefitMonthly > 0) {
    const startMonth = Math.max(1, inputs.stateBenefitStartMonth);

    streams.push({
      label: "State Benefit",
      monthlyAmount: nonNegative(inputs.stateBenefitMonthly),
      startMonth,
      endMonth:
        startMonth + nonNegative(inputs.stateBenefitDurationMonths) - 1,
      taxable: inputs.stateBenefitTaxable,
    });
  }

  if (inputs.includeSsdi && inputs.ssdiMonthlyBenefit > 0) {
    streams.push({
      label: "SSDI",
      monthlyAmount: nonNegative(inputs.ssdiMonthlyBenefit),
      startMonth: Math.max(1, inputs.ssdiStartMonth),
      endMonth: null,
      taxable: inputs.ssdiTaxable,
    });
  }

  return streams;
}
```

## 11.8 Disability Timeline Point

```ts
export type ActiveBenefit = {
  label: string;
  grossAmount: number;
  netAmount: number;
};

export type DisabilityTimelinePoint = {
  month: number;

  baselineMonthlyIncome: number;
  earnedIncomeAfterDisability: number;
  spouseMonthlyIncome: number;

  activeBenefits: ActiveBenefit[];

  availableIncome: number;
  monthlyExpenses: number;
  monthlyGap: number;

  startingReserve: number;
  endingReserve: number;
  reserveDepleted: boolean;
};
```

## 11.9 Monthly Timeline Calculation

```ts
export function calculateDisabilityTimelineV1(
  inputs: DisabilityInputs,
  assumptions: DisabilityAssumptions
): DisabilityTimelinePoint[] {
  const baselineMonthlyIncome =
    nonNegative(inputs.annualEarnedIncome) / 12;

  const retainedIncomePercent =
    assumptions.scenarioType === "partial"
      ? clamp(inputs.partialDisabilityEarnedIncomePercent, 0, 1)
      : clamp(inputs.totalDisabilityEarnedIncomePercent, 0, 1);

  const benefitStreams = buildDisabilityBenefitStreams(inputs);

  let reserveBalance = nonNegative(inputs.emergencySavings);

  const modeledDurationMonths = Math.max(
    1,
    Math.min(nonNegative(inputs.modeledDurationMonths), 600)
  );

  const points: DisabilityTimelinePoint[] = [];

  for (let month = 1; month <= modeledDurationMonths; month++) {
    const earnedIncomeAfterDisability =
      baselineMonthlyIncome * retainedIncomePercent;

    const activeBenefits = benefitStreams.map((stream) => {
      const grossAmount = isBenefitActive(month, stream)
        ? stream.monthlyAmount
        : 0;

      const netAmount = netBenefitAmount({
        amount: grossAmount,
        taxable: stream.taxable,
        effectiveTaxRate: assumptions.effectiveTaxRate,
        useAfterTaxBenefits: assumptions.useAfterTaxBenefits,
      });

      return {
        label: stream.label,
        grossAmount: roundCurrency(grossAmount),
        netAmount: roundCurrency(netAmount),
      };
    });

    const totalNetBenefits = activeBenefits.reduce(
      (sum, benefit) => sum + benefit.netAmount,
      0
    );

    const availableIncome =
      earnedIncomeAfterDisability +
      nonNegative(inputs.spouseMonthlyIncome) +
      totalNetBenefits;

    const monthlyGap =
      Math.max(nonNegative(inputs.monthlyExpenses) - availableIncome, 0);

    const startingReserve = reserveBalance;

    reserveBalance = Math.max(reserveBalance - monthlyGap, 0);

    points.push({
      month,
      baselineMonthlyIncome: roundCurrency(baselineMonthlyIncome),
      earnedIncomeAfterDisability:
        roundCurrency(earnedIncomeAfterDisability),
      spouseMonthlyIncome: roundCurrency(inputs.spouseMonthlyIncome),
      activeBenefits,
      availableIncome: roundCurrency(availableIncome),
      monthlyExpenses: roundCurrency(inputs.monthlyExpenses),
      monthlyGap: roundCurrency(monthlyGap),
      startingReserve: roundCurrency(startingReserve),
      endingReserve: roundCurrency(reserveBalance),
      reserveDepleted:
        startingReserve > 0 &&
        reserveBalance === 0 &&
        monthlyGap > 0,
    });
  }

  return points;
}
```

## 11.10 Disability Output Aggregation

```ts
export type DisabilityOutputs = {
  totalUncoveredGap: number;
  reserveDepletionMonth: number | null;
  totalBenefitsReceived: number;
  averageMonthlyGap: number;
  lifestyleCompressionRequired: number;
  timeline: DisabilityTimelinePoint[];
};
```

```ts
export function aggregateDisabilityOutputs(
  timeline: DisabilityTimelinePoint[]
): DisabilityOutputs {
  const totalUncoveredGap = timeline.reduce(
    (sum, point) => sum + point.monthlyGap,
    0
  );

  const reserveDepletionPoint = timeline.find(
    (point) => point.reserveDepleted
  );

  const totalBenefitsReceived = timeline.reduce(
    (sum, point) =>
      sum +
      point.activeBenefits.reduce(
        (benefitSum, benefit) => benefitSum + benefit.netAmount,
        0
      ),
    0
  );

  const averageMonthlyGap =
    timeline.length > 0 ? totalUncoveredGap / timeline.length : 0;

  const averageMonthlyExpenses =
    timeline.length > 0
      ? timeline.reduce((sum, point) => sum + point.monthlyExpenses, 0) /
        timeline.length
      : 0;

  const lifestyleCompressionRequired =
    safeDivide(averageMonthlyGap, averageMonthlyExpenses);

  return {
    totalUncoveredGap: roundCurrency(totalUncoveredGap),
    reserveDepletionMonth: reserveDepletionPoint?.month ?? null,
    totalBenefitsReceived: roundCurrency(totalBenefitsReceived),
    averageMonthlyGap: roundCurrency(averageMonthlyGap),
    lifestyleCompressionRequired: roundPercent(
      lifestyleCompressionRequired
    ),
    timeline,
  };
}
```

```ts
export function calculateDisabilityOutputsV1(
  inputs: DisabilityInputs,
  assumptions: DisabilityAssumptions
): DisabilityOutputs {
  const timeline = calculateDisabilityTimelineV1(inputs, assumptions);
  return aggregateDisabilityOutputs(timeline);
}
```

## 11.11 Disability Visual Outputs

```txt
Income Collapse Curve
Financial Survival Timeline
Protection Gap Stack
Partial vs Total Disability Comparison
Lifestyle Compression Model
Recovery Path Comparison
```

## 11.12 Disability Chart Transformers

```ts
export function transformIncomeCollapseCurve(
  outputs: DisabilityOutputs
) {
  return outputs.timeline.map((point) => ({
    month: point.month,
    baselineIncome: point.baselineMonthlyIncome,
    availableIncome: point.availableIncome,
    monthlyGap: point.monthlyGap,
  }));
}
```

```ts
export function transformReserveTimeline(
  outputs: DisabilityOutputs
) {
  return outputs.timeline.map((point) => ({
    month: point.month,
    startingReserve: point.startingReserve,
    endingReserve: point.endingReserve,
    monthlyGap: point.monthlyGap,
  }));
}
```

```ts
export function transformProtectionGapStack(
  outputs: DisabilityOutputs
) {
  return outputs.timeline.map((point) => {
    const benefitsTotal = point.activeBenefits.reduce(
      (sum, benefit) => sum + benefit.netAmount,
      0
    );

    return {
      month: point.month,
      earnedIncome: point.earnedIncomeAfterDisability,
      spouseIncome: point.spouseMonthlyIncome,
      benefits: benefitsTotal,
      savingsDrawdown: Math.max(
        point.startingReserve - point.endingReserve,
        0
      ),
      uncoveredGap: point.monthlyGap,
    };
  });
}
```

## 11.13 Disability Narrative Template

```ts
export function getDisabilityNarrative(
  outputs: DisabilityOutputs
): string {
  const depletionText =
    outputs.reserveDepletionMonth === null
      ? "Emergency reserves are not projected to be depleted during the modeled period."
      : `Emergency reserves are projected to be depleted around month ${outputs.reserveDepletionMonth} under the assumptions entered.`;

  return [
    `This scenario illustrates the potential income and expense gap that may occur if earned income is reduced or interrupted by illness or injury.`,
    depletionText,
    `The total illustrated uncovered gap during the modeled period is ${formatCurrency(outputs.totalUncoveredGap)}.`,
    `This result depends on benefit waiting periods, benefit amounts, tax assumptions, expenses, recovery timeline, and advisor review.`,
    `This is not a recommendation, guarantee, underwriting conclusion, or benefit approval estimate.`,
  ].join(" ");
}
```

---

# 12. Unemployment Logic Engine

## 12.1 Client-Facing Question

```txt
How long can I sustain my financial plan after job loss?
```

## 12.2 Inputs

```ts
export type UnemploymentInputs = {
  advisorId: string;
  clientId: string;
  scenarioId: string;

  monthlyIncomeBeforeJobLoss: number;
  monthlyExpenses: number;
  emergencySavings: number;

  severanceAmount: number;

  unemploymentBenefitMonthly: number;
  unemploymentBenefitStartMonth: number;
  unemploymentBenefitDurationMonths: number;

  spouseMonthlyIncome: number;

  estimatedJobSearchDurationMonths: number;
};
```

## 12.3 Assumptions

```ts
export type UnemploymentAssumptions = {
  modeledDurationMonths: number;
  includeSeveranceInReserve: boolean;
  includeUnemploymentBenefits: boolean;
};
```

## 12.4 Timeline Point

```ts
export type UnemploymentTimelinePoint = {
  month: number;
  availableIncome: number;
  monthlyExpenses: number;
  monthlyShortfall: number;
  startingReserve: number;
  endingReserve: number;
  reserveDepleted: boolean;
};
```

## 12.5 Formula

```txt
initial_reserve =
  emergency_savings + severance_amount_if_enabled

available_income =
  spouse_income + active_unemployment_benefit

monthly_shortfall =
  max(monthly_expenses - available_income, 0)

reserve_balance =
  prior_reserve_balance - monthly_shortfall

reserve_depletion_month =
  first month where reserve_balance reaches zero
```

## 12.6 TypeScript Implementation

```ts
export function calculateUnemploymentOutputsV1(
  inputs: UnemploymentInputs,
  assumptions: UnemploymentAssumptions
): UnemploymentOutputs {
  const modeledDurationMonths = Math.max(
    1,
    nonNegative(assumptions.modeledDurationMonths)
  );

  let reserveBalance =
    nonNegative(inputs.emergencySavings) +
    (assumptions.includeSeveranceInReserve
      ? nonNegative(inputs.severanceAmount)
      : 0);

  const timeline: UnemploymentTimelinePoint[] = [];

  const benefitStart = Math.max(1, inputs.unemploymentBenefitStartMonth);
  const benefitEnd =
    benefitStart + nonNegative(inputs.unemploymentBenefitDurationMonths) - 1;

  for (let month = 1; month <= modeledDurationMonths; month++) {
    const unemploymentBenefitActive =
      assumptions.includeUnemploymentBenefits &&
      month >= benefitStart &&
      month <= benefitEnd;

    const availableIncome =
      nonNegative(inputs.spouseMonthlyIncome) +
      (unemploymentBenefitActive
        ? nonNegative(inputs.unemploymentBenefitMonthly)
        : 0);

    const monthlyShortfall =
      Math.max(nonNegative(inputs.monthlyExpenses) - availableIncome, 0);

    const startingReserve = reserveBalance;

    reserveBalance = Math.max(reserveBalance - monthlyShortfall, 0);

    timeline.push({
      month,
      availableIncome: roundCurrency(availableIncome),
      monthlyExpenses: roundCurrency(inputs.monthlyExpenses),
      monthlyShortfall: roundCurrency(monthlyShortfall),
      startingReserve: roundCurrency(startingReserve),
      endingReserve: roundCurrency(reserveBalance),
      reserveDepleted:
        startingReserve > 0 &&
        reserveBalance === 0 &&
        monthlyShortfall > 0,
    });
  }

  const reserveDepletionMonth =
    timeline.find((point) => point.reserveDepleted)?.month ?? null;

  const totalUncoveredShortfall = timeline.reduce(
    (sum, point) => sum + point.monthlyShortfall,
    0
  );

  const cashRunwayMonths =
    reserveDepletionMonth ?? modeledDurationMonths;

  return {
    reserveDepletionMonth,
    cashRunwayMonths,
    totalUncoveredShortfall: roundCurrency(totalUncoveredShortfall),
    timeline,
  };
}
```

## 12.7 Outputs

```ts
export type UnemploymentOutputs = {
  reserveDepletionMonth: number | null;
  cashRunwayMonths: number;
  totalUncoveredShortfall: number;
  timeline: UnemploymentTimelinePoint[];
};
```

## 12.8 Visuals

```txt
Emergency Reserve Runway
Burn Rate Model
Monthly Shortfall Visualization
Recovery Timeline
```

---

# 13. Liability / Lawsuit Logic Engine

## 13.1 Client-Facing Question

```txt
What assets or future earnings are exposed if I face a lawsuit?
```

## 13.2 Critical Disclaimer

Liability modeling is jurisdiction-specific and fact-sensitive. NorthStar must not provide legal advice or determine actual legal exposure. This module only illustrates selected assets, coverage, and claim-scenario gaps based on assumptions entered.

## 13.3 Inputs

```ts
export type LiabilityInputs = {
  advisorId: string;
  clientId: string;
  scenarioId: string;

  homeEquity: number;
  investmentAssets: number;
  savings: number;
  businessAssets: number;
  futureIncomeExposure: number;

  autoLiabilityCoverage: number;
  homeownersLiabilityCoverage: number;
  umbrellaCoverage: number;

  estimatedClaimAmount: number;
  protectedAssets: number;
};
```

## 13.4 Assumptions

```ts
export type LiabilityAssumptions = {
  includeFutureIncomeExposure: boolean;
  includeBusinessAssets: boolean;
};
```

## 13.5 Formula

```txt
gross_exposed_assets =
  home_equity
  + investment_assets
  + savings
  + business_assets_if_enabled
  + future_income_exposure_if_enabled

coverage_total =
  auto_liability_coverage
  + homeowners_liability_coverage
  + umbrella_coverage

net_exposed_assets =
  max(gross_exposed_assets - protected_assets, 0)

claim_coverage_gap =
  max(estimated_claim_amount - coverage_total, 0)

asset_at_risk =
  min(net_exposed_assets, claim_coverage_gap)

protection_offset_percentage =
  coverage_total / estimated_claim_amount
```

## 13.6 TypeScript Implementation

```ts
export function calculateLiabilityOutputsV1(
  inputs: LiabilityInputs,
  assumptions: LiabilityAssumptions
): LiabilityOutputs {
  const grossExposedAssets =
    nonNegative(inputs.homeEquity) +
    nonNegative(inputs.investmentAssets) +
    nonNegative(inputs.savings) +
    (assumptions.includeBusinessAssets
      ? nonNegative(inputs.businessAssets)
      : 0) +
    (assumptions.includeFutureIncomeExposure
      ? nonNegative(inputs.futureIncomeExposure)
      : 0);

  const coverageTotal =
    nonNegative(inputs.autoLiabilityCoverage) +
    nonNegative(inputs.homeownersLiabilityCoverage) +
    nonNegative(inputs.umbrellaCoverage);

  const netExposedAssets =
    Math.max(grossExposedAssets - nonNegative(inputs.protectedAssets), 0);

  const claimCoverageGap =
    Math.max(nonNegative(inputs.estimatedClaimAmount) - coverageTotal, 0);

  const assetAtRisk =
    Math.min(netExposedAssets, claimCoverageGap);

  const protectionOffsetPercentage =
    safeDivide(coverageTotal, nonNegative(inputs.estimatedClaimAmount));

  return {
    grossExposedAssets: roundCurrency(grossExposedAssets),
    coverageTotal: roundCurrency(coverageTotal),
    netExposedAssets: roundCurrency(netExposedAssets),
    claimCoverageGap: roundCurrency(claimCoverageGap),
    assetAtRisk: roundCurrency(assetAtRisk),
    protectionOffsetPercentage: roundPercent(protectionOffsetPercentage),
  };
}
```

## 13.7 Outputs

```ts
export type LiabilityOutputs = {
  grossExposedAssets: number;
  coverageTotal: number;
  netExposedAssets: number;
  claimCoverageGap: number;
  assetAtRisk: number;
  protectionOffsetPercentage: number;
};
```

## 13.8 Visuals

```txt
Asset Exposure Map
Umbrella Coverage Gap
Wealth Erosion Scenario
Protection Adequacy Summary
```

---

# 14. Chart Data Transformer Specification

Chart transformers are mandatory. Raw calculation outputs should not be passed directly into chart components.

## 14.1 Transformer Rules

```txt
Transformers do not calculate new financial logic.
Transformers format existing outputs for visualization.
Transformers may group, label, stack, or sequence output data.
Transformers must not alter source-of-truth values.
Transformers must be pure functions.
Transformers must be testable.
```

## 14.2 Universal Chart Data Shape

```ts
export type ChartDataPoint = {
  label: string;
  value: number;
  category?: string;
  month?: number;
  metadata?: Record<string, unknown>;
};
```

## 14.3 Life Transformer

```ts
export function transformLifeGapChartData(outputs: LifeOutputs) {
  return [
    {
      label: "Modeled Protection Need",
      value: outputs.baseProtectionNeed,
    },
    {
      label: "Available Resources",
      value: outputs.availableResources,
    },
    {
      label: "Remaining Modeled Gap",
      value: outputs.remainingGap,
    },
  ];
}
```

## 14.4 DI Income Collapse Transformer

```ts
export function transformDisabilityIncomeCurve(
  outputs: DisabilityOutputs
) {
  return outputs.timeline.map((point) => ({
    month: point.month,
    baselineIncome: point.baselineMonthlyIncome,
    availableIncome: point.availableIncome,
    monthlyGap: point.monthlyGap,
  }));
}
```

## 14.5 Unemployment Transformer

```ts
export function transformUnemploymentRunway(
  outputs: UnemploymentOutputs
) {
  return outputs.timeline.map((point) => ({
    month: point.month,
    startingReserve: point.startingReserve,
    endingReserve: point.endingReserve,
    monthlyShortfall: point.monthlyShortfall,
  }));
}
```

## 14.6 Liability Transformer

```ts
export function transformLiabilityExposure(
  outputs: LiabilityOutputs
) {
  return [
    {
      label: "Net Exposed Assets",
      value: outputs.netExposedAssets,
    },
    {
      label: "Coverage Total",
      value: outputs.coverageTotal,
    },
    {
      label: "Claim Coverage Gap",
      value: outputs.claimCoverageGap,
    },
    {
      label: "Modeled Asset at Risk",
      value: outputs.assetAtRisk,
    },
  ];
}
```

---

# 15. Static Narrative Template Specification

No AI-generated language is permitted.

Narratives must be static, deterministic, template-based, and compliance-reviewed.

## 15.1 Narrative Rules

```txt
Never say "you need."
Never say "you should buy."
Never say "required coverage."
Never say "correct amount."
Never say "guaranteed."
Never say "ensures protection."
Never recommend a carrier.
Never recommend a policy.
Never provide tax or legal advice.
Always frame output as illustrative.
Always mention assumptions.
Always mention advisor review.
```

## 15.2 Preferred Language

```txt
This scenario illustrates...
Modeled gap...
Potential exposure...
Based on the assumptions entered...
May help guide discussion...
Advisor may review...
Actual needs may vary...
Not a recommendation...
Not a guarantee...
```

## 15.3 Universal Disclaimer

```txt
This model is for illustrative planning purposes only. It is not a guarantee, financial plan, insurance recommendation, legal advice, tax advice, or underwriting determination. Actual needs may vary based on individual circumstances, policy terms, carrier rules, taxation, inflation, market conditions, benefit approval, legal jurisdiction, and advisor review.
```

## 15.4 Static Copy Versioning

```ts
export type StaticCopyVersion = {
  version: string;
  effectiveDate: string;
  moduleType: RiskModuleType | "global";
  changeSummary: string;
};
```

Historical reports must store the copy version used at the time of report generation.

---

# 16. Audit Trail and Snapshot Specification

Every calculation run must be snapshotted.

## 16.1 Calculation Run Database Table

```sql
create table calculation_runs (
  id uuid primary key,
  advisor_id uuid not null,
  client_id uuid not null,
  scenario_id uuid not null,
  module_type text not null,
  formula_version text not null,
  input_snapshot_json jsonb not null,
  assumption_snapshot_json jsonb not null,
  output_snapshot_json jsonb not null,
  chart_data_snapshot_json jsonb not null,
  narrative_snapshot_json jsonb not null,
  disclaimer_version text not null,
  static_copy_version text not null,
  created_at timestamptz not null default now(),
  created_by uuid not null
);
```

## 16.2 Report Snapshot Table

```sql
create table report_snapshots (
  id uuid primary key,
  calculation_run_id uuid not null references calculation_runs(id),
  advisor_id uuid not null,
  client_id uuid not null,
  scenario_id uuid not null,
  report_json jsonb not null,
  static_copy_version text not null,
  disclaimer_version text not null,
  created_at timestamptz not null default now()
);
```

## 16.3 Formula Version Table

```sql
create table formula_versions (
  id uuid primary key,
  module_type text not null,
  version text not null,
  description text not null,
  change_summary text not null,
  effective_date date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);
```

## 16.4 Assumption Sets Table

```sql
create table assumption_sets (
  id uuid primary key,
  advisor_id uuid not null,
  module_type text not null,
  name text not null,
  assumptions_json jsonb not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

# 17. Compliance Guardrails

## 17.1 Software-Enforced Forbidden Phrases

NorthStar should include a phrase linting utility for static copy and report output.

Forbidden phrases:

```txt
You need
You should buy
Required coverage
Correct coverage
Guaranteed protection
Ensures your family is protected
Best policy
Recommended carrier
Approved for benefits
Will qualify
Tax-free in all cases
Legal protection guaranteed
```

## 17.2 Lint Utility

```ts
export const forbiddenPhrases = [
  "you need",
  "you should buy",
  "required coverage",
  "correct coverage",
  "guaranteed protection",
  "ensures your family is protected",
  "best policy",
  "recommended carrier",
  "approved for benefits",
  "will qualify",
  "tax-free in all cases",
];

export function lintStaticCopy(copy: string): string[] {
  const lower = copy.toLowerCase();

  return forbiddenPhrases.filter((phrase) =>
    lower.includes(phrase)
  );
}
```

## 17.3 Report Required Fields

Every report must display:

```txt
Client name
Advisor name
Scenario name
Module type
Calculation date
Formula version
Static copy version
Assumption summary
Input summary
Output summary
Disclaimer
```

---

# 18. Testing and QA Framework

## 18.1 Unit Tests

Every formula must have unit tests.

Required tests:

```txt
Life gap cannot be negative.
Coverage offset returns 0 when base need is 0.
Replacement years cannot exceed retirement-age window.
Present value formula produces stable known output.
DI benefits start after waiting period.
DI benefits stop after duration.
DI reserve depletion returns null if no monthly gap.
Taxable DI benefits are reduced only when after-tax modeling is enabled.
Unemployment runway returns correct depletion month.
Liability asset-at-risk cannot exceed net exposed assets.
Liability coverage offset guards against zero claim amount.
```

## 18.2 Golden Test Cases

Golden cases are known input/output fixtures.

```ts
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
  },
  assumptions: {
    inflationRateAnnual: 0.03,
    discountRateAnnual: 0.04,
    incomeGrowthRateAnnual: 0.03,
    usePresentValue: false,
    includeLiquidAssetsOffset: false,
    deathBenefitTaxTreatment: "generally_income_tax_free",
  },
  expected: {
    replacementYears: 20,
    annualReplacementNeed: 100000,
    futureIncomeLost: 2000000,
    baseProtectionNeed: 2375000,
    existingCoverageTotal: 1050000,
    remainingGap: 1325000,
  },
};
```

## 18.3 Regression Rule

```txt
If a golden test output changes, the formula version must change.
If the formula version does not change, golden tests must remain stable.
```

## 18.4 Snapshot Tests

Snapshot tests should verify:

```txt
CalculationRun structure
inputSnapshot shape
assumptionSnapshot shape
outputSnapshot shape
chartDataSnapshot shape
narrativeSnapshot shape
disclaimerVersion
formulaVersion
```

---

# 19. UI/UX and Component Ownership Strategy

NorthStar’s interface must be presentation-first, advisor-grade, calm, and financially serious. The UI exists to make risk comprehension easier during live advisor-client conversations. It should not feel like a consumer fintech game, spreadsheet tool, or product sales funnel.

## 19.1 Design Principles

```txt
Professional
Calm
Trustworthy
Advisor-grade
Presentation-first
Minimal
Readable in meetings
Emotionally clear without being dramatic
```

Avoid:

```txt
Gamification
Aggressive product sales language
Overly bright consumer fintech styling
Dense spreadsheet-first screens
Hidden assumptions
Unexplained scores
Unreviewed recommendation language
```

## 19.2 Visual Language

Recommended visual system:

```txt
Dark navy / charcoal foundation for application shell.
White or near-white surfaces for client-facing content.
Muted blue for navigation, structure, and selected state.
Soft green for existing protection or covered exposure.
Amber/orange for uncovered gaps or planning attention.
Red only for severe exposure or critical warnings.
Large chart labels.
Generous whitespace.
Meeting-friendly metric cards.
Print/export-ready report surfaces.
```

Color must support comprehension, not emotion-driven pressure. Severe colors should be reserved for clearly defined threshold conditions and paired with neutral explanatory language.

## 19.3 Component Ownership Rules

Third-party or copy-paste component libraries may be used as starting points for layout speed, but all repeated UI patterns must become NorthStar-owned components. No copied component should remain scattered across routes as page-local code.

Mandatory component ownership rules:

```txt
Adapt imported/copy-paste UI patterns into NorthStar naming conventions.
Promote repeated components into /src/components/global, /src/components/ui, or feature-specific shared folders.
Convert static demo content into typed props.
Remove unused demo styles, placeholder content, animations, and unrelated dependencies.
Centralize Tailwind-heavy variants instead of duplicating class strings.
Keep accessibility attributes intact or improve them.
Ensure every presentation component works in dashboard, live presentation, and report/export contexts.
```

## 19.4 Core Global Components

Build these early:

```txt
AppShell
PageShell
PageHeader
SidebarNav
TopBar
BreadcrumbBar
ClientSelector
ScenarioSelector
RiskModuleTabs
MetricCard
RiskSummaryCard
AssumptionCard
InputSection
FieldGroup
CurrencyInputField
PercentInputField
ChartPanel
RiskGapChart
TimelineChart
StackedCoverageChart
ScenarioSummaryCard
AdvisorNarrativePanel
PresentationToolbar
PresentationSlide
ReportHeader
ReportSection
DisclaimerBlock
SaveStatusIndicator
EmptyState
LoadingState
ErrorState
```

## 19.5 Module Component Standard

Each risk module should expose a predictable component set:

```txt
[Module]InputForm
[Module]AssumptionPanel
[Module]OutputCards
[Module]ChartGrid
[Module]ScenarioComparison
[Module]NarrativePanel
[Module]PresentationView
[Module]ReportSection
```

No module component should perform business calculations. Components may call hooks or actions that retrieve already-calculated outputs, but formula execution must remain in the deterministic engine layer.

---

# 20. Application Architecture



## 19.6 Dashboard and Application UI Source Strategy

NorthStar will use Tremor dashboards, Tremor Blocks, Tremor templates, and Tremor-style components as the primary reference system for the advisor workspace, dashboard shell, cards, layout grids, tables, filters, navigation, and standard chart/graph components.

NorthStar should not blindly import or depend on Tremor as a black-box runtime design system. Selected patterns should be copied, recreated, or adapted where license-appropriate, then reviewed, renamed, simplified, typed, themed, and promoted into NorthStar-owned reusable components.

The goal is to achieve a Tremor-grade dashboard experience while preserving:

```txt
full NorthStar component ownership
deterministic data flow
application performance
accessibility
visual consistency
long-term maintainability
strict separation between UI and logic
```

Tremor should be treated as a **dashboard UX and component-pattern source**, not as the source of NorthStar's product logic.

### Source Strategy

```txt
Primary dashboard/UI source:
Tremor Blocks + Tremor-style templates

Primary standard chart source:
Tremor chart components / Tremor Raw-style copied components

Underlying chart engine where required:
Recharts

Fallback custom visualization source:
NorthStar-owned Recharts components

Avoid by default:
Mario Charts, unless Tremor cannot support a specific specialized visualization clearly
```

### Component Ownership Rule

```txt
If a Tremor copy-paste block works:
  Copy or recreate it as a NorthStar-owned component.

If a Tremor npm component materially improves delivery speed and bundle impact is acceptable:
  Use @tremor/react selectively.

If Tremor cannot support the required chart:
  Build a custom NorthStar Recharts component.

If a specialized visual pattern exists outside Tremor:
  Use it only as a reference, not as a default second design system.
```

### Runtime Dependency Policy

A dependency is allowed only if it materially improves dashboard correctness, accessibility, maintainability, or delivery speed without creating meaningful bundle, security, styling-lock, or vendor-lock risk.

Recommended dependency posture:

```txt
Tailwind CSS: Approved.
React / Next.js: Approved.
TypeScript: Approved.
Recharts: Approved where charting requires it.
Tremor copy-paste blocks: Preferred.
@tremor/react: Selective approval only.
TanStack Table: Add only when tables need advanced filtering, sorting, pagination, or column controls.
Radix UI: Add only for accessibility-sensitive primitives.
Framer Motion: Avoid by default for advisor dashboards and reports unless animation materially improves comprehension.
Mario Charts: Fallback reference only, not the default visualization system.
```

### Visualization Component Boundary

All visualization components must remain presentation-only.

They may receive:

```txt
chart-ready transformer output
labels
formatters
visual options
empty/loading/error state props
```

They must not contain:

```txt
financial formulas
scenario logic
business rules
assumption resolution
compliance interpretation
recommendations
tax/legal/underwriting statements
raw calculation orchestration
```

The correct hierarchy is:

```txt
NorthStar deterministic logic engine
  ↓
NorthStar chart data transformers
  ↓
Tremor-style / NorthStar-owned chart components
  ↓
Advisor-facing visualization UI
```

---

## 19.7 Advisor Dashboard Product Role

NorthStar's dashboard overview is the advisor's global client and scenario command center.

It is designed to help advisors track, manage, and visualize risk-analysis work across their book of business. It must not be a generic analytics dashboard, a decorative metric wall, or a replacement for the module-level calculation workflow.

The dashboard should answer these advisor questions:

```txt
Who am I actively working with?
Which clients need attention?
Which scenarios are incomplete?
Where are the largest modeled income/protection gaps?
Which analyses are ready for review?
Which presentations are ready?
Which reports are ready or recently generated?
Which assumptions or formula versions are active?
What should I do next?
```

The dashboard's job is operational clarity.

The module pages' job is deterministic modeling.

The presentation/report pages' job is client-ready explanation.

### Dashboard Product Definition

```txt
NorthStar Dashboard = advisor command center
Client Page = client profile, history, and scenario portfolio
Scenario Page = risk-analysis project workspace
Risk Module Page = deterministic input, calculation, and visualization workspace
Presentation Page = client-facing meeting mode
Report Page = exportable artifact
Assumptions Page = model governance surface
Audit Page = calculation traceability surface
```

---

## 19.8 Advisor Dashboard Information Architecture

Recommended dashboard zones:

```txt
1. Advisor Workspace Header
2. Primary Action Bar
3. Book-of-Business Summary Metrics
4. Risk Exposure Overview
5. Client / Scenario Tracking Table
6. Risk Module Status Cards
7. Recent Presentations and Reports
8. Assumptions / Formula Version Status
9. Advisor Task Queue
```

### Advisor Workspace Header

Purpose: orient the advisor immediately.

Recommended content:

```txt
NorthStar Dashboard
Advisor income gap analysis workspace

Primary actions:
- Create Client
- Start Analysis
- Open Presentation Mode
- Generate Report
- Review Assumptions
```

### Primary Action Bar

Advisor actions should be visible and immediate:

```txt
Create New Client
Start Income Gap Analysis
Open Recent Scenario
Generate Client Report
Review Assumptions
```

### Book-of-Business Summary Metrics

Use Tremor-style metric cards translated into NorthStar-specific concepts:

```txt
Total Clients
Active Scenarios
Incomplete Analyses
Presented Scenarios
Reports Generated
Elevated Gap Scenarios
Average Modeled Gap
Largest Open Gap
```

Bad metrics:

```txt
Page views
Generic user activity
Rows read / rows written
Generic usage totals
Generic SaaS billing metrics
```

Good metrics:

```txt
18 Active Scenarios
7 Incomplete Analyses
$2.4M Largest Modeled Life Gap
11 DI Scenarios Pending Review
4 Reports Ready for Advisor Review
```

### Risk Exposure Overview

The dashboard should surface book-level risk visibility without recalculating module logic on render.

Recommended visuals:

```txt
Gap by Module
Gap Severity Distribution
Recent Modeled Gaps
Highest Open Exposure
DI Monthly Gap Summary
Life Protection Gap Summary
Unemployment Reserve Runway Summary
Liability Exposure Summary
```

Use clear common charts:

```txt
bar charts for gap comparison
line charts for time-series exposure
stacked bars for coverage/benefit offsets
progress bars for completion/readiness
tables for client and scenario tracking
badges for status/severity
```

Avoid overly complex charts where simple cards, bars, tables, or timelines are clearer.

---

## 19.9 Client and Scenario Tracking Table

The dashboard's operational center should be a client/scenario tracking table.

Recommended columns:

```txt
Client
Scenario
Risk Module
Modeled Gap
Status
Last Updated
Presentation Ready
Report Ready
Advisor Action
```

Recommended statuses:

```txt
Draft
Inputs Needed
Calculated
Ready for Review
Presented
Report Generated
Archived
```

Recommended actions:

```txt
Continue
Review Gap
Open Presentation
Generate Report
Archive
```

This table should consume a dashboard view model, not raw calculation functions.

Correct:

```txt
Dashboard reads stored scenario summaries and calculation run outputs.
```

Incorrect:

```txt
Dashboard recalculates every client's risk exposure during render.
```

---

## 19.10 Risk Module Dashboard Cards

Use one dashboard card per risk module:

```txt
Life Insurance
Disability Insurance
Unemployment
Liability / Lawsuit
```

Each card should show:

```txt
Active scenarios
Incomplete scenarios
Highest modeled gap
Average modeled gap
Recently updated client
Presentation/report readiness
Shortcut to create or continue an analysis
```

Disability Insurance should become the primary visual emphasis once the DI time-series engine is implemented, because it is the flagship income-disruption module.

During MVP, Life Insurance may appear first as the proof-of-concept module.

Post-DI build, recommended order:

```txt
Disability Insurance
Life Insurance
Unemployment
Liability / Lawsuit
```

---

## 19.11 Reports, Presentations, Governance, and Tasks

### Recent Presentations and Reports

NorthStar is presentation-first. The dashboard must track report and presentation readiness.

Recommended section fields:

```txt
Client
Scenario
Module
Presented Date
Report Status
Open Presentation
Open Report
```

Report states:

```txt
Draft Report
Ready for Export
Presented
Archived
```

### Model Governance Status

The dashboard should expose deterministic engine governance.

Recommended governance card:

```txt
Model Governance
Formula Versions: life-v1.0.0 / di-v1.0.0
Default Assumption Set: Firm Standard
Last Assumption Update: YYYY-MM-DD
Calculation Runs Logged: 128
```

This builds advisor trust and reinforces that NorthStar is not a black-box tool.

### Advisor Task Queue

The dashboard should surface next actions:

```txt
3 clients have incomplete DI inputs
2 scenarios have no presentation generated
4 reports are ready for review
1 assumption set was updated since last calculation
```

This makes the dashboard a productivity surface, not just a display surface.

---

## 19.12 Dashboard View Model

The dashboard must consume summarized data rather than running calculation logic directly.

```ts
type AdvisorDashboardViewModel = {
  advisor: {
    id: string;
    name: string;
    firmName?: string;
  };

  summary: {
    totalClients: number;
    activeScenarios: number;
    incompleteAnalyses: number;
    presentedScenarios: number;
    generatedReports: number;
    elevatedGapScenarios: number;
    largestModeledGap: number;
    averageModeledGap: number;
  };

  riskModules: RiskModuleDashboardSummary[];

  recentScenarios: ScenarioDashboardRow[];

  recentClients: ClientDashboardRow[];

  recentReports: ReportDashboardRow[];

  advisorTasks: AdvisorTask[];

  governance: {
    activeFormulaVersions: Record<string, string>;
    activeAssumptionSetName: string;
    lastAssumptionUpdate: string;
    calculationRunsLogged: number;
  };
};
```

Supporting row types:

```ts
type ScenarioDashboardRow = {
  clientId: string;
  clientName: string;
  scenarioId: string;
  scenarioName: string;
  moduleType: RiskModuleType;
  modeledGap: number;
  status: "draft" | "inputs_needed" | "calculated" | "ready_for_review" | "presented" | "report_generated" | "archived";
  lastUpdated: string;
  presentationReady: boolean;
  reportReady: boolean;
};

type RiskModuleDashboardSummary = {
  moduleType: RiskModuleType;
  activeScenarios: number;
  incompleteScenarios: number;
  highestModeledGap: number;
  averageModeledGap: number;
  recentlyUpdatedClientName?: string;
};
```

---

## 19.13 Dashboard Route and Component Architecture

Recommended dashboard routes:

```txt
/app/(dashboard)
  /dashboard
  /clients
  /clients/[clientId]
  /clients/[clientId]/scenarios
  /clients/[clientId]/scenarios/[scenarioId]
  /reports
  /assumptions
  /settings
```

Recommended dashboard component structure:

```txt
/src/components/dashboard
  AppShell.tsx
  SidebarNav.tsx
  TopBar.tsx
  WorkspaceHeader.tsx
  PrimaryActionBar.tsx
  DashboardGrid.tsx
  MetricCard.tsx
  IncomeGapMetricCard.tsx
  RiskExposureOverview.tsx
  ClientScenarioTable.tsx
  RiskModuleCard.tsx
  RecentReportsPanel.tsx
  AdvisorTaskQueue.tsx
  GovernanceStatusCard.tsx
  ScenarioStatusBadge.tsx
  RiskSeverityBadge.tsx
  PresentationReadyBadge.tsx
  ReportStatusBadge.tsx
```

Recommended chart/dashboard component structure:

```txt
/src/components/charts
  ChartPanel.tsx
  ChartLegend.tsx
  ChartTooltip.tsx
  ChartEmptyState.tsx
  ChartErrorState.tsx
  IncomeGapBarChart.tsx
  CoverageOffsetChart.tsx
  ProtectionNeedStack.tsx
  IncomeCollapseCurve.tsx
  ReserveDepletionTimeline.tsx
  BenefitStreamStack.tsx
  LifestyleCompressionChart.tsx
  RecoveryPathComparison.tsx

/src/components/tremor-adapted
  TremorCardBase.tsx
  TremorTableBase.tsx
  TremorAreaChartBase.tsx
  TremorBarChartBase.tsx
  TremorLineChartBase.tsx
  TremorDonutChartBase.tsx
```

---

## 19.14 Dashboard Layout Reference

NorthStar should translate Tremor's generic SaaS dashboard structure into advisor workflow language.

```txt
Tremor Analytics Workspace → NorthStar Advisor Workspace
Usage Cards → Risk Module Status Cards
Cost / Spend Cards → Modeled Exposure Summary
Rows Read / Written KPIs → Client / Scenario / Gap Metrics
Overview Table → Recent Clients / Recent Scenarios
Shortcuts → Create Client / Start Analysis / Open Presentation / Export Report
Settings → Assumptions / Formula Versions / Advisor Settings
```

Recommended dashboard layout:

```txt
┌──────────────────────────────────────────────────────────────┐
│ TopBar: NorthStar | Search clients/scenarios | Advisor Menu  │
├───────────────┬──────────────────────────────────────────────┤
│ Sidebar       │ Workspace Header                             │
│               │ "Advisor income gap analysis workspace"      │
│ Dashboard     │ [Create Client] [Start Analysis] [Reports]   │
│ Clients       │                                              │
│ Scenarios     │ Summary Metric Cards                         │
│ Risk Modules  │ Clients | Active Scenarios | Open Gaps       │
│ Reports       │ Reports | Incomplete Analyses                │
│ Assumptions   │                                              │
│ Settings      │ Risk Exposure Overview                       │
│               │ Gap by Module / Gap Severity / Timeline      │
│               │                                              │
│               │ Client + Scenario Tracking Table             │
│               │                                              │
│               │ Risk Module Cards                            │
│               │ Life | DI | Unemployment | Liability         │
│               │                                              │
│               │ Reports / Governance / Advisor Tasks         │
└───────────────┴──────────────────────────────────────────────┘
```

---

## 19.15 Advisor Usability Rules

NorthStar must be built for advisor usability, not internal engineering vanity.

Rules:

```txt
Reduce input friction.
Make the next action obvious.
Use clear status labels.
Prioritize client/scenario tracking.
Keep formulas out of the UI layer.
Show assumptions visibly.
Make reports and presentations easy to access.
Use visuals to explain, not decorate.
Avoid spreadsheet-heavy screens.
Avoid over-dense dashboard metrics.
Do not recalculate module outputs from the dashboard view.
Do not force advisors to navigate deeply for common actions.
```

The dashboard should reduce cognitive load by emphasizing relevant, actionable information. It should not bury the advisor in raw data.

---

## 19.16 Updated UI/UX Implementation Phases

### UI Phase 1 — App Shell and Advisor Command Center

```txt
AppShell
SidebarNav
TopBar
WorkspaceHeader
PrimaryActionBar
MetricCard
RiskModuleCard
ClientScenarioTable
RecentReportsPanel
GovernanceStatusCard
AdvisorTaskQueue
```

Goal:

```txt
The advisor can quickly understand active clients, active scenarios, incomplete analyses, modeled gaps, report readiness, and next actions.
```

### UI Phase 2 — Scenario Workspace and Module UX

```txt
Client selector
Scenario selector
Risk module tabs
Input sections
Assumption panels
Output cards
Chart panels
Static narrative panels
Disclaimer blocks
Audit snapshot viewer
```

Goal:

```txt
The advisor can complete one full deterministic workflow: client → scenario → module inputs → calculation → visual output → presentation/report.
```

### UI Phase 3 — Presentation and Report Experience

```txt
Presentation mode
Report preview
Export-ready report sections
Advisor notes
Static copy snapshots
Formula version display
Assumption disclosure section
```

Goal:

```txt
The advisor can use NorthStar live in a client meeting and preserve the output as a report artifact.
```

### UI Phase 4 — Advanced Dashboard Management

```txt
Advanced table filtering
Dashboard search
Module-specific dashboard slices
Report activity feed
Assumption update warnings
Formula version warnings
Book-of-business gap visibility
```

Goal:

```txt
The dashboard becomes the advisor's long-term client and risk-analysis management surface.
```


## 20.1 Recommended Source Structure

```txt
/src
  /app
    /(auth)
    /(dashboard)
    /(presentation)

  /components
    /global
    /ui
    /layout
    /forms
    /charts
    /cards
    /navigation
    /presentation

  /features
    /clients
    /scenarios

    /risk-modules
      /life
        /schemas
        /calculations
        /transformers
        /constants
        /templates
        /components
        /tests

      /disability
        /schemas
        /calculations
        /transformers
        /constants
        /templates
        /components
        /tests

      /unemployment
        /schemas
        /calculations
        /transformers
        /constants
        /templates
        /components
        /tests

      /liability
        /schemas
        /calculations
        /transformers
        /constants
        /templates
        /components
        /tests

    /reports
    /calculation-runs

  /lib
    /math
    /formatters
    /validators
    /constants
    /storage
    /audit

  /server
    /queries
    /mutations
    /services

  /styles
  /types
```

## 20.2 Absolute Engineering Rules

```txt
No financial calculation inside React components.
No chart component should contain business formulas.
No static copy should contain recommendation language.
No calculation should run without a formula version.
No report should render without a disclaimer.
No historical report should be recalculated silently.
No optional benefit should default to undefined.
No AI service, AI SDK, AI prompt, or AI-generated output should be included.
```

---

# 21. Phased Implementation Roadmap

NorthStar should be built sequentially so each architectural layer is validated before additional module complexity is added.

## 21.1 Phase 1 — Application Shell and UI Foundation

Build:

```txt
Application shell
Dashboard layout
Advisor navigation
Client selector
Scenario selector
Risk module tab structure
Reusable global components
Disclaimer component
Presentation layout placeholder
```

Exit gate:

```txt
Advisor can navigate from client to scenario to risk module tab and view a presentation-ready shell with placeholder data.
```

## 21.2 Phase 2 — Life Insurance MVP Logic Loop

Build:

```txt
Life input schema
Life assumption schema
Life calculation function
Life formula version registry entry
Life chart transformers
Life output cards
Life static narrative
Life calculation snapshot
Life presentation/report section
```

Exit gate:

```txt
Client data → assumptions → deterministic life calculation → chart data → output cards → static narrative → calculation snapshot → presentation view.
```

## 21.3 Phase 3 — Disability Insurance Time-Series Engine

Build:

```txt
DI input schema
DI benefit stream schema
DI assumption schema
STD/LTD/private/state/SSDI stream builders
Month-by-month timeline calculation
Taxability handling per benefit stream
Reserve depletion logic
Partial vs total comparison
Income collapse curve
Protection gap stack
Lifestyle compression model
DI calculation snapshot
```

Exit gate:

```txt
Advisor can model at least one total disability and one partial disability scenario with start dates, waiting periods, benefit durations, reserve depletion, and chart outputs generated from the same timeline source of truth.
```

## 21.4 Phase 4 — Presentation and Report Layer

Build:

```txt
Presentation mode
Report view
Static summary blocks
Assumption summary tables
Formula version display
Calculation date display
Disclaimer rendering
Report snapshots
Print/export-ready layout
```

Exit gate:

```txt
Advisor can open a client-ready presentation/report that renders from saved calculation snapshots and includes assumptions, formulas, static narrative, and disclaimer language.
```

## 21.5 Phase 5 — Governance, QA, and Hardening

Build:

```txt
Formula version management
Assumption set management
Golden test cases
Regression tests
Snapshot tests
Forbidden phrase linting
Audit trail review tools
Security/RLS policies if using remote persistence
Production-readiness checklist
```

Exit gate:

```txt
Every module calculation is test-covered, versioned, auditable, reproducible, and free of forbidden recommendation or guarantee language.
```

---

# 22. MVP Implementation Scope

## 22.1 MVP Must Include

```txt
Application shell
Client profile creation
Scenario creation
Risk module tabs
Life Insurance MVP engine
Disability Insurance timeline engine
Output cards
Basic Recharts visuals
Static narratives
Universal disclaimer
Local storage or Firebase persistence
Calculation snapshots
Presentation/report view
```

## 22.2 MVP May Defer

```txt
Present value life formula enabled by default
Multi-scenario comparison
Firm-level assumption library
Policy document parsing
SSDI estimator integration
Legal jurisdiction asset protection logic
Advanced exports
Advisor team permissions
```

## 22.3 MVP Must Exclude

```txt
AI summaries
AI interpretation
AI prompts
Vercel AI SDK
Carrier recommendations
Product recommendations
Suitability conclusions
Underwriting predictions
Benefit approval predictions
Legal conclusions
Tax conclusions
```

---

# 23. Production Formula Roadmap

## 23.1 Life Insurance Enhancements

```txt
Present-value income stream
Income growth assumptions
Inflation-adjusted education goal
Surviving spouse income offset
Liquid asset allocation
Mortgage payoff prioritization
Social Security survivor benefit optional field
Multi-dependent time horizons
Separate income need and lump-sum obligation logic
```

## 23.2 Disability Insurance Enhancements

```txt
Employer STD/LTD schedule modeling
Private DI policy-specific modeling
Partial vs total disability side-by-side scenario
Return-to-work recovery curve
Expense inflation
Benefit taxability per stream
SSDI advisor-entered assumption
State benefit advisor-entered assumption
Reserve depletion sensitivity analysis
```

## 23.3 Unemployment Enhancements

```txt
Multiple job search duration scenarios
Severance timing
Unemployment benefit phaseout
Reduced expense assumption
Debt payment pause assumption
Recovery month income restoration
```

## 23.4 Liability Enhancements

```txt
Separate asset classes
Jurisdiction-specific protected asset notes
Umbrella gap analysis
Multiple claim scenarios
Coverage tower visualization
Asset erosion timeline
```

---

# 24. Engineering Definition of Done

A module is done only when:

```txt
Input schema exists.
Assumption schema exists.
Calculation function exists.
Formula version is registered.
Chart transformers exist.
Static narrative template exists.
Disclaimer is included.
Calculation snapshot is generated.
Unit tests pass.
Golden test cases exist.
No business logic is inside React components.
No forbidden language appears in static copy.
Outputs are reproducible from snapshots.
```

---

# 25. Module Production-Readiness Checklist

A risk module is not production-ready until every item below is satisfied.

## 25.1 Architecture Checklist

```txt
Input schema exists.
Output schema exists.
Assumption schema exists.
Benefit stream schema exists where applicable.
Formula version is registered.
Calculation orchestrator route exists.
All calculations are pure functions with zero side effects.
No business logic appears inside React components.
All outputs are generated from validated inputs and assumptions.
```

## 25.2 Visualization Checklist

```txt
Every chart has a dedicated transformer.
Raw calculation outputs do not bind directly to charts.
Chart data includes stable empty states.
Timeline charts use the same timeline data as output cards.
Depletion markers and event annotations come from deterministic data, not UI guesses.
Presentation and report views render the same saved output snapshot.
```

## 25.3 Compliance Language Checklist

```txt
Universal disclaimer appears on every output screen.
Module-specific disclaimer appears when needed.
Static narrative avoids recommendation language.
Forbidden phrase linting passes.
No guarantee, suitability, product, carrier, legal, or tax advice language appears.
Government benefits are explicitly non-predictive and advisor-entered where applicable.
Tax assumptions are visible, editable where appropriate, and snapshotted.
```

## 25.4 Audit and Reproducibility Checklist

```txt
CalculationRun snapshot captures inputs.
CalculationRun snapshot captures assumptions.
CalculationRun snapshot captures outputs.
CalculationRun snapshot captures chart data.
CalculationRun snapshot captures static narrative.
CalculationRun snapshot captures disclaimer version.
Formula version can reconstruct historical output.
Report snapshot preserves the exact presentation shown at the time.
```

## 25.5 Testing Checklist

```txt
Unit tests exist for all formulas.
Golden test cases exist for normal, edge, and zero-gap scenarios.
Regression tests pass before formula version changes.
Snapshot tests exist for narratives and disclaimers.
Validation tests reject invalid ages, negative amounts, impossible durations, and out-of-range percentages.
DI tests verify waiting periods, start months, end months, taxability, and reserve depletion.
```

---

# 26. Developer Agent Instruction Prompt

Use this as the build-agent role instruction.

```txt
You are the lead deterministic financial risk logic engineering agent for NorthStar.

NorthStar is an advisor-facing risk visualization platform for Life Insurance, Disability Insurance, Unemployment, and Liability/Lawsuit risk. NorthStar is not a full financial planning suite and not an AI advisor.

Your task is to build the local deterministic logic engine, calculation architecture, validation schemas, chart transformers, static narrative templates, calculation snapshots, and presentation-ready output system.

Strict product constraints:
- No AI assist.
- No AI summaries.
- No AI-generated narratives.
- No AI-driven predictions.
- No carrier recommendations.
- No product recommendations.
- No underwriting conclusions.
- No legal or tax advice.
- No guarantee language.

Core architecture:
Validated inputs
+ explicit assumptions
+ versioned formulas
+ deterministic calculation functions
+ chart transformers
+ static templates
+ calculation run snapshots
= advisor-ready risk visualization.

Engineering rules:
- Do not put financial calculations inside React components.
- Keep formulas in /calculations.
- Keep schemas in /schemas.
- Keep chart formatting in /transformers.
- Keep static copy in /templates or /constants.
- Every calculation must have a formula version.
- Every report must show assumptions, formula version, and disclaimer.
- Every output must be reproducible from a CalculationRun snapshot.

Build modules in this order:
1. Shared math utilities.
2. Formula registry.
3. Calculation orchestrator.
4. Life Insurance module.
5. Disability Insurance module.
6. Chart transformers.
7. Static narrative templates.
8. Calculation run snapshots.
9. Presentation/report mode.
10. Unit and golden tests.

The first complete proof loop must be:
Client data → scenario assumptions → deterministic calculation → chart data → visual output → static narrative → calculation snapshot → presentation view.
```

---

# 27. Final NorthStar Technical Standard

NorthStar’s hardened logic engine should be summarized as:

```txt
NorthStar is a deterministic risk modeling kernel
surrounded by validation, assumption governance,
formula versioning, chart transformers,
static templates, and immutable calculation snapshots.
```

And the permanent engineering formula is:

```txt
Validated Inputs
+ Explicit Assumptions
+ Versioned Formulas
+ Timeline-Based Scenario Logic
+ Benefit / Coverage Offsets
+ Safe Math Guards
+ Chart Transformers
+ Static Narratives
+ Audit Snapshots
= Advisor-Ready Risk Visualization
```

This is the governing specification for NorthStar’s MVP and production logic foundation.

---

# 28. Reference Notes

This specification is informed by the uploaded NorthStar project materials and research report, plus official/professional reference sources used for governance posture:

- IRS: life insurance and disability insurance proceeds tax treatment.
- SSA: SSDI eligibility and work credit rules.
- Department of Labor / EBSA: disability benefits and employee benefit plan context.
- NAIC: life insurance illustration disclosure / consumer education principles.
- Actuarial Standards Board ASOP No. 41: disclosure of assumptions, methods, data, and limitations.
- CFP Board: financial planning practice standards and assumption review discipline.
- Tremor / Tremor Blocks: dashboard, chart, and app UI component reference system.
- Nielsen Norman Group: dashboard UX principle that dashboards should provide at-a-glance actionable information.

These references inform disclosure, tax, benefit, and governance handling. They do not create a universal official coverage formula. NorthStar’s formulas remain illustrative deterministic planning models that must be reviewed and interpreted by the advisor.

The supplemental NorthStrategic Architecture & Module Infrastructure reference was additionally used to harden implementation structure, UI/UX component ownership rules, Disability Insurance time-series module framing, phased development sequencing, transformer responsibilities, and production-readiness controls.


---

# 29. Dashboard and UI Reference Notes

NorthStar's dashboard and application UI strategy is informed by Tremor and Tremor Blocks as a modern React/Tailwind dashboard reference system. Tremor provides dashboard and chart components built for React, Tailwind CSS, and Radix UI, while Tremor Blocks provides copy-paste blocks and templates for dashboard and app construction. NorthStar uses these as design and implementation references, not as authority for financial logic.

NorthStar's dashboard UX standard is also informed by dashboard usability principles: a dashboard should provide at-a-glance information that helps users act quickly. For NorthStar, this means the dashboard must be the advisor's client/scenario/project command center, not a decorative analytics page.

Permanent UI hierarchy:

```txt
Dashboard = global advisor command center
Client page = client profile and history
Scenario page = analysis project workspace
Risk module page = deterministic calculation and visualization workspace
Presentation page = client-facing explanation mode
Report page = exportable artifact
Assumptions page = model governance
Audit page = calculation traceability
```
