# GAP Tool — Module Revision & Enhancement Document

**Project:** NorthStar Resource Group — GAP Tool  
**Prepared:** June 17, 2026  
**Scope:** Life Insurance, Liability/Lawsuit, Unemployment modules  
**Status:** In Review — pending developer handoff

---

## How to Use This Document

Each module section is organized into three tiers:

- 🔴 **Critical** — Calculation accuracy issues; fix before any advisor-facing use
- 🟡 **Logic** — Formula refinements, label corrections, and methodology updates
- 🟢 **Visual / UX** — Chart, display, and narrative improvements

Items marked **[Compliance]** require language review before deployment.

---

## Module 1 — Life Insurance

### 1.1 Safe Income Coverage Tab

#### 🔴 Critical — $5M vs. $5.4M Death Benefit Discrepancy

The "Death Benefit Needed" output and the "Fully Covered" threshold are not using a consistent calculation basis. When a user enters $5,000,000 of coverage against a computed need of $5,400,000, the tool shows "Fully Covered" — a contradiction that undermines advisor credibility.

**Root cause candidates to audit (in priority order):**

1. **Income projection base mismatch** — Confirm both the death benefit needed formula and the fully-covered threshold pull from the same compounded income series (`annualIncome × (1.03 ^ year)` summed to age 65). If one uses a quick multiply and the other iterates, they will diverge.

2. **PV discount rate mismatch** — If "death benefit needed" discounts at the PV Reference Rate (e.g., 5%) but the "fully covered" check compares against undiscounted face value, the targets will never align. Identify every place a discount rate is applied and confirm they reference the same input.

3. **Floor/ceiling rounding on threshold** — The "fully covered" flag may be triggered by a rounded comparison (e.g., `resources >= Math.round(targetNeed / 100000) * 100000`). A $400K gap between two numbers is consistent with a rounding band at the $100K level.

4. **Non-qualified asset inclusion** — Confirm that non-qualified assets are added to the coverage pool in the death benefit needed formula AND in the fully-covered threshold check. Exclusion in one path but not the other would cause the targets to diverge by exactly that asset amount.

**Recommended debug step:** Temporarily log `targetCoverageNeed`, `totalResources`, and the comparison result to console with identical inputs. The actual values will identify the source of divergence immediately.

---

#### 🟡 Logic — Safe Withdrawal Rate Overhaul

The current Safe Withdrawal Rate / Max Withdrawal Rate output is conceptually ambiguous and may be conflated with ROI in the codebase. The recommended approach is to reframe this as a **percentage of projected income need** that the death benefit supports.

**Proposed methodology:**

- Safe Withdrawal Rate = `(annualWithdrawal / targetIncomeSupport) × 100`
- Annual withdrawal assumes the death benefit is invested at the asset return rate and drawn down over the remaining years to age 65
- Apply a **3% annual increase** to the withdrawal amount to model cost-of-living adjustments
- Default target income support = **85% of projected income** (configurable via the Income Gap Analysis panel)

**Example:** A $5M death benefit at 6% return over 30 years can support a starting annual withdrawal of approximately $338K, growing at 3%/year. Against an 85% income target of ~$127K (age 35, $150K income), this would show as "fully supported."

**Action required:** Audit whether `maxWithdrawalRate` and `roi` are the same computed value with different labels. If so, remove one and rename the surviving field to `safeWithdrawalRate` with updated display logic.

---

#### 🟡 Logic — Duplicate Metric Card Labels

On the Safe Income Coverage tab, "Target Coverage Need" and "Target Income Support" both display the same dollar value with different labels. This is confusing in an advisor presentation.

**Recommended resolution:**
- Keep **Target Income Support** = total projected income × income replacement % (the full target)
- Redefine **Target Coverage Need** = Target Income Support − Coverage Resources (i.e., the remaining gap, not the total)
- This makes the bottom card row read as: *here is the gap, here is what's backed, here is what's still needed* — a clear narrative sequence

---

#### 🟡 Logic — Annual Bar Chart Distribution of Lump-Sum Coverage

The green coverage band in the Safe Income Coverage chart appears flat across all years, suggesting the $1.3M lump sum is being divided equally across the projection period (`$1.3M ÷ 30 years = $43K/year`). This is inaccurate for two reasons: (1) it does not reflect how a lump sum would actually be drawn down over time, and (2) it misstates early-year vs. late-year coverage.

**Recommended approach:** Display the lump-sum coverage as a separate annotation or reference line rather than embedding it as a per-year green bar. Alternatively, compute a PV-weighted annual equivalent using the asset return rate. Either approach is more accurate than equal division.

---

#### 🟡 Logic — Coverage Runway: Total Income Replaced Label

The Coverage Runway Scenario shows Total Income Replaced as $1,818,634 against an expected sum of approximately $1,719,573 for 10 years of income draws at 3% growth. The ~$99K delta represents investment earnings accrued during the drawdown period.

**Action required:** Update the metric card sub-label from "Covered by resource pool" to "Draws + interest earned during drawdown" to accurately describe what the figure includes.

---

#### 🟡 Logic — Runway Capital Gap: Rate Source Verification

The Runway Capital Gap ($1,917,843) must be discounted at the **PV Reference Rate** (user-entered, default 5%), not the Asset Return Rate (default 6%). These two rates serve distinct purposes:

- **Asset Return Rate** — how the resource pool grows while funding income draws
- **PV Reference Rate** — the discount rate used to express future gap in today's dollars

Confirm in code that the PV calculation for Runway Capital Gap references `pvReferenceRate`, not `assetReturnRate`. A 1% difference at this magnitude produces approximately $180K variance in the displayed gap.

---

#### 🟡 Logic — Years of Full Coverage Boundary Condition

The Coverage Runway tooltip shows Age 44 as the last fully-funded year. Confirm the boundary check uses `>=` rather than `>` when comparing the draw amount to the remaining pool balance. An off-by-one error here will misstate coverage by a full year, which directly affects how the advisor communicates the runway to the client.

---

#### 🟢 Visual — Y-Axis Dead Space (Coverage Runway Chart)

The Y-axis on the Coverage Runway chart is currently fixed at $360K while bars max near $195K at default inputs. This leaves nearly 45% of the chart area empty and visually compresses the data.

**Fix:** Set dynamic Y-axis maximum:

```javascript
const yMax = Math.ceil(maxBarValue * 1.15 / 50000) * 50000;
```

This maintains approximately 15% headroom above the tallest bar and recalculates on every input change.

---

#### 🟢 Visual — Green Band Visibility at High Coverage Percentages

When Coverage Support Rate approaches 90–100%, the red gap portion of each bar becomes a 2–3px sliver that is nearly invisible, especially on smaller screens or in PDF export.

**Fix:** Enforce a minimum pixel height for the gap portion:

```javascript
const gapHeight = Math.max(barHeight * gapRatio, 4); // 4px minimum
```

Stress-test the chart at $5.5M, $6M, and $7M coverage to confirm the visual remains communicative at all levels.

---

#### 🟢 UX — Metric Card Hierarchy

Both tabs display eight metric cards in two equal rows with no visual distinction. The bottom row carries the most important outputs (gap figures, coverage shortfall) but is not visually prioritized over the top row.

**Recommendation:** Apply semantic color to bottom-row gap numbers:
- Gap > $0: use `var(--color-text-danger)` for the dollar value
- Gap = $0 (fully covered): use `var(--color-text-success)`
- No changes to card backgrounds or borders — color on the number only

---

#### 🟢 UX — Planning Narrative Closing Sentence

Both tab narratives are accurate and appropriately disclaimed but end without a concrete next step for the advisor.

**Add to end of each narrative:**

- Safe Income Coverage: *"Entering an additional $X in coverage resources would close this gap."*
- Coverage Runway: *"Increasing coverage resources by $X would extend the fully-funded runway to age Y."*

These are illustrative statements tied to the tool's own outputs, not formal recommendations, and should carry the same existing disclaimer language.

---

#### 🟢 UX — Chart Annotation: Income Growth Rate

Add a small annotation to the Safe Income Coverage chart header indicating the growth assumption, e.g., `+3%/yr assumed`. Clients frequently ask why the income bars grow each year; a single inline label answers the question without requiring an additional legend entry.

---

#### 🟢 UX — Rename "Runway Capital Gap" **[Compliance]**

The label "Runway Capital Gap" is technically accurate but abstract for a client-facing screen.

**Candidate replacements:**
- Additional Capital Needed
- Remaining Gap (Present Value)
- Coverage Shortfall Today

Confirm final label with compliance and advisory team before deployment.

---

## Module 2 — Liability / Lawsuit

### 2.1 Umbrella Coverage — Input Changes

#### 🟡 Logic — Umbrella Increment Correction

Umbrella policies are issued in $1,000,000 increments, not $500,000. The tool must reflect this to avoid displaying coverage amounts that do not correspond to purchasable products.

**Changes required:**

- Round all umbrella coverage displays up to the nearest $1,000,000
- Update the input slider or field to step in $1,000,000 increments
- Update the "Umbrella Needed" output to show the next available $1M block above the calculated gap

**Example:** Calculated gap of $1,300,000 → display "Umbrella Needed: $2,000,000 (next available $1M block)"

---

#### 🟡 Logic / Compliance — Remove "Recommended Umbrella" Language **[Compliance]**

The label "Recommended Umbrella" implies a formal product recommendation, which is outside the scope of an illustrative planning tool.

**Required changes:**
- Remove all instances of "Recommended Umbrella" from labels, tooltips, and narratives
- "Umbrella Needed" is acceptable as it describes a calculated gap, not a product recommendation
- Add a disclosure note near the umbrella output: *"Umbrella policies are typically available in $1,000,000 increments. This output illustrates a coverage gap and is not a formal product recommendation."*

---

#### 🟡 Logic — Wage Garnishment: Disposable Income Basis

The current Wage Garnishment Risk calculation applies the 25% garnishment rate to gross income. Federal garnishment limits apply to **disposable earnings** (gross income minus mandatory deductions: FICA, federal/state income taxes), which produces a materially lower garnishment exposure.

**Correct formula:**

```
disposableIncome = grossIncome × (1 - estimatedTaxRate)
annualGarnishment = disposableIncome × 0.25
totalWageGarnishmentRisk = Σ (annualGarnishment × (1.03 ^ year)) over remaining working years
```

**Estimated tax rate guidance:** Use 35% as a default effective rate for high-income earners (FICA + blended federal/state). This is configurable but should not require the advisor to manually enter a tax rate in a client-facing session.

**Reference example:**
- $300K gross income
- Disposable income at 35% effective rate: $195,000
- Annual garnishment exposure: $48,750
- Over remaining career at 3% growth (age 41 to 65): **$1,678,290**
- Compare to gross-based calculation (~$2,580,000): a $900K overstatement

Add a footnote or tooltip disclosure: *"Wage garnishment calculation based on estimated disposable earnings (gross income minus estimated FICA and income taxes). Actual disposable income may vary."*

---

#### 🟡 Logic — Simplify Optional Asset Inputs

The current optional extended asset inputs include Home Value, Mortgage Balance, and Lawsuit Exposure. These should be simplified:

**Remove:**
- Home Value (separate field)
- Mortgage Balance (separate field)
- Lawsuit Exposure (redundant with the module's core output)

**Replace with:**
- **Home Equity** (single field) — advisors know this number directly; requiring them to calculate it from two inputs adds friction

**Rationale:** Home Equity is the relevant figure for net worth exposure in a lawsuit scenario. Lawsuit Exposure as a separate input is circular — the module is already computing lawsuit exposure from other inputs.

---

### 2.2 Output Display

#### 🟢 Visual — Umbrella Needed: Description Update

Update the sub-label under the Umbrella Needed metric card to include context on policy increments:

> *"Calculated coverage gap — umbrella policies typically issued in $1M blocks"*

This surfaces the increment information at the point of decision without requiring the advisor to read a separate disclosure section.

---

## Module 3 — Unemployment

### 3.1 Ideal Savings Target — Dual-Income Tiered Model

The current module recommends a flat 3–6 month savings range regardless of household income composition. The revised model introduces a **tiered ideal savings target** based on the degree to which remaining household income covers monthly expenses if the primary earner's income is lost.

---

#### 🟡 Logic — Tiered Savings Target Formula

**Inputs required:**
- Primary earner monthly net income (calculated from annual gross at estimated effective tax rate)
- Secondary earner monthly net income (optional — single-income households default to 6 months)
- Monthly household expenses

**Calculation:**

```
remainingIncome = secondaryEarnerMonthlyNetIncome (or 0 if single income)
coverageRatio = remainingIncome / monthlyExpenses
```

**Tier mapping:**

| Coverage Ratio | Ideal Savings Target |
|---|---|
| Less than 33% | 6 months of expenses |
| 33% to less than 50% | 5 months of expenses |
| 50% to less than 67% | 4 months of expenses |
| 67% or greater | 3 months of expenses |

**Logic rationale:** At each tier threshold, remaining income covers approximately 2, 3, or 4 months of expenses independently, making those months of savings genuinely redundant. The tier levels reflect mathematically meaningful breakpoints rather than arbitrary steps.

---

#### 🟡 Logic — Single-Income Default

If no secondary income is entered (or secondary income = $0), the tool defaults to 6 months as the ideal savings target. Display a contextual note:

> *"With a single household income, a 6-month emergency reserve is recommended. If a second income is added to this household, the target may adjust."*

---

#### 🟡 Logic — Reference Example (For QA Validation)

**Inputs:**
- Primary income: $300,000/year → ~$195,000 net → $16,250/month
- Secondary income: $100,000/year → ~$65,000 net → $5,417/month
- Monthly expenses: $20,000

**Calculation:**
- Coverage ratio: $5,417 / $20,000 = 27.1%
- 27.1% < 33% → **Ideal savings target: 6 months**
- Dollar target: $20,000 × 6 = **$120,000**
- Monthly shortfall if primary income lost: $20,000 − $5,417 = **$14,583/month**

This example should be used as a QA test case when implementing the tiered formula.

---

#### 🟡 Logic — Savings Above Ideal Target

Savings in excess of the ideal target amount should be flagged, not penalized, with a contextual nudge:

> *"Savings above $X (your ideal 6-month target) may be better positioned in higher-yielding accounts. Consider moving the excess to a money market or short-duration bond allocation."*

This aligns with the advisory firm's guidance that excess emergency reserves should be redirected to productive accounts rather than sitting in low-yield savings.

---

#### 🟢 Visual — Dynamic Gauge Range

The savings gauge currently displays a static 3–6 month band regardless of household inputs. Update the gauge to reflect the dynamic ideal target from the tiered model:

- Minimum acceptable: 3 months (hard floor)
- Ideal target: computed per tiered formula (3–6 months)
- Above ideal: trigger the excess nudge message

The gauge needle and green zone should update in real time as income and expense inputs change.

---

## Cross-Module — Visual Standards

### Metric Card Color Convention

Apply consistent semantic coloring to all gap/shortfall metric cards across Life Insurance, Liability, and Unemployment modules:

| State | Number color |
|---|---|
| Gap > $0 (unmet need) | `var(--color-text-danger)` |
| Gap = $0 (fully met) | `var(--color-text-success)` |
| Informational (no gap context) | `var(--color-text-primary)` |

Do not change card backgrounds or borders — color applies to the dollar value only.

---

### Planning Narrative Standard

All module planning narratives should follow this structure:

1. **State the gap** — what the illustrative analysis shows
2. **Show what's covered** — resources entered and what they support
3. **Close with a next step** — a concrete, illustrative statement tied to the tool's own outputs
4. **Disclaim** — "This is an illustrative gap analysis, not a formal recommendation."

The closing next-step sentence is the most actionable change and should be added to all three modules in the near term.

---

## Open Items / Pending Decisions

| # | Item | Owner | Status |
|---|---|---|---|
| 1 | Confirm "Recommended Umbrella" removal with compliance | Advisory/Compliance | Pending |
| 2 | Finalize label for Runway Capital Gap (rename options above) | Elliott + Advisory | Pending |
| 3 | Confirm effective tax rate default (35% proposed) for disposable income calc | Advisory | Pending |
| 4 | Decide whether secondary income input is required or optional in Unemployment module | Elliott | Pending |
| 5 | Confirm Safe Withdrawal Rate formula approach with advisory team | Advisory | Pending |
| 6 | QA validation of $5M vs $5.4M discrepancy after debug session | Developer | In Progress |

---

*This document reflects illustrative planning tool enhancements for internal development and advisory review. All module outputs are illustrative gap analyses. No outputs constitute formal financial, legal, or insurance recommendations.*
