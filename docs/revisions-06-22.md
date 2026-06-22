# GAP Tool Update Brief

## Advisor Review Summary

This brief summarizes the latest GAP Tool updates for NorthStar advisor review.

The goal of this update is to make the tool easier for advisors to review, easier to explain, and more useful during household risk conversations. The tool remains an illustrative gap-analysis resource. It is intended to support advisor review and discussion, not replace advisor judgment or formal compliance review.

This version focuses on clearer outputs, cleaner module flow, and a better plain-English explanation of how each result is being calculated.

---

## Executive Summary

This version improves the tool in four main areas:

1. **Clearer outputs**  
   Module results are easier to read and easier to connect back to the assumptions entered.

2. **Better module flow**  
   Each module places more emphasis on the main numbers advisors are likely to review first.

3. **Improved formula logic**  
   Several calculations were refined so the results better match the intended planning discussion for each module.

4. **Stronger review structure**  
   Inputs, assumptions, and outputs are easier to review together.

Overall, this version is cleaner, more organized, and better prepared for advisor feedback.

---

## Formula and Logic Updates - Advisor-Friendly Overview

This update adds clearer logic behind the numbers shown in each module. The goal is not to overload the review with technical detail. The goal is to make it easier to see what each module is solving for.

At a high level:

- **Life** estimates the income support need and compares it against available coverage and resources.
- **Unemployment / Liquidity** estimates how much monthly expense would need to be replaced and how long current reserves may last.
- **Liability / Lawsuit** estimates possible exposure and compares it against existing liability protection.
- **Disability** compares income need against group LTD and individual disability benefits.

---

## Module Updates

## 1. Life Module

The Life module was refined to make the income-support analysis easier to follow.

### What changed

- The modeled income support need is presented more clearly.
- Safe Income Coverage is more closely tied to the capital needed to support the projected income stream.
- Status, income supported, remaining gap, and summary metrics are more consistent with one another.
- Coverage Runway is clearer as a separate scenario.
- Age-by-age results are easier for advisors to review.

### Formula / logic update

The Life module is now organized around one core question:

> How much income support is needed, and how much of that need is supported by the coverage and resources entered?

Plain-English formula flow:

1. **Modeled annual income need**  
   Annual Income x Income Replacement Percentage, minus any spouse/partner income entered.

2. **Projected income need over time**  
   The annual income need is projected forward through the selected end age using the income growth assumption.

3. **Capital required today**  
   The projected income support stream is translated into a present-day capital amount using the selected reference rate.

4. **Available coverage resources**  
   Group life coverage + private life coverage + modeled available assets.

5. **Remaining capital gap**  
   Capital required today - available coverage resources. If resources meet or exceed the need, the remaining gap shows as zero.

6. **Income support status**  
   The tool compares available coverage resources against the capital required amount to show whether the modeled income support need appears fully covered, partially covered, or still has a gap.

Coverage Runway remains separate. It shows how long the entered resources may last if they are used to support annual income needs over time. It should be reviewed as a scenario view, not confused with the main Safe Income Coverage result.

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

The Unemployment / Liquidity module is now organized around this core question:

> If household income is reduced, how much monthly expense still needs to be covered by reserves?

Plain-English formula flow:

1. **Estimate remaining monthly income**  
   The tool looks at the income that may still remain available in the household after the higher income is removed.

2. **Monthly Expense Replacement**  
   Monthly Expenses - Remaining Monthly Income.

3. **Current Reserve Runway**  
   Current Emergency Savings divided by Monthly Expense Replacement.

4. **Reserve target**  
   The reserve target is based on the monthly expense replacement amount, not simply total household expenses.

5. **Ideal Reserve Target**  
   Monthly Expense Replacement x the selected target month range.

6. **Emergency Reserve Shortfall or Excess**  
   Ideal Reserve Target - Current Savings. If current savings are above the target, the tool shows the excess instead of a shortfall.

This makes the reserve result more practical because it reflects the household's estimated monthly shortfall under the selected assumptions.

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

The Liability / Lawsuit module is now organized around this core question:

> What is the modeled household exposure, and how much of it is not currently protected by existing liability coverage?

Plain-English formula flow:

1. **Potential wage exposure**  
   Gross income is converted to an estimated disposable income amount. A portion of that disposable income is then modeled as potential wage exposure through the selected projection period.

2. **Other Assets at Risk**  
   Home equity + taxable/investment accounts + liquid savings + business ownership value.

3. **Total Liability Exposure**  
   Potential wage exposure + Other Assets at Risk.

4. **Current Liability Protection**  
   Auto liability coverage + existing umbrella coverage.

5. **Unprotected Liability Gap**  
   Total Liability Exposure - Current Liability Protection. If current protection meets or exceeds the modeled exposure, the remaining gap shows as zero.

6. **Umbrella review amount**  
   When there is a remaining gap, the tool helps frame the gap in relation to common umbrella coverage increments.

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

The Disability module is organized around this core question:

> If earned income is reduced by disability, how much of the income need is covered by benefits, and what gap remains?

Plain-English formula flow:

1. **Modeled income need**  
   The tool starts with the household's modeled earned income need.

2. **Group LTD benefit**  
   Group LTD is calculated using the entered coverage percentage and monthly cap. If the benefit is taxable, the tool applies the taxable benefit assumption.

3. **Individual disability benefit**  
   Any entered individual disability benefit is added to the available benefit amount.

4. **Remaining disability income gap**  
   Modeled income need - available disability benefits.

5. **Gross and net views**  
   The output can be reviewed from both gross and net perspectives so advisors can understand the difference between pre-tax and after-tax income gaps.

The main change is not a complete new disability formula. It is a clearer presentation of what is covered, what remains exposed, and which assumptions are driving the result.

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