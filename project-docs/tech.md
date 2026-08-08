# Tech

## Runtime Stack

Gap Tool is a front-end TypeScript application built with:

- React 19.
- React DOM 19.
- React Router DOM 7.
- Vite 6.
- TypeScript 5.
- Tailwind CSS 4 through `@tailwindcss/vite`.
- Zustand 5 for client-side state and persistence.
- Recharts 2 for chart rendering.
- Vite PWA plugin for service-worker generation and install/update support.

The project is configured as an ES module package with `"type": "module"`.

## UI Libraries

The UI uses a mix of local components and third-party primitives:

- Radix UI packages for accessible primitives such as dialog, dropdown menu, label, popover, radio group, select, slider, switch, tabs, and tooltip.
- Remix Icon React and Lucide React for icons.
- Tailwind utility classes for styling.
- `clsx`, `tailwind-merge`, and `tailwind-variants` for class composition.
- React Day Picker and React Aria/Stately date packages where date inputs are needed.

Shared app components live in `src/components/`. Module-specific inputs and outputs live inside their module folders under `src/features/risk-modules/`.

## Data And State

The app uses Zustand with persistence middleware for local browser persistence. The main store is `src/lib/store.ts`, and the persisted shape is documented in `src/lib/store-types.ts`.

Core persisted concepts include:

- Client records.
- Scenario records.
- Per-scenario module records.
- Module inputs, assumptions, calculation outputs, update timestamps, and last-calculated timestamps.

There is no active server API, database layer, authentication system, or multi-user sync layer in the current app.

## Routing

Routes are declared in `src/App.tsx` using React Router. Page components are lazy-loaded with React `Suspense`.

Primary routes:

- `/`: dashboard and client setup.
- `/clients/:clientId/overview`: client profile editor.
- `/scenarios/:scenarioId/:module`: active risk module workspace.
- `/present/:scenarioId`: presentation page outside the main shell.

## Build And Verification Commands

Use the scripts from `package.json`:

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

`npm run lint` runs `tsc --noEmit`. There is no separate ESLint command in the current package scripts.

`npm run build` runs TypeScript checking and then `vite build`.

The dev server command is configured as:

```bash
vite --port=3000 --host=0.0.0.0
```

## TypeScript Configuration

The TypeScript target is ES2022. Module resolution uses the bundler resolver, JSX uses the React JSX transform, and `noEmit` is enabled.

Important compiler settings:

- `target`: `ES2022`.
- `module`: `ESNext`.
- `moduleResolution`: `bundler`.
- `jsx`: `react-jsx`.
- `allowJs`: `true`.
- `isolatedModules`: `true`.
- `noEmit`: `true`.
- Path alias: `@/*` maps to `./src/*`.

`tsconfig.json` includes `src` and excludes generated/build folders.

## Vite And PWA Configuration

`vite.config.ts` configures:

- React plugin.
- Tailwind CSS Vite plugin.
- Vite PWA plugin.
- `@` alias to `src`.
- Conditional base path: `/gap-tool/` in GitHub Actions and `/` otherwise.
- Manual chunks for React/router, charts, and UI/icon dependencies.
- Service-worker precaching for emitted JS, CSS, HTML, SVG, PNG, ICO, and WOFF2 files.
- Network-first app-shell navigation fallback.
- Cache-first Google Fonts runtime caching.

The PWA manifest is managed manually in `public/manifest.json`; the Vite PWA plugin is configured with `manifest: false`.

## Coding Standards

### Calculation Logic

Calculation logic should be pure TypeScript functions. It should not depend on React state, JSX, DOM APIs, formatting components, or side effects.

Preferred pattern:

```text
inputs + assumptions -> calculation result -> transformer/view data -> React output view
```

Cards, charts, narratives, and status labels should derive from the same calculation result or schedule whenever practical.

### Methodology And Assumptions

Advisor methodology should be centralized rather than scattered through components.

Use:

- `src/domain/assumptions/` for shared assumption types and defaults.
- `src/domain/gap-analysis/` for reusable schedule types and summaries.
- `src/domain/financial/` for shared financial math.
- `src/domain/formulas/` for formula metadata.
- `src/domain/copy/advisorSafeCopy.ts` for compliance-sensitive copy.

Advisor reference files in `docs/advisor-references/` should guide methodology and wording when implementation choices are ambiguous.

### React Components

Route pages should orchestrate data flow. They may read route params, select store state, call calculation functions, save outputs, and compose input/output components.

Module components should own module-specific UI only. Avoid embedding new formula logic directly in input forms, output views, metric cards, or chart components.

Shared reusable UI belongs in `src/components/`. Smaller UI primitives can live in `src/components/ui/`.

### Copy And Compliance

Use illustrative language. Avoid wording that implies the app is issuing a formal recommendation. For example, Liability output may use "Needed Umbrella" for the remaining coverage gap rounded to a $1M block, but must not use "Recommended Umbrella."

When wording affects compliance posture, place it in shared advisor-safe copy or module constants rather than writing one-off text inside a component.

### Imports And Formatting

Use the `@/` alias for source imports where it improves clarity. Keep local relative imports for tightly coupled files inside the same feature folder when that is clearer.

Prettier is configured in `.prettierrc` with the Tailwind plugin. Use existing file style when editing nearby code.

## Package Management

The repo uses `package-lock.json`, so use npm commands for installs and verification. Do not mix package managers unless the project is intentionally migrated.
