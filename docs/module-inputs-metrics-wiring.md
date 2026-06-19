# Module Inputs, Metric Outputs, and End-to-End Wiring

Generated from the current TypeScript implementation on 2026-06-19.

## Status legend

| Status | Meaning |
|---|---|
| **E2E** | Editable/prefilled input -> calculation -> stored output -> visible module result. |
| **CALC** | Used by a calculation, but the resulting field is not directly shown in the current module UI. |
| **DISPLAY** | Derived output is shown in a card, chart, tooltip, narrative, dashboard, or presentation. |
| **STORED** | Output is saved in the scenario record but has no current direct UI consumer. |
| **LOCAL** | Wired inside an interactive calculator, but not saved to the scenario record or used by other module calculations. |
| **UNWIRED** | Implementation exists but no reachable current page imports/renders it. |
| **LEGACY** | Compatibility field retained for older persisted data. |

## End-to-end architecture

All four scenario modules are reachable from their module pages and recalculate with `useMemo` whenever their inputs change. A page effect saves the result into `moduleRecordsByScenarioId[scenarioId]`, which is persisted to local storage by Zustand.

| Scenario module | Page calculation | Stored result | Primary gap consumed outside module | E2E status |
|---|---|---|---|---|
| Life | `calculateLifeInsuranceGap` plus `calculateIncomeGapScenarios` | Only `LifeOutputs` from `calculateLifeInsuranceGap` | `remainingGap` in Presentation's modeled-gap helper | **E2E**, with a caveat: income-gap scenario outputs are displayed but not persisted |
| Disability | `calculateDisabilityGap` | `DisabilityOutputs` | `totalGap` | **E2E** |
| Unemployment | `calculateUnemploymentGap` | `UnemploymentOutputs` | `totalUncoveredShortfall` | **E2E** |
| Liability | `calculateLiabilityGap` | `LiabilityOutputs` | `exposureGap` | **E2E** |

`formulaRegistry` lists all four calculation functions and version names, but no current page or store calculation path reads the registry. Pages import the functions directly. The registry is therefore **UNWIRED metadata**, not the runtime dispatcher.

### Shared scenario input synchronization

Editing Life or Disability synchronizes the following fields across included modules:

| Shared value | Life | Disability | Unemployment | Liability |
|---|---|---|---|---|
| Annual income | `annualIncome` | `annualEarnedIncome` | `annualIncome` | `annualIncome` |
| Current age | `currentAge` | `currentAge` | Not used | `currentAge` |
| Projection end age | `retirementAge` | `retirementAge` | Not used | `retirementAge` |
| Replacement years | Recomputed as end age minus current age | Not applicable | Not applicable | Not applicable |

Editing Unemployment or Liability does **not** synchronize changes back to the other modules. Updating a client profile rebuilds every included module from profile values and clears saved outputs.

## 1. Life Insurance

### Inputs and assumptions

| Field | Source/UI | Calculation use | Status |
|---|---|---|---|
| `advisorId`, `clientId`, `scenarioId` | Prefilled identifiers; no module controls | Not used in either formula | **STORED** metadata only |
| `earnerName` | Client profile; no module control | Not used | **STORED** metadata only |
| `currentAge` | Visible input; profile prefill | Projection length and yearly ages in both formulas | **E2E** |
| `retirementAge` | Visible input; profile prefill | Projection end and replacement duration | **E2E** |
| `annualIncome` | Visible input; profile prefill | Gross income basis | **E2E** |
| `spouseAnnualIncome` | Visible input; profile prefill | Reduces annual survivor income need | **E2E** |
| `incomeReplacementYears` | No direct control; initialized/synchronized from ages | Caps main life replacement schedule | **CALC** |
| `incomeReplacementRatio` | Visible percentage input; default 70% | Multiplies client income before spouse offset | **E2E** |
| `groupLifeCoverage` | Visible input; profile prefill | Existing resource pool and GLI allocation | **E2E** |
| `privateLifeCoverage` | Visible input; profile prefill | Existing resource pool and private allocation | **E2E** |
| `privateLifePolicyType` | Visible term/permanent selector | Reported output and private coverage duration | **E2E** |
| `privateLifeTermYears` | Visible only for term policy | Caps private coverage years output | **E2E** |
| `nonQualifiedAssets` | Visible input; household profile total | Added to available coverage resources | **E2E** |
| `debtsTotal` | Visible input | Added to base protection need | **E2E** in main life gap; not used by income-gap scenarios |
| `educationGoal` | Visible input | Added to base protection need | **E2E** in main life gap; not used by income-gap scenarios |
| `finalExpenses` | Visible input | Added to base protection need | **E2E** in main life gap; not used by income-gap scenarios |
| `liquidAssetsAllocated` | Profile prefill; no current Life form control | Offset only when `includeLiquidAssetsOffset` is true | **CALC**, normally disabled by default |
| `targetIncomeSupportPct` | Visible on Safe Income tab; default 85% | Target stream for both life formulas/module 1 | **E2E** |
| `safeIncomeCoveragePct` | No separate control; mirrors target percentage | Fallback alias only | **LEGACY** |
| `maxCoverageRoi` | Visible only on Coverage Runway tab; default 6% | Return on the module 2 resource pool | **E2E** |
| `incomeGapRoi` | Visible PV reference input; default 5% | PV references and module 2 annual-gap capital need | **E2E** |
| `inflationRateAnnual` assumption | Persisted global/scenario assumption; no current Life page control | Not referenced by either current life calculation | **STORED**, currently unused |
| `discountRateAnnual` assumption | Persisted global/scenario assumption; no current Life page control | Main formula applies it only when `usePresentValue` is true | **CALC** |
| `incomeGrowthRateAnnual` assumption | Persisted global/scenario assumption; default 3% | Grows yearly projected income in both formulas | **E2E** via default, not page-editable |
| `usePresentValue` assumption | Persisted assumption; default false | Switches main replacement stream to PV | **CALC**, not page-editable |
| `includeLiquidAssetsOffset` assumption | Persisted assumption; default false | Enables `liquidAssetsAllocated` offset | **CALC**, not page-editable |
| `deathBenefitTaxTreatment` assumption | Persisted assumption | Not used by either formula | **STORED**, currently unused |
| `deathBenefitIncomeYieldAnnual` assumption | Persisted assumption; default 5% | Copied to `LifeOutputs` only | **STORED**, no current output consumer |

### Main `LifeOutputs`

| Output | Meaning | Current consumer/status |
|---|---|---|
| `replacementYears` | Modeled replacement duration | **STORED** |
| `annualReplacementNeed` | First-year net annual survivor need | **STORED** |
| `futureIncomeLost` | Total target income support stream | **STORED** |
| `baseProtectionNeed` | Income need plus debts, education, final expenses | **STORED** |
| `existingCoverageTotal` | Group plus private life coverage | **DISPLAY** through life chart transformer |
| `liquidAssetOffset` | Non-qualified assets plus enabled liquid offset | **STORED** |
| `availableResources` | Coverage plus asset offsets | **STORED** |
| `remainingGap` | Base protection need minus available resources | **DISPLAY** in Presentation's primary modeled-gap label; not used by the current Life tab charts |
| `coverageOffsetPercentage` | Available resources divided by base need | **DISPLAY** through chart transformer |
| `yearlyBreakdown[]` | Yearly need/coverage/gap schedule | **DISPLAY** through chart transformer |
| `yearlyBreakdown[].age` | Age for the year | **DISPLAY** chart axis |
| `yearlyBreakdown[].totalNeed` | Target annual need | **DISPLAY** chart |
| `yearlyBreakdown[].gliCovered` | Group life allocation | **DISPLAY** chart |
| `yearlyBreakdown[].privateCovered` | Private life allocation | **DISPLAY** chart |
| `yearlyBreakdown[].survivorGap` | Annual remaining gap | **DISPLAY** chart |
| `projectedIncomeToRetirement` | Projected net income total | **STORED** |
| `groupLifeCoverageYears` | Years to retirement | **STORED** |
| `groupLifeBenefit` | Entered group death benefit | **STORED** |
| `groupLifeAnnualIncome` | First-year group allocation | **STORED** |
| `privateLifeAnnualIncome` | First-year private allocation | **STORED** |
| `privateLifeCoverageYears` | Term/permanent modeled duration | **STORED** |
| `privateLifePolicyType` | Selected policy type | **STORED** |
| `privateLifeBenefit` | Entered private death benefit | **STORED** |
| `totalDeathBenefit` | Group plus private benefit | **STORED** |
| `cumulativeSurvivorGap` | Sum of yearly survivor gaps | **STORED** |
| `lifetimeIncomeUncoveredPercentage` | Survivor gap divided by target stream | **STORED** |
| `deathBenefitIncomeYieldAnnual` | Copied assumption | **STORED** |

### Income Gap scenario outputs

These outputs are calculated and displayed live but are not written to the scenario store.

| Output | Current consumer/status |
|---|---|
| `yearsToRetirement` | Calculation container only; **CALC** |
| `isM1FullyCovered` | Safe Income card state; **DISPLAY** |
| `m1SurvivorGap` | Safe Income survivor gap; **DISPLAY** |
| `module1.projectedNetIncomeTotal` | Metric card; **DISPLAY** |
| `module1.targetIncomeSupportPct` | Metric card; **DISPLAY** |
| `module1.targetIncomeSupportTotal` | Metric description/value; **DISPLAY** |
| `module1.targetDeathBenefitNeed` | Metric card; **DISPLAY** |
| `module1.coverageSupportRate` | Metric card/chart; **DISPLAY** |
| `module1.safeIncomeCoveragePct` | Compatibility alias used by chart copy; **LEGACY/DISPLAY** |
| `module1.annualCoverageYear1` | No direct consumer; **CALC** |
| `module1.totalIncomeReplaced` | Metric card/chart; **DISPLAY** |
| `module1.existingCoverageResources` | Metric card; **DISPLAY** |
| `module1.pvOfProjectedNeed` | No direct consumer; **CALC** |
| `module1.pvOfTargetNeed` | No direct consumer; **CALC** |
| `module1.pvOfCoverageStream` | No direct consumer; **CALC** |
| `module1.deathBenefitNeeded` | Additional coverage metric logic; **DISPLAY** |
| `module1.additionalDeathBenefitNeeded` | Alias used by output UI; **DISPLAY** |
| `module1.roi` | Calculation/reference only; **CALC** |
| `module2.projectedNetIncomeTotal` | Metric card; **DISPLAY** |
| `module2.yearsOfMaxWD` | Years of full coverage metric; **DISPLAY** |
| `module2.startCoverageAge`, `endCoverageAge` | Metric description; **DISPLAY** |
| `module2.totalIncomeReplaced` | Metric card/chart; **DISPLAY** |
| `module2.survivorGap` | Metric card; **DISPLAY** |
| `module2.deathBenefitNeeded` | Runway capital gap metric; **DISPLAY** |
| `module2.maxCoverageRoi` | Calculation only; **CALC** |
| `module2.roi` | Runway metric description; **DISPLAY** |
| `module1.yearlyData[]`, `module2.yearlyData[]` | Scenario charts; **DISPLAY** |
| Yearly `yearIndex`, `age`, `projectedIncome`, `targetIncomeNeed`, `safeIncomeCoverage`, `incomeGap`, `cumulativeIncomeGap`, `maxCovered`, `maxCoverageGap`, `cumulativeMaxCoverageGap`, `isCoveredMax` | Chart/schedule data; **DISPLAY** (some fields only affect chart series/tooltips) |

## 2. Disability Insurance

### Inputs and assumptions

| Field | Source/UI | Calculation use | Status |
|---|---|---|---|
| `advisorId`, `clientId`, `scenarioId` | Prefilled identifiers | Not used by formula | **STORED** metadata only |
| `annualEarnedIncome` | Visible, shared profile input | Current and projected income | **E2E** |
| `currentAge` | Visible, shared profile input | Projection start and DI end-age math | **E2E** |
| `retirementAge` | Visible, shared profile input | Projection end and premium duration | **E2E** |
| `ltdCoveragePercent` | Visible | Group LTD percentage | **E2E** |
| `ltdMonthlyCap` | Visible | Caps group LTD monthly benefit | **E2E** |
| `ltdTaxable` | Visible yes/no | Applies fixed 70% net factor when true | **E2E** |
| `privateDiBenefitMonthly` | Visible | Individual DI benefit | **E2E** |
| `privateDiBenefitPeriod` | Visible | Ends benefit after 2/5/10 years or age 65/67/70 | **E2E** |
| `privateDiMonthlyPremium` | Visible | Lifetime IDI cost and Premium-vs-Self-Insured prefill | **E2E** |
| `breakEvenRateOfReturn` | Visible | Premium-vs-Self-Insured prefill | **LOCAL** to embedded calculator; not used by main gap formula |
| `breakEvenMonthsWithoutIncome` | Visible | Premium-vs-Self-Insured prefill | **LOCAL** to embedded calculator; not used by main gap formula |
| `incomeGrowthRateAnnual` assumption | Persisted; default 3% | Annual income growth | **E2E** via default, not page-editable |
| `colaRate` assumption | Output-view toggle; default 0/3% | Grows IDI benefits and adds 20% premium load | **E2E** |

### `DisabilityOutputs`

| Output | Current consumer/status |
|---|---|
| `ltdComputedMonthlyBenefit` | Gross monthly metric/derived gross view; **DISPLAY** |
| `ltdNetMonthlyBenefit` | Net monthly metric; **DISPLAY** |
| `privateDiMonthlyBenefit` | Monthly metric; **DISPLAY** |
| `totalNetMonthlyBenefit` | Monthly metric; **DISPLAY** |
| `incomeLossNet` | Representable from selected chart age; direct field is **STORED** |
| `incomeProjection[]` | Main chart, selected-age metrics, COLA comparison; **DISPLAY** |
| Projection `age`, `annualIncome`, `annualIncomeNet`, `ltdAnnualBenefitGross`, `ltdAnnualBenefit`, `individualDIAnnualBenefit`, `totalAnnualBenefit`, `annualGap` | Chart and aggregate source fields; **DISPLAY** |
| `projectedIncomeAtRetirement` | No current direct consumer; **STORED** |
| `totalProjectedIncome` | Lifetime projected income metric logic; **DISPLAY** |
| `totalGroupLTDCoverage` | Lifetime coverage metric; **DISPLAY** |
| `totalIndividualDICoverage` | Lifetime coverage/COLA metric; **DISPLAY** |
| `totalCoverage` | Lifetime coverage and chart summary; **DISPLAY** |
| `totalGap` | Chart summary and Presentation primary gap; **DISPLAY** |
| `averageCoverageRate` | Chart transformer summary; **DISPLAY** |
| `lifetimeIDIExpense` | Outcome/COLA metrics; **DISPLAY** |

## 3. Unemployment and Liquidity

### Inputs

| Field | Source/UI | Calculation use | Status |
|---|---|---|---|
| `annualIncome` | Visible/profile prefill | Primary income and highest-earner risk | **E2E** |
| `spouseIncome` | Visible/profile prefill | Remaining household income/highest-earner comparison | **E2E** |
| `monthlyExpenses` | Visible/profile prefill | Burn rate, reserve targets, timeline expense | **E2E** |
| `emergencySavings` | Visible/profile prefill | Reserve pool and targets | **E2E** |
| `severanceMonthly` | Visible | Monthly offset while active | **E2E** |
| `severanceDurationMonths` | Visible | Severance timeline duration | **E2E** |
| `unemploymentBenefitMonthly` | Visible | Monthly offset while active | **E2E** |
| `unemploymentBenefitDurationMonths` | Visible | Benefit timeline duration | **E2E** |
| `estimatedJobSearchMonths` | Visible; default 6 | Timeline length and total search need | **E2E** |
| `netIncomeRatio` | No form control; defaults to 65% | Converts both gross incomes to net proxies | **CALC** |

### `UnemploymentOutputs`

| Output group | Fields | Current consumer/status |
|---|---|---|
| Income/cash flow | `monthlyBurnRate`, `monthlyIncome`, `spouseMonthlyIncomeReference`, `primaryNetMonthlyIncome`, `secondaryNetMonthlyIncome`, `incomeAtRisk` | **STORED** |
| Visible income metrics | `remainingIncome`, `monthlyCashFlow`, `cashFlowStatus`, `remainingIncomeCoveragePct` | Metric cards; **DISPLAY** |
| Offset totals | `severanceTotal`, `unemploymentBenefitTotal`, `totalOffsetPool`, `monthlyOffset`, `monthlyNetBurn` | **STORED** |
| Search totals | `totalExpensesDuringSearch`, `totalOffsetDuringSearch`, `netCashNeeded`, `coveredBySavings`, `availableAtOnset` | **STORED** |
| Search outcome | `remainingShortfall`, `effectiveRunwayMonths`, `fullyFundedForSearch`, `breakEvenSearchDurationMonths`, `reserveDepletionMonth`, `totalUncoveredShortfall` | Shortfall/runway cards and chart; `totalUncoveredShortfall` is Presentation's primary gap; **DISPLAY** |
| Reserve status | `dangerThreshold`, `reserveCoveragePct`, `reserveStatus` | **STORED** |
| Reserve targets | `currentReserveLevel`, `minimumReserveTarget`, `idealReserveMonths`, `idealReserveTarget`, `reserveGap`, `excessReserve`, `reserveMonthsCurrent` | Cards/chart; **DISPLAY** |
| Advisor aliases | `annualIncomeAtRisk`, `monthlyGapAtDepletion` | **STORED** |
| Timeline | `timeline[]` | Search/runway chart; **DISPLAY** |
| Timeline point | `month`, `remainingIncome`, `severance`, `unemploymentBenefit`, `requiredSavingsDraw`, `endingReserveBalance`, `offsetIncome`, `expenses`, `reserveBalance`, `shortfall`, `coverageSource` | Chart/tooltip data; **DISPLAY** |

## 4. Liability / Lawsuit

### Inputs

| Field | Source/UI | Calculation use | Status |
|---|---|---|---|
| `annualIncome` | Visible/profile prefill | Primary wage exposure and 5x income target | **E2E** |
| `spouseAnnualIncome` | Visible/profile prefill | Household wage exposure | **E2E** |
| `currentAge` | Visible/profile prefill | Primary projection duration | **E2E** |
| `spouseCurrentAge` | Visible/profile prefill | Spouse projection duration | **E2E** |
| `retirementAge` | Visible/profile prefill | Projection end | **E2E** |
| `nonQualifiedAssets` | Visible/profile household total | Direct assets-at-risk value | **E2E** |
| `businessOwnershipValue` | Visible optional input | Asset exposure and total at-risk assets | **E2E** |
| `garnishmentRate` | Visible; default 25% | Disposable-income garnishment | **E2E** |
| `incomeGrowthRate` | Visible; default 3% | Grows projected wages | **E2E** |
| `disposableIncomeRatio` | Prefilled 65%; no form control | Converts gross wages to disposable proxy | **CALC** |
| `homeEquity` | Visible optional input | Total at-risk assets and umbrella target | **E2E** |
| `investmentAssets` | Visible optional/profile mirror | Fallback asset calculation and at-risk assets | **E2E**, but overridden for `nonQualifiedAssetsAtRisk` when `nonQualifiedAssets` is present |
| `savingsAssets` | Visible optional/profile prefill | Fallback asset calculation and at-risk assets | **E2E**, same override caveat |
| `autoLiabilityLimit` | Visible/profile prefill | Primary coverage | **E2E** |
| `umbrellaCoverage` | Visible/profile prefill | Umbrella/total coverage | **E2E** |

### `LiabilityOutputs`

| Output group | Fields | Current consumer/status |
|---|---|---|
| Exposure schedule | `exposureSchedule[]` and point fields `yearIndex`, `age`, `grossIncome`, `disposableIncome`, `garnishableIncome`, `cumulativeExposure` | Calculated and stored; current protection-stack chart does not use the schedule; **STORED** |
| Legacy/general asset metrics | `homeEquity`, `totalAtRiskAssets`, `primaryCoverage`, `totalCoverage`, `erodedAssets`, `wealthErosionPercentage` | **STORED** |
| Primary external gap | `exposureGap` | Presentation primary gap; **DISPLAY** |
| Household risk | `householdWageGarnishmentRisk`, `nonQualifiedAssetsAtRisk`, `totalHouseholdLiabilityRisk` | Metric cards/chart; **DISPLAY** |
| Household coverage | `householdAutoLiabilityCoverage`, `householdUmbrellaCoverage`, `householdTotalCoverage` | Protection-stack chart/coverage percentage; **DISPLAY** |
| Household gap | `householdLiabilityGap` | Metric card/chart; **DISPLAY** |
| Umbrella illustration | `illustrativeUmbrellaCoverageLevel`, `umbrellaCoverageShortfall` | Metric cards; **DISPLAY** |
| Effective assumptions | `assumptionGarnishmentRate` | Metric description; **DISPLAY** |
| Effective assumptions | `assumptionIncomeGrowthRate`, `assumptionDisposableIncomeRatio` | **STORED** |

`exposureGap` and `householdLiabilityGap` currently hold the same calculated coverage gap, so the module UI and cross-module dashboard are aligned despite using different property names.

## 5. Embedded Disability Calculators

### Premium vs Self-Insured

This is reachable from the Disability output tabs. It uses local React state and `calculateBreakEven`; its results are not saved to the scenario output.

| Inputs | Metric outputs | Wiring |
|---|---|---|
| Monthly premium, monthly DI benefit, disability duration, investment return, benefit COLA | Premium invested to retirement, months funded, years funded, benefits with insurance, insurance-wins-before year, break-even month, fund/benefit chart | **LOCAL**, reachable and calculated end to end inside Disability |

It is initially fed by `privateDiMonthlyPremium`, `privateDiBenefitMonthly`, `breakEvenRateOfReturn`, `breakEvenMonthsWithoutIncome`, the DI benefit period/current age, and the main COLA assumption. Slider edits remain local.

The underlying `BreakEvenOutputs` are: `monthlyPremium`, `monthlyBenefit`, `annualRateOfReturn`, `monthlyRateOfReturn`, `monthlyReturnFactor`, `monthsWithoutIncome`, `colaRate`, `benefitsReceived`, `breakEvenMonths`, `breakEvenYears`, `roundedBreakEvenMonths`, `totalPremiumsToBreakEven`, `investmentAtRoundedBreakEven`, and `schedule[]` (`month`, `monthlyPremium`, `monthlyReturnFactor`, `investmentBalance`, `cumulativeBenefits`).

### Job A vs Job B

This is reachable from the Disability output tabs. It is local-only and not saved.

| Inputs per job | Metric outputs | Wiring |
|---|---|---|
| Annual income, group LTD %, group LTD monthly cap, has-IDI toggle, IDI monthly premium, IDI monthly benefit | Job A income if disabled, Job B income if disabled, income replacement difference, annual income difference, stacked coverage/gap chart | **LOCAL**, reachable and calculated inside Disability |

Job A and Job B initialize from the main Disability inputs, then diverge into local state. They do not feed `calculateDisabilityGap` or any dashboard metric.

## 6. Implemented but Unwired Disability Calculators

The following components and calculation functions exist under `src/features/risk-modules/disability/calculators`, but no current route/page/output component imports their UI components. They do not participate in current end-to-end scenario calculations.

### SSDI Estimator - **UNWIRED**

Inputs: `careerAvgAnnualIncome`, `annualIncomeAtDisability`.

Outputs: `estimatedAime`, `estimatedPia`, `estimatedMonthlyBenefit`, `estimatedAnnualBenefit`, `monthlyIncomeAtDisability`, `replacementRateGross`, `monthlyGap`, `waitingPeriodIncomeLoss`, and `piaComponents.tier1/tier2/tier3`.

### Elimination Period / Savings Bridge - **UNWIRED**

Inputs: `monthlyTakeHomeIncome`, `monthlyExpenses`, `liquidSavings`, `eliminationPeriodDays`, `monthlyLtdBenefit`.

Outputs: `eliminationPeriodMonths`, `incomeLostDuringElimination`, `monthlyDeficit`, `totalSavingsNeeded`, `savingsCoverPeriod`, `savingsRunwayMonths`, `savingsShortfall`, `savingsRemaining`, `dailyBurnRate`, `ongoingMonthlyGap`, `postBridgeSavingsRunwayMonths`.

### LTD Benefit Taxation - **UNWIRED**

Inputs: `annualIncome`, `grossMonthlyBenefit`, `coveragePercent`, `employerPaidPremium`, `filingStatus` (`single`, `mfj`, `hoh`, or `mfs`), `stateTaxRate`.

Outputs: `annualGrossBenefit`, `federalTaxableBenefitAnnual`, `federalTaxOnBenefit`, `stateTaxOnBenefit`, `totalTaxOnBenefit`, `monthlyFederalTax`, `monthlyStateTax`, `netMonthlyBenefit`, `netAnnualBenefit`, `effectiveTaxRateOnBenefit`, `marginalFederalRate`, `preTaxAnnualIncome`, `preTaxMonthlyIncome`, `grossReplacementRate`, `netReplacementRate`.

`coveragePercent` is accepted but not read by `calculateBenefitTax`; its comment says it is display-only.

### Standalone Break-Even UI - **UNWIRED UI**

`BreakEvenCalculator.tsx` is not rendered anywhere. Its underlying `calculateBreakEven` function **is** wired through the reachable Premium vs Self-Insured module described above.

## 7. Tab-by-Tab Calculation and Visualization Workflows

This section traces every reachable module visualization from editable data through formula logic, display transformation, metric cards/charts, and persistence. “Impact” means a behavior can change, misstate, or leave stale something the advisor actually sees; it does not merely mean that a field exists in code.

### Runtime state and freshness workflow

:::flow Shared runtime pipeline
Client profile | Prefills scenario-module inputs when a scenario is created or the client profile is updated.
Module input edit | Life and Disability edits also synchronize annual income, current age, and projection end age into other included modules.
Formula execution | The mounted module page recalculates its own output with `useMemo`.
Scenario persistence | A page effect saves only that mounted module's primary output into Zustand/local storage.
Presentation | Presentation prefers a non-null saved output and only recalculates when the saved output is null.
Visible metrics | Output components transform the selected result into cards, charts, tooltips, narratives, and the printed presentation.
:::

**Visualization impact:** shared synchronization updates the other modules' inputs but does not invalidate their outputs. After a Life or Disability edit, unopened modules can retain results calculated from the old shared values. Presentation then selects those stale non-null outputs. This is a live correctness risk, not only a persistence detail.

| Trigger | Inputs changed | Output refreshed immediately | Outputs that can remain stale |
|---|---|---|---|
| Edit Life | Life plus shared Disability, Unemployment, Liability fields | Life | Disability, Unemployment, Liability |
| Edit Disability | Disability plus shared Life, Unemployment, Liability fields | Disability | Life, Unemployment, Liability |
| Edit Unemployment | Unemployment only | Unemployment | None from that edit |
| Edit Liability | Liability only | Liability | None from that edit |
| Update client profile | All included modules rebuilt | Outputs are explicitly cleared | None; each view recalculates when opened |

### Life tab: Safe Income Coverage

:::flow Safe Income Coverage calculation
Income basis | `annualNetIncomeNeed = max(0, annualIncome × incomeReplacementRatio − spouseAnnualIncome)`.
Annual projection | Grow the income basis by `incomeGrowthRateAnnual` for every age through the projection end age.
Target stream | `targetIncomeNeed[year] = projectedIncome[year] × targetIncomeSupportPct`.
Resource pool | `groupLifeCoverage + privateLifeCoverage + nonQualifiedAssets`.
Support rate | `min(1, resourcePool ÷ sum(targetIncomeNeed))`.
Annual coverage and gap | Covered = annual target × support rate. Gap = annual target − covered.
Visible output | Stacked green/red annual chart, eight metric cards, and planning narrative.
:::

| Visible metric/visual | Exact source or formula | What changes it |
|---|---|---|
| Projected Net Income | Sum of projected income before target percentage | Income, replacement ratio, spouse income, ages, income growth |
| Target Income Support | Target percentage plus sum of target stream | Target percentage and all projected-income inputs |
| Coverage Resources | Group life + private life + non-qualified assets | Coverage/resource inputs |
| Coverage Support Rate | Resources divided by target need, capped at 100% | Resources or target stream |
| Target Coverage Need | Sum of annual target income support | Projection and target percentage |
| Total Income Supported | Sum of annual target × support rate | Resources and target stream |
| Survivor Gap | Target support total − total supported | Resources and target stream |
| Additional Coverage Needed | Target coverage need − resources, floored at zero | Resources and target stream |
| Green chart bars | `safeIncomeCoverage` for each age | Same support-rate workflow |
| Red chart bars | `incomeGap` for each age | Same support-rate workflow |
| Planning narrative | Fully-covered flag, survivor gap, and displayed support percentage | Same outputs as cards |

**What impacts correctness:** this tab is internally consistent because the chart, cards, “Fully Covered” state, and narrative use the same target schedule. However, these outputs are not persisted. They are recomputed live in the Life page and Presentation.

### Life tab: Coverage Runway Scenario

:::flow Coverage Runway calculation
Income basis | Use the same projected net income stream as Safe Income, but do not apply the target-support percentage.
Starting capital | Group life + private life + non-qualified assets.
Annual return | At the start of each modeled year, multiply the remaining pool by `1 + maxCoverageRoi`.
Annual withdrawal | Withdraw up to the full projected income need for that year.
Annual gap | `max(0, projectedIncome − amountCovered)` after the pool is insufficient.
Capital gap | Discount the annual gap stream at `incomeGapRoi` to produce Runway Capital Gap.
Visible output | Green/red runway chart, five metric cards, and planning narrative.
:::

| Visible metric/visual | Exact source or formula | What changes it |
|---|---|---|
| Projected Net Income | Full projected income stream | Income, ratio, spouse income, ages, growth |
| Years of Full Coverage | Count of years where the pool funds the complete annual need | Starting pool and asset return |
| Total Income Replaced | Sum of annual withdrawals | Starting pool, return, projected need |
| Survivor Gap | Sum of annual uncovered income | Starting pool, return, projected need |
| Runway Capital Gap | Present value of annual gaps | Annual gaps and PV reference rate |
| Green chart bars | Amount withdrawn from resources | Pool balance and annual need |
| Red chart bars | Annual uncovered amount | Pool depletion and annual need |

**What impacts correctness:** the selected asset return materially changes how long resources last. This is intentionally a scenario view, not the canonical saved Life gap.

### Life hidden/persisted summary path

The Life page also runs `calculateLifeInsuranceGap`, saves it, and passes it to `LifeOutputView`; however, `LifeOutputView` does not read that `outputs` prop. Its cards and charts use only the two income-gap tab results.

:::flow Saved Life summary
Target income stream | Uses the same net income basis, growth, and target-support percentage as Safe Income.
Add obligations | Add debts, education goal, and final expenses to the income-support total.
Apply resources | Subtract group life, private life, non-qualified assets, and optional allocated liquid assets.
Saved primary gap | Persist `remainingGap = max(0, income target + obligations − resources)`.
Presentation summary | Printed “Modeled gap” reads the saved `remainingGap`.
Tab visualization | Safe Income displays income-only gap; Coverage Runway displays drawdown gap.
:::

**Visualization impact:** the saved/printed `remainingGap` and the visible Safe Income “Additional Coverage Needed” answer different questions. The difference is debts, education, final expenses, and any enabled liquid-asset offset. Both can be arithmetically correct while appearing contradictory unless they are labeled as separate metrics.

### Disability tab: Income Gap

:::flow Disability Income Gap calculation
Income projection | Grow annual gross income by `incomeGrowthRateAnnual`; net income is always modeled as 70% of gross.
Group LTD gross | `min(projectedIncome × ltdCoveragePercent, ltdMonthlyCap × 12)`.
Group LTD net | If taxable, multiply gross LTD by 70%; otherwise retain the full LTD benefit.
Individual DI | Monthly benefit × 12, grown by COLA and stopped after the selected benefit period.
Annual gap | `max(0, modeledNetIncome − netLTD − individualDI)`.
Aggregates | Sum lifetime income, LTD, IDI, total coverage, gap, and premium expense.
Visible output | Net/Gross chart, lifetime cards, selected-age monthly cards, COLA cards, and narrative.
:::

| Visible metric/visual | Exact source or formula | Visualization impact |
|---|---|---|
| Lifetime Group LTD | Sum of net or gross LTD according to Net/Gross toggle | Toggle changes displayed value only |
| Lifetime Individual DI | Sum of IDI schedule | Benefit, period, COLA |
| Total Income Replaced | LTD + IDI, net or gross view | Toggle and coverage inputs |
| Projected Income | Sum of modeled net or gross income | Toggle and projection assumptions |
| Income Gap #1 | Projected income − group LTD | Net/Gross local display derivation |
| Income Gap #2 | Projected income − group LTD − IDI | Net/Gross local display derivation |
| Gap Difference | Income Gap #1 − Income Gap #2 | Effectively displayed IDI contribution |
| IDI Expense | Monthly premium × projection months; 20% load when COLA is active | Premium, ages, COLA |
| Monthly Benefits rail | Selected-age income, LTD, IDI, combined benefit, and loss | Chart age selection and Net/Gross toggle |
| COLA comparison | COLA benefit gain and premium differences versus flat benefit | COLA toggle |
| Stacked chart | LTD + IDI + `Income Gap` by age | Output schedule plus view toggle |

**Visualization defect:** the `Income Gap` chart series always comes from `point.annualGap`, which is the **net** gap. Switching the chart to Gross changes the income/LTD series and tooltip calculation, but the red bar remains the net gap. Therefore the Gross bar stack, tooltip, and gross summary cards can disagree.

**Model limitation:** taxable LTD and modeled take-home income use a fixed 70% factor. The implemented filing-status/state-tax calculator is not wired into this tab.

### Disability tab: Premium vs Self-Insured

:::flow Premium vs Self-Insured calculation
Initial policy values | Pull premium, benefit, return, duration, ages, and benefit period from Disability inputs, then normalize to slider limits/defaults.
Benefit value | Benefit needed = monthly DI benefit × disability duration, with optional annual COLA and an 80-month lookup cap.
Self-insurance fund | Compound monthly premium contributions at annual return ÷ 12 for up to 1,200 months.
Break-even | Use NPER to find when invested premiums reach the modeled total benefit.
Retirement fund | Compute future value of premium contributions through the derived retirement/benefit-period age.
Coverage duration | Retirement fund ÷ monthly DI benefit; convert months to years.
Visible output | Interactive chart, three funding cards, three break-even cards, and slider-driven highlighting.
:::

| Visible metric/visual | Exact source or formula | What impacts it |
|---|---|---|
| Premium invested to retirement | Future value of monthly premiums | Premium, return, current/end age |
| Months of disability funded | Future value ÷ monthly DI benefit | Fund value and benefit |
| Years of disability funded | Months funded ÷ 12 | Same inputs |
| Benefits with insurance | Modeled benefit across selected duration | Benefit, duration, COLA |
| Insurance wins if disabled before | Break-even months ÷ 12 | Premium, benefit, return, duration, COLA |
| Break-even month | Ceiling of NPER result | Same inputs |
| Chart | Investment balance versus constant total benefit needed | Same local inputs |

**Visualization impacts:** zero/empty client policy values do not remain zero. The local state substitutes at least a $450 premium and $10,000 benefit through defaults/minimums, so the tab can show a hypothetical policy that was not entered. The main COLA toggle loads the premium by 20%, but the local Benefit COLA slider initializes at 0%, so premium and benefit assumptions can be out of alignment until the slider is adjusted. All slider results are local and unsaved.

### Disability tab: Job A vs Job B

:::flow Job comparison calculation
Local initialization | Seed both jobs from Disability salary/LTD inputs; Job A starts without IDI and Job B inherits current IDI values.
Per-job LTD | `min(jobSalary × groupPercent, monthlyCap × 12)`.
Per-job IDI | Monthly IDI benefit × 12 when the local Has IDI toggle is on.
Coverage stacks | Build Group LTD, IDI Benefit, and Income Gap chart segments.
Comparison cards | Show disabled income for both jobs, replacement difference, and annual income difference.
Persistence | Local state only; does not change the primary Disability calculation or saved scenario output.
:::

| Live defect | Current logic | Visible result affected |
|---|---|---|
| Job B uses Job A salary baseline | `totalBar_B = totalBar_A − annualPremium_B` instead of using Job B salary | Job B stack and Annual Income Difference |
| Job B premium is subtracted twice | Once in `totalBar_B`, again in IDI capacity | Job B IDI Benefit and Income Gap |
| Job A IDI omitted from headline card | Card uses Group LTD only even when Job A “Has IDI” is Yes | Job A income if disabled and replacement difference |
| “Annual income difference” is not salary difference | It derives from Job A bar minus premium-adjusted Job B bar | Mislabels premium cost as income difference |

These defects directly affect live visualization and metric correctness in this tab.

### Unemployment and Liquidity view

:::flow Unemployment calculation
Net household income | Convert primary and spouse annual incomes to monthly values using `netIncomeRatio`.
Loss scenario | Assume the highest earner is lost; retain the lower earner's modeled net monthly income.
Dynamic reserve target | Remaining-income coverage selects a 3, 4, 5, or 6 month ideal reserve target.
Search timeline | For each search month, apply remaining income, active severance, and active unemployment benefit.
Savings draw | Draw the uncovered monthly expense from emergency savings, then record shortfall after depletion.
Visible output | Reserve-position gauge, reserve cards, cash-flow cards, runway/shortfall cards, and disclosure.
:::

| Visible metric/visual | Exact source or formula | What impacts it |
|---|---|---|
| Monthly Cash Flow | Both modeled net incomes − monthly expenses | Both incomes, net ratio, expenses |
| Income Coverage | Remaining lower-earner net income ÷ expenses | Income concentration and expenses |
| Remaining Income | Lower earner's modeled net monthly income | Both incomes and net ratio |
| Reserve Runway | Emergency savings ÷ monthly expenses | Savings and expenses only |
| Reserve Gap / Excess | Difference from dynamic ideal target | Savings, expenses, remaining-income band |
| Ideal Target | Expenses × 3–6 target months | Expenses and income-coverage band |
| Search Runway | Count of modeled search months without a shortfall | Search duration, offsets, savings, expenses |
| Search Shortfall | Required search cash − savings | Search duration, offsets, savings, expenses |
| Reserve-position bar | Current runway relative to minimum/ideal targets | Reserve months and target band |

**Visualization semantics:** “Search Runway” is capped by the entered search horizon because it counts funded months inside that timeline; it is not an unconstrained estimate of when savings will eventually run out. The visible status-band function also uses different labels/thresholds from the stored `reserveStatus` field, although the stored field is not currently displayed.

### Liability / Lawsuit view

:::flow Liability calculation
Wage schedule | Grow both incomes through retirement, multiply by disposable-income ratio, then garnishment rate.
Assets at risk | Prefer `nonQualifiedAssets`; only fall back to investment + savings + business value when that field is null/undefined.
Total risk | Lifetime cumulative wage garnishment + non-qualified assets at risk.
Coverage | Auto liability limit + existing umbrella coverage.
Coverage gap | `max(0, total risk − total coverage)`.
Umbrella illustration | Round the largest of after-auto exposure, net worth at risk, 5× primary income, or $1M up to a $1M block.
Visible output | Two-column protection stack, covered percentage, six metric cards, and disclosure.
:::

| Visible metric/visual | Exact source or formula | What impacts it |
|---|---|---|
| Wage Garnishment Risk | Final cumulative wage schedule | Incomes, ages, end age, growth, disposable ratio, garnishment rate |
| Assets at Risk | `nonQualifiedAssetsAtRisk` | Usually the direct non-qualified-assets field |
| Total Exposure | UI fallback around total household risk | Wage risk and assets, with zero-risk defect below |
| Coverage Gap | Total household risk − auto − umbrella | Exposure and coverage |
| Umbrella Target | Rounded maximum methodology target | Exposure, home equity/net worth, primary income |
| Umbrella Needed | Target − current umbrella | Target and current umbrella |
| Current Auto Only chart | Auto coverage plus pre-umbrella gap | Total risk and auto coverage |
| With Umbrella chart | Auto + umbrella + remaining gap | Total risk and both coverages |

**Visualization defects and omissions:**

1. When `totalHouseholdLiabilityRisk` is zero, the view uses `householdTotalCoverage + householdLiabilityGap` as a fallback. Existing coverage can therefore be displayed as “Total Exposure,” and coverage can appear 100% even though modeled exposure is $0.
2. `nonQualifiedAssets` is normally initialized to a number, including zero. That prevents the fallback from adding investment assets, savings, and business ownership to `nonQualifiedAssetsAtRisk`. Home equity and business ownership can affect the umbrella target or unused `totalAtRiskAssets` while remaining absent from the visible “Assets at Risk” and “Total Exposure” metrics.

### Presentation module tabs and printed output

:::flow Presentation workflow
Load scenario | Read persisted module inputs and saved outputs from Zustand/local storage.
Choose result | Use a saved non-null primary output; calculate from inputs only when output is null.
Recalculate Life tab scenarios | Safe Income and Coverage Runway are always recomputed live from current Life inputs.
Render module tab | Reuse the same Life, Disability, Unemployment, or Liability output component.
Show modeled gap | Read saved `remainingGap`, `totalGap`, `totalUncoveredShortfall`, or `exposureGap` through `scenarioMetrics`.
Print | Render every included module plus its input snapshot and modeled-gap label.
:::

| Presentation area | Calculation source | Correctness impact |
|---|---|---|
| Life tab visuals | Recomputed income-gap scenarios | Current with Life inputs |
| Life “Modeled gap” | Saved main `remainingGap` | Different scope from visible Life tabs |
| Disability tab | Saved output when present | Can be stale after shared Life edits |
| Unemployment tab | Saved output when present | Can be stale after shared Life/Disability edits |
| Liability tab | Saved output when present | Can be stale after shared Life/Disability edits |
| Printed report | Same component/result selection as presentation | Carries the same scope and stale-output risks |

### Unreachable calculations and visible-output impact

| Implemented calculator | Reachable tab? | Impact on current visible metrics |
|---|---|---|
| SSDI estimator | No | SSDI is omitted from Disability coverage/gap outputs |
| Savings bridge | No | Elimination-period reserve depletion is omitted |
| LTD benefit taxation | No | Main Disability uses fixed 70% net modeling instead |
| Standalone Break-Even UI | No | No impact because Premium vs Self-Insured uses the same underlying break-even function |

## Wiring conclusions

1. All four primary modules calculate and save outputs, but shared Life/Disability input synchronization can leave other modules' saved outputs stale until those modules are opened.
2. Life's persisted total-capital gap and its two visible income-gap scenarios answer different questions; Presentation displays both without a single canonical label hierarchy.
3. Disability Income Gap is persisted, while Premium vs Self-Insured and Job A vs Job B are local. The Gross Income Gap chart and Job Comparison contain live visualization/calculation defects documented above.
4. Liability's zero-risk fallback and asset-source precedence can misstate visible Total Exposure or omit entered extended assets from Assets at Risk.
5. SSDI, Savings Bridge, LTD Benefit Taxation, and the standalone Break-Even UI are not reachable. Their modeled factors do not affect current outputs.
6. Several calculated output fields are stored without a visible consumer; stored does not mean displayed or validated end to end.
7. The versioned `formulaRegistry` is not the runtime calculation path, so its version metadata does not govern current page calculations.
