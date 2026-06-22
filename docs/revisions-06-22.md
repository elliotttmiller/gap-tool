# GAP Tool Update Brief

## Advisor Review Summary

This brief summarizes the latest GAP Tool updates for NorthStar advisor review.

The goal of this update is to make the tool easier for advisors to review, easier to explain, and more useful during household risk conversations. The tool remains an illustrative gap-analysis resource. It is intended to support advisor review and discussion, not replace advisor judgment or formal compliance review.

This version focuses on clearer outputs, cleaner module flow, and a better explanation of how each result is being calculated.

---

## Executive Summary

This version improves the tool in four main areas:

1. **Clearer outputs**  
   Module results are easier to read and easier to connect back to the assumptions entered.

2. **Better module flow**  
   Each module places more emphasis on the main numbers advisors are likely to review first.

3. **Improved calculation logic**  
   Several formulas were refined so the tool better reflects the intended planning discussion for each module.

4. **Stronger review structure**  
   Inputs, assumptions, and outputs are easier to review together.

Overall, this version is cleaner, more organized, and better prepared for advisor feedback.

---

## Formula and Logic Updates — Plain-English Overview

The biggest change in this revision is that several modules now explain the gap in a more practical way. The tool is no longer only showing totals. It is doing a better job connecting the household's information to the actual question each module is trying to answer.

At a high level:

- **Life** focuses on whether available coverage and resources can support the modeled income need.
- **Unemployment / Liquidity** focuses on how much monthly expense would need to be replaced if income is reduced.
- **Liability / Lawsuit** focuses on modeled household exposure compared with existing liability protection.
- **Disability** is presented more clearly so gross and net income gaps are easier to review.

The following sections explain the logic changes in a non-technical way.

---

## Module Updates

## 1. Life Module

The Life module was refined to make the income-support analysis easier to follow.

### What changed

- The module presents the modeled income support need more clearly.
- Safe Income Coverage is more closely tied to the capital needed to support the projected income stream.
- Status, income supported, remaining gap, and summary metrics are more consistent with one another.
- Coverage Runway is clearer as a separate scenario.
- Age-by-age results are easier for advisors to review.

### Formula / logic update

Previously, parts of the Life analysis could feel disconnected because different outputs were not always explaining the same concept. The updated logic keeps the main Life outputs tied to one central idea:

> How much support is needed to help replace the modeled income stream, and how much of that need is supported by the coverage and resources entered?

The module now looks at the projected income need over time, applies the selected assumptions, and compares that need against the available coverage and resources. This makes the remaining gap easier to understand because the status, income supported, and capital gap are all based on the same underlying calculation.

Coverage Runway remains separate. That view is meant to show how long available resources may last under the selected assumptions. It should be reviewed as a scenario view, not confused with the main Safe Income Coverage result.

### Why it matters

The Life module should now be easier for advisors to explain and audit. The main outputs are more directly tied to the assumptions selected.

---

## 2. Unemployment / Liquidity Module

The Unemployment / Liquidity module was refined to focus more directly on reserve needs.

### What changed

- The module now emphasizes **Monthly Expense Replacement**.
- Reserve targets are based on the amount of expenses that would need to be replaced.
- The main summary now focuses on:
  - Monthly Expense Replacement
  - Current Savings
  - Current Reserve Runway
  - Ideal Reserve Target
  - Emergency Reserve Shortfall or Excess
- The reserve view is easier to interpret.

### Formula / logic update

The module now starts with a simpler question:

> If income is reduced, how much of the household's monthly expenses still need to be covered?

Instead of treating total monthly expenses as the full reserve need every time, the tool now accounts for remaining household income. The remaining income is subtracted from monthly expenses to estimate the monthly amount that would need to be replaced.

In plain terms:

- Start with monthly expenses.
- Subtract the remaining income that is still available.
- The result is the monthly expense replacement need.
- Compare current savings against that replacement need.
- Show how many months of runway the current savings may provide.

This makes the reserve result more practical because it reflects the household's actual monthly shortfall under the selected assumptions.

### Why it matters

The module gives advisors a clearer way to discuss how long current reserves may last under the selected assumptions.

---

## 3. Liability / Lawsuit Module

The Liability / Lawsuit module was updated to make exposure, current protection, and the remaining gap easier to review.

### What changed

- Wage Garnishment Risk is presented more clearly.
- Other Assets at Risk now better reflects key household assets.
- Total Liability Exposure is easier to understand.
- Unprotected Liability Gap is shown more clearly.
- Umbrella coverage is easier to review in relation to the modeled gap.
- Added helper guidance around auto liability limits.

### Formula / logic update

The Liability module now organizes the analysis around three simpler ideas:

1. **Potential wage exposure**  
   The tool estimates how much future income could be exposed by looking at a portion of disposable income over the projection period.

2. **Other assets at risk**  
   The tool includes household assets such as home equity, taxable or investment accounts, liquid savings, and business ownership value.

3. **Current protection versus modeled exposure**  
   The tool compares the total modeled exposure against existing auto liability and umbrella coverage.

In plain terms:

- Estimate potential wage exposure.
- Add other household assets at risk.
- Compare that total against current liability protection.
- Show the remaining unprotected gap, if any.

Umbrella coverage is easier to review because the result is organized around the gap and common policy increments.

### Why it matters

The Liability / Lawsuit module is now easier for advisors to walk through and explain without overcomplicating the review.

---

## 4. Disability Module

The Disability module received smaller refinements focused on clarity and consistency.

### What changed

- The selected output view is easier to interpret.
- Gross and net disability income gaps are easier to review.
- Key assumptions are easier to review within presentation mode.

### Formula / logic update

The Disability module is focused on the difference between income need and available disability benefits.

In plain terms:

- Start with the household's modeled income need.
- Apply group LTD benefits, including caps and taxable benefit assumptions.
- Add individual disability benefits where entered.
- Show the remaining income gap.
- Allow gross and net views to be reviewed more clearly.

The main change is not a complete new formula. It is a clearer presentation of the disability income gap so advisors can more easily see what is covered, what remains exposed, and which assumptions are driving the result.

### Why it matters

The Disability module is now more consistent with the rest of the tool and easier to include in a complete household review.

---

## Presentation Mode Updates

Presentation mode was improved to better support live review.

### What changed

- Key input assumptions can be viewed alongside the selected module.
- Important inputs can be adjusted during review.
- Module results stay connected to the active scenario data.
- Navigation between modules is cleaner.
- Print and report views were refined.

### Why it matters

Presentation mode now feels more like a working advisor review environment. Advisors can review assumptions, discuss outputs, and move between modules more smoothly.

---

## Review Transparency

The tool now provides a clearer structure for reviewing how results are produced.

### What changed

- Inputs, assumptions, and outputs are easier to review together.
- Module results are easier to inspect in a structured format.
- Supporting documentation was refreshed.
- Validation checks were added for important examples.

### Why it matters

This helps advisors review the tool with more confidence and provides a clearer path for methodology feedback.

---

## Overall Impact

This update moves the GAP Tool closer to a practical advisor review experience.

The most important improvements are:

- Clearer Life income-support analysis.
- More practical Unemployment / Liquidity reserve outputs.
- Better-organized Liability / Lawsuit exposure and gap results.
- More consistent Disability review flow.
- Stronger presentation-mode functionality.
- Better visibility into how assumptions lead to outputs.

The tool remains an illustrative review resource. These updates are intended to support clearer advisor review, stronger feedback, and better future refinement.

---

## Recommended Advisor Review Focus

As this version is reviewed, the most useful advisor feedback will be around these questions:

1. Do the revised outputs show the right numbers first?
2. Do the assumptions match how advisors would explain the analysis?
3. Are the formula explanations clear enough without being overly technical?
4. Are any labels, phrases, or outputs unclear or too strong?
5. Should any outputs be kept internal instead of shown directly to clients?
6. What refinements would make the tool more useful in a real advisor review?

The next round of feedback should focus on methodology, output order, review workflow, and client-facing language.