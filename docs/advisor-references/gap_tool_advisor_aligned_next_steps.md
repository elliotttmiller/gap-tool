# Gap Tool Next Steps: Advisor-Aligned Pipeline Refinement & Production Refocus

**Document purpose:**  
This document defines the next practical steps for refining, optimizing, and refocusing the Gap Tool application so it truthfully matches the advisor’s original wants, needs, expectations, and prototype workflow.

This is not a request to make the app larger. It is a request to make the app **more accurate to the original product intent**:

> A simple, polished, advisor-operated input/output risk gap visualization tool.

The app should help an advisor enter client or household information, generate a risk review, and visually explain income/protection gaps across core risk events: premature death, disability, unemployment, and lawsuit/liability exposure.

---

## 1. Executive Summary

The current app is directionally strong, but it must be pulled back toward the advisor’s original workflow.

The advisor’s original HTML app proves that the first version was not intended to be a broad advisor platform, full CRM, report-generation suite, or complex financial planning system. It was a focused session-based tool:

```text
Client Setup
→ Generate Income Gap Analysis
→ Death
→ Lawsuit
→ Unemployment
```

The current React/TypeScript app should remain more modern and production-grade than the original HTML prototype, but the original prototype should now be treated as the **product behavior reference**.

The current app should therefore become:

```text
Dashboard / Client List
→ Add or Select Client
→ Client Setup
→ Generate Risk Review
→ Life Insurance / Disability / Unemployment / Liability-Lawsuit tabs
→ Clear visual outputs
→ Presentation Mode
```

The key correction is this:

```text
Do not build a bigger platform first.
Build the original advisor workflow correctly, with real saved client/scenario data, polished UI, and truthful deterministic outputs.
```

---

## 2. Primary Product Boundary

The app must remain a **gap visualization tool**, not a comprehensive planning or insurance sales platform.

### The app should do this

- Let an advisor create or select a client/household.
- Let the advisor enter client setup data.
- Let the advisor generate a risk review.
- Let the advisor switch through risk tabs.
- Let the advisor visually show what financial gap appears under each risk event.
- Let the advisor explain how existing coverage/resources offset part of the gap.
- Let the advisor show what modeled gap remains.
- Let the advisor save and return to the analysis.
- Let the advisor open a clean presentation view.

### The app should not do this during MVP

- Recommend specific products.
- Recommend carriers.
- Generate policy illustrations.
- Estimate premiums.
- Perform underwriting.
- Provide tax advice.
- Provide legal advice.
- Replace advisor judgment.
- Become a full CRM.
- Become a full financial planning suite.
- Build heavy assumptions/governance UI before the main workflow is stable.

---

## 3. What the Advisor Actually Asked For

The advisor’s notes and original app point to the same requirement:

```text
Input client/profile data
→ generate visual risk gap outputs
→ help clients understand risk
→ discuss solutions later
```

The core modules are:

1. **Life Insurance / Death**
   - What happens financially if an income earner dies prematurely?
   - How much income disappears?
   - How much is offset by group life coverage?
   - How much is offset by private life insurance?
   - What survivor income gap remains?

2. **Disability**
   - What happens if illness or injury prevents the client from working?
   - What income disappears fully or partially?
   - What benefits/resources offset the income loss?
   - How long do reserves last?
   - What monthly and cumulative gap remains?

3. **Unemployment**
   - What happens if employment income stops?
   - How much emergency reserve should exist?
   - How many months can the client cover income/expense disruption?
   - What shortfall appears?

4. **Liability / Lawsuit**
   - What assets/income may be exposed in a simplified lawsuit scenario?
   - What coverage exists?
   - What modeled exposure gap remains?

---

## 4. Product Truth from the Original HTML Prototype

The original HTML app should be treated as a product-intent reference, not a technical implementation reference.

### Preserve these product behaviors

- A visible **Client Setup** starting point.
- A simple **Generate Income Gap Analysis** action.
- Tab-based risk module navigation.
- Simple language:
  - Client Setup
  - Death
  - Lawsuit
  - Unemployment
- Single/couple client type support.
- Primary and secondary income earner blocks.
- Earner-specific income and life coverage.
- Household-level liability coverage.
- Clear visual charts/cards.
- Advisor-friendly stat cards.
- Simple, understandable calculations.

### Do not preserve these technical details

- One-file HTML architecture.
- Inline styles everywhere.
- Direct DOM string concatenation.
- Global mutable state.
- Canvas-only chart rendering.
- Hardcoded sample values as production data.
- Business logic mixed into UI code.

The modern app should preserve the old app’s simplicity while using the new app’s React/TypeScript architecture.

---

## 5. Correct Product Hierarchy

The app should be organized around this hierarchy:

```text
Advisor Workspace
  → Client / Household
    → Client Setup
      → Risk Review Scenario
        → Risk Module Tabs
          → Inputs
          → Outputs
          → Presentation View
```

The user experience should feel client-first, not system-first.

### Correct mental model

```text
I am an advisor.
I select or create a client.
I enter basic client information.
I generate a risk review.
I show the client the risk gap by tab.
```

### Incorrect mental model

```text
I manage a complex financial planning platform.
I configure assumptions and governance.
I manage reports/settings/users before analyzing the client.
```

---

## 6. Required Navigation Refinement

The app should use a two-level navigation model.

### Global app navigation

Keep this simple:

```text
Dashboard
Clients
Reports
Settings
```

For MVP, **Dashboard** and **Clients** matter most. Reports and Settings can remain simple or secondary.

### Client-level navigation

Each client should have a dedicated workspace with tabs:

```text
Overview
Client Setup
Risk Review
Presentations
Reports
Notes
```

Avoid surfacing Audit as a primary advisor tab during MVP unless specifically needed. It may exist internally or as a developer/admin feature later.

### Risk Review module tabs

Use modern professional labels while preserving the original tab clarity:

```text
Life Insurance
Disability
Unemployment
Liability / Lawsuit
```

Each tab should include helper text:

```text
Life Insurance — premature death income gap
Disability — illness or injury income gap
Unemployment — emergency reserve runway
Liability / Lawsuit — asset and income exposure
```

This preserves the old app’s simplicity while making the current product more professional.

---

## 7. Required Data Model Refocus

The app must move away from hardcoded mock clients and global default module inputs.

### Core rule

```text
Client profile data is reusable baseline data.
Scenario module inputs are scenario-specific analysis data.
```

A client profile should initialize a scenario, but once a scenario is created, the module inputs belong to that scenario.

---

## 8. Minimum Production Data Objects

### Client / Household

Represents the household or individual being reviewed.

Should include:

```text
id
advisorId
displayName
clientType: individual | couple
status: draft | active | archived
createdAt
updatedAt
profileCompletionStatus
```

### Income Earner

Represents a primary or secondary earner.

Should include:

```text
id
clientId
role: primary | secondary
name
age
annualIncome
```

### Earner Coverage

Represents coverage tied to a specific income earner.

Should include:

```text
id
clientId
earnerId
groupLifeCoverage
privateLifeCoverage
privateLifePolicyType
privateLifeTermYears
nonQualifiedAssets
```

### Household Financial Profile

Represents reusable household-level financial assumptions.

Should include:

```text
clientId
monthlyExpenses
emergencySavings
spouseOrSecondaryIncome
debts
educationGoal
finalExpenses
autoLiabilityLimit
homeLiabilityLimit
umbrellaCoverage
homeValue
mortgageBalance
investmentAssets
savingsAssets
```

### Scenario / Risk Review

Represents a saved risk review project for a client.

Should include:

```text
id
clientId
name
status
includedModules
startingModule
createdAt
updatedAt
lastCalculatedAt
lastPresentedAt
```

### Scenario Module Record

Represents one module inside a scenario.

Should include:

```text
id
scenarioId
clientId
moduleType
status
inputs
assumptions
outputs
chartData
narrative
disclaimerVersion
formulaVersion
createdAt
updatedAt
lastCalculatedAt
```

---

## 9. Persistence Strategy

The app can use local browser persistence for MVP, but it must be abstracted behind repository/service functions so it can later move to Firebase or a database without rewriting UI.

### Recommended MVP persistence path

```text
Phase 1: Repository-backed localStorage
Phase 2: IndexedDB if local state becomes larger or more structured
Phase 3: Firebase when multi-device/user persistence is required
```

`localStorage` is acceptable for a small MVP because it persists data across browser sessions for the same origin, but it is string-based and limited in structure. IndexedDB is better for larger structured data because it supports object stores, transactions, and large-scale browser storage.

### Required repository/service layer

Do not let React pages call localStorage directly.

Correct:

```text
UI component
→ service/repository method
→ localStorage / IndexedDB / Firebase
```

Incorrect:

```text
UI component
→ localStorage.getItem(...)
```

### Minimum repository methods

```text
createClient
updateClient
getClient
listClients
archiveClient

createIncomeEarner
updateIncomeEarner
listIncomeEarnersByClient

createScenario
updateScenario
getScenario
listScenariosByClient

createScenarioModule
updateScenarioModule
getScenarioModule
listScenarioModulesByScenario

saveCalculationSnapshot
listCalculationSnapshotsByScenario
```

---

## 10. Correct End-to-End Workflow

### Step 1: Advisor opens dashboard

The dashboard should answer:

```text
Which clients exist?
Which analyses are incomplete?
Which analyses are ready to present?
Where should the advisor continue?
```

It should not become a complex analytics system.

### Step 2: Advisor creates/selects client

The app should support:

```text
Add Client
Select Existing Client
Continue Risk Review
```

### Step 3: Advisor completes Client Setup

Minimum setup sections:

```text
Basic Information
Client Type
Income Earners
Existing Life Coverage
Household Financial Baseline
Household Liability Coverage
```

### Step 4: Advisor generates risk review

Button:

```text
Generate Risk Review
```

or:

```text
Start Income Gap Analysis
```

When clicked:

```text
Validate minimum setup
Create scenario
Create selected module records
Initialize module inputs from client profile
Navigate to first included module tab
```

### Step 5: Advisor reviews tabs

Tabs should be simple and persistent:

```text
Life Insurance
Disability
Unemployment
Liability / Lawsuit
```

Only included modules should show for that scenario.

### Step 6: Advisor edits module-specific inputs

Inputs should be prefilled from client setup but editable per scenario.

### Step 7: App calculates deterministic outputs

Calculation should remain deterministic:

```text
inputs + assumptions
→ calculation engine
→ outputs
→ chart transformer
→ visual UI
```

### Step 8: Advisor saves scenario

Save should persist:

```text
module inputs
assumptions
outputs
chart data
timestamp
status
```

### Step 9: Advisor presents

Presentation mode should read real saved data, not recalculated mock data.

---

## 11. Module-Specific Next Steps

## 11.1 Life Insurance / Death

The old app’s Death module is the clearest product reference.

### Keep the main visual

The main chart should continue showing:

```text
Projected income to retirement
Covered by group life insurance
Covered by private life insurance
Remaining survivor income gap
```

### Required setup data

```text
earner age
earner income
retirement age
income growth assumption
group life coverage
private life coverage
policy type
term length if term
```

### Outputs

```text
total projected income
annualized group life offset
annualized private life offset
cumulative survivor gap
percent of projected income uncovered
```

### MVP guardrail

Do not turn this into a full insurance illustration platform.

Avoid:

```text
premium comparisons
carrier comparisons
underwriting estimates
cash value projections
policy recommendation language
```

---

## 11.2 Disability

Disability is allowed to be deeper because the advisor specifically identified it as a key department and likely the most important module.

### Required setup data

```text
earned income
monthly expenses
emergency savings
spouse/secondary income
STD benefit
LTD benefit
private DI benefit
waiting periods
benefit durations
taxability assumptions
partial disability income percentage
total disability income percentage
modeled duration
```

### Core outputs

```text
monthly income gap
reserve depletion timeline
benefit offset stack
partial vs total disability comparison
lifestyle compression or spending reduction required
recovery/duration scenario
```

### MVP guardrail

Do not exceed 4–5 visuals unless the advisor confirms the setup.

The correct goal is to help the client understand:

```text
If you cannot work, what income disappears?
What benefits/resources replace some of it?
How long do savings last?
What gap remains?
```

---

## 11.3 Unemployment

The original unemployment module is intentionally simple and visual.

### Keep the reserve bucket

The reserve bucket should stay a primary visual.

### Required setup data

```text
income
monthly expenses
emergency savings
estimated job search duration
optional severance
optional unemployment benefit
optional spouse/secondary income
```

### Outputs

```text
monthly income
minimum reserve target
optimal reserve target
current reserve
reserve runway
shortfall if reserves are insufficient
```

### MVP guardrail

Do not let severance/benefit modeling hide the original simple concept:

```text
Do you have 3–6 months of emergency reserves?
```

---

## 11.4 Liability / Lawsuit

The original Lawsuit module is a conceptual liability exposure visual.

### Required setup data

```text
income
age
non-qualified assets
auto liability coverage
home liability coverage
umbrella coverage
estimated exposure assumption
```

### Outputs

```text
modeled wage/income exposure
non-qualified assets at risk
total modeled liability exposure
existing coverage
remaining liability gap
```

### Required disclaimer posture

This module must be framed carefully:

```text
This is a simplified illustrative exposure scenario.
It is not legal advice.
It is not jurisdiction-specific.
Actual outcomes vary.
```

### MVP guardrail

Do not build a legal exposure engine.

---

## 12. UI/UX Next Steps

## 12.1 Dashboard

The dashboard should be a simple advisor command center.

### Required dashboard states

```text
Empty state: no clients yet
Client list state
Recent risk reviews
Continue analysis
Presentation-ready analyses
```

### Dashboard should not prioritize

```text
large analytics grids
complex firm metrics
billing data
admin controls
deep report management
```

---

## 12.2 Add Client Drawer/Page

This should be highly polished and easy.

### Recommended sections

```text
Client Type
Basic Information
Primary Earner
Secondary Earner if couple
Existing Coverage
Household Baseline
Liability Coverage
```

### Required actions

```text
Save Draft
Create Client
Create Client & Start Risk Review
```

---

## 12.3 Client Detail Page

Client detail should be the advisor’s client workspace.

### Recommended tabs

```text
Overview
Client Setup
Risk Review
Presentations
Reports
Notes
```

### Overview should show

```text
profile completeness
primary/secondary earners
active risk review
last updated
largest visible gap
continue analysis button
```

---

## 12.4 Risk Review Page

This should feel like the modern React equivalent of the original HTML tabs.

### Required layout

```text
Client/scenario header
Risk module tabs
Input panel
Output visualization panel
Save scenario action
Presentation action
Disclaimer
```

### Required behavior

```text
Tabs show only included modules.
Module inputs load from scenario records.
Outputs calculate deterministically.
Save persists current module state.
Presentation reads saved module state.
```

---

## 12.5 Presentation Mode

Presentation mode should prioritize client comprehension.

### Presentation should show

```text
client/household name
scenario name
risk module title
primary visual
key gap metric
existing coverage/resources
remaining gap
short advisor-safe narrative
disclaimer
```

### Presentation should not show

```text
developer details
debug fields
formula internals
complex assumption controls
admin settings
```

---

## 13. Calculation Pipeline Next Steps

The current deterministic logic direction is correct. The next step is not to make formulas more complex; it is to make the pipeline cleaner and tied to real client/scenario data.

### Required calculation pipeline

```text
client profile
→ scenario module input record
→ validation
→ deterministic calculation
→ chart transformer
→ output view
→ saved module snapshot
```

### Required separation

```text
Client data = reusable facts
Scenario inputs = editable module-specific analysis inputs
Calculation outputs = deterministic result
Chart data = visualization-ready transform
Narrative = static template based on output state
```

### Do not add AI

The advisor’s need is deterministic visualization. AI-generated analysis, recommendations, or narrative should remain out of scope.

---

## 14. Validation and Truthfulness Requirements

The app must be truthful in its behavior.

### Required truthfulness rules

- No module should appear client-specific if it is using generic default data.
- No dashboard row should show a fake client in production mode.
- No scenario header should show a hardcoded name/date/status.
- No presentation should show unsaved demo data as if it is a real client scenario.
- No output should be called “recommended coverage.”
- No output should imply legal, tax, underwriting, or product advice.
- All results should be described as modeled/illustrative.

### Required wording pattern

Use:

```text
Modeled gap
Illustrative scenario
Based on advisor-entered assumptions
Potential exposure
Remaining gap
May help guide discussion
```

Avoid:

```text
Required coverage
Recommended product
Correct amount
Guaranteed need
Legal exposure prediction
Tax conclusion
```

---

## 15. Anti-Overengineering Rules

The app should not grow beyond the advisor’s need before the main workflow is complete.

### Build now

```text
Client setup
Household/earner model
Risk review creation
Module tabs
Scenario-specific inputs
Save scenario
Presentation mode
Real persistence
Polished empty/loading states
```

### Defer

```text
billing
team user management
complex assumption admin
full report builder
PDF export system
deep audit UI
carrier/product recommendations
advanced analytics dashboard
firm-wide metrics
```

### Build only if directly required

```text
formula registry
calculation snapshot history
advanced validation logs
report export
multi-user permissions
```

---

## 16. Engineering Implementation Plan

## Phase 1: Product Alignment Cleanup

Goal: Make the app visibly match the advisor workflow.

Tasks:

```text
Rename/refine tabs and subtitles.
Ensure Client Setup is first-class.
Ensure Generate Risk Review exists.
Ensure dashboard starts with clients, not analytics.
Hide or de-emphasize admin/platform stubs.
Clarify Liability / Lawsuit naming.
Preserve the unemployment reserve bucket.
```

Acceptance criteria:

```text
A new user can understand the app’s workflow within 30 seconds.
The app visibly feels like an income gap tool, not a generic dashboard.
```

---

## Phase 2: Real Client/Household Data

Goal: Remove production-path mock/hardcoded data.

Tasks:

```text
Create client/household model.
Create income earner model.
Create coverage model.
Create household financial profile model.
Build repository/service layer.
Persist records locally.
Replace mock dashboard data.
Replace hardcoded scenario header.
```

Acceptance criteria:

```text
Dashboard shows only real saved clients or an empty state.
Scenario headers show real client/scenario data.
No production-path hardcoded household names remain.
```

---

## Phase 3: Risk Review Initialization

Goal: Turn client setup into scenario module records.

Tasks:

```text
Build Start Risk Review drawer/page.
Allow module selection.
Create scenario record.
Create included scenario module records.
Initialize Life inputs from earner coverage.
Initialize Disability inputs from income/expense/benefit data.
Initialize Unemployment inputs from income/reserve data.
Initialize Liability inputs from household liability data.
Navigate to starting module.
```

Acceptance criteria:

```text
Starting a risk review produces scenario-specific module records.
Tabs show only selected modules.
Each module has its own saved input state.
```

---

## Phase 4: Module Save + Output Persistence

Goal: Make module work durable.

Tasks:

```text
Load module inputs from scenario module record.
Calculate outputs deterministically.
Transform chart data.
Allow Save Scenario.
Persist inputs, outputs, chart data, narrative, status, and timestamp.
Update scenario status.
```

Acceptance criteria:

```text
Advisor can leave and return to a scenario without losing work.
Presentation mode can display saved outputs.
Dashboard can show last updated status.
```

---

## Phase 5: Presentation Mode Refactor

Goal: Make presentation mode read real saved data.

Tasks:

```text
Load scenario by ID.
Load client by scenario.clientId.
Load included module records.
Render only saved/included modules.
Use client-friendly visuals.
Use advisor-safe narrative.
Show disclaimer.
```

Acceptance criteria:

```text
Presentation mode no longer depends on mock defaults.
Presentation accurately reflects saved client/scenario/module records.
```

---

## Phase 6: Production Hardening

Goal: Improve quality without overbuilding.

Tasks:

```text
Add runtime validation for client setup and module inputs.
Add empty states.
Add loading states.
Add error states.
Add basic test fixtures.
Add build/lint validation.
Add migration/reset local demo data tools for development only.
```

Acceptance criteria:

```text
Build passes.
Lint passes.
No mock data appears in production path.
Invalid input does not create misleading outputs.
```

---

## 17. Updated Acceptance Criteria for the Whole App

The app is back on track when the following are true:

```text
Advisor can create an individual or couple client.
Advisor can enter primary and optional secondary earner data.
Advisor can enter existing coverage and household baseline data.
Advisor can generate a risk review from client setup.
Risk review tabs map to Life, Disability, Unemployment, Liability/Lawsuit.
Only selected modules appear.
Each module loads scenario-specific inputs.
Each module calculates deterministic outputs.
Each module saves current state.
Dashboard reflects real clients and scenarios.
Presentation mode reads saved real data.
No hardcoded client names appear in production paths.
No global module defaults act as the active client scenario.
The workflow feels as simple as the original HTML prototype but polished like a modern production app.
```

---

## 18. Updated Instruction for Engineering AI Assistant

Use this instruction for the implementation agent:

```text
Treat the advisor’s original HTML app as the product-behavior reference and the current React/TypeScript app as the production architecture foundation.

Do not recreate the old one-file HTML implementation. Preserve its workflow: Client Setup → Generate Income Gap Analysis → Risk Tabs → Visual Outputs.

Translate that workflow into the current app as: Client Setup → Generate Risk Review → Life Insurance / Disability / Unemployment / Liability-Lawsuit module tabs.

Prioritize real client/household setup, individual/couple support, primary and secondary income earners, earner-specific coverage, household-level liability data, scenario-specific module inputs, saved outputs, and presentation mode.

Do not expand the app into a full CRM, insurance product recommendation engine, carrier comparison platform, legal/tax advice engine, or broad financial planning system.

Keep the interface polished, modern, advisor-friendly, and visually clear. Keep the pipeline deterministic, explainable, and based only on advisor-entered data and explicit assumptions.
```

---

## 19. Final Product Standard

The final MVP should be judged by this standard:

```text
Can an advisor sit with a client, quickly enter the household profile, generate a risk review, switch through the risk tabs, and clearly show the client what financial gap appears under each risk event?
```

If yes, the app is on track.

If the app makes the advisor manage settings, reports, assumptions, dashboards, or technical configuration before that simple workflow works, the app is drifting.

---

## 20. Source Notes

- The advisor’s original HTML prototype establishes the core product workflow: Client Setup, Death, Lawsuit, Unemployment, Generate Income Gap Analysis, single/couple support, earner-level income/coverage, and household liability coverage.
- The advisor’s later notes establish Disability as a required additional module and likely flagship workflow.
- MDN documents that `localStorage` persists across browser sessions for the same origin.
- web.dev explains IndexedDB as a browser storage system suitable for larger structured data with object stores and transactions.
