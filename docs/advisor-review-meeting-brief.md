# Advisor Review Meeting Brief

**Project:** GAP Tool  
**Audience:** NorthStar advisors / internal review team  
**Purpose:** Guide a top-to-bottom advisor review of the current application so feedback improves the tool's logic, workflow, assumptions, labels, and presentation quality.

---

## 1. Meeting Objective

The goal of this review is not only to confirm that the app works technically. The more important objective is to confirm that the tool reflects how advisors actually want to analyze, explain, and present client protection gaps.

Use this meeting to validate:

- Whether each module's calculation logic matches advisor methodology.
- Whether default assumptions are appropriate.
- Whether labels and narratives are compliant, advisor-friendly, and client-understandable.
- Whether the workflow matches how an advisor would run a real client review.
- Whether the presentation output shows the right numbers in the right order.

The tool should remain an illustrative gap-analysis system, not a formal recommendation engine.

---

## 2. Recommended Live Walkthrough

Walk the advisors through the app exactly as they would use it with a real household.

1. Create a new client profile.
2. Enter core household information.
3. Enter life insurance inputs.
4. Enter disability insurance inputs.
5. Enter unemployment/liquidity inputs.
6. Enter liability/umbrella inputs.
7. Generate the household risk review.
8. Review each module output.
9. Adjust module assumptions live.
10. Open presentation mode / report view.
11. Ask advisors what felt accurate, confusing, unnecessary, or missing.

Primary question during walkthrough:

> If you were using this with a real client, where would the workflow feel natural, and where would it slow you down or create confusion?

---

## 3. Core Product Questions for Advisors

Ask these before going module by module.

1. Should this tool primarily be an internal advisor calculator, a client-facing presentation tool, or both?
2. Should the initial client setup collect all module inputs at once, or should each module have its own guided input workflow?
3. Which outputs should be visible to clients, and which should remain advisor-only?
4. Should the tool always generate all modules, or should advisors select only the modules relevant to the client?
5. What wording should we avoid for compliance reasons?
6. What wording feels natural in an advisor-client conversation?
7. Should each module show formulas/assumptions, or only the final analysis outputs?
8. What is the one number the client should remember from each module?

---

## 4. Life Insurance Module Validation Questions

Use this section to confirm that the Life Insurance module is wired around the correct advisor logic.

### Logic and Assumptions

1. What should be the primary Life Insurance output: total death benefit needed, annual survivor income supported, survivor income gap, or years of coverage runway?
2. Should the tool default to a specific income replacement percentage, or should advisors manually select this for every client?
3. Is 70% income replacement the right default, or should the default differ by income level, household type, or advisor preference?
4. Should the Safe Income Coverage target default to 85% of projected income need, or should that be configurable per advisor/team?
5. Should spouse/partner income automatically reduce the survivor income need, or should advisors decide whether to include it case by case?
6. Should non-qualified assets automatically count as available survivor resources, or should that be an optional advisor-controlled toggle?
7. Should the calculation assume death benefit is invested and drawn down over time, or should it show a simpler lump-sum gap first?
8. Should the projection stop at retirement age, age 65, age 67, or a custom advisor-selected age?

### Workflow and Presentation

1. Should Safe Income Coverage be the main Life Insurance view, or should Coverage Runway be the main client-facing view?
2. Should the tool show both Safe Income Coverage and Coverage Runway, or would that create confusion for clients?
3. Should the advisor be able to hide advanced assumptions before showing the module to a client?
4. Should the module present the gap as a dollar amount, percentage covered, years covered, or all three?
5. What wording is best: "Death Benefit Needed," "Additional Coverage Needed," "Modeled Protection Gap," "Capital Shortfall," or something else?
6. When the client is close to fully covered, should the tool show the exact remaining gap or use softer language?

### Advisor Decision Needed

Confirm the preferred Life Insurance output hierarchy. Recommended structure:

1. Projected income need.
2. Existing coverage/resources.
3. Income supported.
4. Survivor gap.
5. Additional coverage/capital needed.
6. Coverage runway as a secondary scenario.

---

## 5. Disability Insurance Module Validation Questions

Use this section to confirm that the Disability Insurance module is wired around the correct advisor logic.

### Logic and Assumptions

1. Should the Disability module default to net income because clients care about spendable income, or should gross and net always be shown together?
2. Should the main Disability output be monthly income gap, lifetime projected gap, or both?
3. Is the current taxable LTD assumption of 70% of gross appropriate as a default?
4. Should taxable/non-taxable LTD be a required advisor confirmation field?
5. Should group LTD be modeled using current income only, or should it scale with projected income until capped?
6. Should the monthly LTD cap remain fixed, or should advisors be able to model cap increases?
7. Should individual DI benefits remain level, or should COLA be modeled by default when applicable?
8. Should COLA be a simple on/off rider toggle, or should advisors enter the exact policy COLA percentage?
9. Should individual DI benefit periods be strictly tied to the policy period, or should advisors be able to override the modeled end age?
10. Should the tool account for employer-paid vs. employee-paid disability premium tax treatment more explicitly?

### Workflow and Presentation

1. Should the first visual show monthly income replacement, annual projection, or lifetime gap?
2. Should clients see the Premium vs. Self-Insured calculator, or should it remain advisor-only?
3. Should Job A vs. Job B comparison remain inside the Disability module, or should it be separated as a planning calculator?
4. Should the module show the current monthly shortfall more prominently than the lifetime gap?
5. Would advisors prefer a simpler three-number summary: current income, protected income, remaining monthly gap?
6. What label is best: "Income Loss," "Income Gap," "Monthly Shortfall," or "Unprotected Income"?

### Advisor Decision Needed

Confirm the preferred Disability Insurance output hierarchy. Recommended structure:

1. Current monthly income need.
2. Group LTD benefit.
3. Individual DI benefit.
4. Remaining monthly gap.
5. Long-term projected gap.
6. Optional premium/self-insured comparison.

---

## 6. Unemployment / Liquidity Module Validation Questions

Use this section to confirm that the Unemployment module reflects how advisors want to talk about liquidity risk.

### Logic and Assumptions

1. Should this module be framed as "Unemployment Risk," "Liquidity Risk," or "Emergency Reserve Analysis"?
2. Should the ideal emergency reserve target be driven by household income concentration, or should advisors use a fixed 3/6/9-month target?
3. Should secondary income automatically reduce the emergency reserve target, or should advisors manually decide whether that income is reliable?
4. Should severance be included by default, or treated as optional because it is uncertain?
5. Should unemployment benefits be included by default, or treated as optional because eligibility and amount may vary?
6. Should the module use gross income, estimated net income, or actual monthly take-home pay?
7. Should the tool assume job search duration by income level, occupation, or advisor input?

### Workflow and Presentation

1. What is the most useful output: reserve gap, months of runway, monthly shortfall, or cash-flow timeline?
2. Should excess emergency savings be flagged as an opportunity, or should the module avoid implying the money should be moved elsewhere?
3. Should this module feel like a risk module or a cash-management planning module?
4. Would advisors want a simple "3-month / 6-month / 12-month" toggle for client conversations?
5. Should the chart focus on reserve depletion over time or on target-vs-current savings?

### Advisor Decision Needed

Confirm whether this module should be optimized for emergency reserve planning, unemployment event modeling, or both.

---

## 7. Liability / Lawsuit Module Validation Questions

Use this section to confirm that the Liability module is wired around the right risk exposure logic and compliant language.

### Logic and Assumptions

1. Should this module be called "Liability / Lawsuit," "Umbrella Coverage Review," "Asset Exposure Analysis," or something else?
2. Should the calculation emphasize assets at risk, wage garnishment exposure, umbrella coverage gap, or all three?
3. Should home equity be included automatically, or should advisors be able to exclude it depending on state/property protections?
4. Should non-qualified assets and investment assets be treated as fully exposed by default?
5. Should business ownership value be included in the base calculation, or only as an optional advanced input?
6. Should wage garnishment exposure be calculated from disposable income, net income, or a more conservative advisor-entered amount?
7. Should umbrella coverage be rounded to $1M blocks only, or should the exact calculated gap also be displayed?

### Workflow and Presentation

1. Should the module show "Umbrella Needed," "Illustrative Umbrella Coverage Level," or another phrase?
2. Should the tool avoid the word "recommended" entirely in this module?
3. Should this module be presented to clients, or used only as an internal advisor awareness tool?
4. Should the output prioritize simplicity over precision because liability exposure varies by state and legal circumstance?
5. Should the module include a stronger legal/compliance disclaimer than the other modules?

### Advisor Decision Needed

Confirm whether the module should remain a broad liability exposure analysis or be narrowed into an umbrella coverage gap review.

---

## 8. Cross-Module Logic Questions

These questions are useful because they determine whether all modules feel like one unified tool rather than separate calculators.

1. Should all modules use the same projection end age?
2. Should all modules use the same income growth assumption?
3. Should assumptions be globally controlled, module-specific, or both?
4. Should advisors be able to save advisor/team-level default assumptions?
5. Should each module have a conservative/base/aggressive scenario option?
6. Should the app preserve changed module inputs when a client profile is edited, or should profile edits reset module inputs?
7. Should the client setup form be the source of truth, or should each module be allowed to override profile data independently?
8. Should the tool show a final household-level risk score or avoid scoring entirely?
9. Should each module include a plain-English explanation of how the result was calculated?
10. Should the tool include a review checklist before presentation mode is opened?

---

## 9. Presentation Mode Questions

Use these questions to validate whether the presentation/report workflow is useful for real meetings.

1. Would advisors use presentation mode live with a client?
2. Should presentation mode show all modules or only advisor-selected modules?
3. Should presentation mode include input assumptions, or only outputs?
4. Should charts be simplified for client presentation?
5. Should there be a separate advisor-detail PDF and client-safe PDF?
6. Should the report include a cover page, assumptions page, module pages, and disclaimer page?
7. Should the tool allow advisors to hide sensitive or confusing metrics before generating a report?
8. Should the report include next-step language, or should advisors handle next steps verbally?

---

## 10. Closing Questions

End the meeting with these questions to force prioritization.

1. What is the one number you would want the client to remember from each module?
2. Which module feels most valuable in its current form?
3. Which module feels least ready for advisor/client use?
4. Which labels or phrases need compliance review before broader use?
5. If we only improve three things before the next version, should we prioritize calculation accuracy, workflow speed, client presentation quality, or compliance wording?
6. What would make this tool useful enough that you would actually use it in a real client review?

---

## 11. Recommended Feedback Capture Format

During the meeting, capture feedback in this structure:

| Area | Advisor Feedback | Decision Needed | Priority | Owner |
|---|---|---|---|---|
| Life Insurance |  |  | High / Medium / Low |  |
| Disability Insurance |  |  | High / Medium / Low |  |
| Unemployment / Liquidity |  |  | High / Medium / Low |  |
| Liability / Lawsuit |  |  | High / Medium / Low |  |
| Presentation Mode |  |  | High / Medium / Low |  |
| Compliance Language |  |  | High / Medium / Low |  |
| Workflow / UX |  |  | High / Medium / Low |  |

---

## 12. Suggested Meeting Outcome

By the end of the meeting, try to leave with clear answers to these five questions:

1. Which module should be treated as the highest priority?
2. Which calculation assumptions are approved, rejected, or still uncertain?
3. Which outputs should be client-facing versus advisor-only?
4. Which labels need compliance review?
5. What should be included in the next development pass?
