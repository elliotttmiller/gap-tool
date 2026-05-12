# NorthStar UI/UX Blueprint
## Advisor-Facing Income Gap Analysis Workspace

**Document type:** UI/UX product specification and experience blueprint  
**Application:** NorthStar  
**Audience:** Product engineers, UI engineers, UX designers, design-system builders, and implementation agents  
**Purpose:** Define the complete end-to-end NorthStar product experience without prescribing direct implementation code.  
**Scope:** Application shell, dashboard, client workspace, scenario workflow, risk modules, multi-tab navigation, analysis modals, visualization UX, presentation mode, report UX, assumptions/governance pages, settings, empty states, responsive behavior, and design-system expectations.  

---

## 1. Product Experience Thesis

NorthStar should feel like a modern advisor command center for income gap analysis and risk visualization.

It is not a generic financial planning suite, consumer fintech dashboard, insurance sales page, CRM, or spreadsheet wrapper. It is an advisor-facing workspace that helps financial professionals organize clients, create scenarios, model income disruption risks, visualize gaps, and prepare client-ready conversations.

The product experience should make the advisor feel that every screen is designed for a live client conversation, not for administrative clutter. The user interface should help advisors move from client context to risk scenario to visual output to presentation or report with minimal friction.

NorthStar’s primary UX promise:

> Help advisors quickly understand where each client stands, what analysis work is incomplete, what risks have been modeled, what gaps remain, and what is ready to present.

The experience should prioritize:

- Advisor usability.
- Clear workflow progression.
- Clean client organization.
- Fast scenario creation.
- Readable income gap visuals.
- Strong presentation readiness.
- Minimal cognitive load.
- Compliance-safe framing.
- Deterministic, non-AI, advisor-controlled interpretation.

---

## 2. Experience Principles

### 2.1 Advisor-first, not consumer-first

NorthStar is used by advisors, not directly by retail clients as a self-guided consumer app. The interface should help the advisor prepare, explain, manage, and present. Client-facing views should exist, but they should be entered intentionally through presentation or report modes.

Advisor screens may include workflow status, scenario management, assumptions, audit metadata, and report controls. Client-facing presentation screens should strip away operational complexity and show only the visuals, assumptions, and explanatory language needed for a professional client meeting.

### 2.2 Presentation-first outputs

Every major analysis output should be capable of becoming a meeting artifact. Charts, cards, summaries, and assumptions should be designed so they can be understood across the table. A visual that only works as an internal developer or analyst dashboard is not sufficient.

### 2.3 Low-friction workflow

The advisor should never feel buried under forms. Inputs should be grouped, progressive, and contextual. The interface should collect what is needed for the selected analysis without exposing every possible field at once.

### 2.4 Tabbed client and scenario workspaces

Individual client detail views and scenario workspaces should use clean tab navigation. Tabs should make it obvious where the advisor is and what page of the client/scenario they are viewing.

Tabs should be used for structured workspace switching, not for hiding critical next actions.

### 2.5 Dashboard as command center

The dashboard overview is the advisor’s global client and project tracking surface. It should summarize clients, active scenarios, incomplete analyses, modeled gaps, reports, presentations, assumptions, and next actions.

The dashboard should not be decorative. It should answer: what needs attention, what is ready, what is incomplete, and where the largest modeled exposures are.

### 2.6 Visual clarity over visual novelty

Charts should be calm, readable, and direct. The app should avoid gimmicky visuals, excessive animation, or unclear chart types. Use charts to explain risk, not to decorate the page.

### 2.7 Compliance-safe language

The UI must avoid recommendation, guarantee, or certainty language. The interface should consistently frame outputs as illustrative, assumption-based, and advisor-reviewed.

The UX should never imply:

- The app has determined what the client must buy.
- The app is making an insurance recommendation.
- The app is making legal, tax, or underwriting determinations.
- A modeled gap is guaranteed to occur.

---

## 3. Visual Design Direction

### 3.1 Overall feel

NorthStar should feel:

- Professional.
- Calm.
- Advisor-grade.
- Trustworthy.
- Modern.
- Minimal.
- Presentation-ready.
- Financially serious.
- Friendly without being casual.

It should not feel:

- Gamified.
- Consumer-fintech playful.
- Overly colorful.
- Sales-heavy.
- Insurance-brochure-like.
- Spreadsheet-heavy.
- Dense or intimidating.

### 3.2 Style references

Use a Tremor-inspired dashboard language for the app shell, dashboard grids, cards, tables, tabs, filters, and data surfaces. The goal is not to clone another product directly, but to recreate the professional SaaS dashboard clarity: clean layout, card-based structure, neutral surfaces, readable typography, responsive grids, and restrained data visualization.

Tremor Blocks and Tremor-style templates should be treated as UI/UX references and component-starting points. Selected patterns may be copied or recreated when appropriate, but all final components should become NorthStar-owned components with NorthStar naming, NorthStar visual semantics, and NorthStar data contracts.

### 3.3 Color direction

Use a restrained palette:

- Dark navy or charcoal for app shell accents and professional grounding.
- White or near-white card surfaces.
- Muted blue for navigation, structure, active states, and neutral emphasis.
- Soft green for existing protection, coverage, or positive offset.
- Amber/orange for uncovered gaps, moderate exposure, or attention-needed states.
- Red only for severe exposure, critical warnings, or destructive actions.
- Neutral grays for secondary copy, borders, dividers, and inactive states.

Color should communicate meaning consistently. Do not use red casually. Do not use bright saturated colors unless there is a specific semantic need.

### 3.4 Typography

Use clear hierarchy:

- Large page titles for orientation.
- Medium section headings for scanability.
- Compact card labels for dashboard metrics.
- Large numeric values for financial outputs.
- Smaller muted helper text for assumptions and disclaimers.

Financial figures should be easy to read at a glance. Avoid tiny labels on charts and output cards.

### 3.5 Spacing and layout

The interface should use generous whitespace and predictable grid spacing. Dense forms and dashboards should be broken into sections. Cards should have clear titles, concise descriptions, and visually separated content areas.

The app should feel spacious enough for client-meeting use, while still allowing the advisor to manage multiple clients and scenarios efficiently.

---

## 4. Application Information Architecture

NorthStar should be organized around the advisor’s workflow.

Primary app areas:

1. Dashboard
2. Clients
3. Scenarios
4. Risk Modules
5. Reports
6. Presentations
7. Assumptions
8. Formula / Model Governance
9. Settings

### 4.1 Primary navigation

The persistent app shell should include a sidebar or primary navigation area with:

- Dashboard
- Clients
- Scenarios
- Risk Modules
- Reports
- Assumptions
- Settings

Optional later additions:

- Presentations
- Audit / Activity
- Help / Methodology
- Firm Admin

### 4.2 Top bar

The top bar should support quick advisor operations:

- Global client/scenario search.
- Quick create client.
- Start analysis.
- Notifications or task indicators.
- Advisor profile/settings.
- Optional firm/workspace switcher.

The top bar should not be overloaded. It should support quick access, not duplicate every sidebar action.

### 4.3 Breadcrumbs

Nested pages should use breadcrumbs or clear page context, especially in client and scenario workspaces.

Example mental path:

Dashboard → Clients → Jane Smith → Scenarios → Disability Income Gap Analysis

The advisor should always know which client and scenario they are viewing.

---

## 5. Global Dashboard Overview

### 5.1 Purpose

The dashboard overview is the advisor’s main global viewer for client and project tracking, management, and visualization.

It should answer:

- Which clients are active?
- Which scenarios are in progress?
- Which analyses are incomplete?
- Which clients have elevated modeled gaps?
- Which reports or presentations are ready?
- Which assumptions or formula versions are currently active?
- What should the advisor do next?

### 5.2 Dashboard role

The dashboard is not where every calculation happens. It is where prior work is summarized and routed.

It should provide:

- Book-of-business overview.
- Client tracking.
- Scenario/project tracking.
- Risk module coverage.
- Modeled gap summaries.
- Report/presentation readiness.
- Advisor tasks and next actions.
- Governance visibility.

### 5.3 Dashboard page layout

Recommended top-to-bottom structure:

1. Advisor workspace header
2. Primary action row
3. Summary metric cards
4. Risk exposure overview
5. Client/scenario tracking table
6. Risk module status cards
7. Recent presentations and reports
8. Advisor task queue
9. Model governance status

### 5.4 Advisor workspace header

The header should orient the advisor and reinforce product purpose.

Recommended elements:

- Page title: Dashboard or Advisor Workspace.
- Subtitle: Income gap analysis and risk visualization workspace.
- Optional current firm/advisor context.
- Primary actions: Create Client, Start Analysis, Open Reports, Review Assumptions.

### 5.5 Primary action row

The primary action row should give immediate access to the highest-frequency tasks:

- Create new client.
- Start income gap analysis.
- Continue recent scenario.
- Open presentation mode.
- Generate or review report.

Actions should be concise and visible. Avoid burying the most important workflow entry points in dropdowns.

### 5.6 Summary metric cards

The dashboard should use card-based metrics that matter to advisors.

Recommended cards:

- Total clients.
- Active scenarios.
- Incomplete analyses.
- Presented scenarios.
- Reports generated.
- Elevated modeled gap scenarios.
- Largest open modeled gap.
- Average modeled gap.

Each metric card should include:

- Clear label.
- Primary value.
- Short helper text.
- Optional trend or status indicator.
- Click-through to the relevant filtered view.

Avoid vanity metrics such as page views or generic app usage unless they directly support advisor workflow.

### 5.7 Risk exposure overview

This section should summarize modeled exposure across modules.

Recommended visualization patterns:

- Gap by risk module.
- Scenarios by severity.
- Average modeled gap by module.
- Open exposure by client segment.
- Reserve runway status for DI/unemployment scenarios.

Charts should be simple, readable, and connected to scenario output summaries. The dashboard should not recalculate every module in real time. It should display summarized outputs from saved calculation runs or scenario summaries.

### 5.8 Client/scenario tracking table

This should be the dashboard’s operational center.

Recommended columns:

- Client name.
- Scenario name.
- Risk module.
- Modeled gap or key output.
- Status.
- Last updated.
- Presentation status.
- Report status.
- Next action.

Recommended statuses:

- Draft.
- Inputs needed.
- Assumptions needed.
- Calculated.
- Ready for review.
- Presentation ready.
- Presented.
- Report generated.
- Archived.

The table should support:

- Search.
- Filtering by module.
- Filtering by status.
- Sorting by last updated, modeled gap, or readiness.
- Row actions.
- Empty state.

### 5.9 Risk module cards

Each risk module should have a dashboard card:

- Life Insurance.
- Disability Insurance.
- Unemployment.
- Liability / Lawsuit.

Each card should show:

- Module status.
- Number of active scenarios.
- Number of incomplete scenarios.
- Highest modeled gap.
- Most recent scenario.
- Shortcut to create a module-specific scenario.

Disability should receive special emphasis once built because it is the strategic flagship module.

### 5.10 Recent presentations and reports

This section should show meeting-ready artifacts.

Recommended row details:

- Client.
- Scenario.
- Module.
- Created date.
- Presentation status.
- Report status.
- Open action.

Reports and presentations should feel like first-class outputs, not afterthoughts.

### 5.11 Advisor task queue

The dashboard should surface tasks that require attention:

- Incomplete client profiles.
- Scenarios missing assumptions.
- Analyses not yet calculated.
- Reports ready for review.
- Presentations not yet generated.
- Assumption set changes since last calculation.
- Stale scenarios requiring review.

Tasks should be actionable and route the advisor directly to the correct screen.

### 5.12 Model governance status

Include a compact governance card for trust and traceability:

- Active formula versions by module.
- Active default assumption set.
- Last assumption update.
- Calculation runs logged.
- Optional methodology link.

This should reassure advisors that outputs are systematic, versioned, and traceable.

---

## 6. Clients List Page

### 6.1 Purpose

The Clients page is the advisor’s client directory and entry point into individual client workspaces.

It should support:

- Finding clients quickly.
- Creating new clients.
- Reviewing client status.
- Entering client detail pages.
- Seeing which clients have active or incomplete analyses.

### 6.2 Page structure

Recommended layout:

1. Page header
2. Primary action: Add Client
3. Search/filter bar
4. Client table or card/list view
5. Empty state for no clients

### 6.3 Client directory table

Recommended columns:

- Client name.
- Household status.
- Age or age range.
- Active scenarios.
- Highest open modeled gap.
- Last updated.
- Status.
- Next action.

The page should support filtering by:

- Active clients.
- Recently updated.
- Missing profile data.
- Has active scenarios.
- Has elevated modeled gap.

### 6.4 Client creation modal

Client creation should use a focused modal or drawer, not a sprawling page for MVP.

The modal should collect minimum required identity and baseline information:

- First name.
- Last name.
- Household status.
- Age.
- Optional spouse/partner indicator.
- Optional dependents.
- Optional notes.

The modal should give the advisor a clear choice after saving:

- Open client dashboard.
- Start analysis.
- Add another client.

The UI should avoid asking every financial input during initial creation. Detailed financial inputs belong in the client profile or scenario workflow.

---

## 7. Individual Client Detail Workspace

### 7.1 Purpose

The individual client detail UI should feel like a modern, clean, friendly client dashboard. It should be the advisor’s dedicated workspace for that client.

The client detail page should let the advisor:

- Understand the client profile quickly.
- Review household and financial baseline data.
- Track scenarios and risk modules for the client.
- Start new analyses.
- Access presentations and reports.
- Review assumptions and audit history.
- Maintain notes.

### 7.2 Client workspace header

Each client workspace should have a persistent header that stays consistent across tabs.

Recommended elements:

- Client name.
- Household status.
- Age.
- Dependents.
- Primary income summary.
- Client status.
- Last updated.
- Key actions: Start Analysis, Generate Report, Open Presentation, Edit Profile.

The header should give immediate context without forcing the advisor to switch tabs.

### 7.3 Multi-tab navigation model

The client detail page should use a horizontal tab navigation bar below the client header.

Recommended tabs:

1. Overview
2. Profile
3. Scenarios
4. Risk Modules
5. Income Gap Analysis
6. Presentations
7. Reports
8. Notes
9. Audit / History

The MVP can start with fewer tabs, but the tab model should support expansion.

Suggested MVP tabs:

1. Overview
2. Profile
3. Scenarios
4. Analysis
5. Reports
6. Notes

### 7.4 Tab behavior

Tabs should behave like sections of the client workspace.

They should:

- Preserve client context.
- Keep the client header visible.
- Show clear active state.
- Support direct URLs where possible.
- Avoid resetting unsaved work unintentionally.
- Show small status indicators when useful.

Example indicators:

- Profile tab shows incomplete badge.
- Scenarios tab shows count.
- Reports tab shows ready count.
- Audit tab shows recent calculation count.

### 7.5 Client Overview tab

The Overview tab should be the client-level command center.

It should show:

- Client snapshot.
- Key household facts.
- Active scenarios.
- Recent analysis outputs.
- Highest modeled gaps.
- Report/presentation readiness.
- Advisor next actions.

Recommended sections:

1. Client summary cards
2. Active risk scenarios
3. Modeled gap summary
4. Recent reports/presentations
5. Advisor notes preview
6. Next action prompts

The Overview tab should not be a form-heavy page. It should be a clear summary surface.

### 7.6 Client Profile tab

The Profile tab should contain structured client and household data.

Recommended profile sections:

- Basic information.
- Household structure.
- Dependents.
- Income and employment.
- Monthly expenses.
- Emergency savings.
- Existing protection.
- Debts and obligations.
- Planning notes.

Use progressive disclosure. The advisor should not see a massive single form by default.

Profile fields should be grouped into cards or accordions. Each card should show completion status.

### 7.7 Scenarios tab

The Scenarios tab should list all client scenarios.

Recommended scenario row/card details:

- Scenario name.
- Risk module.
- Status.
- Last calculated date.
- Modeled gap.
- Presentation status.
- Report status.
- Last updated.
- Action menu.

Primary actions:

- Create scenario.
- Open scenario.
- Duplicate scenario.
- Archive scenario.
- Generate report.
- Open presentation.

### 7.8 Risk Modules tab

The Risk Modules tab should show module-level progress for the client.

Each module card should show:

- Whether the module has been used for this client.
- Number of scenarios.
- Latest modeled output.
- Completion status.
- Next recommended workflow action.

This tab should make it easy to see whether the client has a life analysis, DI analysis, unemployment scenario, or liability scenario.

### 7.9 Income Gap Analysis tab

This tab should aggregate the client’s income/protection gap outputs across modules.

It should show:

- Combined risk summary.
- Modeled gap by module.
- DI monthly gap and reserve runway.
- Life protection gap.
- Unemployment runway.
- Liability exposure summary.
- Recent calculation runs.

This is a client-level analytical dashboard, not the module input workspace. For editing or calculating, the advisor should open the relevant scenario/module.

### 7.10 Presentations tab

This tab should list all client presentation artifacts.

Recommended details:

- Presentation name.
- Scenario/module.
- Created date.
- Last opened date.
- Status.
- Actions: Open, duplicate, archive.

### 7.11 Reports tab

The Reports tab should list generated client reports.

Recommended details:

- Report title.
- Scenario/module.
- Report type.
- Created date.
- Status.
- Export/open action.

Reports should preserve historical state. The UI should make it clear when a report was generated from a prior calculation run.

### 7.12 Notes tab

The Notes tab should support advisor-owned notes.

Recommended note categories:

- General client notes.
- Meeting notes.
- Scenario notes.
- Assumption notes.
- Follow-up tasks.

Notes should be clearly internal unless intentionally included in a report.

### 7.13 Audit / History tab

This tab should expose calculation and workflow traceability.

Recommended items:

- Calculation runs.
- Formula versions used.
- Assumption snapshots.
- Report generation events.
- Presentation events.
- Profile updates.
- Scenario status changes.

The tab should be readable, not forensic by default. Advanced audit details can open in a modal or drawer.

---

## 8. Scenario Workspace

### 8.1 Purpose

A scenario is the working object for a specific analysis. It should feel like a project page for one modeled risk event.

A scenario workspace should answer:

- What client is this for?
- What risk module is being modeled?
- What inputs are required?
- What assumptions are being used?
- What outputs have been generated?
- What charts are available?
- Is it ready to present?
- Is a report available?

### 8.2 Scenario header

The scenario header should show:

- Scenario name.
- Client name.
- Risk module.
- Status.
- Last calculated date.
- Formula version.
- Actions: Calculate, Present, Generate Report, Duplicate, Archive.

### 8.3 Scenario tab navigation

Recommended scenario tabs:

1. Overview
2. Inputs
3. Assumptions
4. Outputs
5. Visuals
6. Presentation
7. Report
8. Audit

The MVP may combine Outputs and Visuals, but the architecture should anticipate both.

### 8.4 Scenario Overview tab

Shows:

- Scenario status.
- Required input completion.
- Assumption summary.
- Latest modeled gap.
- Visual preview.
- Next actions.

This tab should function as the project dashboard for the scenario.

### 8.5 Inputs tab

The Inputs tab should collect scenario-specific data.

Rules:

- Group inputs into logical sections.
- Use helper copy for complicated fields.
- Validate early and clearly.
- Avoid dense wall-of-form layouts.
- Show completion progress.
- Allow saving draft inputs.

### 8.6 Assumptions tab

The Assumptions tab should show all assumptions used by the analysis.

It should differentiate:

- System defaults.
- Advisor-entered assumptions.
- Client-provided data.
- Policy-document values.
- Optional benefit assumptions.

Each assumption should be visible and understandable. Advanced assumptions may be collapsed, but not hidden from the report or audit trail.

### 8.7 Outputs tab

The Outputs tab should show calculated cards and summary metrics.

Output cards should be clear, large, and client-discussion-ready.

Recommended output card structure:

- Label.
- Primary value.
- Short explanation.
- Related assumption note.
- Severity or status indicator where appropriate.

### 8.8 Visuals tab

The Visuals tab should show the charts and visual explanations generated from the analysis.

Each chart should include:

- Title.
- Short description.
- Legend.
- Clear axis labels where applicable.
- Assumption footnote if needed.
- Optional expand/presentation action.

Charts should be organized by narrative flow, not randomly stacked.

### 8.9 Presentation tab

The Presentation tab should preview the client-facing version of the scenario.

It should allow the advisor to:

- Review slides/sections.
- Hide or show selected sections.
- Review disclaimer placement.
- Launch full-screen presentation mode.

### 8.10 Report tab

The Report tab should preview the printable/exportable report.

It should show:

- Report sections.
- Included charts.
- Included assumptions.
- Disclaimer block.
- Calculation timestamp.
- Formula version.
- Export action.

### 8.11 Audit tab

The Audit tab should expose technical traceability:

- Calculation run ID or reference.
- Input snapshot summary.
- Assumption snapshot summary.
- Formula version.
- Disclaimer version.
- Generated outputs.
- Report snapshot references.

The audit tab should be precise but not intimidating.

---

## 9. Risk Module Workspaces

### 9.1 Module role

Each risk module is a focused analysis tool. Modules should share a common UX structure while preserving module-specific inputs, outputs, and visuals.

Core modules:

1. Life Insurance
2. Disability Insurance
3. Unemployment
4. Liability / Lawsuit

### 9.2 Shared module UX pattern

Each module should follow:

1. Module question
2. Input sections
3. Assumptions
4. Calculate/recalculate action
5. Output cards
6. Visual explanations
7. Static explanation language
8. Presentation/report action
9. Disclaimer

### 9.3 Module header

Each module page should start with a clear client-facing question.

Examples:

- Life Insurance: If I die prematurely, what income and financial support disappears for my family?
- Disability Insurance: If I cannot work due to illness or injury, how does my financial plan change?
- Unemployment: How long can I sustain my financial plan after job loss?
- Liability / Lawsuit: What assets or future earnings are exposed if I face a lawsuit?

This question should guide the interface.

### 9.4 Module-side guidance

Complex modules should include contextual helper panels.

The helper panel may explain:

- What the module models.
- What the module does not model.
- Which inputs are required.
- How assumptions affect outputs.
- What the advisor should review before presenting.

The helper panel should not provide advice or product recommendations.

---

## 10. Life Insurance Analysis UX

### 10.1 Purpose

Life Insurance is the simplest proof-of-concept module. It should prove the input → assumption → output → visual → presentation flow.

### 10.2 Input experience

Group inputs into logical sections:

1. Income and replacement period
2. Existing coverage
3. Financial obligations
4. Family/dependent context
5. Optional resources and assumptions

The interface should be approachable. Life insurance should feel like the easiest module to complete.

### 10.3 Output experience

Primary output cards:

- Modeled protection need.
- Existing coverage total.
- Remaining protection gap.
- Coverage offset percentage.
- Income replacement period.

### 10.4 Visuals

Recommended visual sequence:

1. Protection need stack
2. Existing coverage offset
3. Remaining gap visualization
4. Survivor financial timeline

The visuals should help the client understand what income and obligations are exposed by premature death.

### 10.5 Advisor interpretation panel

Include a static explanation block that frames the result as a modeled planning estimate. It should not say the client needs or should buy a certain amount of insurance.

---

## 11. Disability Insurance Analysis UX

### 11.1 Purpose

Disability Insurance is the flagship module. It should be the most visually powerful and educational part of NorthStar.

The UX must make disability risk easier to understand:

- The client is alive.
- Expenses continue.
- Income may stop or partially decline.
- Benefits may be delayed.
- Savings may be depleted.
- Duration is uncertain.
- Recovery path matters.

### 11.2 Input experience

DI inputs should be progressively structured. Do not put all fields into one dense form.

Recommended input sections:

1. Income and work status
2. Monthly expenses
3. Emergency savings
4. Employer short-term disability benefits
5. Employer long-term disability benefits
6. Private DI coverage
7. Spouse/partner income
8. State/government benefits
9. Taxability assumptions
10. Disability scenario type
11. Recovery timeline

### 11.3 Benefit stream UI

DI should use a benefit-stream style interface.

Each benefit stream should be represented as an editable card:

- Benefit label.
- Monthly amount.
- Waiting period.
- Start timing.
- Duration.
- Taxability.
- Cap/limit if applicable.
- Included/excluded toggle.

The UI should help advisors understand each benefit as a timeline component.

### 11.4 Partial vs total disability selector

The module should support a clean scenario selector:

- Total disability.
- Partial disability.
- Compare both.

This selector should make it easy to demonstrate how outcomes differ across severity.

### 11.5 Output experience

Primary output cards:

- Monthly income gap.
- Reserve depletion month.
- Total uncovered gap.
- Total benefits offset.
- Lifestyle compression required.
- Recovery status summary.

### 11.6 Visuals

Recommended visual sequence:

1. Income collapse curve
2. Financial survival timeline
3. Benefit stream stack
4. Protection gap stack
5. Partial vs total comparison
6. Lifestyle compression model
7. Recovery path comparison

The visual story should move from shock → support → gap → survival → recovery.

### 11.7 DI presentation UX

The DI presentation view should emphasize the income collapse and reserve timeline first. Clients should immediately understand that the issue is not only income replacement, but also how long the household can function under reduced income.

---

## 12. Unemployment Analysis UX

### 12.1 Purpose

The Unemployment module should show how long the household can sustain expenses after job loss.

### 12.2 Input sections

Recommended sections:

- Current monthly income.
- Monthly expenses.
- Emergency savings.
- Severance.
- Unemployment benefits.
- Spouse/partner income.
- Estimated job search duration.
- Debt payments.

### 12.3 Outputs

Primary output cards:

- Monthly shortfall.
- Emergency reserve runway.
- Cash depletion month.
- Total uncovered shortfall.
- Recovery duration.

### 12.4 Visuals

Recommended visuals:

- Reserve runway chart.
- Monthly shortfall chart.
- Cash depletion timeline.
- Recovery path timeline.

---

## 13. Liability / Lawsuit Analysis UX

### 13.1 Purpose

The Liability module should help advisors show potential asset or future income exposure if a lawsuit or liability event occurs.

### 13.2 Input sections

Recommended sections:

- Asset profile.
- Home equity.
- Savings/investments.
- Business assets.
- Future income exposure.
- Existing liability coverage.
- Umbrella coverage.
- Estimated claim scenario.
- Protected assets.

### 13.3 Outputs

Primary output cards:

- Gross exposed assets.
- Current coverage total.
- Coverage gap.
- Net asset exposure.
- Asset at risk.

### 13.4 Visuals

Recommended visuals:

- Asset exposure stack.
- Coverage gap chart.
- Wealth erosion scenario.
- Protection adequacy summary.

### 13.5 Legal boundary

The UI must clearly state that liability modeling is illustrative and not legal advice. Legal exposure is jurisdiction-specific and should be reviewed by qualified professionals.

---

## 14. Analysis Tool Modals and Drawers

### 14.1 Purpose

Modals and drawers should reduce navigation friction and support quick actions without forcing full page transitions.

Use modals/drawers for:

- Creating a client.
- Starting a scenario.
- Selecting a risk module.
- Editing a small input group.
- Reviewing assumptions.
- Confirming recalculation.
- Generating a report.
- Launching presentation mode.
- Viewing audit details.

Do not use modals for long, complex workflows that require multi-step entry. Use a dedicated page or wizard for those.

### 14.2 Start Analysis modal

This is one of the most important modals.

It should help the advisor choose:

- Client.
- Scenario name.
- Risk module.
- Starting assumption set.
- Whether to start from blank, duplicate an existing scenario, or use a template.

The modal should end with a clear action:

- Start Analysis.

After submission, route the advisor directly to the scenario/module workspace.

### 14.3 Risk module selection modal

This modal should present modules as cards:

- Life Insurance
- Disability Insurance
- Unemployment
- Liability / Lawsuit

Each card should include:

- Client-facing question.
- Short module description.
- Required input burden indication.
- Recommended use case.

### 14.4 Assumption review drawer

Assumptions should be reviewable without leaving the workflow.

The drawer should show:

- Active assumption set.
- Module-specific assumptions.
- Source of each assumption.
- Editable/non-editable status.
- Visibility in report.
- Last updated information.

### 14.5 Recalculate confirmation modal

When inputs or assumptions change after a calculation, the app should clearly explain that outputs need to be recalculated.

The modal should show:

- What changed.
- Whether prior outputs will be preserved historically.
- Whether a new calculation run will be created.
- Confirm recalculation action.

### 14.6 Report generation modal

The report modal should let the advisor choose:

- Report title.
- Included sections.
- Included charts.
- Included assumptions.
- Disclaimer placement.
- Notes inclusion.

The advisor should be able to preview before export.

### 14.7 Presentation launch modal

Before entering presentation mode, the advisor should confirm:

- Scenario/client.
- Included sections.
- Client-facing disclaimer visibility.
- Whether internal notes are hidden.

---

## 15. Presentation Mode UX

### 15.1 Purpose

Presentation mode is the client-meeting view. It should remove administrative complexity and show a polished explanation of the modeled risk.

### 15.2 Presentation design

Presentation mode should be:

- Clean.
- Full-screen friendly.
- Large typography.
- Minimal navigation.
- Focused on one visual/message at a time.
- Easy to move through in sequence.

### 15.3 Presentation structure

Recommended section sequence:

1. Client and scenario title
2. What this scenario models
3. Key assumptions
4. Main income/protection gap visual
5. Supporting offset visual
6. Timeline or reserve view
7. Summary output cards
8. Advisor discussion prompts
9. Disclaimer

### 15.4 Presentation controls

Controls should be minimal:

- Previous / next.
- Exit presentation.
- Toggle assumptions.
- Toggle disclaimer.
- Open report.

Internal notes should be hidden by default in client-facing mode.

---

## 16. Report UX

### 16.1 Purpose

Reports are exportable meeting artifacts. They should preserve a scenario’s outputs, assumptions, visuals, disclaimer, and calculation context.

### 16.2 Report preview page

The report preview should show:

- Report title.
- Client name.
- Advisor/firm information.
- Scenario/module.
- Calculation date.
- Formula/model version label.
- Included visuals.
- Output summary.
- Assumptions summary.
- Static explanation.
- Disclaimer.

### 16.3 Report sections

Recommended report sections:

1. Cover/header
2. Scenario overview
3. Client baseline summary
4. Assumptions used
5. Key outputs
6. Visual explanation
7. Advisor discussion section
8. Limitations and disclaimer
9. Calculation snapshot summary

### 16.4 Report status

Reports should have statuses:

- Draft.
- Ready for review.
- Exported.
- Presented.
- Archived.

Reports should preserve historical output state even if the underlying scenario is later recalculated.

---

## 17. Assumptions and Governance UX

### 17.1 Purpose

The Assumptions page gives advisors and firms control over the modeling defaults used across modules.

This page should feel like a governance/admin surface, not a client-facing dashboard.

### 17.2 Assumptions page layout

Recommended sections:

- Active default assumption set.
- Module-specific assumptions.
- Advisor/firms defaults.
- Recently changed assumptions.
- Impact warning when assumptions affect existing scenarios.

### 17.3 Assumption set management

The UI should allow advisors to:

- View assumption sets.
- Create a new assumption set.
- Duplicate an existing set.
- Edit allowed assumptions.
- Mark a default set.
- See where an assumption set is used.

### 17.4 Formula/model version visibility

The app should show formula/model version information without overwhelming the user.

Recommended display:

- Current active model version by module.
- Effective date.
- Short description.
- Change summary.
- Historical versions.

This is not meant to expose implementation code; it is meant to support trust and traceability.

---

## 18. Settings UX

### 18.1 Advisor settings

Advisor settings should include:

- Advisor profile.
- Firm name and branding.
- Contact details.
- Default report footer.
- Default disclaimer display preferences.
- Optional logo upload.

### 18.2 Workspace settings

Workspace settings may include:

- Default landing page.
- Default dashboard filters.
- Default assumption set.
- Report formatting preferences.
- Presentation style preferences.

### 18.3 Security settings

Security settings may include:

- Password/account settings.
- Session management.
- Team access later.
- Advisor/firms access scope later.

---

## 19. Navigation System

### 19.1 Global sidebar

The global sidebar should support the main app areas and stay consistent across dashboard, clients, scenarios, reports, assumptions, and settings.

Recommended items:

- Dashboard
- Clients
- Scenarios
- Risk Modules
- Reports
- Assumptions
- Settings

### 19.2 Client-level tabs

Client tabs should switch between client-specific workspaces while preserving client identity.

Recommended tabs:

- Overview
- Profile
- Scenarios
- Risk Modules
- Analysis
- Presentations
- Reports
- Notes
- Audit / History

### 19.3 Scenario-level tabs

Scenario tabs should organize a single analysis project.

Recommended tabs:

- Overview
- Inputs
- Assumptions
- Outputs
- Visuals
- Presentation
- Report
- Audit

### 19.4 Module-level tabs

Inside a module, tabs or section anchors can organize analysis steps:

- Inputs
- Assumptions
- Results
- Visuals
- Presentation

Module navigation should remain simple. Do not over-tab small modules.

---

## 20. Empty States, Loading States, and Error States

### 20.1 Empty states

Empty states should be useful and action-oriented.

Examples:

- No clients yet: prompt to create first client.
- No scenarios yet: prompt to start first analysis.
- No reports yet: explain reports appear after analysis.
- No calculation runs yet: prompt to complete inputs and calculate.

### 20.2 Loading states

Loading states should preserve layout where possible. Use skeleton cards/tables rather than abrupt spinners.

### 20.3 Error states

Errors should be clear and recoverable.

Examples:

- Missing required inputs.
- Invalid assumption value.
- Calculation unavailable.
- Report generation failed.
- Data could not load.

Error text should be specific enough for the advisor to fix the issue.

---

## 21. Responsive Behavior

### 21.1 Desktop-first but responsive

NorthStar is primarily a desktop/tablet advisor tool. The main experience should be optimized for laptops and larger screens.

However, the UI should remain usable on tablets and narrower screens.

### 21.2 Mobile behavior

On mobile:

- Sidebar should collapse.
- Tables should become stacked cards or horizontally scrollable.
- Charts should simplify.
- Multi-tab bars should scroll horizontally.
- Primary actions should remain accessible.

NorthStar does not need to feel like a consumer mobile app, but it should not break on smaller devices.

---

## 22. Accessibility and Usability Standards

The UI should be accessible and advisor-friendly.

Requirements:

- Keyboard-accessible navigation.
- Clear focus states.
- Proper contrast.
- Readable chart labels.
- Text alternatives for chart meaning where needed.
- Avoid color-only meaning.
- Consistent button labels.
- Predictable tab behavior.
- Clear form validation messages.
- Accessible modals and drawers.

Charts should use labels, legends, and tooltips so that meaning is not communicated only through color.

---

## 23. Component Ownership and UI Source Strategy

### 23.1 Tremor-first dashboard strategy

Use Tremor Blocks and Tremor-style components as the primary UI reference for:

- Dashboard shell.
- Cards.
- Tables.
- Tabs.
- Filters.
- Badges.
- Chart containers.
- Layout grids.
- Empty states.

Final components should be NorthStar-owned, reviewed, renamed, simplified, and adapted.

### 23.2 Visualization source strategy

Use Tremor chart components or Tremor-inspired chart layouts as the primary visualization source when suitable.

Use custom NorthStar-owned chart components when the visual storytelling requires specialized layouts, especially for:

- DI income collapse curve.
- Reserve depletion timeline.
- Benefit stream stack.
- Partial vs total disability comparison.
- Recovery path comparison.

Mario Charts may be used only as a fallback reference if Tremor cannot support a particular visualization pattern.

### 23.3 Component responsibility boundaries

UI components must not contain:

- Financial formulas.
- Scenario calculations.
- Business rules.
- Compliance interpretation.
- Product recommendations.
- Tax/legal advice.
- AI logic.

UI components should receive prepared data and render it clearly.

---

## 24. End-to-End Advisor Workflow

### 24.1 New client workflow

1. Advisor opens dashboard.
2. Advisor selects Create Client.
3. Advisor enters minimal client information.
4. Advisor lands in client workspace.
5. Advisor completes profile sections as needed.
6. Advisor starts first analysis.

### 24.2 Start analysis workflow

1. Advisor selects client.
2. Advisor opens Start Analysis modal.
3. Advisor chooses risk module.
4. Advisor names scenario.
5. Advisor selects assumption set.
6. Advisor enters scenario workspace.
7. Advisor completes inputs.
8. Advisor reviews assumptions.
9. Advisor calculates outputs.
10. Advisor reviews visuals.
11. Advisor opens presentation or report.

### 24.3 Review existing client workflow

1. Advisor opens dashboard.
2. Advisor searches or selects client.
3. Advisor opens client overview.
4. Advisor reviews active scenarios and gaps.
5. Advisor opens relevant scenario or report.
6. Advisor updates or presents as needed.

### 24.4 Presentation workflow

1. Advisor opens scenario.
2. Advisor reviews outputs and visuals.
3. Advisor opens Presentation tab.
4. Advisor chooses sections to show.
5. Advisor launches presentation mode.
6. Advisor walks client through visuals.
7. Advisor exits and optionally generates report.

### 24.5 Report workflow

1. Advisor opens scenario or client reports tab.
2. Advisor selects Generate Report.
3. Advisor chooses included sections.
4. Advisor previews report.
5. Advisor exports or saves report.
6. Report snapshot is preserved historically.

---

## 25. UX Acceptance Criteria

The UI/UX is acceptable when:

- Advisors can create a client without confusion.
- Advisors can find any client quickly.
- Advisors can start a risk analysis from the dashboard or client page.
- Client detail pages use clear tab navigation.
- Scenario pages use clear tab navigation.
- Inputs are grouped and not overwhelming.
- Assumptions are visible and reviewable.
- Output cards are readable and presentation-ready.
- Charts are understandable without advisor over-explanation.
- Dashboard shows global client/scenario/project status.
- Reports and presentations are easy to access.
- Disclaimers are visible where required.
- No UI language implies recommendations or guarantees.
- No calculation logic is embedded in UI components.
- The product feels modern, clean, professional, and advisor-friendly.

---

## 26. Final UI/UX Positioning

NorthStar should be experienced as:

> A modern advisor workspace for income gap analysis, client risk visualization, scenario management, and presentation-ready risk communication.

The product should feel cohesive from top to bottom:

- Dashboard as global command center.
- Client detail as individual client dashboard.
- Scenario workspace as project workspace.
- Risk module pages as analysis tools.
- Presentation mode as client meeting view.
- Reports as exportable artifacts.
- Assumptions/governance as trust and traceability layer.

Every UI decision should support the advisor’s core job:

> Understand the client, model the risk, show the gap, and guide the conversation.
