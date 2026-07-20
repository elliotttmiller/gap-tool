# GAP Tool Revision Summary

## June 22, 2026

This document summarizes the latest GAP Tool updates for NorthStar advisor review.

The purpose of this revision is to make the tool easier to review, easier to explain, and more useful during household risk conversations. The GAP Tool remains an illustrative gap-analysis resource. It is designed to support advisor discussion and methodology review, not replace advisor judgment, compliance review, or formal recommendations.

---

## Executive Summary

This update improves the tool in four main ways:

1. **Clearer module outputs**  
   The main results are easier to read and easier to connect back to the assumptions entered.

2. **More practical formula logic**  
   Several calculations were refined so the modules better answer the real planning question each section is trying to address.

3. **Improved advisor review flow**  
   The presentation experience is cleaner and better suited for walking through a household scenario.

4. **Better transparency**  
   Inputs, assumptions, and results are easier to review together, which should make advisor feedback more precise.

---

## Formula and Logic Overview

The main formula updates are summarized below in advisor-friendly terms.

- **Life** estimates how much capital is needed to support a projected income stream and compares that amount against available coverage and resources.
- **Unemployment / Liquidity** estimates how much monthly expense would still need to be covered after remaining income is considered.
- **Liability / Lawsuit** estimates modeled exposure from wages and assets, then compares that exposure against current liability protection.
- **Disability** compares modeled income need against available group and individual disability benefits.

The formulas below are written in plain English so advisors can review the logic without needing behind-the-scenes detail.

---

## 1. Life Module

The Life module was refined to make the income-support analysis easier to follow.

### What changed

- The modeled income support need is presented more clearly.
- Safe Income Coverage is more closely tied to the capital needed to support the projected income stream.
- Coverage status, income supported, remaining gap, and summary metrics are more consistent with each other.
- Coverage Runway is clearer as a separate scenario view.
- Age-by-age results are easier to review.

### Formula / logic summary

The Life module is organized around this question:

> How much income support is needed, and how much of that need is supported by the coverage and resources entered?

The logic now works as follows:

1. **Modeled annual income need**  
   Annual Income x Income Replacement Percentage, minus any spouse or partner income entered.

2. **Projected income need over time**  
   The annual income need is projected forward through the selected end age using the income growth assumption.

3. **Capital required today**  
   The projected income support stream is converted into a present-day capital amount using the selected reference rate.

4. **Available coverage resources**  
   Group Life Coverage + Private Life Coverage + Modeled Available Assets.

5. **Remaining capital gap**  
   Capital Required Today - Available Coverage Resources. If available resources meet or exceed the capital required amount, the remaining gap is shown as zero.

6. **Coverage support status**  
   The tool compares available resources against the capital required amount to show whether the modeled income support need appears fully covered, partially covered, or still has a gap.

### Coverage Runway

Coverage Runway remains a separate scenario. It shows how long available resources may last if used to support annual income needs over time. It should be reviewed as a scenario view, not as the main Safe Income Coverage result.

### Advisor review value

The Life module should now be easier to explain because the main outputs are tied to the same income-support logic.

---

## 2. Unemployment / Liquidity Module

The Unemployment / Liquidity module was refined to focus more directly on reserve needs.

### What changed

- The module now emphasizes Monthly Expense Replacement.
- Reserve targets are based on the amount of monthly expenses that would need to be replaced.
- The main summary focuses on Current Savings, Current Reserve Runway, Ideal Reserve Target, and Emergency Reserve Shortfall or Excess.
- The reserve view is easier to interpret.

### Formula / logic summary

The Unemployment / Liquidity module is organized around this question:

> If household income is reduced, how much monthly expense still needs to be covered by reserves?

The logic now works as follows:

1. **Remaining monthly income**  
   The tool estimates the income that may still be available in the household after the higher income is removed.

2. **Monthly Expense Replacement**  
   Monthly Expenses - Remaining Monthly Income.

3. **Current Reserve Runway**  
   Current Emergency Savings divided by Monthly Expense Replacement.

4. **Reserve target**  
   The reserve target is based on the monthly expense replacement amount, not simply total household expenses.

5. **Ideal Reserve Target**  
   Monthly Expense Replacement x Target Number of Months.

6. **Emergency Reserve Shortfall or Excess**  
   Ideal Reserve Target - Current Savings. If savings are above the target, the tool shows the excess rather than a shortfall.

### Advisor review value

The module gives advisors a clearer way to review how long current reserves may last under the selected assumptions.

---

## 3. Liability / Lawsuit Module

The Liability / Lawsuit module was updated to make exposure, current protection, and remaining gap easier to review.

### What changed

- Wage Garnishment Risk is presented more clearly.
- Other Assets at Risk better reflects key household assets.
- Total Liability Exposure is easier to understand.
- Unprotected Liability Gap is shown more clearly.
- Umbrella coverage is easier to review in relation to the modeled gap.
- Helper guidance was added around auto liability limits.

### Formula / logic summary

The Liability / Lawsuit module is organized around this question:

> What is the modeled household exposure, and how much of it is not currently protected by existing liability coverage?

The logic now works as follows:

1. **Potential wage exposure**  
   Gross household income is converted to an estimated disposable income amount. A portion of that disposable income is then modeled as potential wage exposure through the projection period.

2. **Other Assets at Risk**  
   Home Equity + Taxable or Investment Accounts + Liquid Savings + Business Ownership Value.

3. **Total Liability Exposure**  
   Potential Wage Exposure + Other Assets at Risk.

4. **Current Liability Protection**  
   Auto Liability Coverage + Existing Umbrella Coverage.

5. **Unprotected Liability Gap**  
   Total Liability Exposure - Current Liability Protection. If current protection meets or exceeds modeled exposure, the remaining gap is shown as zero.

6. **Umbrella review amount**  
   When there is a remaining gap, the tool frames the gap in relation to common umbrella coverage increments.

### Advisor review value

The Liability / Lawsuit module is now easier to walk through because the main exposure categories are clearer and the remaining gap is easier to explain.

---

## 4. Disability Module

The Disability module received smaller refinements focused on clarity and consistency.

### What changed

- The selected output view is easier to interpret.
- Gross and net disability income gaps are easier to review.
- Key assumptions are easier to review in presentation mode.

### Formula / logic summary

The Disability module is organized around this question:

> If earned income is reduced by disability, how much of the income need is covered by benefits, and what gap remains?

The logic works as follows:

1. **Modeled income need**  
   The tool starts with the household's modeled earned income need.

2. **Group LTD benefit**  
   Group LTD is calculated using the entered coverage percentage and monthly cap. If the benefit is taxable, the taxable-benefit assumption is applied.

3. **Individual disability benefit**  
   Any entered individual disability benefit is added to the available benefit amount.

4. **Remaining disability income gap**  
   Modeled Income Need - Available Disability Benefits.

5. **Gross and net views**  
   The output can be reviewed from both gross and net perspectives so advisors can see the difference between pre-tax and after-tax income gaps.

### Advisor review value

The Disability module is now more consistent with the rest of the tool and easier to include in a complete household review.

---

## Presentation Mode Updates

Presentation mode was improved to better support live advisor review.

### What changed

- Key input assumptions can be viewed alongside the selected module.
- Important inputs can be adjusted during review.
- Module results stay connected to the active scenario data.
- Navigation between modules is cleaner.
- Print and report views were refined.

### Advisor review value

Presentation mode now feels more like a working review environment. Advisors can review assumptions, discuss outputs, and move between modules more smoothly.

---

## Review Transparency

The tool now provides a clearer structure for reviewing how results are produced.

### What changed

- Inputs, assumptions, and outputs are easier to review together.
- Module results are easier to inspect in a structured format.
- Supporting documentation was refreshed to match the current module behavior.
- Important formula examples were checked against expected results.

### Advisor review value

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
3. Are the formula explanations clear enough without being overly detailed?
4. Are any labels, phrases, or outputs unclear or too strong?
5. Should any outputs be kept internal instead of shown directly to clients?
6. What refinements would make the tool more useful in a real advisor review?

The next round of feedback should focus on methodology, output order, review workflow, and client-facing language.