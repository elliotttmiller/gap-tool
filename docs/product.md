# Product

## Overview

Gap Tool is an advisor-facing, illustrative financial gap-analysis application. It helps an advisor create a client profile, generate a household risk review, and model active risk exposures across Life Insurance, Disability, Unemployment, and Liability / Lawsuit modules.

The product is not a formal recommendation engine. Its purpose is to translate client-provided facts, advisor-approved assumptions, and module-specific methodology into modeled exposures, coverage, gaps, schedules, charts, and advisor-readable explanations. Results should be reviewed by a qualified professional before they are used with a client.

## Core Workflow

1. Create or edit a client profile from the dashboard.
2. Capture household facts such as age, income, expenses, coverage, emergency savings, home equity, non-qualified assets, disability benefits, and liability coverage.
3. Generate a risk review for the client.
4. Navigate the scenario module tabs for Life Insurance, Disability, Unemployment, and Liability / Lawsuit.
5. Adjust module inputs and assumptions where the module exposes them.
6. Review calculated outputs, schedules, charts, coverage gaps, and advisor-safe explanatory copy.

Client and scenario records are persisted in browser storage through the Zustand store. The app is currently a local/front-end planning tool rather than a server-backed CRM or policy administration system.

## Active Capabilities

### Client Setup

The dashboard supports active client creation, client search, client archival, and risk-review generation. Client setup supports individual and couple household profiles. The profile is the shared source of starting data for active risk modules.

The client overview page allows editing the client profile after creation. Saving profile changes updates the stored client data and resets or refreshes module inputs that depend on the client profile.

### Scenario Risk Reviews

A risk review is stored as a scenario. Scenarios track the client, included modules, active module, status, timestamps, and module records. The active scenario route hosts nested module pages for the four active risk modules.

### Life Insurance Risk Analysis

The Life module models premature-death income support and coverage gaps. It uses current age, retirement age, income, spouse income offset, income replacement ratio, existing group/private life coverage, non-qualified assets, debts, education funding, and final expenses.

The active Life methodology includes:

- A base life-insurance summary calculator.
- A Safe Income Coverage scenario that models a target percentage of projected net income need, defaulting to 85%.
- A Coverage Runway scenario that models the entered coverage/resource pool growing at a selected return while funding projected income need.
- Annual schedule data used to keep cards, charts, and fully-covered status aligned.
- Advisor-safe copy that frames death-benefit numbers as modeled illustrative gap analysis.

### Disability Insurance Risk Analysis

The Disability module models income replacement if the client cannot work because of illness or injury. It uses annual income, current age, retirement age, group LTD coverage percent, LTD monthly cap, LTD tax treatment, individual disability benefit, individual disability premium, benefit period, income growth, and optional COLA.

The active Disability output includes current-year monthly benefit estimates, yearly income projections, group LTD coverage, individual DI coverage, annual gaps, total projected income, total coverage, total gap, average coverage rate, and lifetime individual DI expense. Additional calculators support SSDI estimation, savings bridge, premium versus self-insured analysis, break-even analysis, benefit tax analysis, and job comparison views.

### Unemployment & Liquidity Risk

The Unemployment module models household liquidity resilience if the highest earner loses income. It uses primary income, secondary income, monthly expenses, emergency savings, severance, unemployment benefit assumptions, estimated search duration, and a net-income proxy.

The active methodology maps remaining household income coverage to an ideal emergency reserve target:

- Less than 33% remaining expense coverage: 6 months.
- Less than 50% remaining expense coverage: 5 months.
- Less than 67% remaining expense coverage: 4 months.
- 67% or greater remaining expense coverage: 3 months.

The output includes reserve targets, reserve gap or excess reserve, cash-flow status, monthly search timeline, savings draw, offset income, reserve depletion, and shortfall estimates.

### Liability / Lawsuit Risk Analysis

The Liability module models illustrative household liability exposure. It uses income, spouse income, current age, retirement age, home equity, non-qualified/investment/savings assets, business ownership value, auto liability coverage, umbrella coverage, disposable-income ratio, wage garnishment rate, and income growth.

The active methodology applies garnishment exposure to estimated disposable income rather than gross income. It also rounds illustrative umbrella coverage levels to common $1M umbrella policy blocks. Copy should avoid recommendation language and use labels such as "Illustrative Umbrella Coverage Level."

## Methodology Principles

The advisor reference materials in `docs/advisor-references/` are the source of truth for methodology direction. Implementation should follow these principles:

- Treat the product as an illustrative gap-analysis system, not a recommendation engine.
- Prefer schedule-driven calculations so charts, cards, summaries, and narratives use the same underlying values.
- Keep formulas and methodology in pure domain or calculation functions rather than embedding math in React views.
- Centralize assumptions, formula metadata, and compliance-sensitive copy where practical.
- Preserve advisor-safe wording for legal, insurance, and coverage outputs.

## Current Boundaries

The application is front-end only. It does not currently provide authentication, server-side persistence, multi-user collaboration, policy issuance, carrier integrations, formal compliance approval workflows, or client-ready report generation as a completed server-backed feature.

Only Life Insurance, Disability, Unemployment, and Liability / Lawsuit workflows should be treated as active product scope.
