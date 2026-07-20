
## 1. Meeting Objective

The purpose of this meeting is to move the GAP Tool from a functional prototype toward an advisor-aligned planning workflow. The review should not only confirm whether the app works technically. The more valuable goal is to determine whether the tool is calculating, organizing, explaining, and presenting risk gaps the way NorthStar advisors actually want to use them in real client conversations.

This meeting should help answer one central question:

> Are we building the right tool, with the right logic, the right workflow, the right assumptions, and the right advisor/client-facing language?

The app should be evaluated as an illustrative gap-analysis system, not as a formal recommendation engine. The meeting should therefore focus on advisor methodology, presentation accuracy, workflow fit, compliance-safe wording, and the practical usefulness of each module.

### What This Meeting Should Validate

Use this review to validate seven core areas.

1. **Calculation methodology**  
   Confirm that each module's formulas, assumptions, offsets, thresholds, and gap calculations match how advisors believe the analysis should be performed. The key question is not only whether the math calculates correctly, but whether the math reflects the right planning methodology.

2. **Input workflow**  
   Confirm whether the current intake flow matches how advisors naturally gather client information. Determine whether inputs should remain in one centralized client setup flow, be moved into module-specific workflows, or be split between basic profile inputs and advanced module assumptions.

3. **Default assumptions**  
   Confirm whether default values are appropriate for advisor use. Examples include income replacement percentages, target income support percentages, LTD tax treatment, income growth, projection end age, reserve targets, and liability exposure assumptions.

4. **Output hierarchy**  
   Confirm which outputs deserve primary visual emphasis and which should be secondary. Each module may calculate several useful numbers, but the advisor needs to define the one or two numbers that should drive the client conversation.

5. **Advisor-only versus client-facing content**  
   Decide which metrics, formulas, assumptions, and explanations should be visible in a client meeting and which should remain behind the scenes for advisor analysis only.

6. **Compliance and language**  
   Identify labels, narratives, and phrases that may imply a formal recommendation, guarantee, requirement, legal conclusion, tax advice, or underwriting conclusion. Replace those phrases with advisor-safe language before broader use.

7. **Presentation and report usefulness**  
   Determine whether presentation mode should be used live with clients, saved as a PDF report, used internally by advisors, or separated into advisor-detail and client-safe versions.

### What the Meeting Should Not Focus On First

Avoid spending the majority of the meeting on small visual preferences before the logic and workflow are confirmed. Colors, spacing, card order, and chart polish matter, but they should come after the advisors confirm that the tool is modeling the right things.

The first priority should be:

1. Is the module asking for the right inputs?
2. Is the module using those inputs correctly?
3. Is the module calculating the right gap?
4. Is the module showing the right output first?
5. Is the module explaining the result in advisor-safe language?

### Key Decisions to Capture During the Meeting

For each module, try to capture specific decisions instead of general reactions.

| Decision Area | What Needs to Be Confirmed |
|---|---|
| Primary use case | Internal advisor calculator, client-facing presentation, or both |
| Required inputs | Which fields are required before the module should calculate |
| Optional inputs | Which fields should be advanced or advisor-controlled |
| Default assumptions | Which defaults NorthStar wants standardized |
| Primary output | The main number advisors want clients to understand |
| Secondary outputs | Useful supporting metrics that should not dominate the screen |
| Client-facing language | Labels and explanations safe enough to show directly to clients |
| Advisor-only details | Formulas, assumptions, or calculators that should stay internal |
| Compliance concerns | Words, claims, or outputs requiring review before deployment |
| Next development priority | What should be fixed, refined, or expanded first |

### Module-Specific Objective

The objective is not to make every module more complex. The objective is to make every module more precise, more useful, and more aligned with advisor behavior.

For each module, determine:

1. What real-world advisor question is this module answering?
2. What inputs does the advisor actually need to answer that question accurately?
3. What assumptions should the tool make automatically?
4. What assumptions should the advisor control manually?
5. What output should appear first?
6. What output should be hidden, simplified, or moved into an advanced view?
7. What wording would the advisor feel comfortable saying out loud to a client?
8. What wording would compliance likely reject or want softened?

### Recommended Framing for Advisors

Open the meeting with a statement similar to this:

> The goal today is not just to test whether the app functions. The goal is to pressure-test whether the tool thinks like an advisor. We need your feedback on whether the inputs, assumptions, calculations, labels, and outputs match how you would actually review these risks with a client. If a number is technically accurate but not useful in a client conversation, we need to know that. If a label is mathematically correct but not compliant or advisor-friendly, we need to know that too.

### Success Criteria for the Meeting

The meeting is successful if it produces clear answers to these questions:

1. Which module logic is already directionally correct?
2. Which module logic needs methodology changes?
3. Which assumptions should become NorthStar defaults?
4. Which assumptions should remain editable by advisors?
5. Which outputs are client-facing versus advisor-only?
6. Which labels or narratives need compliance review?
7. Which workflow changes would make the tool easier to use in a real client meeting?
8. Which improvements should be prioritized before the next advisor review?

The most valuable outcome is a clear development direction: what to keep, what to revise, what to simplify, and what to validate with compliance before the tool becomes more broadly advisor-facing.


Core Product Questions for Advisors

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
