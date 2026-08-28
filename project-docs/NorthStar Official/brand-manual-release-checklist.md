# Brand Manual release QA checklist

Use this checklist for the 2020 Brand Manual compliance release and future brand-sensitive UI changes.

## Identity and logo

- [x] North Star Resource Group is the application identity used in browser/install metadata.
- [x] Application header uses the official Resource Group logo lockup.
- [x] Dark-background header uses the approved dark-background logo treatment.
- [x] Logo aspect ratio is preserved (`width: auto`; no independent width/height distortion).
- [x] Header layout provides clear space around the logo and does not crowd it with adjacent text.

## Color

- [x] Sirius `#188A89` is the primary interaction/accent color.
- [x] Sirius lite `#1DB8B9` is used for secondary/high-contrast Sirius states.
- [x] Nebula `#148F45` / Nebula lite `#44B649` represent positive states.
- [x] Pegasi `#1B75BC` / Pegasi lite `#27AAE1` represent informational/comparison states.
- [x] Polaris `#F15A29` / Polaris lite `#FBB040` represent gap/warning/destructive emphasis.
- [x] Header `#4F4F54` and Subheader `#A7A9AC` are the authoritative neutral brand colors.
- [x] Legacy application navy is removed from primary shell, presentation rail, and print branding.
- [x] Shared semantic Tailwind color families resolve through the official palette.

## Typography

- [x] Raleway is the primary application font.
- [x] Montserrat is the approved substitution fallback.
- [x] Disclosure blocks use the prescribed condensed disclosure stack.
- [x] Proprietary Myriad Pro font files are not redistributed by the application.
- [x] Print/PDF typography uses the same hierarchy.

## Core UI

- [x] Shared buttons use official brand tokens.
- [x] Shared cards use neutral brand surfaces.
- [x] Both input implementations use brand-neutral surfaces and Sirius focus states.
- [x] Select controls and option menus use the same brand system.
- [x] Theme controls use the same interaction system.
- [x] Light mode selected states retain readable contrast.
- [x] Dark mode uses the manual's Header gray with differentiated tonal surfaces and approved brand accents.

## Presentation and print

- [x] Presentation mode uses the same brand tokens as builder mode.
- [x] Presentation input rail uses the manual's Header gray in dark mode rather than legacy navy.
- [x] Print/PDF headings, rules, status colors, and disclosure typography are brand-normalized.
- [x] Financial values/formulas are not modified by print or branding changes.

## Browser metadata

- [x] Theme/background metadata uses the official neutral brand field.
- [x] No PWA manifest, install prompt, service-worker generation, or offline-app integration is present.
- [x] Existing application icon assets are retained; this revision does not invent a new corporate mark.

## Imagery

- [x] No marketing imagery is introduced by this revision.
- [x] Brand Manual imagery pages are documented as not applicable to the current Gap Tool UI.
- [ ] If marketing imagery is added in the future, review it against the Business, Occupation, and Lifestyle guidance before release.

## Business logic protection

- [x] No Life Insurance formula changes.
- [x] No Disability Insurance formula changes.
- [x] No Unemployment formula changes.
- [x] No Liability formula changes.
- [x] No persistence, scenario normalization, or client-profile exchange changes.
- [x] No advisor assumption changes.

## Validation expectations

The repository-level implementation audit confirms that the branch is limited to presentation, shared UI primitives, brand assets/metadata, and brand documentation. A production build and rendered-browser QA should be run in the normal developer/CI environment before deployment; the GitHub connector used to prepare this PR does not execute the local Vite/TypeScript toolchain.
