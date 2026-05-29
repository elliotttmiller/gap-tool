# NorthStar Offensive Advisor Tool — Tier 1 Blueprint
### Wealth Accumulation Gap + Fee Drag Analyzer
**Version 1.0 — Full Design Specification**
*Generated May 2026*

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Strategic Context](#strategic-context)
3. [Tool Architecture Overview](#tool-architecture-overview)
4. [Module 1 — Wealth Accumulation Gap](#module-1--wealth-accumulation-gap)
   - [1.0 Purpose & Advisor Use Case](#10-purpose--advisor-use-case)
   - [1.1 Input Schema (Data Model)](#11-input-schema--data-model)
   - [1.2 Derived Constants & Intermediate Values](#12-derived-constants--intermediate-values)
   - [1.3 Formula Catalog](#13-formula-catalog)
   - [1.4 Metric Card Specifications](#14-metric-card-specifications)
   - [1.5 Chart & Visualization Specifications](#15-chart--visualization-specifications)
   - [1.6 Assumptions Panel](#16-assumptions-panel)
   - [1.7 Output Action Items](#17-output-action-items)
   - [1.8 Edge Cases & Validation Rules](#18-edge-cases--validation-rules)
5. [Module 2 — Fee Drag Analyzer](#module-2--fee-drag-analyzer)
   - [2.0 Purpose & Advisor Use Case](#20-purpose--advisor-use-case)
   - [2.1 Input Schema (Data Model)](#21-input-schema--data-model)
   - [2.2 Derived Constants & Intermediate Values](#22-derived-constants--intermediate-values)
   - [2.3 Formula Catalog](#23-formula-catalog)
   - [2.4 Metric Card Specifications](#24-metric-card-specifications)
   - [2.5 Chart & Visualization Specifications](#25-chart--visualization-specifications)
   - [2.6 Assumptions Panel](#26-assumptions-panel)
   - [2.7 Output Action Items](#27-output-action-items)
   - [2.8 Edge Cases & Validation Rules](#28-edge-cases--validation-rules)
6. [Cross-Module Integration](#cross-module-integration)
7. [Shared Design Principles](#shared-design-principles)
8. [Glossary](#glossary)

---

## Executive Summary

This document is the complete, authoritative design specification for the two Tier 1 modules of the NorthStar Offensive Advisor Tool. It covers every input field, every formula, every metric card, every visualization, and all action-oriented outputs for both modules.

**Module 1 — Wealth Accumulation Gap** answers: *"Are you on track to retire with enough, and if not, exactly what does it take to close the gap?"*

**Module 2 — Fee Drag Analyzer** answers: *"How much wealth is being silently destroyed by the cost structure of your current investments — and what is that costing you in retirement income?"*

Together, these two modules form the offensive core of the advisor tool: Module 1 defines the destination (wealth needed at retirement), and Module 2 quantifies a recoverable drag that is directly within the advisor's control to fix.

---

## Strategic Context

### The Defensive / Offensive Duality

| Dimension | GAP Tool (Defensive) | Offensive Tool |
|---|---|---|
| Core narrative | "Here is what you stand to *lose*" | "Here is what you stand to *gain*" |
| Time orientation | Today's protection gaps | Future wealth trajectory |
| Client emotion | Fear, urgency | Optimism, possibility |
| Advisor action | Product placement (insurance) | Strategy optimization |
| Headline metric | Coverage shortfall | Wealth gap / fee drag cost |
| Mathematical core | Exposure minus coverage | Projected trajectory vs. needed trajectory |

### Why These Two Modules First

The Wealth Accumulation Gap is the single most universally applicable advisor conversation — every client with a paycheck and a retirement date can engage with it. The Fee Drag Analyzer is the highest-impact, lowest-complexity supporting module: it requires only three inputs to produce a compelling number, and it directly amplifies the Wealth Accumulation Gap by showing that the same gap can be partially closed without the client saving a single additional dollar — simply by restructuring existing costs.

---

## Tool Architecture Overview

```
INPUTS                        CALCULATIONS                   OUTPUTS
─────────────────────         ──────────────────────         ──────────────────────────────
Client profile                Module 1:                      Metric cards (status-coded)
  • Age / retirement age    → Wealth trajectory         →   Charts (growth, gap, income)
  • Current income             Gap quantification            Action items (specific & $ amounts)
  • Savings / portfolio        Income need analysis          Assumptions panel (auditable)
  • Contributions
  • SS / pension estimates   Module 2:                       
                            → Cost analysis            →    Fee drag dollar cost
Investment assumptions         Return delta                  Retirement income impact
  • Expected return            Cumulative drag chart         Annual savings metrics
  • Inflation rate             Portfolio comparison
  • Expense ratios
  • Trading costs            Cross-module:
                            → Optimized return feeds   →    Combined gap closure potential
                               back into Module 1
```

**Architectural principles shared with the GAP tool:**

- Metric card layout as the primary output surface
- Status-coded cards (green / yellow / red) based on defined thresholds
- A single "headline gap" number per module that drives the conversation
- Assumption transparency through an auditable assumptions panel
- Chart visualizations that support — not replace — the metric cards

---

## Module 1 — Wealth Accumulation Gap

### 1.0 Purpose & Advisor Use Case

**What it computes:** The module projects the client's retirement portfolio value under their current savings trajectory, compares it against the lump-sum wealth needed to fund their desired retirement income for life, and surfaces the gap (or surplus) in dollar terms along with specific levers to close it.

**Primary advisor use case:** Retirement readiness assessment. Used at onboarding to establish a baseline, and at annual reviews to track progress. The output drives conversations about savings rate, contribution increases, income targeting, and portfolio optimization.

**Secondary use case:** Quantifying the "cost of delay" — the module can be re-run with a 1-year delay in starting contributions to show the compound cost of inaction, a powerful behavioral coaching tool.

**Industry framework basis:** The module implements the standard Capital Needs Analysis framework used by MoneyGuide Pro, eMoney, and RightCapital, anchored to the Safe Withdrawal Rate (SWR) methodology from William Bengen's original 4% rule research (updated for current conditions), combined with a Future Value of Annuity model for accumulation-phase projection.

---

### 1.1 Input Schema — Data Model

All inputs are organized into four logical groups that map directly to UI sections.

---

#### Group A — Client Profile

| Field | Variable Name | Type | Default | Range / Validation | Description |
|---|---|---|---|---|---|
| Current Age | `currentAge` | Integer | — | 18–79; required | Client's current age in years |
| Retirement Age | `retirementAge` | Integer | 65 | `currentAge + 1` to 85 | Target retirement age |
| Current Annual Income | `currentAnnualIncome` | Currency | — | > 0; required | Gross annual earned income |
| Income Replacement Ratio | `incomeReplacementRatio` | Percent | 80% | 50%–100% | Target income in retirement as % of pre-retirement income |
| Target Annual Retirement Income | `targetRetirementIncome` | Currency | *Derived* | > 0; optional override | If entered directly, overrides the replacement ratio calculation |

> **Note:** `targetRetirementIncome` and `incomeReplacementRatio` follow the same override pattern used in the Life Insurance module — advisor may enter the target directly or derive it from the ratio.

---

#### Group B — Current Financial Position

| Field | Variable Name | Type | Default | Range / Validation | Description |
|---|---|---|---|---|---|
| Current Portfolio Value | `currentPortfolioValue` | Currency | 0 | ≥ 0 | Combined value of all investable assets (qualified + non-qualified) |
| Monthly Contribution | `monthlyContribution` | Currency | 0 | ≥ 0 | Total monthly savings across all accounts (401k employee + employer + IRA + brokerage) |
| Social Security Monthly Estimate | `socialSecurityMonthly` | Currency | 0 | ≥ 0 | Estimated monthly SS benefit at retirement age (from SSA statement or SSDI Estimator) |
| Pension Monthly Income | `pensionMonthly` | Currency | 0 | ≥ 0 | Defined benefit pension income at retirement |
| Other Guaranteed Monthly Income | `otherGuaranteedMonthly` | Currency | 0 | ≥ 0 | Annuity income, rental income, or other recurring non-portfolio retirement income |

---

#### Group C — Growth Assumptions

| Field | Variable Name | Type | Default | Range / Validation | Description |
|---|---|---|---|---|---|
| Expected Annual Return | `expectedAnnualReturn` | Percent | 7.0% | 0%–15% | Nominal pre-fee portfolio growth rate |
| Inflation Rate | `inflationRate` | Percent | 3.0% | 0%–10% | Annual inflation assumption for purchasing-power adjustment |
| Include Inflation Adjustment | `useInflationAdjustment` | Boolean | true | — | When true, targets and needs are expressed in future (nominal) dollars; when false, all figures are in today's dollars |
| Planning Horizon in Retirement | `retirementDurationYears` | Integer | 30 | 10–50 | How many years of retirement to fund (used in SWR wealth target calculation) |

---

#### Group D — Retirement Income Model

| Field | Variable Name | Type | Default | Range / Validation | Description |
|---|---|---|---|---|---|
| Safe Withdrawal Rate | `safeWithdrawalRate` | Percent | 4.0% | 2%–8% | Annual portfolio withdrawal rate assumed sustainable for the retirement duration |
| Use Custom Wealth Target | `useCustomWealthTarget` | Boolean | false | — | When enabled, advisor can override the formula-derived wealth target with a manually entered figure |
| Custom Wealth Target | `customWealthTarget` | Currency | *Derived* | > 0; conditional | Active only when `useCustomWealthTarget = true` |

---

### 1.2 Derived Constants & Intermediate Values

These values are computed before any metric cards are calculated. They appear in the assumptions panel and are referenced throughout the formula catalog.

```
yearsToRetirement       = retirementAge − currentAge

monthsToRetirement      = yearsToRetirement × 12

monthlyRate             = expectedAnnualReturn ÷ 12

realRate                = ((1 + expectedAnnualReturn) ÷ (1 + inflationRate)) − 1
  [used only when useInflationAdjustment = true]

annualGuaranteedIncome  = (socialSecurityMonthly + pensionMonthly + otherGuaranteedMonthly) × 12
```

---

### 1.3 Formula Catalog

Each formula entry includes the variable name, the expression, a plain-language description, the metric card or visualization it powers, and any conditional logic.

---

#### F1.01 — Base Target Annual Retirement Income

```
baseTargetIncome = currentAnnualIncome × incomeReplacementRatio

  When targetRetirementIncome is entered directly by advisor:
baseTargetIncome = targetRetirementIncome
```

- **Powers:** Target Retirement Income (metric card)
- **Description:** The gross annual income the client aims to sustain in retirement, expressed in today's dollars. Either derived from the replacement ratio or entered directly by the advisor as an override.
- **Module:** Wealth Accumulation Gap

---

#### F1.02 — Inflation-Adjusted Target Income at Retirement

```
inflationAdjustedTarget = baseTargetIncome × (1 + inflationRate)^yearsToRetirement

  When useInflationAdjustment = false:
inflationAdjustedTarget = baseTargetIncome
```

- **Powers:** Inflation-Adjusted Income Target (metric card, assumptions panel)
- **Description:** Converts the target income from today's dollars into the nominal (future) dollar amount needed at retirement, accounting for cumulative inflation over the planning horizon. A client wanting $100,000/year in today's dollars at 3% inflation over 30 years actually needs ~$243,000/year in nominal terms.
- **Module:** Wealth Accumulation Gap

---

#### F1.03 — Net Annual Income Need from Portfolio

```
netIncomeNeed = max(0, inflationAdjustedTarget − annualGuaranteedIncome)
```

- **Powers:** Net Portfolio Income Need (metric card)
- **Description:** The portion of retirement income that the portfolio must provide after all guaranteed income sources (Social Security, pension, annuity) are offset. This is the foundation of the wealth target calculation. If guaranteed income exceeds the target, this value is zero — meaning the client may already be fully funded through guaranteed sources alone.
- **Module:** Wealth Accumulation Gap

---

#### F1.04 — Wealth Needed at Retirement (SWR Method)

```
wealthNeeded = netIncomeNeed ÷ safeWithdrawalRate

  When useCustomWealthTarget = true:
wealthNeeded = customWealthTarget
```

- **Powers:** Wealth Needed at Retirement (headline benchmark metric card)
- **Description:** The lump-sum portfolio value needed on the first day of retirement to sustainably fund the net income need for the entire planning horizon. Uses the Safe Withdrawal Rate as the conversion factor — dividing the annual need by the SWR is algebraically equivalent to finding the present value of a perpetuity at that rate. At the default 4% SWR, the client needs 25× their annual net income need. This is the industry-standard "number" that all retirement planning conversations center on.
- **Note:** The SWR method is a deliberate simplification for client communication. The Monte Carlo module (Tier 2) provides a probability-weighted alternative for clients requiring more precision.
- **Module:** Wealth Accumulation Gap

---

#### F1.05 — Future Value of Current Portfolio

```
portfolioFV = currentPortfolioValue × (1 + expectedAnnualReturn)^yearsToRetirement
```

- **Powers:** Portfolio Growth component of Projected Wealth (metric card, stacked area chart)
- **Description:** Compounds the client's existing portfolio at the expected annual return over the accumulation horizon. This represents the "what you already have working for you" component of projected wealth.
- **Module:** Wealth Accumulation Gap

---

#### F1.06 — Future Value of Ongoing Contributions (Ordinary Annuity)

```
contributionsFV = monthlyContribution × ((1 + monthlyRate)^monthsToRetirement − 1)
                  ─────────────────────────────────────────────────────────────────
                                        monthlyRate

  When monthlyRate = 0:
contributionsFV = monthlyContribution × monthsToRetirement
```

- **Powers:** Contributions Growth component of Projected Wealth (metric card, stacked area chart)
- **Description:** The future value of all monthly contributions assuming end-of-period deposits compounding at the monthly equivalent of the annual return rate. This is the standard ordinary annuity (FV of annuity) formula — equivalent to Excel `FV(rate/12, years×12, -payment, 0, 0)`. Represents the "what you're adding going forward" component.
- **Module:** Wealth Accumulation Gap

---

#### F1.07 — Projected Wealth at Retirement

```
projectedWealthAtRetirement = portfolioFV + contributionsFV
```

- **Powers:** Projected Wealth at Retirement (primary headline metric card)
- **Description:** The total estimated portfolio value at retirement if the client continues their current savings trajectory at the assumed return. Combines the compounded current portfolio and the accumulated value of all future contributions.
- **Module:** Wealth Accumulation Gap

---

#### F1.08 — Wealth Accumulation Gap

```
wealthAccumulationGap = max(0, wealthNeeded − projectedWealthAtRetirement)
```

- **Powers:** Wealth Accumulation Gap (headline gap metric card — red)
- **Description:** The dollar shortfall between what the client will have and what they need at retirement. A positive value means they are under-funded on their current trajectory. Zero means fully on track or ahead of target. This is the module's primary output and the driver of all advisor action items.
- **Module:** Wealth Accumulation Gap

---

#### F1.09 — Wealth Surplus

```
wealthSurplus = max(0, projectedWealthAtRetirement − wealthNeeded)
```

- **Powers:** Wealth Surplus (headline metric card — green; shown only when gap = 0)
- **Description:** When the projected wealth exceeds the target, this surface the dollar amount of the surplus. Useful for conversations about legacy planning, charitable giving, or earlier retirement.
- **Module:** Wealth Accumulation Gap

---

#### F1.10 — Funding Ratio

```
fundingRatio = projectedWealthAtRetirement ÷ wealthNeeded
```

- **Powers:** Funding Ratio / On-Track Percentage (gauge metric card)
- **Description:** The fraction of the needed wealth that the client is currently on track to accumulate. A ratio of 1.0 (100%) means fully funded. Below 1.0 means a gap; above 1.0 means a surplus. Displayed as a percentage. This is the single-number "health score" for retirement readiness.
- **Status thresholds:**
  - ≥ 1.00 → Green ("On Track")
  - 0.80–0.99 → Yellow ("Close — Adjust Needed")
  - 0.60–0.79 → Orange ("Behind — Action Required")
  - < 0.60 → Red ("Significantly Underfunded")
- **Module:** Wealth Accumulation Gap

---

#### F1.11 — Sustainable Annual Retirement Income (from Projected Wealth)

```
sustainableAnnualIncome = (projectedWealthAtRetirement × safeWithdrawalRate)
                        + annualGuaranteedIncome
```

- **Powers:** Projected Sustainable Annual Retirement Income (metric card)
- **Description:** The total annual income in retirement the client could sustain under their current trajectory — combining what their projected portfolio can safely generate with all guaranteed income sources. Compared directly against the target for the income gap visualization.
- **Module:** Wealth Accumulation Gap

---

#### F1.12 — Retirement Income Gap

```
retirementIncomeGap = max(0, inflationAdjustedTarget − sustainableAnnualIncome)
```

- **Powers:** Annual Retirement Income Shortfall (metric card)
- **Description:** The annual income the client would go without in retirement if no changes are made. Bridges the portfolio gap to an income story — more concrete for clients to understand than a lump-sum shortfall.
- **Module:** Wealth Accumulation Gap

---

#### F1.13 — Additional Monthly Contribution to Close Gap (PMT to FV)

```
// Solve for additional monthly PMT needed to accumulate wealthAccumulationGap
// in yearsToRetirement years at monthlyRate:

additionalMonthlyNeeded = wealthAccumulationGap × monthlyRate
                          ──────────────────────────────────────────────────────
                          (1 + monthlyRate)^monthsToRetirement − 1

  When monthlyRate = 0:
additionalMonthlyNeeded = wealthAccumulationGap ÷ monthsToRetirement
```

- **Powers:** Additional Monthly Savings Required (action metric card)
- **Description:** The incremental monthly savings amount that, invested at the assumed return from today to retirement, would exactly close the wealth accumulation gap. This is the algebraic inverse of the FV of annuity formula — solving for PMT given a target FV, rate, and periods. Equivalent to Excel `PMT(rate/12, years×12, 0, -gap, 0)`. This is the primary advisor action metric: a specific, actionable dollar figure.
- **Module:** Wealth Accumulation Gap

---

#### F1.14 — Total Monthly Contribution Required

```
totalMonthlyRequired = monthlyContribution + additionalMonthlyNeeded
```

- **Powers:** Total Monthly Savings Needed (metric card)
- **Description:** The complete monthly savings amount needed to reach the wealth target — current contributions plus the additional amount required.
- **Module:** Wealth Accumulation Gap

---

#### F1.15 — Current Savings Rate

```
currentSavingsRate = (monthlyContribution × 12) ÷ currentAnnualIncome
```

- **Powers:** Current Savings Rate (metric card)
- **Description:** The client's annual savings as a percentage of gross income. Industry benchmark: 15% is commonly cited as the minimum for adequate retirement preparation, including employer match. Displayed alongside the required savings rate for comparison.
- **Module:** Wealth Accumulation Gap

---

#### F1.16 — Required Savings Rate to Close Gap

```
requiredSavingsRate = (totalMonthlyRequired × 12) ÷ currentAnnualIncome
```

- **Powers:** Required Savings Rate (action metric card)
- **Description:** The percentage of gross annual income the client needs to save each month to close the wealth gap. Contextualized against their current savings rate to communicate the magnitude of change required.
- **Module:** Wealth Accumulation Gap

---

#### F1.17 — Cost of 1-Year Delay (Opportunity Cost of Inaction)

```
// Additional monthly needed if client waits 1 year before making changes:
delayedAdditionalMonthly = wealthAccumulationGap × (monthlyRate)
                           ────────────────────────────────────────────────────────────
                           (1 + monthlyRate)^(monthsToRetirement − 12) − 1

costOfDelay = delayedAdditionalMonthly − additionalMonthlyNeeded
```

- **Powers:** Cost of 1-Year Delay (action metric card)
- **Description:** The incremental increase in required monthly savings if the client delays taking action by one year. This is a powerful behavioral coaching metric — it quantifies the cost of procrastination in concrete monthly dollar terms. The longer the delay, the larger this number grows nonlinearly due to compounding.
- **Module:** Wealth Accumulation Gap

---

#### F1.18 — Year-by-Year Portfolio Projection (Chart Data)

```
// For each year y from 0 to yearsToRetirement:

monthlyRateY = expectedAnnualReturn ÷ 12
monthsY      = y × 12

portfolioBalance[y] = currentPortfolioValue × (1 + expectedAnnualReturn)^y
                    + monthlyContribution × ((1 + monthlyRateY)^monthsY − 1) ÷ monthlyRateY

  When monthlyRateY = 0:
portfolioBalance[y] = currentPortfolioValue + (monthlyContribution × monthsY)
```

- **Powers:** Wealth Accumulation Timeline chart (projected balance line)
- **Description:** The year-by-year portfolio value from today through retirement, used to draw the growth curve in the accumulation timeline chart. Runs from y=0 (current balance) to y=yearsToRetirement (projected wealth at retirement).
- **Module:** Wealth Accumulation Gap

---

#### F1.19 — Wealth Target Flat Line (Chart Reference)

```
wealthTargetLine[y] = wealthNeeded   (constant for all y from 0 to yearsToRetirement)
```

- **Powers:** Wealth Accumulation Timeline chart (target reference line)
- **Description:** A horizontal reference line drawn across the chart at the wealth needed value. When the portfolio projection line crosses above this line before retirement, the client is on track. When it doesn't reach the line by retirement, the vertical gap between the two at the far right of the chart is the wealth accumulation gap.
- **Module:** Wealth Accumulation Gap

---

#### F1.20 — Retirement Income Waterfall Components (Chart Data)

```
guaranteedIncomeBar  = annualGuaranteedIncome
portfolioIncomeBar   = projectedWealthAtRetirement × safeWithdrawalRate
incomeGapBar         = max(0, inflationAdjustedTarget − guaranteedIncomeBar − portfolioIncomeBar)
```

- **Powers:** Retirement Income Waterfall chart (three-segment stacked bar)
- **Description:** Decomposes the target retirement income into three segments for visualization: (1) income already secured through guaranteed sources, (2) income the projected portfolio can generate, and (3) the residual gap. When displayed as a stacked bar against the target, the gap segment immediately communicates the shortfall without requiring the client to process a large abstract number.
- **Module:** Wealth Accumulation Gap

---

### 1.4 Metric Card Specifications

Cards are listed in recommended display order. Each card shows: label, value (formula reference), format, status color logic, and tooltip/description text.

---

| # | Card Label | Formula | Format | Status Logic | Tooltip |
|---|---|---|---|---|---|
| M1.01 | **Projected Wealth at Retirement** | `projectedWealthAtRetirement` (F1.07) | $X,XXX,XXX | Green if ≥ wealthNeeded; Yellow if 80–99%; Orange if 60–79%; Red if < 60% | The total estimated portfolio value at age [retirementAge] based on current balance and contributions |
| M1.02 | **Wealth Needed at Retirement** | `wealthNeeded` (F1.04) | $X,XXX,XXX | Neutral (benchmark) | The lump-sum needed on day one of retirement to fund [targetIncome]/yr for [retirementDurationYears] years |
| M1.03 | **Wealth Accumulation Gap** | `wealthAccumulationGap` (F1.08) | $X,XXX,XXX | Red if > 0; hidden if gap = 0 | The funding shortfall between projected wealth and the wealth target |
| M1.04 | **Wealth Surplus** | `wealthSurplus` (F1.09) | $X,XXX,XXX | Green; shown only if gap = 0 | The amount by which projected wealth exceeds the target |
| M1.05 | **Retirement Readiness Score** | `fundingRatio × 100` (F1.10) | XX.X% | ≥100% Green; 80–99% Yellow; 60–79% Orange; <60% Red | The percentage of the needed wealth currently on track to be accumulated |
| M1.06 | **Target Retirement Income** | `baseTargetIncome` (F1.01) | $XXX,XXX/yr | Neutral | Annual income target in today's dollars |
| M1.07 | **Inflation-Adjusted Target (at Retirement)** | `inflationAdjustedTarget` (F1.02) | $XXX,XXX/yr | Neutral | What the income target is worth in nominal dollars at retirement, at [inflationRate]% inflation |
| M1.08 | **Guaranteed Annual Income** | `annualGuaranteedIncome` | $XX,XXX/yr | Green if > 0 | Social Security + Pension + Other guaranteed income at retirement |
| M1.09 | **Net Portfolio Income Need** | `netIncomeNeed` (F1.03) | $XXX,XXX/yr | Yellow if > 0 | Annual income the portfolio must generate after guaranteed sources are offset |
| M1.10 | **Sustainable Annual Retirement Income** | `sustainableAnnualIncome` (F1.11) | $XXX,XXX/yr | Green if ≥ target; Yellow if 80–99%; Red if < 80% | Total projected annual retirement income from all sources on current trajectory |
| M1.11 | **Annual Retirement Income Shortfall** | `retirementIncomeGap` (F1.12) | $XX,XXX/yr | Red if > 0; hidden if = 0 | Annual income the client would go without in retirement on current trajectory |
| M1.12 | **Additional Monthly Savings Required** | `additionalMonthlyNeeded` (F1.13) | $X,XXX/mo | Red if > 0; Green if = 0 | The incremental monthly savings needed to fully close the wealth gap |
| M1.13 | **Total Monthly Savings Needed** | `totalMonthlyRequired` (F1.14) | $X,XXX/mo | Neutral | Current contributions plus additional required to hit the target |
| M1.14 | **Current Savings Rate** | `currentSavingsRate` (F1.15) | XX.X% | Green if ≥ 15%; Yellow if 10–14.9%; Red if < 10% | Current monthly savings as a percentage of gross annual income |
| M1.15 | **Required Savings Rate** | `requiredSavingsRate` (F1.16) | XX.X% | Red if > currentSavingsRate; Green if ≤ currentSavingsRate | Savings rate needed to close the wealth gap |
| M1.16 | **Cost of 1-Year Delay** | `costOfDelay` (F1.17) | +$XXX/mo | Red always | Additional monthly savings required if action is delayed by one year |
| M1.17 | **Future Value of Current Portfolio** | `portfolioFV` (F1.05) | $X,XXX,XXX | Neutral / informational | Projected value of today's assets alone at retirement, with no additional contributions |
| M1.18 | **Future Value of Contributions** | `contributionsFV` (F1.06) | $X,XXX,XXX | Neutral / informational | Projected value of ongoing contributions alone, separate from current assets |

---

### 1.5 Chart & Visualization Specifications

---

#### Chart 1A — Wealth Accumulation Timeline

- **Type:** Area / line combo chart
- **X-axis:** Age (from currentAge to retirementAge), one point per year
- **Y-axis:** Portfolio value in dollars
- **Series 1:** Projected Portfolio Balance — `portfolioBalance[y]` (F1.18) — solid blue/green fill area
- **Series 2:** Wealth Target Line — `wealthTargetLine[y]` (F1.19) — flat dashed line in red/orange
- **Gap shading:** When the target line sits above the portfolio line at retirement, shade the vertical gap at the right edge in red. When portfolio crosses above target before retirement, shade green.
- **Key annotations:**
  - Dot on the line at current age showing current balance
  - Dot at retirement age showing projected wealth
  - Label showing `wealthAccumulationGap` or `wealthSurplus` at the right edge
- **Purpose:** Makes the "trajectory vs. destination" story visual. The gap or surplus is immediately apparent without reading numbers.

---

#### Chart 1B — Retirement Income Waterfall

- **Type:** Horizontal stacked bar (single bar)
- **Y-axis:** Single bar labeled "Projected Annual Retirement Income"
- **Segments (left to right):**
  - Segment A (green): Guaranteed Income — `annualGuaranteedIncome` — labeled "Social Security + Pension"
  - Segment B (blue): Portfolio Withdrawal — `portfolioIncomeBar` (F1.20) — labeled "Portfolio Withdrawal"
  - Segment C (red): Income Gap — `incomeGapBar` (F1.20) — labeled "Unfunded Gap"
- **Reference line:** Vertical dashed line at `inflationAdjustedTarget` labeled "Income Target"
- **Purpose:** Converts the abstract wealth gap into a concrete annual income story. Clients understand "$28,000/year I won't have" more immediately than "$700,000 portfolio shortfall."

---

#### Chart 1C — Contribution Sensitivity (Scenario Comparison)

- **Type:** Three-line chart (scenarios)
- **X-axis:** Age (currentAge to retirementAge)
- **Y-axis:** Portfolio value
- **Scenario lines:**
  - Line 1 (gray): Current trajectory — `monthlyContribution` as-is
  - Line 2 (yellow): Current + 50% of `additionalMonthlyNeeded` — halfway there
  - Line 3 (green): Current + `additionalMonthlyNeeded` — fully closed
- **Reference line:** Wealth target (red dashed)
- **Purpose:** Shows clients the range of outcomes based on different savings levels. Makes the additional contribution feel achievable when presented in steps.

---

### 1.6 Assumptions Panel

The assumptions panel is displayed below the metric cards and provides full audit transparency. All values are shown with their source (user-entered vs. default).

| Assumption | Value Displayed | Source Tag |
|---|---|---|
| Expected Annual Return | `expectedAnnualReturn` | User / Default (7.0%) |
| Inflation Rate | `inflationRate` | User / Default (3.0%) |
| Real Rate of Return | `realRate` | Calculated |
| Safe Withdrawal Rate | `safeWithdrawalRate` | User / Default (4.0%) |
| Income Replacement Ratio | `incomeReplacementRatio` | User / Default (80%) |
| Retirement Duration | `retirementDurationYears` years | User / Default (30 yrs) |
| Inflation Adjustment | Enabled / Disabled | User / Default (Enabled) |
| SS / Pension Included | Yes / No | User |
| Planning Horizon | `yearsToRetirement` years | Calculated |

**Footnote text (displayed beneath panel):**
> "Projections are illustrative estimates based on the assumptions above and do not guarantee future results. Returns are hypothetical and not adjusted for taxes unless noted. The Safe Withdrawal Rate methodology assumes a diversified portfolio. This tool is for planning purposes only."

---

### 1.7 Output Action Items

Each action item is a specific, dollar-quantified recommendation generated from the module outputs. Displayed in a dedicated action panel below the metric cards.

---

**Action 1 — Increase Monthly Contributions**
> *"To close your $[wealthAccumulationGap] retirement gap, increase monthly contributions by $[additionalMonthlyNeeded] — bringing total savings to $[totalMonthlyRequired]/month ([requiredSavingsRate]% of income)."*
> — Triggered when: `wealthAccumulationGap > 0`

**Action 2 — Urgency Signal (Cost of Delay)**
> *"Every 12 months without action increases the required monthly savings by an additional $[costOfDelay]. Acting today costs $[additionalMonthlyNeeded]/month; waiting one year costs $[additionalMonthlyNeeded + costOfDelay]/month."*
> — Triggered when: `wealthAccumulationGap > 0`

**Action 3 — Guaranteed Income Gap**
> *"Social Security and pension cover $[annualGuaranteedIncome]/year of your $[inflationAdjustedTarget]/year target. Your portfolio must generate the remaining $[netIncomeNeed]/year — equivalent to maintaining a $[wealthNeeded] portfolio."*
> — Triggered when: `annualGuaranteedIncome > 0 AND netIncomeNeed > 0`

**Action 4 — Surplus Action (Legacy / Early Retirement)**
> *"At current savings rates, you are projected to exceed your retirement target by $[wealthSurplus]. This surplus supports [retiring N years early / leaving a $[wealthSurplus] legacy / reducing monthly contributions by $X]."*
> — Triggered when: `wealthSurplus > 0`

---

### 1.8 Edge Cases & Validation Rules

| Scenario | Handling |
|---|---|
| `retirementAge ≤ currentAge` | Validation error: "Retirement age must be greater than current age" |
| `monthlyContribution = 0 AND currentPortfolioValue = 0` | projectedWealth = 0; gap = wealthNeeded; action items emphasize starting immediately |
| `annualGuaranteedIncome ≥ inflationAdjustedTarget` | `netIncomeNeed = 0`; `wealthNeeded = 0`; display "Guaranteed income fully covers retirement target" status card in green |
| `expectedAnnualReturn = 0` | Use simple multiplication formulas (no division by zero); portfolio grows only via contributions |
| `yearsToRetirement < 5` | Display advisory warning: "Short planning horizon — results are highly sensitive to market timing. Consider reviewing with the Monte Carlo module." |
| `fundingRatio > 2.0` | Cap display at "200%+" to prevent misinterpretation; show surplus dollar amount |
| `safeWithdrawalRate = 0` | Blocked at input level; minimum value enforced at 1% |

---

## Module 2 — Fee Drag Analyzer

### 2.0 Purpose & Advisor Use Case

**What it computes:** The module calculates the compound wealth destruction caused by the cost differential between a client's current investment cost structure (expense ratios, trading costs) and an optimized lower-cost alternative. It converts that wealth destruction into a concrete dollar figure and an equivalent annual retirement income impact.

**Primary advisor use case:** Product and platform optimization conversations. Used when an advisor is transitioning a client from high-cost actively managed funds, broker-sold insurance products with high internal charges, or legacy platforms to a lower-cost advisory structure. The output gives advisors a specific, auditable dollar figure to anchor the value conversation.

**Secondary use case:** Quantifying the advisor's own value-add. Because the tool separates market return from cost drag, it can demonstrate that a well-structured advisory relationship (with a transparent, reasonable advisory fee) produces better net outcomes than unadvised high-cost investing — even after the advisory fee.

**Industry framework basis:** This module applies the compound return differential methodology documented in Vanguard's "Putting a Value on Your Value: Quantifying Vanguard Advisor's Alpha" (2019, updated 2022), which attributes approximately 0–0.75% annually to cost reduction and fund selection. The formula structure mirrors the FINRA "Fund Analyzer" and Morningstar's cost impact methodology.

---

### 2.1 Input Schema — Data Model

Inputs are organized into three groups.

---

#### Group A — Portfolio Basis (Shared with Module 1 or Standalone)

| Field | Variable Name | Type | Default | Range / Validation | Description |
|---|---|---|---|---|---|
| Current Portfolio Value | `currentPortfolioValue` | Currency | *Linked from M1* | ≥ 0; required | Total investable assets. Auto-populated from Module 1 if used together; can be entered independently |
| Monthly Contribution | `monthlyContribution` | Currency | *Linked from M1* | ≥ 0 | Monthly savings amount. Auto-populated from Module 1 |
| Years to Retirement | `yearsToRetirement` | Integer | *Linked from M1* | 1–60 | Planning horizon. Auto-populated from Module 1 |
| Expected Market Return (Gross) | `grossMarketReturn` | Percent | 7.0% | 0%–15% | The market return before any fees or costs — the shared return that both current and proposed portfolios are assumed to earn |

---

#### Group B — Current Cost Structure

| Field | Variable Name | Type | Default | Range / Validation | Description |
|---|---|---|---|---|---|
| Current Expense Ratio | `currentExpenseRatio` | Percent | 0.85% | 0%–3% | Weighted average expense ratio of current portfolio holdings. Includes fund-level management fees and 12b-1 fees |
| Current Portfolio Label | `currentPortfolioLabel` | Text | "Current Portfolio" | — | Display name for current portfolio in charts (e.g., "Actively Managed Funds") |
| Include Trading Cost Drag | `includeTradingCosts` | Boolean | true | — | When enabled, adds an estimated drag from portfolio turnover (transaction costs + tax friction from short-term capital gains) |
| Current Annual Turnover Rate | `currentTurnoverRate` | Percent | 80% | 0%–200% | Annualized portfolio turnover for current holdings. Active mutual funds average 60–100%; index funds average 3–10% |
| Advisor Fee (Current) | `currentAdvisorFee` | Percent | 0% | 0%–3% | Advisory fee assessed on current portfolio, if any. Use 0% for self-directed accounts |

---

#### Group C — Proposed Cost Structure

| Field | Variable Name | Type | Default | Range / Validation | Description |
|---|---|---|---|---|---|
| Proposed Expense Ratio | `proposedExpenseRatio` | Percent | 0.10% | 0%–3% | Weighted average expense ratio of the proposed optimized portfolio |
| Proposed Portfolio Label | `proposedPortfolioLabel` | Text | "Optimized Portfolio" | — | Display name for proposed portfolio (e.g., "Low-Cost Index Portfolio") |
| Proposed Annual Turnover Rate | `proposedTurnoverRate` | Percent | 5% | 0%–200% | Turnover for proposed holdings |
| Advisor Fee (Proposed) | `proposedAdvisorFee` | Percent | 1.0% | 0%–3% | Advisory fee on the proposed portfolio. Include the advisor's own AUM fee here to show net value after all costs |
| Switching Cost / Tax Liability | `switchingCostEstimate` | Currency | 0 | ≥ 0 | One-time estimated tax liability or transition cost from liquidating current positions. Used to calculate break-even timeline |
| Safe Withdrawal Rate | `safeWithdrawalRate` | Percent | 4.0% | 2%–8% | Used to convert lump-sum fee drag into annual retirement income equivalent. Auto-populated from Module 1 if linked |

---

### 2.2 Derived Constants & Intermediate Values

```
monthsToRetirement          = yearsToRetirement × 12

tradingCostDragPerTurnover  = 0.0030
  // Industry estimate: ~30 basis points per 100% annual turnover.
  // Reflects bid-ask spread, market impact, and embedded tax friction.
  // Source: Vanguard research; range in literature is 20–50bps/100% turnover.

currentTradingCostDrag      = currentTurnoverRate × tradingCostDragPerTurnover
  (when includeTradingCosts = true; else 0)

proposedTradingCostDrag     = proposedTurnoverRate × tradingCostDragPerTurnover
  (when includeTradingCosts = true; else 0)
```

---

### 2.3 Formula Catalog

---

#### F2.01 — Current Effective Total Cost (All-In Annual %)

```
currentEffectiveCost = currentExpenseRatio + currentAdvisorFee + currentTradingCostDrag
```

- **Powers:** Current All-In Cost Rate (metric card)
- **Description:** The total annual percentage drag on the current portfolio from all cost sources: fund expenses, the advisor fee (if any), and estimated trading friction. This is the "true" cost rate — what the client actually loses each year before any net return is realized.
- **Module:** Fee Drag Analyzer

---

#### F2.02 — Proposed Effective Total Cost (All-In Annual %)

```
proposedEffectiveCost = proposedExpenseRatio + proposedAdvisorFee + proposedTradingCostDrag
```

- **Powers:** Proposed All-In Cost Rate (metric card)
- **Description:** The total annual cost of the proposed optimized portfolio including the advisor's own fee. Displaying the proposed cost inclusive of the advisory fee is critical for fiduciary transparency — the value story holds only if the all-in proposed cost is less than the current all-in cost.
- **Module:** Fee Drag Analyzer

---

#### F2.03 — Net Annual Return (Current Portfolio)

```
currentNetReturn = grossMarketReturn − currentEffectiveCost
```

- **Powers:** Current Net Annual Return (metric card)
- **Description:** What the client actually earns each year after all costs are subtracted from the gross market return. This is the return that compounds in the client's portfolio. The difference between gross and net is the total annual wealth transfer from the client to fund managers, brokers, and advisors.
- **Module:** Fee Drag Analyzer

---

#### F2.04 — Net Annual Return (Proposed Portfolio)

```
proposedNetReturn = grossMarketReturn − proposedEffectiveCost
```

- **Powers:** Proposed Net Annual Return (metric card)
- **Description:** The net annual return the client would earn in the proposed portfolio after all costs including the advisor's fee.
- **Module:** Fee Drag Analyzer

---

#### F2.05 — Return Delta (Improvement from Optimization)

```
returnDelta = proposedNetReturn − currentNetReturn
```

- **Powers:** Net Return Improvement (headline metric card)
- **Description:** The annual improvement in net return achieved by moving from the current to the proposed cost structure. This percentage improvement compounds over the entire planning horizon to produce the dollar fee drag figure. A seemingly small improvement (e.g., 0.75%) generates a large cumulative dollar impact due to compounding.
- **Module:** Fee Drag Analyzer

---

#### F2.06 — Current Annual Fee Cost (Year 1, Dollar Amount)

```
currentAnnualFeeCost = currentPortfolioValue × currentEffectiveCost
```

- **Powers:** Current Annual Cost (metric card — Year 1)
- **Description:** The dollar amount the client's portfolio loses to costs in the current year, applied to the current portfolio value. This is an immediately tangible figure — "you are paying $X this year in fees and costs" — that does not require understanding of compounding.
- **Module:** Fee Drag Analyzer

---

#### F2.07 — Proposed Annual Fee Cost (Year 1, Dollar Amount)

```
proposedAnnualFeeCost = currentPortfolioValue × proposedEffectiveCost
```

- **Powers:** Proposed Annual Cost (metric card — Year 1)
- **Description:** What the client would pay in the first year under the proposed cost structure. The difference from the current annual fee cost is the immediate Year 1 savings.
- **Module:** Fee Drag Analyzer

---

#### F2.08 — Year 1 Annual Savings

```
annualFeeSavings = currentAnnualFeeCost − proposedAnnualFeeCost
```

- **Powers:** Year 1 Annual Savings (metric card)
- **Description:** The immediate first-year dollar savings from optimization. Presented alongside the lifetime compounded saving to give clients both a short-term and long-term frame of reference.
- **Module:** Fee Drag Analyzer

---

#### F2.09 — Current Portfolio Projected Value at Retirement

```
currentMonthlyRate = currentNetReturn ÷ 12

currentPortfolioFV = currentPortfolioValue × (1 + currentNetReturn)^yearsToRetirement
                   + monthlyContribution × ((1 + currentMonthlyRate)^monthsToRetirement − 1)
                     ─────────────────────────────────────────────────────────────────────────
                                            currentMonthlyRate

  When currentMonthlyRate = 0:
currentPortfolioFV = currentPortfolioValue + (monthlyContribution × monthsToRetirement)
```

- **Powers:** Projected Wealth (Current Portfolio) — metric card and chart
- **Description:** The projected retirement portfolio value at the current net return rate — what the client accumulates with the existing cost structure. This is the lower of the two portfolio trajectories.
- **Module:** Fee Drag Analyzer

---

#### F2.10 — Proposed Portfolio Projected Value at Retirement

```
proposedMonthlyRate = proposedNetReturn ÷ 12

proposedPortfolioFV = currentPortfolioValue × (1 + proposedNetReturn)^yearsToRetirement
                    + monthlyContribution × ((1 + proposedMonthlyRate)^monthsToRetirement − 1)
                      ───────────────────────────────────────────────────────────────────────────
                                              proposedMonthlyRate

  When proposedMonthlyRate = 0:
proposedPortfolioFV = currentPortfolioValue + (monthlyContribution × monthsToRetirement)
```

- **Powers:** Projected Wealth (Proposed Portfolio) — metric card and chart
- **Description:** The projected retirement portfolio value at the optimized net return rate — what the client accumulates with the proposed cost structure. This is always ≥ currentPortfolioFV.
- **Module:** Fee Drag Analyzer

---

#### F2.11 — Total Fee Drag Cost (Lifetime Dollar Impact)

```
feeDragCost = proposedPortfolioFV − currentPortfolioFV
```

- **Powers:** Total Fee Drag (headline metric card — red)
- **Description:** The total dollar wealth destroyed by the current cost structure over the full planning horizon relative to the optimized alternative. This is the module's headline output. It represents money that would exist in the client's portfolio at retirement but is instead lost to costs. The figure is always positive because the proposed return is always ≥ the current return.
- **Module:** Fee Drag Analyzer

---

#### F2.12 — Fee Drag as a Percentage of Potential Wealth

```
feeDragPercentage = feeDragCost ÷ proposedPortfolioFV
```

- **Powers:** Fee Drag as % of Wealth (metric card)
- **Description:** What fraction of the client's maximum achievable wealth is destroyed by the current cost structure. Contextualizes the dollar figure as a proportion — "the current fees will cost you X% of what your portfolio could be worth."
- **Module:** Fee Drag Analyzer

---

#### F2.13 — Annual Retirement Income Lost to Fee Drag

```
retirementIncomeLost = feeDragCost × safeWithdrawalRate
```

- **Powers:** Annual Retirement Income Lost (metric card — red)
- **Description:** Converts the lump-sum fee drag into an annual retirement income equivalent using the Safe Withdrawal Rate. This bridges the fee conversation directly to the retirement income gap conversation in Module 1 — making the cost of fees concrete in terms of lifestyle, not just portfolio size.
- **Module:** Fee Drag Analyzer

---

#### F2.14 — Break-Even Year on Switching Costs

```
// For each year y from 1 to yearsToRetirement:
cumulativeFeeDrag[y] = proposedBalanceAtYear[y] − currentBalanceAtYear[y]

breakEvenYear = min(y) where cumulativeFeeDrag[y] ≥ switchingCostEstimate

  When switchingCostEstimate = 0:
breakEvenYear = 1  (immediate positive impact)
```

- **Powers:** Break-Even Year on Transition (metric card)
- **Description:** If there is a one-time switching cost (e.g., tax liability from liquidating a low-basis position), this formula finds the year at which the cumulative savings from lower fees exceeds that upfront cost. Before the break-even year, the client is "in the hole" on the transition; after it, every year is net positive. Uses the same iterative year-by-year simulation that powers Chart 2A.
- **Module:** Fee Drag Analyzer

---

#### F2.15 — Year-by-Year Portfolio Balances (Chart Data)

```
// For each year y from 0 to yearsToRetirement:

currentMonthlyRateY  = currentNetReturn ÷ 12
proposedMonthlyRateY = proposedNetReturn ÷ 12
monthsY              = y × 12

currentBalance[y] = currentPortfolioValue × (1 + currentNetReturn)^y
                  + monthlyContribution × ((1 + currentMonthlyRateY)^monthsY − 1)
                    ──────────────────────────────────────────────────────────────
                                         currentMonthlyRateY

proposedBalance[y] = currentPortfolioValue × (1 + proposedNetReturn)^y
                   + monthlyContribution × ((1 + proposedMonthlyRateY)^monthsY − 1)
                     ─────────────────────────────────────────────────────────────────
                                           proposedMonthlyRateY

cumulativeFeeDrag[y] = proposedBalance[y] − currentBalance[y]
```

- **Powers:** Portfolio Growth Comparison chart (Chart 2A) and Fee Drag Accumulation chart (Chart 2B)
- **Description:** Year-by-year portfolio values for both the current and proposed cost structures, plus the cumulative growing dollar gap between them. The fee drag starts small and grows nonlinearly — the divergence between the two lines accelerates in later years as compounding magnifies the return differential. This nonlinear widening is the most important visual to convey.
- **Module:** Fee Drag Analyzer

---

#### F2.16 — Cost Breakdown by Component (Chart Data)

```
// Current portfolio cost breakdown (annualized $ on current balance):
expenseRatioCost_current      = currentPortfolioValue × currentExpenseRatio
advisorFeeCost_current        = currentPortfolioValue × currentAdvisorFee
tradingCostDragCost_current   = currentPortfolioValue × currentTradingCostDrag

// Proposed portfolio cost breakdown:
expenseRatioCost_proposed     = currentPortfolioValue × proposedExpenseRatio
advisorFeeCost_proposed       = currentPortfolioValue × proposedAdvisorFee
tradingCostDragCost_proposed  = currentPortfolioValue × proposedTradingCostDrag
```

- **Powers:** Cost Breakdown Comparison chart (Chart 2C)
- **Description:** Itemizes the current and proposed annual cost in dollars by category — fund expense ratio, advisor fee, and trading cost drag. Displayed as a paired bar chart to show exactly where the cost savings are coming from. Makes the advisor's fee visible and positioned alongside the offsetting savings in fund and trading costs.
- **Module:** Fee Drag Analyzer

---

### 2.4 Metric Card Specifications

| # | Card Label | Formula | Format | Status Logic | Tooltip |
|---|---|---|---|---|---|
| M2.01 | **Total Fee Drag** | `feeDragCost` (F2.11) | $X,XXX,XXX | Red always | Total wealth destroyed by current cost structure over [yearsToRetirement] years vs. optimized alternative |
| M2.02 | **Projected Wealth — Current Portfolio** | `currentPortfolioFV` (F2.09) | $X,XXX,XXX | Neutral | Projected retirement portfolio at current all-in cost of [currentEffectiveCost]%/yr |
| M2.03 | **Projected Wealth — Optimized Portfolio** | `proposedPortfolioFV` (F2.10) | $X,XXX,XXX | Green | Projected retirement portfolio at proposed all-in cost of [proposedEffectiveCost]%/yr |
| M2.04 | **Fee Drag as % of Potential Wealth** | `feeDragPercentage` (F2.12) | XX.X% | Red always | The percentage of maximum achievable wealth consumed by current fees |
| M2.05 | **Annual Retirement Income Lost** | `retirementIncomeLost` (F2.13) | $XX,XXX/yr | Red if > 0 | Annual retirement income equivalent of the total fee drag (at [safeWithdrawalRate]% SWR) |
| M2.06 | **Current All-In Cost Rate** | `currentEffectiveCost` (F2.01) | X.XX% | Red if > 0.75%; Yellow if 0.35–0.75%; Green if < 0.35% | Total annual cost: expense ratio + advisor fee + trading drag |
| M2.07 | **Proposed All-In Cost Rate** | `proposedEffectiveCost` (F2.02) | X.XX% | Green if < 0.75%; Yellow if 0.75–1.25% | Total proposed annual cost including advisor fee |
| M2.08 | **Net Return Improvement** | `returnDelta` (F2.05) | +X.XX%/yr | Green always | Annual net return gained by moving to the optimized cost structure |
| M2.09 | **Current Net Annual Return** | `currentNetReturn` (F2.03) | X.XX% | Neutral | Market return minus all current costs |
| M2.10 | **Proposed Net Annual Return** | `proposedNetReturn` (F2.04) | X.XX% | Neutral | Market return minus all proposed costs |
| M2.11 | **Year 1 Annual Savings** | `annualFeeSavings` (F2.08) | $XX,XXX/yr | Green if > 0 | Immediate first-year dollar savings from cost optimization |
| M2.12 | **Current Annual Cost (Year 1)** | `currentAnnualFeeCost` (F2.06) | $XX,XXX/yr | Red | Dollar cost of current structure applied to today's portfolio |
| M2.13 | **Proposed Annual Cost (Year 1)** | `proposedAnnualFeeCost` (F2.07) | $XX,XXX/yr | Green | Dollar cost of proposed structure applied to today's portfolio |
| M2.14 | **Break-Even Year on Transition** | `breakEvenYear` (F2.14) | Year X (Age XX) | Green if ≤ 3; Yellow if 4–7; Hidden if switchingCost = 0 | The year when cumulative fee savings exceeds any one-time transition cost |
| M2.15 | **Current Expense Ratio** | `currentExpenseRatio` | X.XX% | Status per M2.06 thresholds | Fund-level annual expense ratio of current holdings |
| M2.16 | **Proposed Expense Ratio** | `proposedExpenseRatio` | X.XX% | Green | Fund-level annual expense ratio of proposed holdings |

---

### 2.5 Chart & Visualization Specifications

---

#### Chart 2A — Portfolio Growth Comparison (Dual Trajectory)

- **Type:** Dual-line area chart with gap shading
- **X-axis:** Age (currentAge to retirementAge), one point per year
- **Y-axis:** Portfolio value in dollars
- **Series 1:** Current Portfolio — `currentBalance[y]` (F2.15) — solid gray or muted color fill
- **Series 2:** Optimized Portfolio — `proposedBalance[y]` (F2.15) — solid green fill
- **Gap shading:** The area between the two lines shaded in red/orange, growing wider toward retirement
- **Key annotations:**
  - Labels at the right edge showing final values for both portfolios
  - Arrow and label showing `feeDragCost` at the gap's widest point (at retirement)
  - Break-even year marker (vertical dashed line) if `switchingCostEstimate > 0`
- **Purpose:** The diverging lines with growing gap make the compounding cost story viscerally obvious. The visual narrative is "two portfolios start at the same place today — here is where they end up."

---

#### Chart 2B — Cumulative Fee Drag Over Time

- **Type:** Area chart (single series)
- **X-axis:** Age (currentAge to retirementAge)
- **Y-axis:** Cumulative dollar gap (fee drag accumulated to date)
- **Series:** `cumulativeFeeDrag[y]` (F2.15) — red fill
- **Key annotations:**
  - Horizontal dashed line at `switchingCostEstimate` (if > 0), labeled "Transition Cost"
  - Break-even year marker where the curve crosses the switching cost line
  - Final value label at retirement age = `feeDragCost`
- **Purpose:** Shows the nonlinear acceleration of fee drag over time. The curve starts flat and bends sharply upward in later years — the most powerful visual argument for acting early rather than late.

---

#### Chart 2C — Annual Cost Breakdown (Component Comparison)

- **Type:** Grouped bar chart (two bars side by side, one per portfolio)
- **X-axis:** Cost categories — "Fund Expense Ratio" | "Advisor Fee" | "Trading Cost Drag"
- **Y-axis:** Annual dollar cost
- **Bar A (current):** `expenseRatioCost_current`, `advisorFeeCost_current`, `tradingCostDragCost_current` (F2.16)
- **Bar B (proposed):** `expenseRatioCost_proposed`, `advisorFeeCost_proposed`, `tradingCostDragCost_proposed` (F2.16)
- **Color:** Current bars in red/orange; proposed bars in green
- **Purpose:** Itemizes where costs are being reduced. Important for advisor transparency — the advisor's own fee appears explicitly, demonstrating that the value case holds even after accounting for their compensation. Trading cost drag is often invisible to clients and this chart makes it visible.

---

### 2.6 Assumptions Panel

| Assumption | Value Displayed | Source Tag |
|---|---|---|
| Gross Market Return | `grossMarketReturn` | User / Default (7.0%) |
| Trading Cost Drag Enabled | Yes / No | User / Default (Yes) |
| Trading Cost per 100% Turnover | 0.30% | Fixed (industry estimate) |
| Current Turnover Rate | `currentTurnoverRate` | User / Default (80%) |
| Proposed Turnover Rate | `proposedTurnoverRate` | User / Default (5%) |
| Safe Withdrawal Rate | `safeWithdrawalRate` | Linked from M1 / Default (4.0%) |
| Switching Cost Included | Yes ($X) / No | User |

**Footnote text:**
> "Trading cost drag is estimated at 0.30% per 100% annual turnover rate, reflecting bid-ask spreads, market impact costs, and short-term capital gains friction for taxable accounts. This is a simplified estimate; actual costs vary by asset class, fund size, and tax situation. Expense ratios and returns are hypothetical and for planning purposes only."

---

### 2.7 Output Action Items

---

**Action 1 — Core Fee Drag Finding**
> *"The current portfolio's all-in cost of [currentEffectiveCost]% vs. the proposed [proposedEffectiveCost]% will cost $[feeDragCost] in accumulated wealth by retirement — equivalent to $[retirementIncomeLost]/year in retirement income."*
> — Triggered always

**Action 2 — Immediate First-Year Savings**
> *"Optimizing the cost structure saves $[annualFeeSavings] in the first year alone — money that stays in the portfolio and compounds forward."*
> — Triggered when: `annualFeeSavings > 0`

**Action 3 — Break-Even on Transition Costs**
> *"Even accounting for an estimated $[switchingCostEstimate] transition cost, the fee savings break even by [breakEvenYear] (age [breakEvenAge]). Every year after that is a net gain."*
> — Triggered when: `switchingCostEstimate > 0`

**Action 4 — Bridge to Wealth Accumulation Gap**
> *"The $[feeDragCost] recovered through fee optimization closes [feeDragCost ÷ wealthAccumulationGap × 100]% of the $[wealthAccumulationGap] wealth gap identified in Module 1 — without the client saving a single additional dollar."*
> — Triggered when: Modules 1 and 2 are used together AND `wealthAccumulationGap > 0`

---

### 2.8 Edge Cases & Validation Rules

| Scenario | Handling |
|---|---|
| `currentEffectiveCost ≤ proposedEffectiveCost` | Display warning: "Proposed cost structure is not lower than current. Review inputs." feeDragCost = 0; suppress gap cards |
| `currentNetReturn ≤ 0` | Display warning: "Current costs exceed expected return — portfolio is projected to shrink in real terms." Proceed with calculation but highlight prominently |
| `proposedAdvisorFee = 0` | Flag for review: "No advisor fee entered for proposed portfolio. Confirm this is a self-directed account." |
| `currentAdvisorFee = 0 AND currentExpenseRatio < 0.20%` | Current portfolio is already low-cost; display "Current portfolio is already cost-optimized" in green status panel. Fee drag will be minimal. |
| `switchingCostEstimate > feeDragCost` | Break-even year exceeds retirement — display warning: "Transition costs may not be recovered before retirement. Review whether position liquidation is advisable." |
| `yearsToRetirement < 3` | Short horizon warning; fee drag impact will be small — note this to manage expectations |
| `currentNetReturn = 0 OR proposedNetReturn = 0` | Use simple multiplication fallback (no division by zero) |

---

## Cross-Module Integration

### How the Modules Connect

The two modules are designed to be used sequentially in the same client session, with data flowing from Module 2 into Module 1 to produce a combined, enhanced analysis.

---

#### Integration Point 1 — Shared Inputs (Auto-Population)

When both modules are active, the following fields are shared and need only be entered once:

| Field | Module 1 Variable | Module 2 Variable |
|---|---|---|
| Current Portfolio Value | `currentPortfolioValue` | `currentPortfolioValue` |
| Monthly Contribution | `monthlyContribution` | `monthlyContribution` |
| Years to Retirement | `yearsToRetirement` | `yearsToRetirement` |
| Safe Withdrawal Rate | `safeWithdrawalRate` | `safeWithdrawalRate` |

---

#### Integration Point 2 — Return Feed-Through

Module 2's optimized return can optionally replace Module 1's `expectedAnnualReturn` to show the combined impact of fee optimization on the retirement wealth gap:

```
// When "Apply Fee Optimization to Wealth Gap" is enabled:
Module1.expectedAnnualReturn = Module2.proposedNetReturn

// The resulting improvement in Module 1 outputs:
improvementInProjectedWealth = new projectedWealthAtRetirement − original projectedWealthAtRetirement
remainingGapAfterFeeOptimization = max(0, wealthNeeded − new projectedWealthAtRetirement)
```

---

#### Integration Point 3 — Combined Action Item

When both modules produce active gaps, a combined action item is generated:

```
feeDragContributionToGapClosure = feeDragCost ÷ wealthAccumulationGap  (as %)
gapRemainingAfterFeeOptimization = max(0, wealthAccumulationGap − feeDragCost)
additionalMonthlyAfterOptimization = solve PMT for gapRemainingAfterFeeOptimization
```

**Combined Action Statement:**
> *"Optimizing fees recovers $[feeDragCost], closing [X]% of the $[wealthAccumulationGap] retirement gap. The remaining $[gapRemainingAfterFeeOptimization] gap requires an additional $[additionalMonthlyAfterOptimization]/month in contributions."*

This combined framing is the most powerful advisor conversation in the tool: it shows that the path to closing the retirement gap has two levers — one the client controls (savings rate) and one the advisor controls (cost structure).

---

### Module Sequencing Recommendation

```
Step 1: Collect client inputs in Module 1
Step 2: Establish the Wealth Accumulation Gap
Step 3: Run Module 2 with current and proposed cost structures
Step 4: Enable "Apply Fee Optimization" toggle
Step 5: Show updated Module 1 gap with fee optimization applied
Step 6: Present combined action plan:
          (a) Fee optimization closes X% of gap — advisor action
          (b) Remaining gap requires $Y/month — client action
```

---

## Shared Design Principles

These principles govern both modules and ensure consistency with the existing GAP tool architecture.

**1. Metric card primacy.** The headline metric card drives the conversation. Every other card, chart, and action item supports and contextualizes the headline number, never competes with it.

**2. Status color logic is non-negotiable.** Green / Yellow / Orange / Red thresholds are defined in this spec and must not be soft-coded. Consistent color semantics build advisor muscle memory.

**3. Assumption transparency.** Every output is auditable. The assumptions panel is always visible and always shows which values are user-entered vs. default. Advisors face scrutiny on projections — the tool must support their defensibility.

**4. Positive and negative values are contextually labeled.** A "gap" is never shown as a negative number. The tool adds the word "Shortfall," "Gap," or "Additional Needed" to make the directional meaning unambiguous.

**5. Action items are dollar-specific and role-assigned.** Each action item specifies a dollar amount, a timing, and implicitly or explicitly who acts (client increases contributions; advisor restructures portfolio). Vague recommendations are not surfaced.

**6. The client never sees raw intermediate values.** Variables like `portfolioFV`, `contributionsFV`, `currentTradingCostDrag` are computed internally and shown only in the assumptions panel, never as primary metric cards. The client surface shows interpreted, contextualized outputs.

**7. All edge cases fail gracefully.** No division by zero, no NaN outputs. Every formula includes a zero-rate fallback. Validation errors are shown in context, not as crashes.

---

## Glossary

| Term | Definition |
|---|---|
| **Wealth Accumulation Gap** | The dollar shortfall between projected portfolio value at retirement and the wealth needed to fund the desired retirement income |
| **Safe Withdrawal Rate (SWR)** | The annual portfolio withdrawal rate assumed to be sustainable over the full retirement period without depleting the portfolio. Commonly cited at 4% (Bengen, 1994); advisors may adjust based on client profile and market conditions |
| **Future Value of Annuity** | The compounded value at a future date of a series of equal periodic payments. Used to project the accumulated value of ongoing contributions |
| **Funding Ratio** | Projected wealth at retirement divided by wealth needed — the single-number retirement readiness health score |
| **Expense Ratio** | The annual percentage of fund assets charged by the fund manager to cover operating costs, expressed as a percentage of assets under management. Deducted daily from fund NAV |
| **All-In Cost** | The total annual drag on a portfolio from all sources: fund expense ratio + advisor fee + trading cost drag |
| **Fee Drag** | The compound wealth destruction caused by costs over the accumulation period — the difference in terminal wealth between a high-cost and low-cost portfolio earning the same gross return |
| **Return Delta** | The annual improvement in net return achieved by reducing costs. The primary driver of the fee drag calculation |
| **Trading Cost Drag** | The return friction attributable to portfolio turnover: bid-ask spreads, market impact, and embedded short-term capital gains tax friction in high-turnover funds |
| **Break-Even Year** | The year at which cumulative fee savings exceed any one-time transition costs |
| **Inflation-Adjusted Target** | The retirement income target expressed in future (nominal) dollars, accounting for cumulative inflation between today and the retirement date |
| **Net Income Need** | The portion of target retirement income that must be funded from the portfolio, after subtracting all guaranteed income sources (SS, pension, annuity) |
| **Retirement Income Lost (to fees)** | The annual retirement income that could have been sustained if fee drag had not reduced the terminal portfolio value, calculated as fee drag × SWR |
| **Cost of Delay** | The incremental increase in required monthly savings caused by waiting one year to act — a behavioral coaching metric |
| **Real Rate of Return** | The inflation-adjusted annual return: `(1 + nominal return) / (1 + inflation rate) − 1` |
| **Ordinary Annuity** | A series of equal payments made at the end of each period. The standard assumption for contribution projections (end-of-month) |
| **PMT (Payment)** | The level periodic payment needed to reach a target future value given a rate and number of periods — the formula behind "Additional Monthly Contribution Required" |
| **AUM Fee** | Assets Under Management fee — an advisory fee charged as an annual percentage of the portfolio value managed |

---

*NorthStar Offensive Advisor Tool — Tier 1 Blueprint*
*Version 1.0 | Compiled May 2026*
*For internal use by the NorthStar product and development team*
