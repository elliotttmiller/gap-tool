# NorthStar End-to-End Engineering Blueprint
## Deterministic Income Gap Analysis Platform, Advisor Workspace, Visualization System, and Governance Specification

**Version:** 1.3.0  
**Date:** May 12, 2026  
**Revision purpose:** Preserve the full strategic, product, engineering, modeling, dashboard, visualization, governance, and compliance depth of the previous blueprint while removing strict/direct implementation code. This version is intentionally written as an interpretive engineering specification: it tells the engineering agent what every layer, component, workflow, and section must accomplish, while leaving final technical implementation decisions to the engineer.

---

## 0. Executive Summary

NorthStar is a modern, production-grade, advisor-facing income gap analysis and risk visualization workspace. It is designed to help financial advisors, insurance advisors, disability insurance specialists, and risk-planning professionals transform abstract client financial vulnerabilities into clear, visual, assumption-driven, presentation-ready models.

NorthStar is not a complete financial planning suite. It is not a budgeting tool, investment management platform, AI financial advisor, product recommendation engine, underwriting system, legal system, tax system, or suitability engine. It is a focused deterministic risk visualization platform whose job is to make income disruption, reserve depletion, protection gaps, and exposure scenarios visible before an advisor introduces specific solutions.

The master product principle is:

> Show the gap before selling the solution — using transparent deterministic logic, not AI-generated advice.

The platform should be engineered around one controlling idea: every meaningful output must be traceable to validated client inputs, explicit assumptions, deterministic formulas, formula versioning, chart-data transformation, static language templates, and a saved calculation snapshot. The advisor remains the interpretation layer.

This blueprint defines the complete product and engineering reference for:

- Product identity and operating philosophy.
- Deterministic local-logic modeling requirements.
- Advisor dashboard and global workspace requirements.
- Client, scenario, module, report, and audit workflows.
- Life Insurance income/protection gap modeling.
- Disability Insurance time-series income gap modeling.
- Unemployment reserve runway modeling.
- Liability / Lawsuit exposure modeling.
- Visualization, chart, and dashboard component strategy.
- Tremor/Tremor Blocks UI reference strategy.
- Formula versioning and assumption governance.
- Static narrative and disclaimer requirements.
- Calculation snapshot and report snapshot requirements.
- QA, validation, regression, and release readiness gates.
- Engineering role instructions for interpreting and building the system.

This document deliberately avoids prescribing exact source code. It instead defines architecture, responsibilities, rules, requirements, formulas, workflows, interfaces, and acceptance standards so the engineer can intelligently design and build the implementation.

---

## 1. Product Positioning

### 1.1 Core Category

NorthStar should be positioned as an advisor-facing income gap analysis and risk visualization platform.

Its core specialty is modeling how major disruption events may affect a client’s income continuity, household stability, reserve runway, protection adequacy, and exposed assets.

### 1.2 Primary Users

NorthStar is designed for:

- Financial advisors.
- Insurance advisors.
- Disability insurance specialists.
- Risk-planning professionals.
- Advisor teams that need a client-facing way to explain risk exposure.

### 1.3 Client-Facing Purpose

NorthStar helps advisors show clients what may happen if:

- An income earner dies prematurely.
- An income earner becomes ill or injured and cannot work.
- A client loses employment.
- A client faces a liability event or lawsuit.

The platform’s value is not in replacing the advisor. Its value is in making the advisor’s explanation more concrete, visual, and client-comprehensible.

### 1.4 Product Boundary

NorthStar must not present itself as:

- A full financial plan.
- A recommendation engine.
- A policy design system.
- A carrier selection system.
- A tax or legal advisor.
- An underwriting prediction system.
- A guarantee of coverage need or benefit availability.

NorthStar should consistently frame outputs as illustrative, assumption-dependent planning scenarios.

---

## 2. Deterministic Modeling Philosophy

### 2.1 Local Logic Only

NorthStar must use deterministic local logic only.

The platform must not use AI to calculate, interpret, summarize, predict, recommend, or produce advisor language. This applies across all risk modules, reports, dashboard insights, client-facing outputs, advisor summaries, and presentation language.

### 2.2 Deterministic Truth Layer

The deterministic engine is the system’s truth layer. It must define how inputs, assumptions, formulas, offsets, timelines, and scenarios are transformed into structured outputs.

Every result must be reproducible. If the same input snapshot, assumption snapshot, and formula version are used again, the system must return the same output.

### 2.3 Advisor Judgment Layer

The advisor remains responsible for interpretation, client discussion, context, professional judgment, and solution implementation. NorthStar should support the advisor but never replace the advisor.

### 2.4 Four-Layer Product Model

NorthStar should be understood as four separate layers:

1. Deterministic Engine Layer: validates data, applies formulas, evaluates scenarios, and produces outputs.
2. Visualization Layer: translates outputs into charts, cards, stacks, timelines, tables, and presentation views.
3. Static Explanation Layer: uses pre-written template language and disclaimers to frame outputs safely.
4. Advisor Judgment Layer: the human advisor interprets the result and discusses options with the client.

The engineer should preserve these boundaries in the final implementation.

---

## 3. Authoritative Source Hierarchy

NorthStar should separate official authority from planning methodology and internal product rules.

### 3.1 Tier 1 — Official and Professional Reference Layer

This layer informs tax assumptions, benefit eligibility treatment, disclosure discipline, consumer protection, professional communication, and assumption governance.

| Area | Recommended source category | NorthStar usage |
|---|---|---|
| Life insurance and disability insurance tax treatment | IRS | Tax assumption language and disclaimers |
| SSDI eligibility | Social Security Administration | Optional SSDI input rules and non-predictive framing |
| Employer disability benefit context | Department of Labor / EBSA | Employer plan awareness and benefit workflow caution |
| Life insurance illustration discipline | NAIC | Consumer-facing illustration and disclosure caution |
| Actuarial communication discipline | Actuarial Standards Board / ASOP No. 41 | Method, assumption, limitation, and data disclosure discipline |
| Advisor planning workflow | CFP Board practice standards | Client information, assumption review, and advisor-controlled analysis |

### 3.2 Tier 2 — Industry Planning Methodology Layer

This layer includes planning concepts that inform deterministic formulas but are not universal official formulas.

Examples include:

- Needs analysis.
- Capital needs analysis.
- Human life value framing.
- Income replacement analysis.
- Present value of future income stream.
- Benefit offset modeling.
- Emergency reserve runway modeling.
- Lifestyle compression modeling.
- Scenario comparison.
- Coverage gap modeling.

### 3.3 Tier 3 — NorthStar Product Rules

This layer contains NorthStar’s internal product decisions:

- No AI logic or AI narratives.
- No product recommendations.
- No carrier recommendations.
- No underwriting conclusions.
- No suitability determinations.
- All outputs are illustrative.
- All assumptions are visible and documented.
- All calculations are versioned and auditable.
- All charts are fed by transformer output, not raw formulas.
- All reports preserve historical calculation context.

---

## 4. Universal Product Pipeline

Every NorthStar workflow should follow the same conceptual pipeline:

1. Advisor selects or creates a client.
2. Advisor creates or opens a scenario.
3. Advisor selects a risk module.
4. System loads the module’s required input structure.
5. Advisor enters or reviews client facts.
6. System validates all required fields and ranges.
7. System loads default assumptions or an advisor-selected assumption set.
8. Advisor reviews and edits assumptions where appropriate.
9. System resolves the active formula version.
10. System runs the deterministic calculation workflow.
11. System produces structured module outputs.
12. System transforms outputs into chart-ready data.
13. System generates static explanation language and disclaimers.
14. System records a calculation run snapshot.
15. System renders advisor workspace output.
16. System renders presentation/report mode when requested.
17. Advisor interprets and discusses the result with the client.

### 4.1 Universal Risk Modeling Pattern

Every module must answer the same core modeling questions:

1. What is the risk event?
2. What is the client’s baseline financial condition?
3. What income, assets, reserves, or coverage are currently available?
4. What financial disruption is being modeled?
5. What offsets reduce the disruption?
6. What gap remains after offsets?
7. What timeline or severity pattern matters?
8. What visual output best communicates the risk?
9. What assumptions and limitations must be shown?
10. What audit information must be saved?

### 4.2 Strict Separation of Concerns

The engineer must preserve these boundaries:

- Input forms collect data; they do not calculate financial outputs.
- Validation schemas approve or reject data; they do not decide recommendations.
- Calculation modules produce deterministic outputs; they do not render UI.
- Transformers shape data for charts; they do not change financial meaning.
- Chart components display transformed data; they do not calculate.
- Narrative templates explain outputs; they do not recommend products.
- Dashboard views summarize saved outputs; they do not recalculate all modules during render.

---

## 5. Core System Objects and Responsibilities

This section describes the core data concepts without prescribing exact code structures.

### 5.1 Advisor

The advisor object represents the authenticated professional or firm user. It should scope access to clients, scenarios, assumptions, reports, and audit records.

Responsibilities:

- Own or belong to a firm workspace.
- Create and manage clients.
- Create and manage scenarios.
- Maintain assumption sets.
- Generate reports and presentations.
- Access only authorized records.

### 5.2 Client Profile

The client profile stores facts about the client or household that are needed for risk modeling.

The engineer should design this object to support:

- Basic identity fields.
- Age and household status.
- Dependents.
- Earned income.
- Spouse or partner income where applicable.
- Monthly expenses.
- Emergency savings.
- Debts.
- Existing coverage.
- Notes and advisor context.

The client profile should avoid becoming a full financial planning balance sheet in the MVP. It should collect only what is needed to support risk visualization.

### 5.3 Scenario

A scenario is the primary work object. It represents a client-specific analysis instance using a selected risk module and selected assumptions.

The scenario should support:

- Client association.
- Advisor association.
- Scenario name and description.
- Module type.
- Status.
- Inputs.
- Assumptions.
- Outputs.
- Presentation and report state.
- Audit history.

Recommended statuses:

- Draft.
- Inputs Needed.
- Calculated.
- Ready for Review.
- Presented.
- Report Generated.
- Archived.

### 5.4 Assumption Set

An assumption set defines the modeling assumptions used for a calculation. Assumptions may be system defaults, advisor defaults, firm defaults, or scenario-specific overrides.

Each assumption should have:

- A clear label.
- A visible value.
- A source category.
- A description.
- Editable or locked status.
- Report visibility status.
- Module applicability.

### 5.5 Calculation Run

The calculation run is the immutable historical record of a deterministic calculation.

It should preserve:

- Advisor reference.
- Client reference.
- Scenario reference.
- Module type.
- Formula version.
- Input snapshot.
- Assumption snapshot.
- Output snapshot.
- Chart-data snapshot.
- Static narrative snapshot.
- Disclaimer version.
- Calculation timestamp.

This is essential for reconstructing historical scenarios after formulas, assumptions, visuals, or language templates evolve.

### 5.6 Report Snapshot

A report snapshot preserves the client-facing artifact generated from a scenario. It should not be dynamically altered when later assumptions or formulas change.

The report should preserve:

- Calculation run reference.
- Report sections.
- Displayed charts.
- Static narrative text.
- Disclaimers.
- Assumptions shown.
- Formula version shown.
- Advisor notes.
- Export timestamp.

---

## 6. Formula Versioning Requirements

NorthStar must include a formula versioning system.

### 6.1 Purpose

Formula versioning ensures that if the Life Insurance formula, DI timeline logic, tax treatment assumption, offset logic, or output structure changes later, historical calculations remain reproducible.

### 6.2 Requirements

The engineer should design a formula registry or equivalent system that can:

- Identify the current formula version for each module.
- Preserve older formula versions for historical runs.
- Describe what changed between versions.
- Associate each calculation run with the formula version used.
- Prevent silent output changes without version updates.
- Support regression testing across formula versions.

### 6.3 Version Metadata

Every formula version should have metadata describing:

- Module type.
- Version number.
- Effective date.
- Purpose.
- Change summary.
- Whether the version is active or deprecated.
- Any material assumptions embedded in that version.

### 6.4 Versioning Rule

If a formula change can alter user-facing outputs, the formula version must change.

If a change only affects visual formatting, accessibility, or non-financial UI styling, the formula version does not need to change, but the component or report version may need to change.

---

## 7. Universal Validation and Safe-Math Standards

### 7.1 Validation Principles

All data must be validated before calculation. Invalid or missing inputs should be handled explicitly rather than silently producing misleading output.

Validation should cover:

- Required fields.
- Non-negative currency values.
- Percentage ranges.
- Reasonable age ranges.
- Duration ranges.
- Waiting period ranges.
- Coverage values.
- Expense values.
- Tax assumption values.
- Scenario-specific dependencies.

### 7.2 Safe-Math Rules

The engine must prevent common modeling failures:

- No division by zero.
- No negative protection gaps.
- No negative reserve balances shown as available reserves.
- No negative coverage values.
- No negative expenses.
- No impossible durations.
- No replacement period extending beyond logical retirement-age boundaries unless explicitly allowed.
- No hidden default assumptions that materially affect outputs.

### 7.3 Error Handling

The engineer should design clear error and warning states for:

- Missing required inputs.
- Invalid ranges.
- Inconsistent assumptions.
- Unsupported scenario combinations.
- Benefit timing conflicts.
- Output values that cannot be meaningfully calculated.

Errors should prevent calculation when outputs would be materially unreliable. Warnings should allow the advisor to continue when the result is still useful but assumption-dependent.

---

## 8. Assumption Governance

### 8.1 Purpose

Assumption governance is one of NorthStar’s core professional differentiators. Advisors must be able to see, understand, and explain the assumptions behind every output.

### 8.2 Assumption Categories

Assumptions should be categorized as:

- Client-provided facts.
- Advisor-entered assumptions.
- Firm default assumptions.
- System default assumptions.
- Policy-document assumptions.
- External benefit assumptions.

### 8.3 Assumption Visibility

Any assumption that materially affects the output must be visible in advisor view and report/presentation view unless intentionally excluded for a documented reason.

Examples of visible assumptions:

- Income replacement ratio.
- Replacement period.
- Inflation rate.
- Discount rate.
- Effective tax rate.
- Disability duration.
- Benefit waiting period.
- Benefit duration.
- SSDI inclusion or exclusion.
- Expense inflation.
- Liquid asset offset inclusion.

### 8.4 Assumption Review Workflow

Before calculation, the advisor should be able to:

- View default assumptions.
- Edit scenario-specific assumptions.
- Select a saved assumption set.
- Understand which assumptions are locked versus editable.
- See which assumptions will appear in reports.

### 8.5 Assumption Change Impact

If assumptions change after a scenario has already been calculated, the system should indicate that the previous calculation may be outdated and invite the advisor to rerun the scenario.

---

## 9. Life Insurance Module Specification

### 9.1 Client-Facing Question

If I die prematurely, what income and financial support disappears for my family?

### 9.2 Modeling Purpose

The Life Insurance module is the simplest proof-of-concept module. It should demonstrate the full NorthStar loop: inputs, assumptions, deterministic calculation, visual output, static narrative, disclaimer, snapshot, and presentation view.

The module should calculate an illustrative protection gap created by the premature death of an income earner.

### 9.3 Required Input Categories

The engineer should design the Life input workflow to collect:

- Client age.
- Intended retirement age.
- Annual income.
- Income replacement period.
- Income replacement ratio.
- Existing employer/group life coverage.
- Existing private life coverage.
- Outstanding debts.
- Education funding goal.
- Final expenses.
- Optional liquid assets allocated to survivor support.
- Household/dependent context where needed.

### 9.4 Required Assumption Categories

The Life module should support assumptions for:

- Income replacement ratio.
- Income replacement years.
- Inflation rate if future value or present value modeling is enabled.
- Discount rate if present value modeling is enabled.
- Income growth rate if production-grade income projection is enabled.
- Liquid asset offset inclusion.
- Tax treatment framing for death benefit proceeds.

### 9.5 MVP Formula Logic

The MVP formula should use a transparent capital-needs model.

The engineer should design the calculation to determine:

- A logical replacement period based on user input and retirement-age boundaries.
- Annual replacement need based on income and replacement ratio.
- Future income loss over the selected replacement period.
- Specific capital needs, including debt, education goal, and final expenses.
- Total existing coverage, including group and private coverage.
- Optional liquid assets that the advisor chooses to treat as available resources.
- Remaining modeled gap after offsets.
- Coverage offset percentage.

The remaining gap must never be negative. If offsets exceed modeled need, the remaining gap should show as zero while still indicating that available resources exceed the modeled need.

### 9.6 Production Formula Roadmap

The production-grade Life module may later add:

- Present value of future income replacement.
- Income growth assumptions.
- Inflation-adjusted education goals.
- Discount-rate assumptions.
- Survivor income or spouse income treatment.
- Social Security survivor benefit assumptions, if advisor-entered and clearly framed.
- Asset allocation assumptions.
- Need segmentation by debt, income replacement, education, final expenses, and transition reserves.

The MVP should not overbuild this immediately. It should preserve a clear path for upgrade.

### 9.7 Life Outputs

The module should produce structured outputs for:

- Replacement years used.
- Annual replacement need.
- Future income loss.
- Specific capital needs.
- Base protection need.
- Existing coverage total.
- Available resource offset.
- Remaining modeled gap.
- Coverage offset percentage.
- Assumption summary.

### 9.8 Life Visuals

The Life module should support:

- Income replacement gap chart.
- Coverage offset bar.
- Protection need stack.
- Survivor financial timeline.
- Protection need summary cards.

The visuals should show the gap clearly before discussing any solution.

### 9.9 Life Narrative Requirements

The static narrative should explain:

- What the scenario is illustrating.
- What assumptions were used.
- What existing coverage offsets the modeled need.
- What gap remains.
- That the result is not a recommendation or required coverage amount.

Avoid phrases such as “you need this much coverage” or “this is the correct amount.”

---

## 10. Disability Insurance Module Specification

### 10.1 Client-Facing Question

If I cannot work due to illness or injury, how does my financial plan change?

### 10.2 Strategic Role

Disability Insurance is NorthStar’s flagship module. It is the most strategically important module because clients often find disability risk harder to conceptualize than death risk. The client is still alive, expenses continue, income may partially or totally disappear, benefit timing is uncertain, and recovery duration varies.

The DI module should make the client’s income-earning ability visible as a financial asset and show how illness or injury can impair that asset.

### 10.3 Core Modeling Principle

The DI module must be modeled as a time-series engine, not a static monthly average.

The engine should model each month of the selected disability duration and evaluate:

- Baseline income before disability.
- Earned income retained during partial or total disability.
- Spouse or partner income.
- Employer short-term disability benefits.
- Employer long-term disability benefits.
- Private disability benefits.
- State benefits.
- Optional Social Security Disability assumptions.
- Taxability of each benefit stream.
- Monthly expenses.
- Monthly income gap.
- Reserve drawdown.
- Reserve depletion month.

### 10.4 Required Input Categories

The DI input workflow should collect:

- Annual earned income.
- Monthly household expenses.
- Emergency savings.
- Spouse or partner monthly income.
- Employer short-term disability benefit amount.
- Employer short-term disability waiting period.
- Employer short-term disability duration.
- Employer short-term disability taxability.
- Employer long-term disability benefit amount.
- Employer long-term disability waiting period.
- Employer long-term disability duration.
- Employer long-term disability taxability.
- Private DI benefit amount.
- Private DI waiting period.
- Private DI duration.
- Private DI taxability.
- State benefit amount and timing, if included.
- SSDI amount and timing, if advisor chooses to include it.
- Partial disability retained income percentage.
- Total disability retained income percentage.
- Modeled disability duration.

### 10.5 Benefit Stream Requirements

Every benefit stream should be modeled with:

- Label.
- Monthly amount.
- Start month.
- End month or duration.
- Taxability treatment.
- Source type.
- Whether it is advisor-entered, policy-derived, or defaulted.

Benefit streams should activate only after their waiting period or start month. They should stop after their duration ends unless explicitly modeled as continuing through the selected scenario period.

### 10.6 Taxability Treatment

The DI module should support benefit-specific taxability assumptions.

The engineer should design the system so taxable and non-taxable benefit streams can be modeled separately. When after-tax modeling is enabled, taxable benefits should be adjusted by the selected effective tax assumption. Non-taxable benefits should not be reduced.

The tool should not claim universal tax treatment. It should show the taxability assumption and explain that actual tax treatment may vary based on who paid premiums, how premiums were paid, policy terms, and advisor/tax review.

### 10.7 SSDI Treatment

SSDI must be optional and advisor-entered. NorthStar should not automatically predict SSDI eligibility, approval, approval timing, or benefit amount.

If included, SSDI should be framed as an assumption, not a prediction. The advisor should specify the monthly amount and start month. The report should clearly state that SSDI inclusion is assumption-based and subject to actual eligibility and approval rules.

### 10.8 Partial versus Total Disability

The DI module should support both partial and total disability scenarios.

Partial disability should allow some retained earned income or partial benefit assumptions. Total disability should generally model a larger loss of earned income. Both scenarios should be comparable side by side.

### 10.9 Monthly Timeline Logic

For each month in the modeled duration, the engine should determine:

- Baseline monthly income.
- Retained earned income after disability.
- Spouse or partner income.
- Active benefit streams.
- Net available benefit income.
- Total available income.
- Monthly expenses.
- Monthly income gap.
- Beginning reserve balance.
- Ending reserve balance.
- Whether reserve depletion occurred.

This monthly timeline should become the source for DI visuals and output summaries.

### 10.10 DI Outputs

The DI module should produce:

- Average monthly gap.
- Monthly gap by month.
- Total uncovered gap.
- Total benefits received.
- Employer benefit offset total.
- Private benefit offset total.
- Government or state benefit offset total, if included.
- Reserve depletion month.
- Final reserve balance.
- Lifestyle compression required.
- Partial disability comparison outputs.
- Total disability comparison outputs.
- Timeline data for visuals.

### 10.11 DI Visuals

The DI module should support:

- Income Collapse Curve.
- Reserve Depletion Timeline.
- Protection Gap Stack.
- Benefit Stream Stack.
- Partial versus Total Disability Comparison.
- Lifestyle Compression Model.
- Recovery Path Comparison.

These visuals should be presentation-friendly, readable, and designed for advisor-client explanation.

### 10.12 DI Narrative Requirements

The static narrative should explain:

- What happens to income under the modeled disability scenario.
- Which benefits offset the income loss.
- When benefits begin.
- Whether reserves are projected to deplete.
- What monthly or total gap remains.
- That results depend on benefit approvals, policy terms, tax assumptions, expenses, recovery timeline, and advisor review.

---

## 11. Unemployment Module Specification

### 11.1 Client-Facing Question

How long can I sustain my financial plan after job loss?

### 11.2 Modeling Purpose

The Unemployment module should model the client’s reserve runway after job loss. It is simpler than DI but should still use time-based logic because severance, unemployment benefits, spouse income, and job-search duration vary over time.

### 11.3 Required Inputs

The module should collect:

- Monthly income before job loss.
- Monthly expenses.
- Emergency savings.
- Severance amount.
- Unemployment benefit amount.
- Unemployment benefit start month.
- Unemployment benefit duration.
- Spouse or partner income.
- Estimated job-search duration.

### 11.4 Core Logic

The engine should determine:

- Starting reserve balance including emergency savings and severance.
- Monthly available income during unemployment.
- Monthly shortfall.
- Reserve balance by month.
- Reserve depletion month.
- Total uncovered shortfall.
- Cash runway.

### 11.5 Visuals

The module should support:

- Reserve Runway Chart.
- Monthly Shortfall Visualization.
- Burn Rate Model.
- Recovery Timeline.

---

## 12. Liability / Lawsuit Module Specification

### 12.1 Client-Facing Question

What assets or future earnings are exposed if I face a lawsuit?

### 12.2 Modeling Purpose

The Liability module should show possible asset exposure, coverage gaps, and wealth erosion scenarios. It must be especially careful not to provide legal advice.

### 12.3 Required Inputs

The module should collect:

- Home equity.
- Investment assets.
- Savings.
- Business assets, if applicable.
- Future income exposure assumption.
- Auto liability coverage.
- Homeowners liability coverage.
- Umbrella coverage.
- Estimated claim scenario.
- Protected assets assumption.

### 12.4 Core Logic

The engine should determine:

- Gross exposed assets.
- Total liability coverage.
- Net exposed assets after protected asset assumptions.
- Claim coverage gap.
- Asset amount potentially at risk.
- Protection offset percentage.

### 12.5 Visuals

The module should support:

- Asset Exposure Map.
- Umbrella Coverage Gap.
- Wealth Erosion Scenario.
- Protection Adequacy Summary.

### 12.6 Disclaimer Requirement

Every Liability output must state that the model is illustrative and not legal advice. Actual liability exposure depends on jurisdiction, policy terms, claim facts, legal process, and professional review.

---

## 13. Chart Data Transformation Layer

### 13.1 Purpose

The chart transformer layer converts deterministic outputs into chart-ready structures. It must not perform financial calculations or alter financial meaning.

### 13.2 Responsibilities

Transformers should handle:

- Chart labels.
- Data series grouping.
- Axis-friendly values.
- Timeline mapping.
- Stack segmentation.
- Tooltip-ready descriptions.
- Event markers.
- Depletion markers.
- Comparative layouts.
- Responsive scaling hints.
- Empty-state conditions.

### 13.3 Rules

- Raw calculation outputs should not bind directly to chart components.
- Chart components should receive transformed display data.
- Transformers should be module-specific when chart meaning is module-specific.
- Shared chart utilities may exist for common card, axis, legend, tooltip, and empty-state needs.
- Transformers must not insert recommendations or interpretation beyond labels and display descriptions.

---

## 14. Visualization and UI Component Strategy

### 14.1 Tremor-First Strategy

NorthStar will use Tremor, Tremor Blocks, Tremor templates, and Tremor-style patterns as the primary reference for dashboard UI, layout blocks, metric cards, tables, filters, tabs, badges, and standard data visualization components.

The system should prioritize copy-paste ownership where practical. Selected Tremor patterns should be reviewed, renamed, simplified, typed, themed, and promoted into NorthStar-owned components.

Tremor should be treated as a high-quality dashboard/app UI reference system, not as a black-box product to clone blindly.

### 14.2 Visualization Component Source Policy

Recommended hierarchy:

1. Tremor Blocks and Tremor-style components for dashboard layout, cards, tables, tabs, badges, and standard charts.
2. Recharts or Tremor-backed charting where standard charting is required.
3. NorthStar-owned custom chart components for specialized risk visualizations.
4. Mario Charts only as a fallback reference if Tremor cannot support a specialized visualization clearly.

### 14.3 Dependency Policy

The engineer should evaluate dependencies based on:

- Accessibility value.
- Bundle impact.
- Maintenance cost.
- Performance implications.
- Styling control.
- Long-term ownership.
- Whether the same result can be achieved with copied/adapted components.

Dependencies should not be added solely for visual convenience if a small owned component would be cleaner.

### 14.4 Component Ownership

NorthStar should maintain an internal component system. Repeated UI patterns must be promoted into reusable components rather than duplicated across pages.

Component categories should include:

- Shell components.
- Navigation components.
- Dashboard components.
- Metric cards.
- Risk module cards.
- Table components.
- Chart panels.
- Presentation components.
- Report components.
- Form/input components.
- Empty/loading/error states.
- Disclaimer and compliance components.

### 14.5 Visual Design Language

NorthStar should feel:

- Professional.
- Calm.
- Trustworthy.
- Advisor-grade.
- Presentation-first.
- Financially serious.
- Clean and minimal.

Recommended visual language:

- Dark navy or charcoal foundation.
- White or near-white content surfaces.
- Muted blue for structure and navigation.
- Green for coverage/protection/offsets.
- Amber for modeled gaps or attention states.
- Red only for severe exposure or true warning states.
- Generous whitespace.
- Large readable chart labels.
- Minimal decorative graphics.

Avoid:

- Consumer fintech gamification.
- Overly bright visuals.
- Dense spreadsheets.
- Sales-heavy language.
- Excessive animation.
- Decorative charts that do not improve comprehension.

---

## 15. Advisor Dashboard Command Center

### 15.1 Purpose

The dashboard overview is the advisor’s global command center. It should help advisors track, manage, and visualize client risk-analysis work across their book of business.

The dashboard should not replace the scenario/module workflow. It should summarize clients, scenarios, modeled gaps, reports, assumptions, and next actions.

### 15.2 Dashboard Questions

The dashboard should answer:

- Which clients am I actively working with?
- Which scenarios are incomplete?
- Which clients have elevated modeled gaps?
- Which reports are ready or pending?
- Which presentations are ready?
- Which modules are most active?
- Which assumptions or formula versions are currently in use?
- What should I do next?

### 15.3 Dashboard Zones

The dashboard should include:

1. Advisor Workspace Header.
2. Primary Action Bar.
3. Book-of-Business Summary Metrics.
4. Risk Exposure Overview.
5. Client and Scenario Tracking Table.
6. Risk Module Status Cards.
7. Recent Presentations and Reports.
8. Assumption and Formula Version Status.
9. Advisor Task Queue.

### 15.4 Primary Actions

The dashboard should make frequent actions immediately visible:

- Create New Client.
- Start Income Gap Analysis.
- Continue Recent Scenario.
- Open Presentation Mode.
- Generate Report.
- Review Assumptions.

### 15.5 Summary Metrics

The dashboard should prioritize operational and risk-analysis metrics:

- Total Clients.
- Active Scenarios.
- Incomplete Analyses.
- Presented Scenarios.
- Reports Generated.
- Elevated Gap Scenarios.
- Average Modeled Gap.
- Largest Open Gap.

Avoid vanity metrics that do not support advisor action.

### 15.6 Client and Scenario Tracking Table

The central dashboard table should track:

- Client.
- Scenario.
- Risk module.
- Modeled gap.
- Status.
- Last updated date.
- Presentation readiness.
- Report readiness.
- Recommended next action label.

This table should be searchable, filterable, and sortable when the data volume justifies it. Complex table tooling should be added only when necessary.

### 15.7 Risk Module Cards

Each risk module should have a status card:

- Life Insurance.
- Disability Insurance.
- Unemployment.
- Liability / Lawsuit.

Cards should show:

- Active scenarios.
- Incomplete scenarios.
- Highest modeled exposure.
- Recently updated scenario.
- Shortcut to create or continue analysis.

Disability Insurance should become visually prominent once the module is available because it is NorthStar’s strategic flagship.

### 15.8 Governance Status

The dashboard should include a model governance surface showing:

- Active formula versions.
- Active default assumption set.
- Last assumption update.
- Number of calculation runs logged.
- Any scenarios that may need recalculation due to assumption or formula updates.

### 15.9 Advisor Task Queue

The task queue should surface actionable items such as:

- Clients with incomplete inputs.
- Scenarios requiring review.
- Reports ready for export.
- Presentations not yet generated.
- Assumption changes affecting prior outputs.

### 15.10 Dashboard Performance Rule

The dashboard should display summarized scenario/output data. It should not recalculate every client’s risk exposure during render.

Calculations should happen inside the scenario/module workflow. The dashboard should read saved summaries, output snapshots, or precomputed view models.

---

## 16. Application Routes and Workspaces

### 16.1 Primary Workspaces

NorthStar should be organized around these major workspaces:

- Dashboard.
- Clients.
- Client Detail.
- Scenarios.
- Scenario Detail.
- Risk Module Workspace.
- Presentation View.
- Report View.
- Assumptions.
- Settings.
- Audit / Calculation History.

### 16.2 Dashboard Role

Dashboard equals global advisor command center.

### 16.3 Client Page Role

Client page equals client-specific profile, household information, scenario history, and report history.

### 16.4 Scenario Page Role

Scenario page equals analysis project workspace. It should show scenario status, selected module, assumptions, outputs, presentation readiness, report readiness, and audit history.

### 16.5 Risk Module Page Role

Risk module page equals input, assumption, calculation, and visualization workflow for a specific risk event.

### 16.6 Presentation Page Role

Presentation page equals client-facing explanation mode. It should be clean, simplified, readable, and meeting-friendly.

### 16.7 Report Page Role

Report page equals exportable artifact. It should preserve snapshot integrity and include disclaimers, assumptions, formula versions, and advisor notes.

### 16.8 Assumptions Page Role

Assumptions page equals model governance workspace. It should allow advisor or firm-level management of defaults.

### 16.9 Audit Page Role

Audit page equals calculation traceability. It should show calculation runs, input snapshots, assumption snapshots, output snapshots, formula versions, and report snapshots.

---

## 17. Static Narrative and Disclaimer System

### 17.1 Static Narrative Purpose

Static narratives translate outputs into controlled, professional, compliance-reviewed language.

They should be deterministic and template-based. They should interpolate values from outputs but never generate new conclusions or recommendations.

### 17.2 Narrative Categories

Narrative templates should support:

- Neutral result explanation.
- Fully offset gap.
- Moderate modeled gap.
- Elevated modeled gap.
- Insufficient data.
- Reserve depletion projected.
- Reserve depletion not projected.
- SSDI included as assumption.
- Taxability assumption active.

### 17.3 Required Language Style

Use language such as:

- This scenario illustrates...
- Modeled gap...
- Potential exposure...
- Based on the assumptions entered...
- May help guide advisor-client discussion...
- Actual needs may vary...
- This is not a recommendation...

Avoid language such as:

- You need...
- You should buy...
- Required coverage...
- Correct amount...
- Guaranteed protection...
- Ensures security...
- This solves...
- Recommended carrier...
- Recommended product...

### 17.4 Universal Disclaimer

Every output should include a disclaimer that states the model is for illustrative planning purposes only and is not a guarantee, financial plan, insurance recommendation, legal advice, tax advice, underwriting determination, or suitability determination. It should state that actual needs may vary based on individual circumstances, policy terms, carrier rules, taxation, inflation, market conditions, benefit approval, and advisor review.

### 17.5 Module-Specific Disclaimers

Module-specific disclaimers should be added when needed:

- Life Insurance: tax treatment and coverage need are assumption-dependent.
- Disability Insurance: benefit approval, policy terms, taxability, waiting periods, and recovery timelines may vary.
- Unemployment: job search duration and benefit availability may vary.
- Liability: actual exposure depends on jurisdiction, claim facts, legal process, and policy terms.

---

## 18. Reports and Presentation Mode

### 18.1 Presentation Mode Purpose

Presentation mode is designed for live advisor-client meetings. It should reduce interface clutter and emphasize client comprehension.

It should include:

- Scenario title.
- Client context.
- Risk event question.
- Key assumptions.
- Key output cards.
- Main visualizations.
- Static narrative.
- Disclaimer.
- Advisor notes where appropriate.

### 18.2 Report Mode Purpose

Report mode creates a durable artifact. It should be printable/exportable and preserve historical snapshot integrity.

It should include:

- Advisor and client details.
- Scenario details.
- Module type.
- Calculation date.
- Formula version.
- Assumptions used.
- Inputs summary.
- Output summary.
- Charts.
- Static narrative.
- Disclaimers.
- Advisor notes.

### 18.3 Snapshot Integrity

Reports should reference calculation snapshots rather than live recalculated data. If a report is regenerated after assumptions change, the system should create a new report snapshot or clearly indicate the calculation version used.

---

## 19. Database and Persistence Strategy

### 19.1 MVP Persistence

For early development, NorthStar may use local storage, mock data, or Firebase-style lightweight persistence if that accelerates iteration.

The engineer should still design data structures so they can later migrate cleanly to a proper database.

### 19.2 Production Persistence

The production data model should support:

- Advisors.
- Clients.
- Households.
- Scenarios.
- Scenario assumptions.
- Module inputs.
- Module outputs.
- Calculation runs.
- Formula versions.
- Assumption sets.
- Reports.
- Report snapshots.
- Advisor notes.
- Audit events.

### 19.3 Security and Access Control

All client, scenario, calculation, report, and audit records must be scoped to the authenticated advisor or firm workspace.

The engineer should implement authorization rules that prevent advisors from accessing records outside their allowed scope.

### 19.4 Audit Events

The system should log meaningful events such as:

- Client created.
- Scenario created.
- Inputs updated.
- Assumptions updated.
- Calculation run generated.
- Report generated.
- Presentation opened.
- Formula version changed.
- Assumption set changed.

---

## 20. Quality Assurance and Testing Requirements

### 20.1 Testing Philosophy

Testing should prove that outputs are deterministic, formulas are stable, validation works, narratives remain compliant, and historical calculations remain reproducible.

### 20.2 Required Test Categories

The engineer should design tests for:

- Input validation.
- Assumption validation.
- Safe math behavior.
- Life Insurance formulas.
- DI benefit stream timing.
- DI reserve depletion.
- DI taxability treatment.
- Unemployment runway.
- Liability exposure.
- Chart transformers.
- Static narratives.
- Forbidden language detection.
- Formula version registry behavior.
- Calculation snapshot creation.
- Regression cases.

### 20.3 Golden Test Cases

Each module should have golden test cases with known inputs and expected outputs. These fixtures should be used for regression testing whenever formulas change.

### 20.4 Release Readiness Gates

A module should not be considered production-ready until:

- Required inputs are validated.
- Assumptions are visible.
- Formulas are versioned.
- Calculation outputs are reproducible.
- Chart transformers are tested.
- Static narratives are reviewed.
- Disclaimers appear on all relevant outputs.
- Calculation snapshots are saved.
- Reports preserve snapshot integrity.
- UI contains no business logic.
- Dashboard uses summarized outputs, not live recalculation.

---

## 21. Phased Implementation Roadmap

### Phase 1 — Application Shell and Dashboard Foundation

Build the advisor workspace shell, navigation, dashboard overview, client list, scenario list, and reusable UI components.

The goal is to make the app feel like a real advisor command center before all calculations are complete.

### Phase 2 — Core Data and Scenario Backbone

Build client creation, scenario creation, scenario status, assumptions, calculation run structure, and local/mock persistence.

The goal is to prove that the data model supports the future deterministic engine.

### Phase 3 — Life Insurance MVP Module

Build the Life module as the first complete workflow: inputs, assumptions, calculation, outputs, chart transformers, static narrative, disclaimer, audit snapshot, and presentation view.

The goal is to prove the full NorthStar loop.

### Phase 4 — Disability Insurance Time-Series Module

Build the DI module with benefit streams, waiting periods, durations, taxability, partial versus total comparison, monthly timeline, reserve depletion, visuals, narrative, and audit snapshot.

The goal is to build NorthStar’s flagship differentiator.

### Phase 5 — Presentation and Report Layer

Build client-ready presentation mode and exportable report mode using saved calculation snapshots.

The goal is to make outputs usable in live advisor-client meetings.

### Phase 6 — Governance and QA Hardening

Build formula versioning, assumption management, regression tests, forbidden language tests, audit review screens, and production-readiness workflows.

The goal is to harden the platform for professional use.

---

## 22. Engineering Interpretation Rules

This blueprint should guide engineering decisions without prescribing exact implementation code.

The engineer is responsible for:

- Choosing clean file and component architecture consistent with the blueprint.
- Designing type-safe data contracts.
- Implementing strict validation.
- Structuring pure calculation functions.
- Designing formula versioning.
- Creating chart transformers.
- Building Tremor-inspired UI components.
- Preserving deterministic boundaries.
- Ensuring dashboard usability.
- Maintaining report and audit integrity.
- Avoiding premature overengineering.

The engineer should not:

- Add AI logic.
- Put formulas inside UI components.
- Recalculate all scenarios inside the dashboard render path.
- Hide assumptions.
- Use recommendation language.
- Bind raw calculation outputs directly to charts.
- Copy third-party UI code without review and adaptation.
- Add dependencies without evaluating value and performance impact.

---

## 23. AI Engineering Agent Role Prompt

Use the following role prompt when assigning an AI engineering agent to build from this document:

You are the lead deterministic product engineering agent for NorthStar, an advisor-facing income gap analysis and risk visualization workspace.

Your task is to analyze the attached Markdown blueprint as the single source of truth and design/build the application, deterministic logic engine, advisor dashboard, risk modules, visualization system, presentation/report layer, and audit/governance structure according to its requirements.

Do not reinterpret the product from scratch. Do not add AI-assisted calculations, AI summaries, AI interpretations, AI predictions, product recommendations, carrier recommendations, legal advice, tax advice, underwriting conclusions, or suitability determinations.

Before building, extract the product purpose, advisor workflow, deterministic pipeline, module requirements, dashboard requirements, visualization requirements, assumption governance, formula versioning model, audit trail, report workflow, compliance language rules, and QA standards.

Build the foundation first. Prioritize clean architecture, modularity, deterministic calculation boundaries, advisor usability, Tremor-inspired dashboard quality, chart transformer discipline, and snapshot-based auditability.

Every output must be traceable to validated inputs, explicit assumptions, a formula version, deterministic calculation logic, transformed chart data, static narrative language, and a saved calculation snapshot.

The engineer may choose the exact implementation approach, file naming, component implementation, and technical details, but must preserve the boundaries and requirements in this blueprint.

---

## 24. Definition of Done for the MVP Foundation

The MVP foundation is complete when:

- The advisor can open a professional dashboard command center.
- The advisor can create or view clients.
- The advisor can create or view scenarios.
- The advisor can open the Life Insurance module.
- The advisor can enter Life inputs and assumptions.
- The app produces deterministic Life outputs.
- The app displays at least one chart and key metric cards.
- The app creates a calculation snapshot.
- The advisor can open presentation mode.
- The output includes static narrative language and disclaimers.
- The dashboard summarizes saved scenario status without recalculating everything live.
- All business logic is outside UI components.

---

## 25. Final Product Standard

NorthStar should ultimately feel like a modern, production-grade advisor workspace for income gap analysis.

The final system should combine:

- Deterministic local logic engine.
- Advisor-friendly dashboard command center.
- Client and scenario management.
- Modular risk analysis workflows.
- High-quality Tremor-inspired UI.
- Clear visualizations.
- Static compliance-reviewed language.
- Report and presentation outputs.
- Formula versioning.
- Assumption governance.
- Calculation snapshots.
- Audit traceability.

The platform’s core identity should remain:

> NorthStar helps advisors show clients the financial gap before selling the solution.

