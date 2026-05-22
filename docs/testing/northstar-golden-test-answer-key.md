# Northstar Golden Test Client & Answer Key

This document defines the deterministic golden client and the complete expected output set used to validate the `gap-tool` calculation workflow.

The machine-checkable source of truth lives in:

- `src/golden/northstarGoldenTestClient.ts`
- `src/golden/northstarGoldenAnswerKey.ts`
- `src/golden/northstarGoldenCheck.ts`

Run the golden calculation check with:

```bash
npm run test:golden
```

Run full end-to-end validation (calculation truth + page/tab wiring coverage) with:

```bash
npm run test:validation
```

## Purpose

This is not an investment prediction, underwriting model, tax opinion, or legal opinion. It is a production QA artifact for validating that the current advisor-facing gap-analysis calculators compute exactly what the code and Northstar assumptions require.

## Golden client setup form

| Field | Value |
|---|---:|
| Client Type | Couple |
| Primary Client | Jordan Walker |
| Display Name | Jordan & Taylor Walker |
| Current Age | 40 |
| Annual Income | $150,000 |
| Monthly Household Expenses | $8,000 |
| Spouse / Partner | Taylor Walker |
| Spouse Age | 38 |
| Spouse Annual Income | $50,000 |
| Group Life Coverage | $300,000 |
| Private Life Coverage | $500,000 |
| Private Life Policy Type | Term |
| Private Life Term Years | 20 |
| Non-Qualified Assets | $500,000 |
| Group LTD Coverage Percent | 60% |
| Group LTD Monthly Cap | $8,000 |
| Group LTD Taxable | Yes |
| Individual DI Monthly Benefit | $4,000 |
| Individual DI Monthly Premium | $250 |
| Individual DI Benefit Period | A65 |
| Disability Break-Even Rate of Return | 6% |
| Disability Months Without Income | 12 |
| Auto Liability Limit | $250,000 |

## Module-level test inputs not currently captured by the setup form

These are still required for a complete end-to-end module workflow and are therefore part of the golden fixture.

| Module | Field | Value |
|---|---|---:|
| Life | Debts Total | $100,000 |
| Life | Education Goal | $80,000 |
| Life | Final Expenses | $25,000 |
| Life | Liquid Assets Allocated | $30,000 |
| Life | Asset Base | $500,000 |
| Life | Safe Withdrawal Rate | 4% |
| Life | Max Withdrawal Rate | 6% |
| Life | Income Gap ROI | 5% |
| Liability | Home Value | $650,000 |
| Liability | Mortgage Balance | $350,000 |
| Liability | Investment Assets | $500,000 |
| Liability | Savings Assets | $30,000 |
| Liability | Home Liability Limit | $500,000 |
| Liability | Umbrella Coverage | $1,000,000 |
| Liability | Estimated Lawsuit Exposure | $1,500,000 |

## Life Insurance — Core Answer Key

| Output | Expected |
|---|---:|
| Replacement Years | 25 |
| Annual Replacement Need | $100,000 |
| Future Income Lost | $2,500,000 |
| Base Protection Need | $2,705,000 |
| Existing Coverage Total | $800,000 |
| Liquid Asset Offset | $0 |
| Available Resources | $800,000 |
| Remaining Gap / Cumulative Survivor Gap | $4,134,320 |
| Coverage Offset Percentage | 29.57% |
| Projected Income to Retirement | $5,468,890 |
| Group Life Coverage Years | 25 |
| Group Life Benefit | $300,000 |
| Group Life Annual Income | $21,286 |
| Private Life Annual Income | $40,121 |
| Private Life Benefit | $500,000 |
| Private Life Coverage Years | 20 |
| Total Death Benefit | $800,000 |
| Lifetime Income Uncovered Percentage | 75.60% |

## Life Insurance — Income Gap Safe W/D Rate

| Box | Expected |
|---|---:|
| Projected Net Income to Age 65 | $3,645,926 |
| Safe W/D Rate to Age 65 | $20,000 / yr |
| Total Income Replaced | $500,000 |
| Survivor Gap | $3,145,926 |
| Death Benefit Needed | $1,773,541 |

## Life Insurance — Income Gap Max W/D Rate

| Box | Expected |
|---|---:|
| Projected Net Income to Age 65 | $3,645,926 |
| Years of Max Withdrawal Rate | 5 Years |
| Coverage Range | Ages 40–44 |
| Total Income Replaced | $530,914 |
| Survivor Gap | $3,115,012 |
| Death Benefit Needed | $1,756,113 |

## Disability — Core Answer Key

| Output | Expected |
|---|---:|
| LTD Computed Monthly Benefit | $7,500 |
| LTD Net Monthly Benefit | $5,250 |
| Private DI Monthly Benefit | $4,000 |
| Total Net Monthly Benefit | $9,250 |
| Income Loss Net | -$500 / mo |
| Projected Income at Retirement | $219,847 |
| Total Projected Income | $4,048,072 |
| Total Group LTD Coverage | $1,740,327 |
| Total Individual DI Coverage | $1,248,000 |
| Total Coverage | $2,988,327 |
| Total Gap | $1,074,391 |
| Average Coverage Rate | 73.82% |
| Lifetime IDI Expense | $75,000 |

## Disability — Display-Derived Answer Key

| Net View Output | Expected |
|---|---:|
| Projected Income Display | $4,048,072 |
| Group LTD Display | $1,740,327 |
| Total Income Replaced Display | $2,988,327 |
| Income Gap #1 | $2,307,745 |
| Income Gap #2 | $1,059,745 |
| Gap Difference | $1,248,000 |

| Gross View Output | Expected |
|---|---:|
| Projected Income Display | $5,782,956 |
| Group LTD Display | $2,486,181 |
| Total Income Replaced Display | $3,734,181 |
| Income Gap #1 | $3,296,775 |
| Income Gap #2 | $2,048,775 |
| Gap Difference | $1,248,000 |

## Disability — Premium vs Self-Insured

| Output | Expected |
|---|---:|
| Benefits with Insurance | $48,000 |
| Break-Even Months | 134.9250871903506 |
| Break-Even Years | 11.24375726586255 |
| Rounded Break-Even Month | 135 |
| Total Premiums to Break-Even | $33,731.27179758765 |
| Investment at Rounded Break-Even | $48,276.80576781033 |
| Premium Invested to Age 65 | $173,248.49060810817 |
| Months of Disability Funded | 43.31212265202704 |
| Years of Disability Funded | 3.6093435543355867 |

## Disability — Job Comparison

| Output | Expected |
|---|---:|
| Job A Group LTD Annual | $90,000 |
| Job A IDI Annual | $0 |
| Job A Income Gap | $60,000 |
| Job B Group LTD Annual | $90,000 |
| Job B IDI Annual | $48,000 |
| Job B Annual Premium | $3,000 |
| Job B Income Gap | $9,000 |
| Income Difference | $3,000 |
| Gap Difference | $51,000 |

## Supplemental Disability Calculators

| Benefit Tax Output | Expected |
|---|---:|
| Annual Gross Benefit | $90,000 |
| Federal Taxable Benefit | $90,000 |
| Federal Tax on Benefit | $6,723 |
| State Tax on Benefit | $4,455 |
| Total Tax on Benefit | $11,178 |
| Net Monthly Benefit | $6,568.50 |
| Net Annual Benefit | $78,822 |
| Effective Tax Rate on Benefit | 12.42% |
| Marginal Federal Rate | 12% |
| Pre-Disability After-Tax Annual Income | $126,347 |
| Gross Replacement Rate | 60% |
| Net Replacement Rate | 62.38533562332307% |

| SSDI Output | Expected |
|---|---:|
| Estimated AIME | $12,500 |
| Estimated PIA | $3,842.60 |
| Estimated Monthly Benefit | $3,822 |
| Estimated Annual Benefit | $45,864 |
| Gross Replacement Rate | 30.576% |
| Monthly Gap | $8,678 |
| Waiting Period Income Loss | $62,500 |

| Savings Bridge Output | Expected |
|---|---:|
| Elimination Period Months | 2.9568788501026693 |
| Income Lost During Elimination | $25,872.689938398355 |
| Monthly Deficit | $8,000 |
| Total Savings Needed | $23,655.030800821354 |
| Savings Covers Period | true |
| Savings Runway Months | 3.75 |
| Savings Shortfall | $0 |
| Savings Remaining | $6,344.969199178646 |
| Daily Burn Rate | $262.8336755646817 |
| Ongoing Monthly Gap | $0 |
| Post-Bridge Savings Runway Months | Infinity |

## Unemployment Answer Key

| Output | Expected |
|---|---:|
| Monthly Burn Rate | $8,000 |
| Monthly Available Income Base | $4,166.666666666667 |
| Monthly Income | $12,500 |
| Severance Total | $12,500 |
| Reserve Depletion Month | 15 |
| Total Uncovered Shortfall | $0 |
| Current Reserve Level | $30,000 |
| Minimum Reserve Target | $37,500 |
| Optimal Reserve Target | $75,000 |
| Annual Income at Risk | $150,000 |
| Reserve Months Current | 2.4 |

## Liability Answer Key

| Output | Expected |
|---|---:|
| Home Equity | $300,000 |
| Total At-Risk Assets | $830,000 |
| Primary Coverage | $500,000 |
| Total Coverage | $1,500,000 |
| Exposure Gap | $876,092.8310553343 |
| Eroded Assets | $830,000 |
| Wealth Erosion Percentage | 100% |
| Household Wage Garnishment Risk | $1,876,092.8310553343 |
| Non-Qualified Assets at Risk | $500,000 |
| Total Household Liability Risk | $2,376,092.8310553343 |
| Household Auto Liability Coverage | $250,000 |
| Household Liability Gap | $2,126,092.8310553343 |

## Scenario Summary Answer Key

| Module | Scenario Gap Value |
|---|---:|
| Life | $4,134,320 |
| Disability | $1,074,391 |
| Unemployment | $0 |
| Liability | $876,092.8310553343 |
| Largest Scenario Gap | $4,134,320 |

## Complete output coverage

The tables above summarize the visible and highest-value testing metrics. The complete machine-readable answer key also includes:

- Life yearly breakdown checkpoints by age.
- Life Income Gap yearly data checkpoints by age.
- Disability income projection checkpoints by age.
- Unemployment month-by-month timeline for the 9-month job search.
- Break-even schedule checkpoints for months 1, 12, 135, 240, and 300.

For exact scalar targets and checkpoint arrays, use `src/golden/northstarGoldenAnswerKey.ts`.

## Route + page + tab coverage checks

`npm run test:golden:surface` runs `src/golden/northstarSurfaceCoverageCheck.ts`, which verifies calculation coverage across the app surface by asserting:

- Route coverage in `src/App.tsx` for dashboard, client overview, scenario routes, each risk-module route, presentation, settings, and fallback.
- Module tab coverage in `src/pages/ScenarioDetail.tsx`, `src/pages/RiskModulePage.tsx`, and `src/pages/Presentation.tsx`.
- Page-to-calculator bindings in all module pages:
	- `LifeModulePage` → `calculateLifeInsuranceGap`, `calculateIncomeGapScenarios`
	- `DisabilityModulePage` → `calculateDisabilityGap`
	- `UnemploymentModulePage` → `calculateUnemploymentGap`
	- `LiabilityModulePage` → `calculateLiabilityGap`
- Tab-level output coverage:
	- `LifeOutputView` safe/max withdrawal tabs
	- `DisabilityOutputView` income-gap, premium-vs-self-insured, and job-comparison tabs
- Formula version registry presence in `src/features/risk-modules/core/registry.ts`.
- Scenario summary gap mapping across life/disability/unemployment/liability in `src/lib/scenarioMetrics.ts`.

This complements the scalar golden answer-key assertions by proving every modeled module tab/page route remains connected to the expected formulas.
