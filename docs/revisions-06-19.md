# Revision Overview - June 19, 2026

This file summarizes the updates and revisions made when comparing commit `017f285eed6bffeb6afcfdfdf3fca9f633714cbc` to commit `86c0f78f7d2836686a7286ba1ae3850647465f0c`.

## Comparison

- **Starting version:** `017f285eed6bffeb6afcfdfdf3fca9f633714cbc`
- **Updated version:** `86c0f78f7d2836686a7286ba1ae3850647465f0c`
- **Scope of change:** 19 commits across module calculations, module outputs, presentation mode, documentation, theme support, and verification tooling.

The updated version continues the advisor-alignment pass. It keeps the same core application structure, but improves how module calculations are explained, verified, displayed, and presented.

---

## High-Level Summary

The main revisions between these versions are:

1. **Life Insurance calculations were refined** so income replacement and target income support are handled more clearly and consistently.
2. **Unemployment reserve logic was updated** to use monthly expense replacement after remaining spousal net income, with a tiered 3-6 month ideal reserve target.
3. **Liability calculations were tightened** around disposable-income wage garnishment, other assets at risk, umbrella need, and policy-block rounding.
4. **Presentation mode was expanded** so advisors can view and adjust key input snapshots while reviewing module outputs.
5. **A Calculation Analysis Center was strengthened** to give a clearer audit trail from inputs to formulas to outputs.
6. **Formula verification tooling was added** so key advisor examples can be tested directly from the command line.
7. **Documentation and module wiring references were refreshed** to make the current methodology easier to review.

---

## 1. Life Insurance Revisions

The Life Insurance module received important logic and output refinements.

### Main changes

- Safe Income Coverage continues to use a present-value capital-required model for the projected income support stream.
- The calculation now separates the **income replacement ratio** from the **target income support percentage**, instead of allowing one percentage to unintentionally stand in for the other.
- The annual schedule now labels projected periods by the age reached at the end of each annual period, making the projection timeline easier to interpret.
- Coverage Runway was clarified as a resource drawdown model that attempts to fund annual projected income from the available resource pool.
- Life output cards and charts now support age-level selection, allowing a reviewer to inspect annual income need, income supported, income gap, and cumulative gap for a selected age.

### Practical impact

The Life module is now better suited for advisor review because the displayed income-support outputs are more traceable to the underlying calculation assumptions.

---

## 2. Unemployment / Liquidity Revisions

The Unemployment module was revised around a clearer reserve methodology.

### Main changes

- The module now calculates **Monthly Expense Replacement** as monthly expenses minus the lower remaining net income.
- The reserve target is now based on that replacement need instead of full household expenses.
- The model keeps a 3-month minimum reserve reference and uses a tiered 3-6 month ideal target based on how much income remains after the higher income is removed.
- Output metrics were reorganized around the most important reserve-planning numbers:
  - Monthly Expense Replacement
  - Current Savings
  - Current Reserve Runway
  - Ideal Reserve Target
  - Emergency Reserve Shortfall or Excess
- The reserve visual now focuses on danger, minimum, ideal, and above-target reserve zones.

### Practical impact

The Unemployment module now better reflects the household's actual monthly replacement need after accounting for remaining spousal income. This makes the reserve result more useful than a simple expenses-only calculation.

---

## 3. Liability / Lawsuit Revisions

The Liability module was refined to better match the advisor's lawsuit and umbrella-analysis notes.

### Main changes

- Wage garnishment exposure continues to use a disposable-income proxy rather than gross income.
- Annual wage exposure is now labeled by the age reached at the end of each projection year.
- Other Assets at Risk are based on entered home equity, investment/taxable accounts, liquid savings, and business ownership value, with legacy non-qualified assets used only as a fallback.
- Added a clearer **Needed Umbrella Coverage** calculation that rounds the remaining liability gap up to the next $1M umbrella block.
- Liability output labels were clarified around:
  - Wage Garnishment Risk
  - Other Assets at Risk
  - Total Liability Exposure
  - Unprotected Liability Gap
  - Additional Umbrella to Review
- The auto liability input received helper guidance so advisors can confirm they are entering the correct policy limit.
- The liability chart now more clearly separates auto coverage, umbrella coverage, and unprotected gap.

### Practical impact

The Liability module is now easier to audit because total exposure, current coverage, remaining gap, and umbrella-block logic are more directly connected.

---

## 4. Disability Revisions

The Disability module received smaller output and calculation refinements.

### Main changes

- Disability gap calculations were lightly adjusted for more consistent annual-gap behavior.
- Output displays were simplified so the selected view is easier to interpret.
- Disability assumptions can now be reviewed or adjusted more directly inside presentation workflows.

### Practical impact

The Disability module did not receive the same level of methodology change as Life, Unemployment, or Liability, but its output flow is now more consistent with the broader advisor-review experience.

---

## 5. Presentation Mode Revisions

Presentation mode was expanded significantly.

### Main changes

- Advisors can now see an input snapshot beside the selected module during presentation review.
- Several key inputs can be adjusted from the presentation view, including Life, Disability, and Unemployment inputs.
- Presentation mode recalculates module results from the current scenario data, keeping outputs tied to the visible input snapshot.
- Module navigation and printed report behavior were improved.
- The print/export view still includes module sections and disclaimer content.

### Practical impact

Presentation mode is now closer to a live advisor-review workspace instead of only a static display page. Advisors can review assumptions, adjust key values, and immediately see the effect on module results.

---

## 6. Calculation Analysis Center and Audit Trail

The Analysis Center was improved to make formulas, inputs, outputs, and schedules easier to inspect.

### Main changes

- Added clearer module formula versions.
- Added better formatting for exact input and output values.
- Added formula descriptions, assumptions, disclosures, and schedule tables.
- Improved scenario/module filtering and export support.
- Added a generated JSON export under `docs/` for calculation evidence and review.

### Practical impact

The app now has a stronger audit path. A reviewer can trace how entered data flows through formulas and into displayed results without needing to inspect the source code directly.

---

## 7. Formula Verification Tooling

A new formula verification script was added.

### Main changes

- Added `scripts/verify-advisor-formulas.ts`.
- Added `npm run test:formulas` to `package.json`.
- The script checks key advisor-aligned examples for Life, Unemployment, and Liability.
- Liability verification now includes the advisor wage-garnishment example for a $300,000 income, age 41, projected to age 65.

### Practical impact

The project now has a simple regression-check path for important advisor formulas. This helps reduce the risk of future updates silently breaking key calculation logic.

---

## 8. Documentation Updates

Several documentation files were refreshed.

### Main changes

- Formula references were updated to match the revised module logic.
- Advisor module revision notes were adjusted.
- Module input/metric wiring documentation was regenerated and refreshed.
- Product and technology documentation received small consistency updates.
- A generated export file was added under `docs/` for review and traceability.

### Practical impact

The documentation is now more closely aligned with the implemented module behavior and easier to use during advisor or developer review.

---

## 9. Theme and Interface Support

Although the main purpose of this revision was methodology and output alignment, the version also includes interface support work.

### Main changes

- Added or refined persistent Light, Dark, and System theme support.
- Updated shared card, drawer, dropdown, select, collapsible-section, and layout components for better consistency.
- Improved print and presentation styles.

### Practical impact

These changes make the app more consistent across presentation, builder, and print contexts. They are secondary to the calculation and output revisions but support a cleaner advisor-review experience.

---

## Overall Result

Compared with `017f285eed6bffeb6afcfdfdf3fca9f633714cbc`, commit `86c0f78f7d2836686a7286ba1ae3850647465f0c` makes the app more complete, auditable, and advisor-ready.

The most important improvements are:

- More consistent Life Insurance income-support logic.
- More useful Unemployment reserve calculations based on replacement need.
- Clearer Liability exposure and umbrella-block calculations.
- Stronger presentation-mode workflows.
- Better formula documentation and regression checks.
- A more complete calculation audit trail.

The codebase remains the same core application, but the newer version is better aligned for advisor testing, methodology review, and future refinement.