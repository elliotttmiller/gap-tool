# Structure

## High-Level Architecture

Gap Tool is a Vite React application organized around a client/scenario workflow and active risk modules. The current architecture is:

```text
Client profile
  -> Scenario risk review
  -> Module input state
  -> Pure calculation functions
  -> Module output views
  -> Advisor-safe copy, schedules, charts, and saved outputs
```

The active application is entirely front-end. Browser routes are defined in `src/App.tsx`, app chrome lives in global layout components, and persisted data is managed by the Zustand store in `src/lib/store.ts`.

## Top-Level Folders

```text
docs/
  Project documentation and advisor source materials.

public/
  Static browser assets such as icons, manifest, logo, and meta-tag HTML.

scripts/
  Local maintenance or helper scripts.

src/
  React application source, domain helpers, module features, shared components,
  pages, styles, and client-side state.
```

Build output is emitted to `dist/` and should not be treated as source.

## `docs/`

```text
docs/
  product.md
  structure.md
  tech.md
  advisor-references/
```

`docs/advisor-references/` contains methodology source material, including advisor notes, formula references, and prototype/reference assets. These files should guide product behavior and wording when the code and advisor methodology disagree.

## `src/App.tsx`

`src/App.tsx` defines the application route tree with React Router:

- `/` renders the dashboard.
- `/clients/:clientId/overview` renders the client overview editor.
- `/scenarios/:scenarioId` hosts nested module routes.
- `/scenarios/:scenarioId/life` renders the Life module.
- `/scenarios/:scenarioId/disability` renders the Disability module.
- `/scenarios/:scenarioId/unemployment` renders the Unemployment module.
- `/scenarios/:scenarioId/liability` renders the Liability module.
- `/present/:scenarioId` renders the presentation page outside the main app shell.

The route tree uses lazy-loaded pages and a shared `AppShell` for the primary application experience.

## `src/pages/`

`src/pages/` contains route-level screens:

```text
src/pages/
  Dashboard.tsx
  ClientOverview.tsx
  ScenarioDetail.tsx
  RiskModulePage.tsx
  LifeModulePage.tsx
  DisabilityModulePage.tsx
  UnemploymentModulePage.tsx
  LiabilityModulePage.tsx
  Presentation.tsx
  Settings.tsx
```

Page components coordinate route params, store reads/writes, calculation calls, and feature components. Module pages should remain orchestration layers. They should not become the home for new formula logic.

## `src/features/risk-modules/`

Risk-module implementation lives under `src/features/risk-modules/`.

```text
src/features/risk-modules/
  core/
  life/
  disability/
  unemployment/
  liability/
```

Each active module generally follows this pattern:

```text
module/
  calculations/
    Pure calculation functions.
  components/
    Module-specific input and output React components.
  constants/
    Module-specific copy or display constants.
  transformers/
    Chart or view-data transformation helpers.
  types.ts
    Input, assumption, output, and schedule types.
```

`core/` contains shared module-level components and types, including shared metric-card and formula metadata types.

## Active Risk Modules

### Life

```text
src/features/risk-modules/life/
  calculations/calculateLifeInsuranceGap.ts
  calculations/calculateIncomeGapScenarios.ts
  components/LifeInputForm.tsx
  components/LifeOutputView.tsx
  constants/moduleCopy.ts
  transformers/transformLifeChartData.ts
  utils/getTotalDeathBenefit.ts
  utils/sanitizeLifeInputs.ts
  types.ts
```

The Life module includes both the core life summary calculation and income-gap scenario calculations. `sanitizeLifeInputs.ts` protects calculation functions from invalid or stale persisted inputs.

### Disability

```text
src/features/risk-modules/disability/
  calculations/calculateDisabilityGap.ts
  calculators/
  components/
  constants/moduleCopy.ts
  transformers/transformDisabilityChartData.ts
  types.ts
```

The Disability module has the primary disability gap calculator plus supporting advisor calculators for SSDI, savings bridge, premium versus self-insured, break-even, benefit tax, and job comparison views.

### Unemployment

```text
src/features/risk-modules/unemployment/
  calculations/calculateUnemploymentGap.ts
  components/
  constants/moduleCopy.ts
  transformers/transformUnemploymentChartData.ts
  types.ts
```

The Unemployment module calculates reserve targets, remaining income coverage, reserve gap/excess, search timeline, savings draw, and shortfall risk.

### Liability

```text
src/features/risk-modules/liability/
  calculations/calculateLiabilityGap.ts
  components/
  constants/moduleCopy.ts
  transformers/transformLiabilityChartData.ts
  types.ts
```

The Liability module calculates disposable-income wage exposure, assets at risk, existing liability coverage, liability gap, illustrative umbrella coverage level, and umbrella shortfall.

## `src/domain/`

`src/domain/` contains shared methodology helpers that should be reused across modules:

```text
src/domain/
  assumptions/
    defaultAssumptions.ts
    assumptionTypes.ts
  copy/
    advisorSafeCopy.ts
  financial/
    presentValue.ts
  formulas/
    formulaRegistry.ts
  gap-analysis/
    gapSchedule.ts
```

Use this folder for cross-module financial methodology, advisor-safe copy, formula metadata, default assumptions, and generic schedule helpers. This is the preferred location for shared truth that should not be tied to a single React component.

## `src/lib/`

`src/lib/` contains app infrastructure and shared utility logic:

```text
src/lib/
  store.ts
  store-types.ts
  clientFormSchema.ts
  math.ts
  utils.ts
  chartUtils.ts
  siteConfig.ts
  use-once-animation.ts
  useOnWindowResize.tsx
  usePWAInstall.ts
```

`store-types.ts` defines client, scenario, module-record, and persisted-data shapes. `store.ts` creates the Zustand store, initializes default client/module data, persists application state, updates inputs, and stores calculation outputs.

## `src/components/`

`src/components/` contains shared display and interaction components:

```text
src/components/
  global/
  navigation/
  ui/
  Button.tsx
  Card.tsx
  Drawer.tsx
  Input.tsx
  LineChart.tsx
  ProgressBar.tsx
  ProgressCircle.tsx
  Select.tsx
  TabNavigation.tsx
```

`components/global/` contains app-wide shell, sidebar navigation, PWA update toast, install button, disclaimer block, and module error boundary. `components/ui/` contains smaller UI primitives used by newer or more granular interfaces.

## State Shape

The persisted app state is centered on:

- `clients`: client profile records.
- `scenarios`: risk-review scenario records.
- `moduleRecordsByScenarioId`: per-scenario module inputs, assumptions, outputs, and timestamps.
- `globalLifeAssumptions` and `globalDisabilityAssumptions`: shared assumption defaults where applicable.

Persisted data is browser-local. When changing field names, add compatibility or migration logic so older local-storage records do not silently produce incorrect module values.

## Architecture Rules

- Keep route components focused on orchestration.
- Keep calculations pure and side-effect free.
- Keep module-specific React UI under the module's `components/` folder.
- Keep shared methodology under `src/domain/`.
- Keep shared store and app infrastructure under `src/lib/`.
- Keep compliance-sensitive language in `src/domain/copy/advisorSafeCopy.ts` or module copy constants.
- Keep charts, cards, and narratives derived from the same calculation output whenever possible.
