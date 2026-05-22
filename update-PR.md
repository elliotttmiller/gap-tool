# AGENT ROLE & IMPLEMENTATION PROMPT
## Income Gap Analysis Tool — Life Insurance Page Update
### Full End-to-End Build, Refinement & Integration Instructions

---

## YOUR ROLE

You are a **Senior Full-Stack Financial UI/UX Engineer** specializing in life insurance planning tools and interactive financial dashboards. You have deep expertise in data visualization, actuarial logic, and client-facing financial applications.

Your mission is to **build, refine, and fully integrate** two new Income Gap Analysis modules and their corresponding chart visualizations into the existing Life Insurance page. You must implement every detail with precision — from the chart rendering logic to the summary metric boxes — ensuring the math is airtight, the UX is intuitive, and the output is production-ready.

Do **not** skip steps. Do **not** assume. If something is ambiguous, implement the most financially sound and user-friendly interpretation and document your reasoning inline.

---

## CONTEXT & BACKGROUND

This tool is part of a **Life Insurance planning/sales page** designed to help financial advisors and clients visualize the **income replacement gap** a surviving spouse or beneficiary would face if the insured were to pass away.

The tool currently has a chart and some coverage bar logic. You will be **modifying and extending** it with two distinct analysis scenarios, each with their own chart visualization and a set of 5 metric summary boxes.

**Core Philosophy:**
- Use **NET income only** throughout all calculations. Life insurance death benefits are tax-free (already net), so no gross-to-net conversion is needed on the benefit side.
- Remove or hide any existing "coverage bars" from the chart. The new charts show only the relevant withdrawal rate bars.
- The tool must be **visually clear**, showing clients exactly where their income gap exists and how much life insurance death benefit is needed to fill it.

---

## WHAT YOU ARE BUILDING

There are **two separate scenario modules**, each with:
1. A distinct **chart visualization**
2. A set of **5 metric summary boxes**

These two modules may be displayed as **tabs, toggle sections, or side-by-side panels** — choose the layout that best serves clarity and UX on the Life Insurance page.

---

---

# ═══════════════════════════════════════
# MODULE 1 — SAFE WITHDRAWAL RATE SCENARIO
# ═══════════════════════════════════════

## Chart — "Safe W/D Rate"

### Visual Description:
- Bar chart where each bar represents **one year** from the current age to **Age 65**
- Each bar is the same height (flat/even across all years) — representing a **consistent, sustainable annual safe withdrawal amount**
- The bars should be labeled or styled to reflect the "Safe Withdrawal Rate" (e.g., 4% rule or configurable rate)
- The chart's x-axis = years (age progression to 65); y-axis = dollar amount
- **Remove all existing "coverage bars"** — the chart should ONLY show the Safe W/D Rate bars
- Use a clear, distinct color for these bars (e.g., a solid professional blue or green — consistent with the page's design system)
- The flat-top visual across all bars is intentional: it communicates that this income stream is **steady and reliable each year**

### Chart Notes:
- The bars reflect the **same annual dollar amount repeated each year** until Age 65
- This is NOT a growth curve — it is a flat, predictable income floor
- Add a clear chart title: **"Safe Withdrawal Rate — Annual Income to Age 65"**
- Tooltip on hover: show year, age, and dollar amount for that bar

---

## Module 1 — 5 Summary Metric Boxes

Place these boxes adjacent to or below the chart, numbered 1–5 in order.

---

### BOX 1 — Projected Net Income to Age 65 (Total)
- **Label:** `Projected Net Income to Age 65 (Total)`
- **Calculation:** Sum of all projected annual NET income from current age to age 65
- **Definition:** This is what the client/insured **currently has** — their total expected net earnings over their working years remaining
- **Display:** Large dollar figure (formatted: $X,XXX,XXX)
- **Note to Agent:** Use NET income only. Do not include gross. This is the baseline "what you have" figure.

---

### BOX 2 — Safe W/D Rate to Age 65
- **Label:** `Safe Withdrawal Rate to Age 65`
- **Calculation:** The **annual safe withdrawal dollar amount** (same figure repeated each year, matching the flat bars in the chart)
- **Definition:** Shows the annual rate/amount that will be consistently available each year — this is the same value shown in the chart bars
- **Display:** Annual dollar figure (e.g., `$XX,XXX / year`) — NOT a total, just the per-year amount
- **Note to Agent:** This should be a **consistent, equal amount each year**. It represents a sustainable, predictable income stream. The rate (e.g., 4%) should be configurable or pulled from existing tool inputs.

---

### BOX 3 — Total Income Replaced
- **Label:** `Total Income Replaced`
- **Calculation:** **(Sum) of all the Safe W/D Rate bars in the chart** — i.e., `Annual Safe W/D Amount × Number of Years to Age 65`
- **Definition:** The total dollar amount the survivor/beneficiary **would actually receive** from the safe withdrawal strategy over all years
- **Display:** Large dollar figure (formatted: $X,XXX,XXX)
- **Note to Agent:** This is the cumulative total of the flat bars — the "bottom" or "green" area of the chart. It represents the total income that CAN be replaced.

---

### BOX 4 — Survivor Gap
- **Label:** `Survivor Gap`
- **Calculation:** `Box 1 − Box 3` (Projected Net Income to 65 MINUS Total Income Replaced)
- **Definition:** The **shortfall** — how much income the surviving spouse/beneficiary will NOT receive compared to what the insured would have earned
- **Display:** Dollar figure, styled prominently in **red or warning orange** to indicate a deficit. If negative (gap exists), show as a loss figure. If zero or positive, show in green.
- **Formula on screen:** Optionally display `Box 1 – Box 3 = Survivor Gap` as a sub-label for transparency

---

### BOX 5 — Death Benefit Needed
- **Label:** `Death Benefit Needed`
- **Calculation:** The amount of **Life Insurance death benefit required** to fill the Survivor Gap (Box 4), accounting for **ROI/investment return** on the lump sum death benefit
- **Formula:** Reverse-engineer the death benefit using a present value or capital needs analysis:
  - The death benefit is invested at a given rate of return (ROI — configurable, default suggested: 5–6%)
  - The goal is for that invested lump sum to generate enough annual income to close the gap over the remaining years
  - **Example shown in notes:** "If you need $3.2M in income replacement, the death benefit needed might be $2M" (because $2M invested at the configured ROI generates $3.2M over time)
- **Display:** Large dollar figure (formatted: $X,XXX,XXX) in a highlighted/accent box — this is the **key sales number**
- **Sub-label:** Show the assumed ROI rate used in the calculation (e.g., `Based on X% ROI`)
- **Note to Agent:** This is the most critical output of the entire module. It directly tells the advisor/client what death benefit amount to recommend. Implement the ROI calculation with precision. Use a configurable ROI input field if one does not already exist on the page.

---

---

# ═══════════════════════════════════════
# MODULE 2 — MAX WITHDRAWAL RATE SCENARIO
# (AKA "FILLING MORE BARS")
# ═══════════════════════════════════════

## Chart — "Max W/D Rate" (AKA "Filling More Bars")

### Visual Description:
- Bar chart where bars represent annual income from current age to **Age 65**
- Unlike Module 1's flat bars, these bars **start tall (full income replacement) and then truncate** — visually illustrating the point in time when the maximum withdrawal strategy can **no longer sustain full income**
- The first N bars are full height (full income paid out) — then the bars drop to zero or a lower level, showing **the years of full income coverage** the max strategy provides
- The "green" bars (years where full income IS covered) are visually distinct from years where it is NOT
- Add a clear chart title: **"Max Withdrawal Rate — Years of Full Income Coverage"**
- Tooltip on hover: year, age, dollar amount, and status (Covered / Gap)
- **Key visual story:** The chart shows the client exactly how many years of full income the max strategy covers before running out

### Chart Notes:
- This is sometimes called "Filling More Bars" — the idea is you're drawing down aggressively to fill as many full-income years as possible
- The **number of bars that are "full"** is the key metric (feeds into Box 2)
- Color: Full-coverage bars = **green**; Gap years (if any before 65) = **red or empty**

---

## Module 2 — 5 Summary Metric Boxes

---

### BOX 1 — Projected Net Income to Age 65 (Total)
- **Label:** `Projected Net Income to Age 65 (Total)`
- **Calculation:** Identical to Module 1, Box 1 — same total projected net income figure
- **Note to Agent:** This should be the same data source/calculation as Module 1 Box 1. Do not recalculate separately — share the same input/state.

---

### BOX 2 — Years of Max W/D Rate
- **Label:** `Years of Max Withdrawal Rate`
- **Calculation:** The **number of years** the max withdrawal strategy can sustain **full income replacement** before exhausting the asset base
- **Definition:** How many years of full income the chart's "green bars" cover
- **Display:** Number (e.g., `14 Years`) — prominently displayed
- **Chart Link:** This number should match the count of full-height green bars in the chart above — they must stay in sync dynamically
- **Sub-label:** Optionally show the range (e.g., `Ages 32–46 fully covered`)

---

### BOX 3 — Total Income Replaced
- **Label:** `Total Income Replaced`
- **Calculation:** **(Sum) of the "Green" Safe W/D Rate bars** — i.e., the total cumulative income paid out during the covered years only
- **Definition:** The total dollars actually received by the survivor under this strategy
- **Display:** Large dollar figure (formatted: $X,XXX,XXX)
- **Note to Agent:** Only sum the green/covered bars, not the gap years. This is the "green area" total.

---

### BOX 4 — Survivor Gap
- **Label:** `Survivor Gap`
- **Calculation:** `Box 1 − Box 3` (same formula as Module 1)
- **Definition:** The remaining income shortfall after the max strategy is exhausted
- **Display:** Dollar figure in **red/warning** if a gap exists. Green if fully covered.

---

### BOX 5 — Death Benefit Needed
- **Label:** `Death Benefit Needed`
- **Calculation:** **Same as Module 1, Box 5** — same ROI-based capital needs formula applied to this module's Survivor Gap
- **Note to Agent:** The DB Needed calculation method is identical between both modules. The INPUT (the gap amount) will differ, so the output dollar figure will differ — but the formula is the same.
- **Display:** Large dollar figure in a highlighted/accent box

---

---

# ═══════════════════════════════════════
# SHARED LOGIC, INPUTS & GLOBAL RULES
# ═══════════════════════════════════════

## Required Inputs (Configurable — use existing page inputs where they exist, add new fields where they don't):

| Input Field | Description | Default |
|---|---|---|
| Current Age | Client's current age | — |
| Retirement Age | Target age (default: 65) | 65 |
| Annual NET Income | Current annual net income | — |
| Income Growth Rate | Annual income growth rate (%) | 2–3% |
| Safe Withdrawal Rate | % used for Module 1 (e.g., 4%) | 4% |
| Asset Base / Policy Value | The asset/account being drawn from | — |
| Max W/D Rate | % used for Module 2 aggressive strategy | Configurable |
| ROI / Return Rate | Investment return used in DB Needed calc | 5% or 6% |

---

## Calculation Rules:

1. **Always use NET income.** Death benefits are tax-free; no gross conversion needed.
2. **Survivor Gap = Box 1 − Box 3** in both modules. Never invert this.
3. **Death Benefit Needed uses ROI.** Do not display a raw gap as the DB amount — apply the capital needs / present value calculation using the configured ROI rate.
4. **Both charts share the same x-axis** (years to age 65) and the same y-axis scale for comparability.
5. **Module 1 Box 1 and Module 2 Box 1 are always identical** — pull from the same computed value.
6. **Module 2 Box 5 = Module 1 Box 5 methodology** (same formula, different gap input).
7. All dollar figures formatted with commas and `$` prefix. No decimals on large figures unless relevant.
8. All charts must update dynamically when any input changes.

---

## UI/UX Requirements:

- **Both modules must be clearly labeled** (Module 1: "Safe Withdrawal Rate" / Module 2: "Max Withdrawal Rate")
- Present as **tabs or a toggle** at the top of the Income Gap Analysis section so users can switch between scenarios
- Each module's chart and 5 boxes should feel like a **self-contained analysis card**
- Box 5 (Death Benefit Needed) should be the **most visually prominent** element in each module — it's the key advisor takeaway
- Box 4 (Survivor Gap) should use **color-coded styling** (red = gap exists, green = fully covered)
- Charts should have **clean gridlines, axis labels, and hover tooltips**
- The entire section should integrate seamlessly into the existing Life Insurance page design system

---

## Implementation Steps (Execute In Order):

1. **Audit the existing Life Insurance page** — identify current chart component, state management, existing inputs, and any coverage bar logic to be removed
2. **Remove existing coverage bars** from the current chart. Do not remove the chart component itself.
3. **Build the shared calculation engine** (income projections, withdrawal math, gap logic, ROI/DB formula) as a reusable utility/service
4. **Build Module 1** — Safe W/D Rate chart + 5 boxes, wired to shared calculation engine
5. **Build Module 2** — Max W/D Rate chart + 5 boxes, wired to shared calculation engine
6. **Implement tab/toggle UI** to switch between Module 1 and Module 2
7. **Wire all inputs** — ensure all 5 boxes and both charts react live to input changes
8. **Test all edge cases** — zero gap, gap larger than income, very young or old client ages, zero ROI, etc.
9. **Style and polish** — ensure visual consistency with existing page, prominence of DB Needed box, color coding on gap boxes
10. **Code review pass** — verify all formulas, variable names, and logic are clean and documented

---

## Success Criteria:

- [ ] Existing coverage bars are removed from the chart
- [ ] Module 1 (Safe W/D Rate) chart renders flat bars correctly to Age 65
- [ ] Module 2 (Max W/D Rate) chart renders green full-coverage bars + gap years correctly
- [ ] All 10 metric boxes (5 per module) display correct, dynamically calculated values
- [ ] Box 3 in each module correctly sums only the relevant bars from its respective chart
- [ ] Box 4 in each module correctly shows Box 1 minus Box 3
- [ ] Box 5 in each module applies ROI-based capital needs formula, NOT raw gap amount
- [ ] Module 1 Box 1 and Module 2 Box 1 always show the same value
- [ ] Module 2 Box 5 uses same formula as Module 1 Box 5
- [ ] All calculations use NET income only
- [ ] All inputs are configurable and charts/boxes update dynamically
- [ ] Death Benefit Needed (Box 5) is the most visually prominent metric in each module
- [ ] UI integrates cleanly into the existing Life Insurance page

---

*End of Agent Prompt — Income Gap Analysis Tool Update*
*Version 1.0 — Derived from handwritten specification*
