# NorthStar Application Build Blueprint  
## Infrastructure, Shell, Backbone, and UI/UX Foundation

This document is grounded in the NorthStar Project Blueprint, which defines NorthStar as a focused risk-management visualization layer for advisors, not a full financial-planning suite.

---

## 1. Product Identity

**Application name:** NorthStar  
**Product category:** Advisor-focused strategic risk intelligence and visualization platform  
**Primary user:** Financial advisors, insurance advisors, disability insurance specialists, and risk-planning professionals  
**Primary purpose:** Help advisors visually explain client financial exposure caused by death, disability, unemployment, lawsuits, and liability events before introducing specific products.  

NorthStar should not be engineered as a general financial planning suite. It should be built as a **risk-visualization and advisor presentation layer** that transforms abstract planning risks into clear client-facing visual outputs.

The product thesis should remain:

> Show the gap before selling the solution.

The application’s first version should prioritize **clean data entry, credible modeling logic, strong visual outputs, advisor-controlled interpretation, and meeting-ready presentation screens**.

---

## 2. Recommended Technical Stack

### Frontend

Use:

```txt
Next.js
React
TypeScript
Tailwind CSS
IndoUI React copy-paste UI components
Tailwind CSS component ownership pattern
shadcn/ui only as a secondary fallback when IndoUI does not provide the needed primitive
Recharts
```

Next.js App Router is appropriate because it supports modern routing, layouts, server/client component composition, and organized project structure conventions.

### UI Component Source Strategy

Use **IndoUI React copy-paste components** as the preferred visual component source for the MVP shell, dashboard surfaces, cards, tables, forms, navigation patterns, layout sections, and presentation-ready UI blocks. IndoUI should be treated as an owned-code component source, not as a black-box dependency. Components should be copied into the codebase, reviewed, renamed where needed, adapted to NorthStar naming conventions, and converted into globally reusable project components.

IndoUI implementation rules:

```txt
Use IndoUI components as copy-paste starting points.
Do not scatter copied components directly across pages.
Promote repeated IndoUI patterns into /src/components/global or the appropriate shared component folder.
Normalize class names, props, naming, and variants to match the NorthStar design system.
Keep Tailwind styling consistent with NorthStar's advisor-grade visual language.
Remove demo content, unused dependencies, and irrelevant visual effects.
Do not create one-off page-level UI blocks when a global component should exist.
Use shadcn/ui only as a secondary fallback for missing primitives or accessibility-sensitive components.
```

IndoUI is a free React and Tailwind CSS component library with copy-paste production-ready components including data tables, dashboards, forms, buttons, modals, layouts, and icons. It is suitable for accelerating NorthStar's UI shell while preserving code ownership and customization.

Use **Server Components** for layout, shell, navigation, and data-fetching surfaces where possible. Use **Client Components** only where interactivity is required, such as sliders, dynamic charts, tab state, forms, and scenario controls.

### Charts and Visualization

Use:

```txt
Recharts for MVP visualizations
D3 only later if custom visualization complexity exceeds Recharts
```

Recharts is built for React, uses reusable chart components, and is suitable for fast development of dashboard and presentation visuals.

### Backend / Data Layer

Use one of the following:

```txt
Option A: Supabase + Postgres
Option B: Next.js API routes/server actions + external Postgres
```

For the early MVP, Supabase is a strong fit because it provides authentication, Postgres, and Row Level Security.

### AI Layer

Use AI only for:

```txt
Client-friendly summaries
Advisor explanation drafts
Scenario interpretation language
Plain-English risk narratives
Report summary generation
```

Do **not** use AI for:

```txt
Deterministic insurance advice
Carrier recommendations
Policy recommendations
Regulated suitability conclusions
Guaranteed financial outcomes
```

The Vercel AI SDK is suitable if building AI features inside a TypeScript/Next.js application.

---

## 3. Product Architecture

NorthStar should be structured around four core layers:

```txt
1. Application Shell
2. Risk Module Engine
3. Visualization Layer
4. Advisor Presentation Layer
```

### 3.1 Application Shell

The application shell is the persistent structure around every workflow.

It should include:

```txt
Sidebar navigation
Top navigation/header
Advisor workspace
Client/scenario selector
Module tabs
Save/export actions
Settings and assumptions area
Presentation/report mode toggle
```

Primary navigation:

```txt
Dashboard
Clients
Scenarios
Risk Modules
Reports
Assumptions
Advisor Settings
```

Risk module navigation:

```txt
Life Insurance
Disability Insurance
Unemployment
Liability / Lawsuit
```

Initial MVP should not overbuild dashboard analytics. The first priority is a strong **advisor workflow shell** that makes it easy to create, view, and explain one client scenario.

---

## 4. Core User Workflow

The first application flow should be:

```txt
Advisor logs in
→ Creates or selects client
→ Creates scenario
→ Selects risk module
→ Enters minimal client assumptions
→ Generates model outputs
→ Reviews visual risk gap
→ Generates advisor/client summary
→ Saves scenario
→ Exports or presents report
```

### MVP Flow

```txt
1. Advisor Dashboard
2. Client Profile Creation
3. Scenario Builder
4. Life Insurance Module
5. Disability Insurance Module
6. Visual Output Screen
7. Client Presentation View
8. Export/Report View
```

The uploaded blueprint identifies Life Insurance as the simplest proof-of-concept module and Disability Insurance as the strategic core differentiator.

---

## 5. Application Pages and Routes

Recommended route structure:

```txt
/app
  /(auth)
    /login
    /register
    /forgot-password

  /(dashboard)
    /dashboard
    /clients
    /clients/[clientId]
    /clients/[clientId]/scenarios
    /clients/[clientId]/scenarios/[scenarioId]
    /clients/[clientId]/scenarios/[scenarioId]/life
    /clients/[clientId]/scenarios/[scenarioId]/disability
    /clients/[clientId]/scenarios/[scenarioId]/unemployment
    /clients/[clientId]/scenarios/[scenarioId]/liability
    /reports
    /settings
    /assumptions

  /(presentation)
    /present/[scenarioId]
    /report/[scenarioId]
```

### Route Purpose

| Route | Purpose |
|---|---|
| `/dashboard` | Advisor home, recent clients, recent scenarios |
| `/clients` | Client list and client creation |
| `/clients/[clientId]` | Client profile summary |
| `/scenarios/[scenarioId]` | Scenario overview |
| `/life` | Life insurance risk module |
| `/disability` | Disability income risk module |
| `/unemployment` | Job-loss risk module |
| `/liability` | Lawsuit/liability exposure module |
| `/present/[scenarioId]` | Meeting-friendly presentation mode |
| `/report/[scenarioId]` | Printable/exportable report view |
| `/assumptions` | Global modeling assumptions |
| `/settings` | Advisor profile, firm settings, compliance text |

---

## 6. Recommended Project Structure

Use a modular architecture that separates app routes from reusable business logic.

```txt
/src
  /app
    /(auth)
    /(dashboard)
    /(presentation)

  /components
    /global
      AppShell.tsx
      PageShell.tsx
      SectionHeader.tsx
      EmptyState.tsx
      LoadingState.tsx
      ErrorState.tsx
    /ui
      IndoUI-adapted owned components
      shared primitives
      buttons
      inputs
      dialogs
      tables
    /layout
    /forms
    /charts
    /cards
    /navigation
    /presentation
    /indoui
      source-adapted components before promotion to global/shared components

  /features
    /clients
      components
      actions
      schemas
      types

    /scenarios
      components
      actions
      schemas
      types

    /risk-modules
      /life
        components
        calculations
        schemas
        types
        constants

      /disability
        components
        calculations
        schemas
        types
        constants

      /unemployment
        components
        calculations
        schemas
        types
        constants

      /liability
        components
        calculations
        schemas
        types
        constants

    /reports
      components
      templates
      export

    /ai-summaries
      prompts
      actions
      schemas

  /lib
    /db
    /auth
    /utils
    /formatters
    /validators
    /constants

  /server
    /queries
    /mutations
    /services

  /styles
  /types
```

Core rules:

```txt
Do not put business calculations directly inside React components.
Do not leave IndoUI copy-paste blocks as isolated one-off page code.
Every repeated UI pattern must become a globally reusable component.
Global components must expose clear props, controlled variants, and predictable composition.
```

All financial/risk calculations should live in dedicated calculation files, for example:

```txt
/features/risk-modules/life/calculations/calculateLifeInsuranceGap.ts
/features/risk-modules/disability/calculations/calculateDisabilityGap.ts
```

### Global Reusable Component Strategy

NorthStar should build a small internal design system on top of adapted IndoUI React/Tailwind components. The engineering agent should copy useful IndoUI components into the project, strip demo-specific logic, normalize styling, and expose them as reusable NorthStar components.

Component promotion rule:

```txt
If a UI pattern appears in more than one page, module, or report surface, promote it to /src/components/global, /src/components/ui, or the relevant shared folder.
```

Recommended global component categories:

```txt
Global shell components: AppShell, PageShell, PageHeader, SectionHeader
Navigation components: SidebarNav, TopBar, BreadcrumbBar, ModuleTabs
Card components: MetricCard, RiskSummaryCard, ScenarioCard, ClientCard
Form components: FieldGroup, NumberInputField, CurrencyInputField, PercentInputField, AssumptionInput
Chart wrappers: ChartPanel, ChartLegend, ChartTooltipContent, RiskGapChartContainer
State components: EmptyState, LoadingState, ErrorState, SaveStatusIndicator
Presentation components: PresentationSlide, ReportSection, DisclaimerBlock, AdvisorNarrativePanel
Data display components: DataTable, DetailList, ComparisonTable, AssumptionTable
```

IndoUI adaptation requirements:

```txt
Copy only the needed component code.
Rename components to NorthStar-specific names where appropriate.
Convert static demo values into typed props.
Remove unused icons, placeholder content, and unrelated marketing copy.
Ensure responsive behavior works across dashboard and presentation views.
Keep accessibility attributes intact or improve them.
Centralize reusable variants instead of duplicating Tailwind class strings.
```

---

## 7. Database Backbone

### Core Tables

Initial schema:

```txt
advisors
clients
client_households
scenarios
scenario_assumptions
life_inputs
life_outputs
disability_inputs
disability_outputs
unemployment_inputs
unemployment_outputs
liability_inputs
liability_outputs
reports
ai_summaries
audit_events
```

### Suggested Entity Model

#### advisors

```txt
id
email
full_name
firm_name
role
created_at
updated_at
```

#### clients

```txt
id
advisor_id
first_name
last_name
email
age
household_status
notes
created_at
updated_at
```

#### scenarios

```txt
id
advisor_id
client_id
name
description
status
created_at
updated_at
```

#### scenario_assumptions

```txt
id
scenario_id
inflation_rate
income_growth_rate
discount_rate
emergency_reserve_months
replacement_income_percent
created_at
updated_at
```

#### life_inputs

```txt
id
scenario_id
current_income
age
retirement_age
income_replacement_years
existing_group_life
existing_private_life
debts
education_goal
final_expenses
created_at
updated_at
```

#### life_outputs

```txt
id
scenario_id
future_income_lost
existing_coverage_total
remaining_protection_gap
survivor_cashflow_gap
recommended_coverage_range_low
recommended_coverage_range_high
created_at
updated_at
```

#### disability_inputs

```txt
id
scenario_id
current_income
monthly_expenses
emergency_savings
employer_short_term_benefit
employer_long_term_benefit
benefit_waiting_period_days
benefit_duration_months
spouse_income
state_benefits
private_di_coverage
partial_disability_income_percent
created_at
updated_at
```

#### disability_outputs

```txt
id
scenario_id
monthly_income_gap
reserve_depletion_month
total_uncovered_income
benefit_offset_total
partial_disability_gap
total_disability_gap
lifestyle_compression_required
created_at
updated_at
```

#### reports

```txt
id
scenario_id
advisor_id
client_id
title
report_type
content_json
created_at
updated_at
```

#### audit_events

```txt
id
advisor_id
client_id
scenario_id
event_type
event_payload
created_at
```

### Security Requirement

Every client, scenario, and report row should be scoped to the authenticated advisor or firm account. If using Supabase, enable Row Level Security on all user-owned tables and write policies that prevent advisors from accessing client records they do not own.

---

## 8. UI/UX Direction

### Product Feel

NorthStar should feel:

```txt
Professional
Calm
Trustworthy
Advisor-grade
Presentation-first
Minimal
Financially serious
```

Avoid:

```txt
Consumer fintech gamification
Overly bright colors
Spreadsheet-heavy interfaces
Complex financial-planning clutter
Product-sales-heavy design
```

### Visual Style

Recommended design language:

```txt
Dark navy / charcoal foundation
White or near-white content surfaces
Muted blue accent
Soft green for coverage/protection
Amber/orange for risk gap
Red only for severe exposure
Generous whitespace
Large readable chart labels
Minimal decorative graphics
```

### UI Components

Use IndoUI React copy-paste components as the initial source for polished layout, form, card, table, navigation, and dashboard patterns. After copying, convert each selected component into a NorthStar-owned reusable component. The goal is not to depend on IndoUI at runtime; the goal is to accelerate UI construction while maintaining full code ownership.

Build the following reusable global components early:

```txt
AppShell
PageShell
PageHeader
SectionHeader
SidebarNav
TopBar
BreadcrumbBar
ClientSelector
ScenarioSelector
RiskModuleTabs
MetricCard
RiskSummaryCard
AssumptionCard
InputSection
FieldGroup
CurrencyInputField
PercentInputField
ChartPanel
RiskGapChart
TimelineChart
StackedCoverageChart
ScenarioSummaryCard
AdvisorNarrativePanel
PresentationToolbar
PresentationSlide
ReportHeader
ReportSection
DisclaimerBlock
EmptyState
LoadingState
ErrorState
SaveStatusIndicator
DataTable
DetailList
```

Global UI component protocol:

```txt
Start from IndoUI where useful.
Adapt the component into NorthStar naming and styling.
Place primitives in /src/components/ui.
Place application-wide composed components in /src/components/global.
Place feature-specific components only when they are truly module-specific.
Never duplicate the same Tailwind-heavy component across multiple pages.
```

---

## 9. Initial Dashboard Layout

### Advisor Dashboard

Purpose: get the advisor into a client scenario quickly.

Sections:

```txt
1. Welcome / advisor context
2. Create new client button
3. Recent clients
4. Recent scenarios
5. Risk modules shortcut
6. Reports shortcut
```

Do not overbuild analytics yet.

Suggested dashboard cards:

```txt
Total Clients
Active Scenarios
Recent Reports
Incomplete Scenarios
```

---

## 10. Client Profile UI

Client profile should collect only what is needed for risk modeling.

### Basic Client Fields

```txt
First name
Last name
Age
Household status
Dependents
Annual income
Monthly expenses
Existing emergency savings
Current employer benefits
Current private coverage
Debt obligations
Planning notes
```

### UI Principle

Use progressive disclosure. Do not show every possible input at once.

Structure:

```txt
Basic Info
Income & Expenses
Existing Protection
Dependents & Obligations
Scenario Assumptions
```

---

## 11. Scenario Builder

A scenario is the central working object.

Each scenario should have:

```txt
Client
Risk module
Assumptions
Inputs
Outputs
Advisor notes
AI-generated explanation
Report state
```

Scenario statuses:

```txt
Draft
Ready for Review
Presented
Archived
```

---

## 12. Risk Module Backbone

Each module should share the same internal pattern:

```txt
Input schema
Validation schema
Calculation engine
Output schema
Chart data transformer
Client-facing explanation
Advisor-facing notes
Report section
```

Recommended module file pattern:

```txt
/features/risk-modules/[module-name]
  /components
    ModuleInputForm.tsx
    ModuleOutputView.tsx
    ModuleSummary.tsx
  /calculations
    calculateModuleOutputs.ts
    transformModuleChartData.ts
  /schemas
    inputSchema.ts
    outputSchema.ts
  /types
    index.ts
  /constants
    assumptions.ts
```

---

## 13. Life Insurance Module MVP

### Client Question

```txt
If I die prematurely, what income and financial support disappears for my family?
```

### Inputs

```txt
Current annual income
Client age
Retirement age
Income replacement years
Existing group life insurance
Existing private life insurance
Outstanding debts
Education funding goal
Final expenses
Spouse/partner income
Dependents
```

### Outputs

```txt
Future income lost
Total existing coverage
Remaining protection gap
Survivor cash-flow gap
Coverage offset percentage
Simplified family financial impact
```

### Visuals

```txt
Income Replacement Gap Chart
Coverage Offset Bar
Survivor Financial Timeline
Protection Need Summary
```

### MVP Formula Logic

The MVP does not need actuarial sophistication. Start transparent:

```txt
future_income_lost = annual_income * income_replacement_years

total_existing_coverage = group_life + private_life

base_need = future_income_lost + debts + education_goal + final_expenses

remaining_gap = max(base_need - total_existing_coverage, 0)

coverage_offset_percentage = total_existing_coverage / base_need
```

Add clear disclaimers:

```txt
This is an illustrative planning model, not a guarantee or product recommendation.
```

---

## 14. Disability Insurance Module

This should become the strategic flagship module.

### Client Question

```txt
If I cannot work due to illness or injury, how does my financial plan change?
```

### Inputs

```txt
Current annual income
Monthly household expenses
Emergency savings
Employer short-term disability benefit
Employer long-term disability benefit
Private disability coverage
Spouse/partner income
Benefit waiting period
Benefit duration
Partial disability income percentage
Total disability income percentage
State benefits
Taxability assumption
Recovery timeline assumption
```

### Outputs

```txt
Monthly income gap
Reserve depletion timeline
Total uncovered income
Employer benefit offset
Private benefit offset
Partial disability gap
Total disability gap
Lifestyle compression required
```

### Visuals

```txt
Income Collapse Curve
Financial Survival Timeline
Protection Gap Stack
Partial vs Total Disability Comparison
Lifestyle Compression Model
Recovery Path Comparison
```

These outputs map directly to the NorthStar blueprint’s recommended Disability Insurance visual outputs.

### MVP Formula Logic

```txt
monthly_income = annual_income / 12

monthly_available_income =
  spouse_income_monthly
  + employer_disability_benefit
  + private_disability_benefit
  + state_benefits

monthly_income_gap = max(monthly_expenses - monthly_available_income, 0)

reserve_depletion_month =
  emergency_savings / monthly_income_gap

total_uncovered_income =
  monthly_income_gap * disability_duration_months

lifestyle_compression_required =
  monthly_income_gap / monthly_expenses
```

---

## 15. Unemployment Module

### Client Question

```txt
How long can I sustain my financial plan after job loss?
```

### Inputs

```txt
Current monthly income
Monthly expenses
Emergency savings
Severance
Unemployment benefits
Estimated job search duration
Spouse/partner income
Debt payments
```

### Outputs

```txt
Emergency reserve runway
Monthly burn rate
Monthly shortfall
Recovery timeline
Cash depletion month
```

### Visuals

```txt
Reserve Runway Chart
Burn Rate Model
Monthly Shortfall Visualization
Recovery Timeline
```

---

## 16. Liability / Lawsuit Module

### Client Question

```txt
What assets or future earnings are exposed if I face a lawsuit?
```

### Inputs

```txt
Home equity
Investment assets
Savings
Future income exposure
Current liability coverage
Umbrella coverage
Estimated claim scenario
Protected assets
Unprotected assets
```

### Outputs

```txt
Asset exposure total
Coverage gap
Wealth erosion scenario
Protection adequacy summary
```

### Visuals

```txt
Asset Exposure Map
Umbrella Coverage Gap
Wealth Erosion Scenario
Protection Adequacy Summary
```

---

## 17. AI Explanation Layer

The AI layer should be isolated from deterministic calculations.

### AI Should Receive

```txt
Client scenario inputs
Calculated outputs
Module type
Advisor tone preference
Compliance disclaimer
```

### AI Should Produce

```txt
Plain-English explanation
Advisor talking points
Client-facing summary
Risk interpretation
Report section narrative
```

### AI Should Not Produce

```txt
Specific product recommendations
Carrier recommendations
Policy language
Underwriting conclusions
Legal advice
Tax advice
Guaranteed outcomes
```

### Example AI Summary Prompt

```txt
You are generating a client-friendly explanation for a financial advisor using NorthStar.

Explain the modeled risk gap in plain English.
Use the provided calculated outputs only.
Do not invent numbers.
Do not recommend specific insurance products, carriers, policy types, tax strategies, or legal actions.
Frame the result as an illustrative planning scenario, not a guarantee.
Keep the tone professional, calm, and suitable for an advisor-client meeting.

Module:
{{moduleName}}

Inputs:
{{inputsJson}}

Calculated Outputs:
{{outputsJson}}

Required sections:
1. What this model is showing
2. Why the gap matters
3. What assumptions were used
4. What the advisor may want to discuss next
5. Required disclaimer
```

---

## 18. Compliance and Risk Language

NorthStar must be designed with compliance discipline from the beginning.

Every output should include language like:

```txt
This model is for illustrative planning purposes only.
It is not a guarantee, financial plan, insurance recommendation, legal advice, tax advice, or underwriting determination.
Actual needs may vary based on individual circumstances, policy terms, carrier rules, taxation, inflation, market conditions, and advisor review.
```

Avoid phrases like:

```txt
You need this much insurance
You should buy this policy
This guarantees protection
This is the correct coverage amount
This product solves the gap
```

Use phrases like:

```txt
This scenario suggests a potential exposure of...
This model illustrates a possible gap of...
The advisor may use this output to discuss...
This estimate depends on the assumptions selected...
```

---

## 19. MVP Build Phases

### Phase 1: Application Shell

Build:

```txt
Next.js project foundation
Authentication layout
Dashboard layout
Sidebar navigation
Top navigation
Client list page
Client detail page
Scenario detail page
Risk module tab structure
Reusable card/chart/form components
```

Goal:

```txt
The app should feel real before the calculations are complete.
```

### Phase 2: Data Backbone

Build:

```txt
Database schema
Advisor/client/scenario tables
Auth integration
RLS/security policies
Basic CRUD operations
Input validation
Server-side save/load flows
```

Goal:

```txt
Advisors can create clients and scenarios safely.
```

### Phase 3: Life Insurance MVP Module

Build:

```txt
Life input form
Life calculation engine
Life output cards
Life gap chart
Coverage offset chart
Life summary panel
Save outputs to scenario
```

Goal:

```txt
Prove the full input → calculation → visualization → explanation pattern.
```

### Phase 4: Disability Insurance Core Module

Build:

```txt
DI input form
Income collapse curve
Reserve depletion timeline
Protection gap stack
Partial vs total disability comparison
Lifestyle compression output
Advisor explanation panel
```

Goal:

```txt
Build NorthStar’s strategic differentiator.
```

### Phase 5: Presentation and Report Mode

Build:

```txt
Presentation view
Printable report layout
PDF/export-ready structure
Advisor notes
Client-friendly summaries
Disclosure block
```

Goal:

```txt
Make outputs usable in live advisor-client conversations.
```

### Phase 6: AI Narrative Layer

Build:

```txt
AI summary generator
Advisor talking points generator
Client explanation generator
Compliance-safe prompt templates
Generated summary storage
Manual advisor editing
```

Goal:

```txt
Use AI to clarify outputs, not to replace advisor judgment.
```

---

## 20. Definition of Done for Starting Build

The first build milestone is complete when:

```txt
The app has a working authenticated shell.
An advisor can create a client.
An advisor can create a scenario.
The advisor can open a Life Insurance module.
The advisor can enter basic inputs.
The app calculates a basic protection gap.
The app displays at least one chart and several output cards.
The advisor can view a clean presentation screen.
The app includes clear illustrative-use disclaimers.
```

---

## 21. Copy/Paste Instruction Prompt for AI Dev Engineering Specialist Agent

Use this as the starting prompt for your AI dev engineering specialist agent.

```txt
You are the lead AI dev engineering specialist for NorthStar, a strategic risk intelligence and visualization platform for financial advisors, insurance advisors, disability insurance specialists, and risk-planning professionals.

Your task is to begin the starting phases of creating the application infrastructure, shell, backbone, and UI/UX foundation.

NorthStar is not a full financial planning suite. It is a focused risk-visualization and advisor presentation layer. Its purpose is to help advisors show clients the financial consequences of high-impact disruption events before specific products are introduced.

Core product principle:
Show the gap before selling the solution.

Primary users:
- Financial advisors
- Insurance advisors
- Disability insurance specialists
- Risk-planning professionals

Primary client-facing risk modules:
1. Life Insurance
2. Disability Insurance
3. Unemployment
4. Liability / Lawsuit

Strategic priority:
Life Insurance should be the simplest proof-of-concept module.
Disability Insurance should become the flagship differentiator because disability risk is harder for clients to conceptualize and requires stronger visual explanation.

Recommended technology stack:
- Next.js with App Router
- React
- TypeScript
- Tailwind CSS
- IndoUI React copy-paste UI components as the preferred UI component source
- Tailwind CSS-owned component system
- shadcn/ui only as a secondary fallback when IndoUI does not provide the needed primitive
- Recharts for MVP charts
- Supabase/Postgres for database and authentication, unless another backend is explicitly selected
- Optional Vercel AI SDK for AI-generated explanations later

Build priorities:
1. Build the application shell first.
2. Build clean advisor/client/scenario data structures.
3. Build reusable UI components.
4. Build transparent calculation engines outside of React components.
5. Build Life Insurance MVP module first.
6. Build Disability Insurance module second.
7. Build presentation/report mode early.
8. Use AI only for explanation and summaries, not deterministic advice.

Application shell requirements:
Create a professional advisor-facing interface with:
- Sidebar navigation
- Top header
- Dashboard
- Clients page
- Client detail page
- Scenario builder
- Risk module tabs
- Output visualization area
- Presentation mode
- Report mode
- Settings/assumptions area

Primary navigation:
- Dashboard
- Clients
- Scenarios
- Risk Modules
- Reports
- Assumptions
- Settings

Risk module tabs:
- Life Insurance
- Disability Insurance
- Unemployment
- Liability / Lawsuit

Recommended route structure:
Use this as the starting structure:

/app
  /(auth)
    /login
    /register
    /forgot-password

  /(dashboard)
    /dashboard
    /clients
    /clients/[clientId]
    /clients/[clientId]/scenarios
    /clients/[clientId]/scenarios/[scenarioId]
    /clients/[clientId]/scenarios/[scenarioId]/life
    /clients/[clientId]/scenarios/[scenarioId]/disability
    /clients/[clientId]/scenarios/[scenarioId]/unemployment
    /clients/[clientId]/scenarios/[scenarioId]/liability
    /reports
    /settings
    /assumptions

  /(presentation)
    /present/[scenarioId]
    /report/[scenarioId]

Recommended source structure:

/src
  /app
  /components
    /ui
    /layout
    /forms
    /charts
    /cards
    /navigation
    /presentation

  /features
    /clients
    /scenarios
    /risk-modules
      /life
      /disability
      /unemployment
      /liability
    /reports
    /ai-summaries

  /lib
    /db
    /auth
    /utils
    /formatters
    /validators
    /constants

  /server
    /queries
    /mutations
    /services

  /styles
  /types

Important engineering rules:
Do not put financial/risk calculations directly inside React components.
All formulas must live in dedicated calculation files and be testable.
Use IndoUI React copy-paste components as starting points for polished UI blocks, but convert them into NorthStar-owned global/shared components.
Do not leave repeated IndoUI code scattered across pages.
Promote repeated UI patterns into /src/components/global, /src/components/ui, or the appropriate shared component folder.

Create these reusable components early:
- AppShell
- SidebarNav
- TopBar
- ClientSelector
- ScenarioSelector
- RiskModuleTabs
- MetricCard
- AssumptionCard
- InputSection
- ChartPanel
- RiskGapChart
- TimelineChart
- StackedCoverageChart
- ScenarioSummaryCard
- AdvisorNarrativePanel
- PresentationToolbar
- ReportHeader
- DisclaimerBlock

Initial database entities:
- advisors
- clients
- client_households
- scenarios
- scenario_assumptions
- life_inputs
- life_outputs
- disability_inputs
- disability_outputs
- unemployment_inputs
- unemployment_outputs
- liability_inputs
- liability_outputs
- reports
- ai_summaries
- audit_events

Security requirements:
- All client and scenario records must be scoped to the authenticated advisor or firm.
- If using Supabase, enable Row Level Security on all user-owned tables.
- Advisors must not be able to read or modify records owned by other advisors.
- Do not expose sensitive client data unnecessarily to the browser.
- Keep AI summaries and prompt payloads scoped to the correct advisor/client/scenario.

UI/UX direction:
NorthStar should feel professional, calm, trustworthy, advisor-grade, and presentation-first.
Avoid consumer fintech gamification.
Avoid spreadsheet-heavy visual clutter.
Avoid aggressive sales language.
Use clean layouts, strong typography, muted colors, and readable chart labels.

Suggested visual style:
- Dark navy or charcoal foundation
- White or near-white content surfaces
- Muted blue accent
- Soft green for coverage/protection
- Amber/orange for uncovered gap
- Red only for severe exposure
- Large readable charts
- Client-meeting-friendly cards

Life Insurance MVP module:
Client-facing question:
"If I die prematurely, what income and financial support disappears for my family?"

Inputs:
- Current annual income
- Client age
- Retirement age
- Income replacement years
- Existing group life insurance
- Existing private life insurance
- Outstanding debts
- Education funding goal
- Final expenses
- Spouse/partner income
- Dependents

Outputs:
- Future income lost
- Total existing coverage
- Remaining protection gap
- Survivor cash-flow gap
- Coverage offset percentage
- Simplified family financial impact

MVP formula logic:
future_income_lost = annual_income * income_replacement_years
total_existing_coverage = group_life + private_life
base_need = future_income_lost + debts + education_goal + final_expenses
remaining_gap = max(base_need - total_existing_coverage, 0)
coverage_offset_percentage = total_existing_coverage / base_need

Life Insurance visuals:
- Income Replacement Gap Chart
- Coverage Offset Bar
- Survivor Financial Timeline
- Protection Need Summary

Disability Insurance module:
Client-facing question:
"If I cannot work due to illness or injury, how does my financial plan change?"

Inputs:
- Current annual income
- Monthly household expenses
- Emergency savings
- Employer short-term disability benefit
- Employer long-term disability benefit
- Private disability coverage
- Spouse/partner income
- Benefit waiting period
- Benefit duration
- Partial disability income percentage
- Total disability income percentage
- State benefits
- Taxability assumption
- Recovery timeline assumption

Outputs:
- Monthly income gap
- Reserve depletion timeline
- Total uncovered income
- Employer benefit offset
- Private benefit offset
- Partial disability gap
- Total disability gap
- Lifestyle compression required

MVP formula logic:
monthly_income = annual_income / 12

monthly_available_income =
  spouse_income_monthly
  + employer_disability_benefit
  + private_disability_benefit
  + state_benefits

monthly_income_gap = max(monthly_expenses - monthly_available_income, 0)

reserve_depletion_month =
  emergency_savings / monthly_income_gap

total_uncovered_income =
  monthly_income_gap * disability_duration_months

lifestyle_compression_required =
  monthly_income_gap / monthly_expenses

Disability Insurance visuals:
- Income Collapse Curve
- Financial Survival Timeline
- Protection Gap Stack
- Partial vs Total Disability Comparison
- Lifestyle Compression Model
- Recovery Path Comparison

AI layer instructions:
AI may be used for:
- Plain-English explanation
- Advisor talking points
- Client-facing summaries
- Scenario interpretation
- Report narrative drafts

AI must not be used for:
- Specific product recommendations
- Carrier recommendations
- Policy recommendations
- Legal advice
- Tax advice
- Underwriting conclusions
- Guaranteed financial outcomes

Every AI output must be based only on provided inputs and calculated outputs.
The AI must not invent numbers.
The AI must not imply certainty.
The AI must include compliance-safe language.

Required disclaimer language:
"This model is for illustrative planning purposes only. It is not a guarantee, financial plan, insurance recommendation, legal advice, tax advice, or underwriting determination. Actual needs may vary based on individual circumstances, policy terms, carrier rules, taxation, inflation, market conditions, and advisor review."

Starting build objective:
Create the first functional NorthStar skeleton where an advisor can:
1. Log in or access the dashboard shell.
2. Create or view a client.
3. Create a scenario.
4. Open the Life Insurance module.
5. Enter basic inputs.
6. Generate a basic protection gap calculation.
7. View output cards and at least one chart.
8. Open a clean presentation mode.
9. See required disclaimer language.

Development standards:
- Use TypeScript strictly.
- Use reusable components.
- Use validation schemas for inputs.
- Keep calculation logic isolated and testable.
- Keep UI components clean and modular.
- Use semantic naming.
- Avoid premature enterprise complexity.
- Prioritize a polished MVP shell and credible workflow over excessive features.
- Add TODO comments only where future logic is intentionally deferred.
- Do not fabricate compliance, legal, tax, or insurance-specific claims.

Your first deliverables:
1. Project folder architecture.
2. Core layout shell.
3. Dashboard page.
4. Clients page.
5. Scenario page.
6. Risk module tab layout.
7. Life Insurance input form.
8. Life Insurance calculation function.
9. Life Insurance output cards.
10. Basic Recharts visualization.
11. Presentation-mode page.
12. Disclaimer component.
13. Clear notes explaining where future modules will plug in.

Begin by generating the application scaffold and foundational components, not by overbuilding every module.
```

---

## 22. First Build Command for the Dev Agent

Use this as the first execution instruction after the main prompt:

```txt
Start by creating the NorthStar MVP application scaffold using Next.js, TypeScript, Tailwind CSS, IndoUI React copy-paste component patterns, and a modular /src architecture. Use shadcn/ui only as a secondary fallback when IndoUI does not provide the needed primitive.

Do not implement all features at once.

First create:
1. App shell
2. Dashboard layout
3. Sidebar navigation
4. Client and scenario placeholder pages
5. Risk module tab structure
6. Life Insurance module form
7. Life Insurance calculation utility
8. Basic chart output
9. Presentation mode placeholder
10. Disclaimer component

Use static mock data where necessary, but structure the code so it can later connect cleanly to Supabase/Postgres.
```

---

## 23. Recommended Immediate Development Sequence

```txt
Step 1:
Initialize project and install dependencies.

Step 2:
Create app shell, layout components, and navigation.

Step 3:
Create dashboard and clients pages.

Step 4:
Create scenario detail page and risk module tabs.

Step 5:
Create Life Insurance input schema and form.

Step 6:
Create Life Insurance calculation utility.

Step 7:
Create chart data transformer.

Step 8:
Render output cards and charts.

Step 9:
Create presentation view.

Step 10:
Add disclaimer and advisor summary panel.
```

The key is to avoid building “everything” too early. NorthStar should first prove one complete loop:

```txt
Client data → scenario assumptions → risk calculation → visual output → advisor explanation → presentation view
```
