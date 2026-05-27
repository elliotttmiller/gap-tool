# Gap Tool Codebase Audit Report (2026-05-27)

## 1) Summary of Evaluation

This audit reviewed application architecture, persistence/data flow, module calculation engines, validation/error handling, and security-relevant surfaces (client-side import/export and runtime failure behavior).  
The codebase is generally well-structured for an MVP: deterministic calculators, centralized state via persisted Zustand store, and clear module boundaries.

Primary risk areas identified:
- **Calculation correctness drift** between aggregate metrics and timeline logic in unemployment modeling (fixed in this update).
- **Golden validation drift** (baseline `npm run test:validation` currently fails against stale/over-strict expectations).
- **Data import validation depth** is minimal for untrusted JSON imports.

## 2) Identified Issues by Category

### A. Calculation Correctness

#### A1. Unemployment aggregate offsets were inconsistent with timeline simulation (**fixed**)
- **Severity:** High
- **Impact:** Advisor-facing summary metrics (`totalOffsetDuringSearch`, `netCashNeeded`) could materially misstate liquidity risk.
- **Evidence:**
  - Pre-fix logic multiplied combined monthly offset by unemployment-duration overlap only, ignoring severance-only months.
  - File: `src/features/risk-modules/unemployment/calculations/calculateUnemploymentGap.ts`
  - Old behavior:
    - `overlapMonths = min(unemploymentBenefitDurationMonths, estimatedJobSearchMonths)`
    - `totalOffsetDuringSearch = monthlyOffset * overlapMonths`
- **Resolution implemented:**
  - Compute severance and unemployment contribution independently across the search window.
  - New logic:
    - `severanceMonthly * min(severanceDurationMonths, estimatedJobSearchMonths)`
    - `+ unemploymentBenefitMonthly * min(unemploymentBenefitDurationMonths, estimatedJobSearchMonths)`
- **Validation added:**
  - `src/golden/unemploymentInvariantCheck.ts` with deterministic assertions for:
    - severance-only case
    - mixed severance + unemployment case

#### A2. Golden validation currently fails on numeric precision/answer-key drift
- **Severity:** Medium
- **Impact:** Reduced confidence in regression safety prior to preview.
- **Evidence:**
  - Baseline run before changes: `npm run test:validation` fails in `src/golden/northstarGoldenCheck.ts` with mismatch:
    - `lifeIncomeGap.module1.projectedNetIncomeTotal: expected 3645926, received 3645926.4321807176`
- **Recommendation:**
  - Re-baseline golden answer key and/or apply explicit currency rounding policy for life income-gap totals.
  - Keep strict tolerances only where cents-level precision is required by specification.

### B. Data Integrity & Storage

#### B1. Import accepts minimally validated JSON shape
- **Severity:** Medium
- **Impact:** Malformed imports can persist structurally invalid state and create runtime instability later.
- **Evidence:**
  - `src/pages/Assumptions.tsx` only checks `clients` and `scenarios` are arrays before calling `importAppData`.
  - `src/lib/store.ts` `importAppData` assigns incoming fields with limited runtime structural verification.
- **Recommendation:**
  - Add schema-based validation (e.g., Zod) for import payload before persistence.
  - Reject invalid module record maps and invalid assumption objects with clear UI error.

### C. Validation & Testing Governance

#### C1. Validation surface relies heavily on large golden snapshots
- **Severity:** Medium
- **Impact:** Large answer-key drift can hide root-cause regressions or create noisy failures.
- **Evidence:**
  - `src/golden/northstarGoldenCheck.ts`
  - `src/golden/northstarGoldenAnswerKey.ts`
- **Recommendation:**
  - Keep golden snapshots, but add more **small invariant checks** (identity equations, monotonicity, range constraints) per module.
  - Example now added for unemployment aggregate/timeline consistency.

### D. Security & Error Handling

#### D1. Error boundary displays raw runtime messages to end users
- **Severity:** Low
- **Impact:** Potential leakage of internal details in user-facing UI.
- **Evidence:**
  - `src/components/global/ModuleErrorBoundary.tsx` renders `this.state.error.message`.
- **Recommendation:**
  - Show user-safe generic message by default and gate detailed diagnostics behind dev mode.

## 3) Additional Observations

- State architecture is maintainable for current scope:
  - Persisted store + centralized scenario/module records (`src/lib/store.ts`, `src/lib/store-types.ts`).
- Calculation modules are mostly deterministic and include several numeric guards (`src/lib/math.ts`, module calculators).
- Existing import/export is useful operationally for advisor workflows but should be hardened before production preview.

## 4) Changes Made in This Audit Update

1. **Fixed unemployment aggregate calculation correctness issue**
   - `src/features/risk-modules/unemployment/calculations/calculateUnemploymentGap.ts`
2. **Added focused invariant check**
   - `src/golden/unemploymentInvariantCheck.ts`
3. **Documented full audit findings and recommendations**
   - `docs/advisor-references/2026-05-27-codebase-audit-report.md`
