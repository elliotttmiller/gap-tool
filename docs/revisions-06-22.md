# GAP Tool Revision Summary

## Verified Current State - June 22, 2026

This document summarizes the GAP Tool behavior currently implemented in the repository. It is intended for NorthStar advisor and product review. It describes verified functionality, not planned work.

The GAP Tool remains an illustrative gap-analysis resource. Its outputs support advisor discussion and methodology review; they are not guarantees, legal or tax advice, underwriting decisions, or formal insurance recommendations.

---

## Executive Summary

The current release includes four categories of work:

1. **Calculation alignment**
   - Life, Unemployment, and Liability calculations were aligned with the supplied advisor methodology notes.
   - Formula regression checks cover key Life, Unemployment, and Liability examples.

2. **Builder and presentation redesign**
   - Module layouts, cards, inputs, tabs, charts, and responsive behavior were revised in dark and light themes.
   - The light theme now uses distinct canvas, surface, raised-card, border, text, and accent tokens instead of rendering most surfaces as the same white or gray.

3. **Interactive review workflows**
   - Life and Disability charts support age-specific inspection.
   - The Unemployment reserve marker can be dragged to change emergency savings and recalculate dependent outputs.
   - Selected presentation inputs can be edited against the active scenario.

4. **Review transparency**
   - The Calculation Analysis Center exposes methodology, source inputs, assumptions, outputs, and schedules.
   - Its Review Scenario selector changes the evidence snapshot in place without redirecting to a builder or client page.

---

## Cross-Application UI and Theme Updates

### Theme system

- Light, dark, and system preferences are supported and persisted locally.
- The light theme has separate colors for the page canvas, standard surfaces, raised surfaces, muted surfaces, borders, primary text, secondary text, and accent states.
- Builder and presentation cards no longer rely on one uniform light background for every layer.
- Module selection tabs use the shared brand overlay color with white selected text.
- Shared cards, inputs, selects, dropdowns, collapsible sections, and metric cards were restyled for both themes.

### Builder layout

- Builder pages use a responsive input rail and visualization workspace.
- The input-panel toggle sits outside the form panel and moves to the page edge when the panel is closed.
- Chart and metric layouts use container-aware grids so desktop rows can use the available width without forcing avoidable wrapping.

### Chart conventions

- Age-based Life and Disability projections label each annual period by the age attained at the end of that period.
- A projection ending at age 65 therefore includes a final bar labeled age 65.
- Charts include explicit axis titles, legends, tooltips, and selected-state feedback where applicable.

---

## 1. Life Insurance Module

The visible Life workspace contains two related but distinct analyses: **Safe Income Coverage** and **Coverage Runway Scenario**.

### Safe Income Coverage

The implemented calculation flow is:

1. **Annual projected income basis**

   > **Projected income basis** = the greater of **$0** or (**Annual income** × **Income replacement ratio** − **Spouse income offset**)

2. **Annual target income support**

   The projected income basis grows by the configured annual income-growth rate. Each annual amount is then multiplied by the target income-support percentage, which defaults to 85%.

3. **Capital required today**

   The growing target income-support stream is converted to present value using the entered PV reference rate.

4. **Existing resources**

   > **Existing resources** = **Group life coverage** + **Private life coverage** + **Non-qualified assets**

5. **Coverage support rate**

   > **Coverage support rate** = the lesser of **100%** or (**Existing resources** ÷ **Present-value capital required**)

6. **Additional capital gap**

   > **Additional capital gap** = the greater of **$0** or (**Present-value capital required** − **Existing resources**)

The same support rate drives the Safe Income chart, supported-income metrics, annual gaps, and fully covered state. Changing the income replacement ratio changes the projected income basis and downstream metrics.

### Coverage Runway Scenario

Coverage Runway is a scenario view, not the Safe Income target calculation.

- The starting resource pool is group life coverage, private life coverage, and non-qualified assets.
- The pool grows by the entered runway return rate at the beginning of each annual period.
- The model then attempts to fund the full projected income basis for that period.
- A selected bar updates the age-specific projected income, coverage status, income replaced, annual gap, and cumulative gap cards.
- Coverage status is based on the actual covered amount for the selected year. A fully red bar is reported as uncovered, not partially covered.

### UI updates

- Both Life charts have explicit age and annual-income axes.
- Bar selection and reset controls were added.
- Metric cards respond to the selected age.
- The private-policy selector was restyled for the editable presentation snapshot.
- Planning Narrative cards remain in builder mode and are intentionally omitted from presentation mode.

### Important current boundary

The visible Safe Income Capital Gap comes from the present-value income-stream calculator. The saved scenario-level Life `remainingGap` is still produced by the broader Life summary calculator, which includes its own target-income total and may also include debts, education, final expenses, and configured liquid-asset offsets.

These two values answer related but not identical questions and can differ. They should not be described as one fully reconciled Life gap until the product decides which calculation is authoritative for scenario summaries and exports.

---

## 2. Unemployment and Liquidity Module

The Unemployment calculation models the loss of the higher household income and the reserve demand that remains after the lower income continues.

### Base reserve calculation

1. Both entered incomes are converted to modeled net monthly income using the net-income ratio, which defaults to 65%.
2. If two incomes exist, the lower modeled net income is treated as remaining household income after the higher income is lost. With one income, remaining income is zero.
3. Monthly Expense Replacement is:

   > **Monthly Expense Replacement** = the greater of **$0** or (**Monthly expenses** − **Remaining modeled net income**)

4. The minimum reserve target is always three months of Monthly Expense Replacement.
5. The ideal target is tiered according to how much of monthly expenses the remaining income covers:

   | Remaining income coverage | Ideal reserve period |
   | --- | ---: |
   | Less than 33% | 6 months |
   | 33% to less than 50% | 5 months |
   | 50% to less than 67% | 4 months |
   | 67% or more | 3 months |

6. Current reserve runway is:

   > **Current reserve runway (months)** = **Emergency savings** ÷ **Monthly Expense Replacement**

### Search-period calculation

The detailed search-period outputs also use:

- remaining household income;
- monthly severance and its duration;
- monthly unemployment benefit and its duration;
- entered job-search duration; and
- emergency savings.

These values drive Search-Period Expenses, Transition Income Offsets, Reserve Draw, Uncovered Shortfall, depletion timing, and the monthly timeline. Severance and unemployment benefits reduce search-period cash need, but they do not change the base three-month minimum or tiered ideal reserve targets.

### Interactive reserve visualization

- The reserve visualization is a centered vertical ladder with danger, below-minimum, target, and above-target regions.
- Three-month and ideal target cards are placed inside the visualization as supporting context.
- The current marker can be dragged or adjusted with the keyboard.
- Dragging changes only Liquid Emergency Savings, because that is the input represented by the marker.
- Current Reserves, Current Runway, Reserve Draw, Uncovered Shortfall, and status recalculate from that change.
- Income, expenses, benefits, durations, Monthly Expense Replacement, and target values do not change when the marker moves.

The drag interaction is available in both builder and presentation modes.

---

## 3. Liability and Lawsuit Module

The Liability module follows the supplied advisor methodology for disposable-income wage exposure, assets at risk, current protection, and an illustrative additional umbrella amount.

### Implemented calculation

Defaults are a 65% disposable-income proxy, 25% garnishment rate, 3% annual income growth, and $1,000,000 umbrella blocks.

For each remaining annual period through the projection end age:

> **Annual modeled wage exposure** = **Grown household gross income** × **Disposable-income ratio** × **Garnishment rate**

Annual wage exposure is accumulated through the projection period.

Assets at risk use direct Home Equity, Investment/Taxable Accounts, Liquid Savings, and Business Ownership Value inputs. For compatibility with older saved data, the legacy non-qualified-assets value is used only when no extended asset total is present.

> **Total exposure** = **Cumulative wage exposure** + **Assets at risk**
>
> **Current protection** = **Auto liability limit** + **Existing umbrella coverage**
>
> **Coverage gap** = the greater of **$0** or (**Total exposure** − **Current protection**)
>
> **Needed umbrella** = **Coverage gap** rounded up to the next available **$1 million block**

`Needed Umbrella` is the additional modeled amount after existing coverage, rounded to the next $1M block. It is not labeled as a recommendation.

### Advisor example validation

The formula regression script verifies the supplied example of a 41-year-old earning $300,000 with 3% income growth, a 65% disposable-income proxy, and a 25% garnishment rate. The calculated cumulative wage exposure through age 65 is approximately $1,678,290.

### Visualization and input updates

- Scenario labels now distinguish Auto Limit Only from Current Protection.
- Auto, existing umbrella, and unprotected-gap amounts are shown in exact-value coverage-layer cards.
- A reference line labels the auto limit.
- Non-zero chart layers receive a six-pixel minimum display thickness so a small auto limit is visible against multi-million-dollar exposure. The axis, tooltip, labels, and layer cards retain the actual values, and the display adjustment is disclosed below the chart.
- The four primary metrics are Total Exposure, Total Current Coverage, Coverage Gap, and Needed Umbrella.
- The Auto Liability Limit input includes a hover/focus tooltip explaining that the household per-occurrence liability limit should be entered from policy declarations.
- An auto limit below $100,000 changes the tooltip to an amber review state because the value may be a deductible or property-damage sublimit. This is guidance, not automatic correction.
- Existing umbrella input steps use $1M increments.

### Important current boundary

The wage-exposure model is an illustrative cumulative proxy. Actual garnishment rules and actual exposed assets vary by jurisdiction, judgment type, ownership structure, exemptions, and policy terms. The tool does not determine legal collectability or insurance coverage for a specific claim.

---

## 4. Disability Insurance Module

The Disability workspace includes Income Gap, Premium vs. Self-Insured, and Job A vs. Job B views.

### Income Gap calculation

1. Annual earned income grows by the configured annual growth rate.
2. Group LTD gross monthly benefit is:

   > **Group LTD monthly benefit** = the lesser of (**Annual income** × **LTD coverage percentage** ÷ **12**) or the **Monthly cap**

   If no positive cap is entered, the percentage-based amount is used.

3. Taxable LTD is modeled at 70% net. Non-taxable LTD retains its gross amount in the net view.
4. Individual DI is added while the selected benefit period remains active.
5. Net annual income is modeled at 70% of projected gross income.
6. The annual income gap is the positive difference between modeled net income and total modeled benefits.

### COLA behavior

- COLA is available in builder and presentation Income Gap views.
- Enabling COLA applies a 3% annual increase to the individual DI benefit.
- The active COLA model applies a 20% load to the entered individual DI monthly premium for lifetime-expense calculations.
- Changing COLA invalidates the saved Disability output so the chart and dependent metrics recalculate.

### UI updates

- Net and Gross chart views are available.
- The chart includes age and annual-benefit axes and ends at the selected projection age.
- Input controls and metric rails were refitted for presentation mode.
- Income Loss is part of the same vertical metric rail without a separate divider.
- Planning Narrative is builder-only.

---

## Presentation Mode

Presentation mode is a live scenario viewer rather than a second calculation engine.

### Current behavior

- The Back to Builder control is outside the visualization container at the upper-left page edge.
- There is no visible Save as PDF button in presentation mode.
- The module header and tabs were compacted to preserve vertical space for charts and outputs.
- Planning Narrative containers are not rendered in presentation mode.
- Life, Disability Income Gap, and Unemployment provide editable Input Snapshot rails.
- Snapshot edits write to the active scenario and recalculate the displayed module.
- Disability COLA and the Unemployment draggable reserve marker are live in presentation mode.
- Liability currently renders its visualization and outputs without an editable Input Snapshot rail.
- A separate print-only layout remains in the page for browser print workflows, but presentation mode does not expose a dedicated PDF export control.

---

## Calculation Analysis Center

The Analysis Center now supports scenario-specific evidence review.

- Review Scenario options are backed by actual scenarios and clients in the application store.
- Selecting another review updates the snapshot in place and resets the module filter to All Modules.
- Selection does not navigate to the builder, dashboard, or client list.
- The snapshot includes client and scenario identity, scenario status, modules in scope, methodology text, source inputs, assumptions, scalar outputs, and calculated schedules.
- Evidence export uses the currently selected scenario snapshot.

---

## Verification Status

The revision summary was audited against the implementation on June 22, 2026.

Current automated checks:

- `npm run build`: TypeScript validation and production Vite build.
- `npm run test:formulas`: targeted regression checks for Life income replacement, Unemployment reserve tiers and transition offsets, and Liability coverage/rounding plus the advisor wage-exposure example.

Current test limitations:

- The repository does not currently contain a browser end-to-end test suite.
- There is no automated visual-regression suite for dark/light or responsive layouts.
- The formula regression script does not yet include Disability calculation examples.
- Manual advisor and compliance review is still required for methodology, terminology, and client-facing suitability.

---

## Recommended Review Focus

1. Decide whether the visible Life Safe Income Capital Gap or the broader saved Life summary gap should be authoritative across scenario cards, exports, and presentation print summaries.
2. Confirm the Liability cumulative wage-exposure proxy and the assets considered at risk.
3. Confirm whether the Disability 70% net-income/taxable-benefit proxy and 20% COLA premium load match the intended methodology.
4. Confirm that Unemployment transition offsets should affect only the search-period analysis, not the base reserve targets.
5. Decide whether Liability should receive editable presentation inputs like the other three modules.
6. Add browser interaction, visual-regression, and Disability formula tests before treating the UI and methodology as release-final.
