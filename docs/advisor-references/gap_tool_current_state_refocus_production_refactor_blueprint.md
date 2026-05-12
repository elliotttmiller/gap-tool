# Gap Tool — Current State Audit, Product Refocus, and Production Refactor Blueprint

**Document purpose:**  
This Markdown file summarizes the current state of the Gap Tool application, identifies where the product is aligned or drifting from the advisor’s actual needs, and defines the refactor path required to turn the app from a polished demo/prototype into a real production-ready advisor-facing input/output gap analysis tool.

**Primary audience:** product owner, engineering agent, UI/UX designer, and implementation developer.

**Controlling product principle:**

> Gap Tool is a polished advisor-facing input/output risk visualization tool.  
> It exists to help advisors enter client profile data, model basic income/protection gaps across death, disability, unemployment, and lawsuit/liability events, and present those gaps visually to clients before products or solutions are introduced.

---

## 1. Executive Summary

The app is directionally strong. Its core risk categories, visual presentation goals, and deterministic input/output structure are aligned with the advisor’s vision. The current implementation already has the right conceptual foundation:

- A dashboard-oriented advisor workspace.
- Risk modules for Disability, Life Insurance, Unemployment, and Liability.
- Input forms paired with output visualizations.
- Deterministic calculations instead of AI-driven modeling.
- Presentation mode as a client-facing workflow.
- Polished UI direction with animated charts and modern dashboard patterns.

However, the app is not yet production-real because the core workflow is still partially demo-driven. The largest issue is that the app still relies on hardcoded or globally defaulted client/module data instead of a real client setup and scenario initialization pipeline.

The current product risk is not that the idea is wrong. The risk is that supporting architecture, admin pages, assumptions pages, reports, settings, and dashboard shell work may be getting built before the core advisor workflow is fully real.

The app must be refocused around this sequence:

```text
Create/select client
→ enter client profile data
→ start a risk review
→ initialize selected modules from client profile
→ advisor adjusts module-specific inputs
→ deterministic outputs calculate
→ charts visualize the gap
→ advisor presents the risk to the client
```

Everything else is secondary.

---

## 2. Advisor Vision Restatement

The advisor’s notes define a focused product, not a broad financial planning platform.

### 2.1 What the app is

The app is a simple but polished input/output risk management tool.

Inputs include:

- Client identity.
- Household profile.
- Income and income trajectory.
- Expenses.
- Existing savings.
- Existing insurance/benefits.
- Existing coverage.
- Basic risk-specific inputs.

Outputs include:

- A visual gap caused by premature death.
- A visual gap caused by disability.
- A reserve/runway view caused by unemployment.
- An exposure/gap view caused by lawsuits or liability events.

The goal is to help the client conceptualize risk before discussing actual products.

### 2.2 What the app is not

The app is not:

- A full financial planning platform.
- A CRM replacement.
- A wealth management tool.
- A product recommendation engine.
- A carrier comparison tool.
- An underwriting tool.
- A tax advice tool.
- A legal advice tool.
- A full actuarial modeling system.
- A policy illustration system.
- An AI advisory assistant.

The tool should show the gap clearly. The advisor handles interpretation and later solution discussion.

---

## 3. Correct North Star

The correct product north star is:

```text
Input client/profile data
→ show risk-event gap visually
→ help advisor explain the need
→ advisor later discusses products/solutions outside the tool
```

The app should be optimized for an advisor sitting with a client and saying:

```text
Here is the risk.
Here is what existing coverage helps with.
Here is the remaining gap.
Here is why we should talk about possible solutions.
```

That is the product.

---

## 4. Current App State Summary

Based on the current app structure and prior repo audit, the application is best described as:

```text
A strong deterministic MVP prototype with polished UI direction,
but still using demo-like data flow and hardcoded/default module values.
```

### 4.1 Current strengths

The current app has strong foundations:

| Area | Current State | Assessment |
|---|---|---|
| Risk modules | Disability, Life Insurance, Unemployment, Liability | Correct module set |
| UI direction | Modern dashboard and module views | Strong |
| Input/output structure | Module pages use inputs and output views | Correct |
| Calculation model | Deterministic local calculations | Correct |
| Charting | Recharts-based visualizations | Suitable |
| Animation | Staged cards and chart animations added | Improved |
| Presentation concept | Dedicated presentation route exists | Correct direction |
| TypeScript | App uses TypeScript | Correct production choice |

### 4.2 Current weaknesses

The current app still has production blockers:

| Area | Issue | Impact |
|---|---|---|
| Client setup | Not fully real/persistent | App cannot truthfully model real clients |
| Data source | Hardcoded/default module data still exists | Outputs may look client-specific but are not |
| Scenario header | Hardcoded client/scenario display values | Breaks data truthfulness |
| Dashboard | Still behaves like demo/global view | Needs real client/scenario source |
| Store design | Global scenario/module inputs | Does not support multiple clients/scenarios cleanly |
| Persistence | No real production persistence layer yet | Cannot be used reliably by advisors |
| Save workflow | Save Scenario button is not fully meaningful | Advisor cannot trust saved work |
| Reports | Stubbed/not core-ready | Defer until core flow works |
| Assumptions | Potentially over-prominent early | Should be module-local/collapsed for MVP |
| Settings/users/billing | Premature for current product maturity | Keep secondary |

---

## 5. Product Alignment Verdict

Current alignment:

```text
UI direction: Strong
Module concept: Strong
Risk categories: Correct
Calculation concept: Mostly aligned
Advisor workflow: Partially aligned
Client setup workflow: Not yet real
Persistence/data pipeline: Not yet real
Overengineering risk: Moderate
```

The app is not off-track conceptually. It is off-track operationally because the real client setup and scenario pipeline is not yet the central implemented workflow.

---

## 6. Primary Product Boundary

The app should be defined as:

> A polished advisor-facing income/protection gap visualization tool for basic risk management conversations.

The app should not try to become everything a financial advisor uses. Its job is to help advisors demonstrate risk gaps in a clean, credible, client-friendly way.

### 6.1 Keep

Keep and refine:

- Client setup.
- Client detail workspace.
- Risk review tabs.
- Module input forms.
- Animated output visualizations.
- Advisor narrative blocks.
- Disclaimers.
- Presentation mode.
- Basic save/continue workflow.

### 6.2 Defer

Defer or keep minimal:

- Billing.
- Team management.
- Deep settings.
- Advanced report generation.
- Advanced assumption management.
- Audit pages.
- Firm-level analytics.
- Complex dashboard intelligence.
- Policy/product recommendations.
- Carrier integrations.
- Premium quoting.
- Underwriting prediction.

---

## 7. Correct MVP Application Structure

The simplest correct application structure is:

```text
Dashboard
  ↓
Client Setup
  ↓
Client Detail
  ↓
Risk Review
  ↓
Module Tabs
  ↓
Input + Output
  ↓
Presentation Mode
```

This is enough for MVP.

### 7.1 Dashboard

The dashboard should be the advisor’s global viewer for real clients and open analyses.

It should answer:

- Which clients exist?
- Which clients have incomplete profiles?
- Which risk reviews are active?
- Which analyses were recently updated?
- Which clients have visible gaps?
- Which analysis should the advisor continue next?

It should not become:

- A full analytics platform.
- A CRM.
- A productivity suite.
- A book-of-business intelligence tool.
- A complex admin console.

### 7.2 Client Setup

Client setup should collect only the data needed to initialize a basic gap analysis.

Recommended sections:

1. Basic Info.
2. Household / Income Earner.
3. Financial Baseline.
4. Existing Coverage / Benefits.

This should not be a long onboarding wizard. It should be fast, friendly, and editable.

### 7.3 Client Detail Workspace

The client detail page should become the center of each client relationship inside the app.

Recommended tabs:

- Overview.
- Client Setup.
- Risk Review.
- Presentations.
- Reports.
- Notes.

The Audit tab can be deferred or kept hidden unless needed later.

### 7.4 Risk Review Tabs

Risk Review should contain the advisor-facing risk modules:

- Disability.
- Life Insurance.
- Unemployment.
- Liability / Lawsuit.

Each tab should have a subtitle:

- **Disability** — illness or injury income gap.
- **Life Insurance** — premature death income gap.
- **Unemployment** — job loss runway.
- **Liability / Lawsuit** — asset exposure.

This preserves the clarity of the legacy tabs while giving the current app professional labels.

---

## 8. Legacy Tab Reconciliation

The original/legacy app used:

```text
Client Setup
Death
Lawsuit
Unemployment
```

The newer app uses:

```text
Disability
Life Insurance
Unemployment
Liability
```

The best final structure should not discard either model. It should layer them.

### 8.1 Client-level tabs

```text
Overview
Client Setup
Risk Review
Presentations
Reports
Notes
```

### 8.2 Risk Review module tabs

```text
Disability
Life Insurance
Unemployment
Liability / Lawsuit
```

### 8.3 Why this is better

This gives the app:

- The simplicity of the old UI.
- The professional clarity of the new UI.
- A clean place for client setup.
- A clean place for risk modules.
- Room for Disability as the flagship module.
- Better advisor navigation.

---

## 9. Current Pipeline Problem

The current app appears polished, but the data pipeline is not yet production-real.

The current effective flow is closer to:

```text
Open default scenario
→ read global module defaults from store
→ calculate output
→ render chart
```

The target flow must become:

```text
Create/select real client
→ client profile is saved
→ start scenario/risk review
→ module inputs initialize from client profile
→ advisor edits module inputs
→ calculation runs
→ output is saved to that scenario
→ dashboard and presentation read from saved state
```

The difference is fundamental.

The first flow is a demo.  
The second flow is a production tool.

---

## 10. Required Production Data Model

The app needs a real data model. It does not need to be overcomplicated, but it must separate client facts, scenario inputs, and calculated outputs.

### 10.1 Client

Represents the person or household.

Required fields:

- Client ID.
- Advisor ID or local owner ID.
- First name.
- Last name.
- Display name or household name.
- Email.
- Phone.
- Status.
- Created date.
- Updated date.
- Profile completion status.

Recommended statuses:

- Draft.
- Active.
- Archived.

### 10.2 Client Financial Profile

Stores reusable baseline facts.

Recommended fields:

- Client ID.
- Primary income earner name.
- Current age.
- Expected retirement age.
- Annual earned income.
- Spouse or partner income.
- Monthly household expenses.
- Emergency savings.
- Dependents.
- Debts total.
- Education funding goal.
- Final expenses.
- Group life coverage.
- Private life coverage.
- Employer STD benefit.
- Employer LTD benefit.
- Private disability benefit.
- State benefit estimate.
- Home value.
- Mortgage balance.
- Savings assets.
- Investment assets.
- Auto liability limit.
- Home liability limit.
- Umbrella coverage.

This profile initializes module inputs. It does not replace module-specific inputs.

### 10.3 Scenario / Risk Review

Represents one risk analysis project for a client.

Recommended fields:

- Scenario ID.
- Client ID.
- Advisor ID.
- Scenario name.
- Included modules.
- Active module.
- Status.
- Created date.
- Updated date.
- Last calculated date.
- Presented date.
- Report status.

Recommended statuses:

- Draft.
- Inputs Needed.
- Calculated.
- Ready for Review.
- Presented.
- Report Generated.
- Archived.

### 10.4 Module Input Records

Each scenario should have module-specific input records.

Examples:

- Life module inputs.
- Disability module inputs.
- Unemployment module inputs.
- Liability module inputs.

These records should be initialized from the client profile but editable per scenario.

### 10.5 Calculation Output Records

For MVP, each module should save its latest output.

For production, each calculation run should eventually be snapshotted.

Required saved data:

- Client ID.
- Scenario ID.
- Module type.
- Input snapshot.
- Assumption snapshot.
- Output snapshot.
- Chart data snapshot, if available.
- Narrative snapshot, if available.
- Calculation timestamp.
- Formula version, if used internally.

Do not make this a visible “audit” feature before the core workflow works. But structure the data so it can support production use.

---

## 11. Persistence Strategy

The app should move away from hardcoded mock data.

Recommended staged approach:

### Phase 1 — Local storage persistence

Use local storage as the initial real persistence mechanism.

Store:

- Clients.
- Client financial profiles.
- Scenarios.
- Module inputs.
- Calculation outputs.
- Presentation state.
- Reports, if needed later.

Important rule:

> UI components should never talk directly to local storage.

Use a repository/service layer:

```text
UI
→ domain service/repository
→ local storage adapter
```

This keeps the app easy to move to Firebase later.

### Phase 2 — Firebase persistence

When ready, replace the local storage adapter with Firebase.

Suggested collections:

- Advisors.
- Clients.
- ClientProfiles.
- Scenarios.
- ModuleInputs.
- CalculationRuns.
- Presentations.
- Reports.
- AssumptionSets.

The UI should not need major changes if the repository layer is designed correctly.

---

## 12. Required Refactor: Remove Hardcoded Mock Client Data

The app must remove:

- Hardcoded client arrays.
- Hardcoded scenario rows.
- Hardcoded scenario header names.
- Hardcoded “Miller Household” values.
- Hardcoded last updated values.
- Hardcoded global module defaults used as if they are real client data.

### 12.1 What should replace mock clients

Replace mock arrays with repository/service methods such as:

- List clients.
- Create client.
- Update client.
- Archive client.
- List scenarios by client.
- Create scenario.
- Load module inputs by scenario.
- Save module inputs by scenario.

The exact names can vary, but the architecture should follow this pattern.

### 12.2 Dashboard should read real state

The dashboard should be generated from:

- Stored clients.
- Stored scenarios.
- Stored calculation summaries.
- Stored presentation/report statuses.

It should not own mock data.

### 12.3 Scenario header should read real state

The scenario header should display:

- Client name.
- Scenario name.
- Scenario status.
- Last updated date.
- Last calculated date.
- Included modules.

No static household names should remain.

### 12.4 Module pages should read scenario-specific inputs

Each module page should load inputs by scenario ID and module type.

Correct:

```text
scenarioId + moduleType
→ load module input record
→ calculate output
→ save updated input/output
```

Incorrect:

```text
global default lifeInputs
global default disabilityInputs
global default unemploymentInputs
global default liabilityInputs
```

---

## 13. Client Setup Workflow

Client setup should become a first-class production workflow.

### 13.1 Entry points

An advisor should be able to start client setup from:

- Dashboard primary action.
- Empty state.
- Client list.
- Search no-results state.
- Start analysis flow.

### 13.2 Recommended UI pattern

Use a modern drawer or full page.

For MVP, a drawer may be faster and friendlier. A full page may be better if the profile becomes longer.

Recommended sections:

1. Basic Information.
2. Household / Income Earner.
3. Financial Baseline.
4. Existing Protection / Benefits.
5. Review and Start.

### 13.3 Required fields for client creation

Keep the minimum low:

- First name.
- Last name.
- Household/display name, optional.
- Current age, optional but recommended.
- Annual income, optional but recommended.
- Monthly expenses, optional but recommended.

The app should allow saving draft clients.

### 13.4 Profile completion states

Use visible states:

- Missing Required Info.
- Ready for Basic Analysis.
- Ready for Full Analysis.

This keeps the advisor workflow flexible.

### 13.5 After client creation

After creating a client, the app should offer:

- Go to Client Dashboard.
- Start Risk Review.
- Start Disability Analysis.
- Start Life Insurance Analysis.

Default should be “Go to Client Dashboard” with a clear CTA to start analysis.

---

## 14. Scenario / Risk Review Initialization Workflow

When an advisor starts an analysis, open a “Start Risk Review” or “Start Income Gap Analysis” modal/drawer.

### 14.1 Required fields

- Scenario name.
- Included modules.
- Starting module.
- Optional notes.

Recommended scenario name:

```text
[Client Last Name] Household Risk Review
```

### 14.2 Analysis type options

- Full Risk Review.
- Disability Only.
- Life Insurance Only.
- Unemployment Only.
- Liability / Lawsuit Only.

### 14.3 Initialization behavior

On scenario creation:

1. Create scenario record.
2. Create selected module input records.
3. Prefill module inputs from the client profile.
4. Apply safe MVP defaults where client profile data is missing.
5. Mark module status as Inputs Needed or Ready to Calculate.
6. Route advisor to the first selected module.

---

## 15. Module Prefill Rules

Module inputs should be initialized from the client financial profile.

### 15.1 Life Insurance prefill

From client profile:

- Current age.
- Retirement age.
- Annual income.
- Spouse/partner income.
- Debts total.
- Education goal.
- Final expenses.
- Group life coverage.
- Private life coverage.
- Liquid assets allocated, if used.

Default assumptions:

- Income replacement ratio.
- Income replacement years.
- Present value mode.
- Liquid asset offset mode.

### 15.2 Disability prefill

From client profile:

- Annual earned income.
- Monthly household expenses.
- Emergency savings.
- Spouse monthly income.
- Employer STD benefit.
- Employer LTD benefit.
- Private DI benefit.
- State benefit estimate, if any.

Default assumptions:

- Partial/total disability mode.
- Modeled duration.
- Waiting periods.
- Benefit durations.
- Taxability assumptions.
- SSDI excluded by default unless advisor enters it.

### 15.3 Unemployment prefill

From client profile:

- Annual income.
- Monthly expenses.
- Emergency savings.
- Spouse income.

Default assumptions:

- Severance months.
- Unemployment benefit amount.
- Benefit duration.
- Estimated job search months.

### 15.4 Liability / Lawsuit prefill

From client profile:

- Home value.
- Mortgage balance.
- Savings assets.
- Investment assets.
- Auto liability limit.
- Home liability limit.
- Umbrella coverage.

Default assumptions:

- Estimated lawsuit exposure.
- Claim scenario type.
- Protected asset assumptions, if used later.

---

## 16. Module UX Requirements

Each risk module should remain an input/output workspace.

### 16.1 Layout

Recommended layout:

```text
Header
→ module title and simple client question
→ left input panel
→ right output visualization panel
→ disclaimer
```

The existing layout is good. Keep it.

### 16.2 Header wording

Each module should be framed as a client question:

- Life Insurance: “If I die prematurely, what financial support disappears for my family?”
- Disability: “If I cannot work due to illness or injury, how does my financial plan change?”
- Unemployment: “If I lose my job, how long can my reserves support my household?”
- Liability / Lawsuit: “If I face a lawsuit, what assets or wealth could be exposed?”

### 16.3 Save behavior

The “Save Scenario” button should actually persist:

- Current module inputs.
- Current assumptions.
- Current output.
- Last calculated timestamp.
- Scenario status.

If this button does not save real state, it should not be visible as a production control.

### 16.4 Output behavior

Outputs should update as the advisor changes inputs, but saving should preserve the current state.

Acceptable MVP pattern:

```text
inputs update live
outputs calculate live
advisor clicks save
scenario state persists
```

---

## 17. Module-by-Module Scope

### 17.1 Life Insurance

Keep Life simple.

Core purpose:

```text
Show the financial gap caused by premature death of an income earner.
```

Inputs:

- Income.
- Age.
- Retirement age.
- Spouse/partner income.
- Existing group life coverage.
- Existing private life coverage.
- Debts.
- Education goal.
- Final expenses.

Outputs:

- Total protection need.
- Existing coverage.
- Group life offset.
- Private life offset.
- Remaining gap.
- Year-by-year visual.

Do not build:

- Carrier comparisons.
- Premium quotes.
- Policy illustrations.
- Underwriting prediction.
- Product recommendations.

### 17.2 Disability

Disability should be the deepest module because the advisor specifically identified DI as the key area.

Core purpose:

```text
Show what happens when illness or injury reduces or eliminates earned income.
```

Inputs:

- Earned income.
- Expenses.
- Emergency savings.
- Spouse income.
- STD benefits.
- LTD benefits.
- Private DI benefits.
- State benefits.
- Optional SSDI estimate.
- Partial vs total disability mode.
- Waiting periods.
- Benefit durations.

Outputs should remain limited to 4–5 strong visuals:

1. Monthly income gap.
2. Reserve depletion timeline.
3. Employer/private/government benefit offset.
4. Partial vs total disability comparison.
5. Recovery/duration scenario view.

Do not build:

- Approval probability modeling.
- Underwriting predictions.
- Carrier-specific DI contract modeling.
- Product recommendation logic.
- Complex medical condition modeling.

### 17.3 Unemployment

Keep Unemployment simple.

Core purpose:

```text
Show reserve runway and shortfall after job loss.
```

Outputs:

- Current emergency reserve.
- Months of runway.
- Cash depletion month.
- Monthly shortfall.
- Unfunded shortfall across modeled search period.

### 17.4 Liability / Lawsuit

Keep Liability careful and conceptual.

Core purpose:

```text
Show estimated exposure if a lawsuit exceeds existing liability protection.
```

Outputs:

- Estimated lawsuit exposure.
- Existing liability/umbrella coverage.
- At-risk assets.
- Remaining modeled exposure.
- Wealth erosion estimate.

Required disclaimer:

> This is a simplified illustrative exposure scenario and is not legal advice. Actual liability exposure depends on facts, jurisdiction, policy terms, exclusions, protected assets, and legal proceedings.

---

## 18. Dashboard Refocus

The dashboard should become a real client and scenario manager.

### 18.1 Dashboard should show

- Total clients.
- Draft clients.
- Active risk reviews.
- Incomplete analyses.
- Recently updated clients.
- Recent scenarios.
- Largest modeled gaps.
- Quick action: Add Client.
- Quick action: Start Risk Review.
- Continue recent analysis.

### 18.2 Dashboard should not show

- Fake analytics.
- Non-actionable metrics.
- Complex firm-level performance data.
- Generic usage metrics.
- Anything not based on real stored client/scenario data.

### 18.3 Dashboard empty state

If no clients exist, show a polished empty state:

```text
No clients yet.
Create your first client profile to begin a gap analysis.
[Add Client]
```

This is more production-real than demo cards.

---

## 19. Presentation Mode Refocus

Presentation Mode should be prioritized over advanced reports.

The advisor needs a clean client-facing view.

### 19.1 Presentation mode should include

- Client/scenario header.
- Risk module tabs or stepper.
- Key gap number.
- Clean chart.
- Existing coverage/benefit offset.
- Remaining gap.
- Advisor narrative.
- Disclaimer.

### 19.2 Presentation mode should exclude

- Raw configuration controls.
- Admin settings.
- Complex assumptions unless expanded.
- Technical formula references.
- Internal audit metadata.

### 19.3 Presentation behavior

The advisor should be able to move through:

```text
Life
→ Disability
→ Unemployment
→ Liability / Lawsuit
```

or only the modules included in that scenario.

---

## 20. Reports Refocus

Reports should be secondary to presentation mode.

For MVP:

- Keep report generation as a placeholder or simple export-ready summary.
- Do not build a complex report system before client setup and scenario persistence are real.

When reports are later implemented, they should summarize:

- Client.
- Scenario.
- Included modules.
- Key inputs.
- Key outputs.
- Visuals.
- Advisor narrative.
- Disclaimers.

---

## 21. Assumptions Refocus

Do not make assumptions a major app section too early.

Recommended MVP behavior:

- Use safe defaults internally.
- Show basic assumptions inside each module.
- Put assumptions in a collapsed “Advanced assumptions” panel.
- Allow advisor edits only where useful.
- Do not expose firm-wide assumption management yet.

This prevents the product from becoming too technical before advisors can use the core workflow.

---

## 22. Settings Refocus

Settings should remain minimal.

MVP settings can include:

- Advisor name.
- Firm name.
- App preferences.
- Optional display preferences.

Defer:

- Billing.
- Team users.
- Access control.
- Firm policy settings.
- Advanced role management.

---

## 23. Calculation and Logic Scope

The current deterministic approach is correct.

Do not add AI to calculations.  
Do not add AI-generated recommendations.  
Do not add predictive modeling.

The app should calculate:

```text
risk event
+ client financial profile
+ existing protection
= modeled gap
```

### 23.1 Correct formula philosophy

Use transparent MVP formulas.

They should be:

- Simple.
- Explainable.
- Deterministic.
- Advisor-editable through inputs.
- Not represented as guaranteed or official recommendations.

### 23.2 Avoid overbuilding formulas

Avoid:

- Full actuarial engines.
- Detailed tax engines.
- Product-specific policy modeling.
- Carrier illustration logic.
- Monte Carlo simulations.
- AI-generated risk scoring.

### 23.3 Keep disclaimers visible

Every output should remain framed as:

```text
Illustrative planning estimate.
Not a recommendation.
Actual needs may vary.
Advisor review required.
```

---

## 24. UI/UX Priority List

The UI/UX should be polished, but not bloated.

### Highest priority UI

1. Add Client workflow.
2. Client detail workspace.
3. Client Setup tab.
4. Risk Review module tabs.
5. Input forms.
6. Output visualizations.
7. Presentation mode.
8. Save/continue states.
9. Empty states.
10. Loading/transition states.

### Medium priority UI

1. Reports list.
2. Basic reports.
3. Notes.
4. Basic assumptions display.

### Low priority UI

1. Billing.
2. Team management.
3. Advanced settings.
4. Audit screens.
5. Advanced analytics dashboard.

---

## 25. Recommended Implementation Phases

### Phase 1 — Product Refocus Cleanup

Goal: simplify visible product structure and remove distractions.

Tasks:

- Confirm product boundary in documentation.
- Hide or minimize non-core sections if they distract.
- Ensure labels match advisor language.
- Rename Liability to Liability / Lawsuit.
- Add risk module subtitles.
- Remove hardcoded visible scenario names from headers.
- Make Dashboard messaging about real clients and risk reviews.

Success criteria:

- The app clearly presents itself as a gap analysis tool.
- No visible UI implies a full financial planning suite.
- No visible UI implies product recommendations.

### Phase 2 — Real Client Setup

Goal: create real clients instead of mock clients.

Tasks:

- Define client and client profile domain objects.
- Create local storage repository layer.
- Build Add Client workflow.
- Build Client Setup form.
- Save clients to persistence.
- Show real clients on Dashboard.
- Add empty state when no clients exist.

Success criteria:

- Advisor can create a client.
- Client persists on refresh.
- Dashboard displays real saved clients.
- No hardcoded client list is needed.

### Phase 3 — Client Detail Workspace

Goal: make the app client-first.

Tasks:

- Add Client Detail page.
- Add client-level tabs:
  - Overview.
  - Client Setup.
  - Risk Review.
  - Presentations.
  - Reports.
  - Notes.
- Display real client header.
- Show profile completion.
- Show active scenarios.
- Allow editing client profile.

Success criteria:

- Advisor can open a real client.
- Advisor can edit profile data.
- App feels centered on the client, not a demo scenario.

### Phase 4 — Scenario / Risk Review Initialization

Goal: make risk reviews real.

Tasks:

- Build Start Risk Review modal/drawer.
- Allow module selection.
- Create scenario record.
- Initialize module inputs from client profile.
- Store module inputs per scenario.
- Route advisor into selected module.

Success criteria:

- Scenario belongs to a client.
- Module inputs are generated from client profile.
- Multiple clients/scenarios can exist without overwriting each other.

### Phase 5 — Module Input Persistence

Goal: remove global module defaults as the working source of truth.

Tasks:

- Replace global singleton module state with scenario-specific module input records.
- Load inputs by scenario ID and module type.
- Save module input edits.
- Save calculated outputs.
- Update scenario status after calculation/save.

Success criteria:

- Module pages do not rely on one global default object.
- Saved scenario outputs are reproducible.
- Dashboard can show real scenario summaries.

### Phase 6 — Presentation Mode Integration

Goal: make the advisor/client conversation real.

Tasks:

- Load real scenario data into presentation mode.
- Show selected modules only.
- Use saved outputs where available.
- Provide clean navigation between risk modules.
- Keep inputs/admin controls out of presentation mode.

Success criteria:

- Advisor can present a real saved analysis.
- Presentation mode matches client/scenario data.
- No mock values appear.

### Phase 7 — Production Hardening

Goal: prepare for real usage.

Tasks:

- Add runtime validation.
- Add safe empty states.
- Add local storage migration/versioning.
- Add basic error handling.
- Add calculation save metadata.
- Add reset/demo-data tools for development only.
- Add unit tests for calculations.
- Add smoke tests for client/scenario workflows.

Success criteria:

- App is stable across refreshes.
- Bad inputs do not break calculations.
- Demo-only data is removed from production path.
- Calculation outputs remain traceable to client/scenario inputs.

### Phase 8 — Firebase Migration

Goal: replace local storage with cloud persistence when ready.

Tasks:

- Keep repository interfaces stable.
- Replace local storage adapter with Firebase adapter.
- Add authentication if required.
- Store clients/scenarios/calculation outputs per advisor.
- Preserve app-level data model.

Success criteria:

- UI does not require major rewrite.
- Data persists across devices.
- App can support real advisor usage.

---

## 26. Production Data Flow Target

The final production data flow should be:

```text
Advisor opens Dashboard
→ Dashboard reads clients/scenarios from repository
→ Advisor creates or selects client
→ Client profile loads
→ Advisor starts risk review
→ Scenario is created
→ Module input records are initialized
→ Advisor edits inputs
→ Calculation runs deterministically
→ Output is displayed
→ Advisor saves scenario
→ Output snapshot is persisted
→ Presentation mode reads saved scenario
```

This is the real app pipeline.

---

## 27. What to Stop Doing

Stop building features that do not directly support the core advisor loop.

Stop prioritizing:

- Complex settings.
- Billing views.
- Team user management.
- Advanced reports.
- Deep assumption management.
- Formal audit UI.
- Firm analytics.
- Complex dashboards.
- Formula governance UI.

Stop using:

- Hardcoded demo clients.
- Hardcoded scenario headers.
- Global default module inputs as if they were client-specific data.
- Static “Miller Household” labels.
- Demo dates.
- Non-functional save buttons.

---

## 28. What to Start Doing

Start prioritizing:

- Client creation.
- Client persistence.
- Client detail workspace.
- Scenario creation.
- Module initialization from client profile.
- Real save behavior.
- Real presentation mode.
- Clean empty states.
- Real dashboard data.
- Light validation.
- Local storage repository.
- Later Firebase-ready abstraction.

---

## 29. Definition of Done for “Back on Track”

The app is back on track when an advisor can complete this real workflow:

1. Open the app.
2. See an empty or real client dashboard.
3. Add a new client.
4. Enter basic profile data.
5. Save the client.
6. Start a risk review.
7. Choose Life Insurance, Disability, Unemployment, and/or Liability.
8. See module inputs prefilled from the client profile.
9. Adjust inputs.
10. See the output visualizations update.
11. Save the scenario.
12. Open presentation mode.
13. Present the modeled gap to the client.
14. Return later and continue from saved state.

If the app cannot do this, it is still a demo/prototype.

---

## 30. Recommended Engineering Agent Instructions

Use these instructions for the engineering agent implementing the refactor:

```text
You are refactoring Gap Tool back toward its core product goal:
a polished advisor-facing input/output risk visualization tool.

Do not overbuild the app into a CRM, full financial planning suite, product recommendation engine, carrier illustration system, or admin-heavy platform.

Your priority is to remove hardcoded mock client/scenario data and implement a real client setup, client profile, scenario initialization, module input, deterministic output, and presentation workflow.

Build the app around this flow:
Create/select client
→ enter client setup data
→ start risk review
→ initialize module inputs from client profile
→ calculate and visualize gaps
→ save scenario
→ present to client.

Use local storage persistence first, behind a repository/service layer, so the app can later move to Firebase without rewriting UI components.

Keep UI polished and advisor-friendly. Keep calculations deterministic. Keep assumptions simple and mostly collapsed. Keep advanced reports, audit, billing, users, and deep settings secondary.

Preserve the core risk tabs:
Disability
Life Insurance
Unemployment
Liability / Lawsuit

Use clear subtitles so the advisor/client understands each tab:
Disability — illness or injury income gap
Life Insurance — premature death income gap
Unemployment — job loss runway
Liability / Lawsuit — asset exposure.

Every production screen must use real stored client/scenario data or show a proper empty state. Do not leave hardcoded household names, mock client arrays, fake last-updated dates, or global default module inputs as the production path.
```

---

## 31. Final Recommendation

The app should not be made more complex right now. It should be made more real.

The correct next move is not more architecture for its own sake. The correct next move is:

```text
Replace mock state with real client/scenario state.
Make client setup work.
Make scenario initialization work.
Make module prefill work.
Make save/continue work.
Make presentation mode read real outputs.
```

Once that loop works, the app will be aligned with the advisor’s actual vision.

The final product should feel like this:

> An advisor opens the app, creates a client, enters a few understandable facts, selects a risk module, and shows the client a clean visual gap.  
> The client understands the risk.  
> The advisor can then discuss possible solutions.

That is the main goal.
