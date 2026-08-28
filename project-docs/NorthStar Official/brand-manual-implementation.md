# North Star Resource Group 2020 Brand Manual implementation

This document records how the Gap Tool applies the official **North Star Resource Group 2020 Brand Manual**. The manual remains the authority; this file is an implementation checklist for the application.

## Scope

The Gap Tool applies the manual to application identity, color, typography, logo usage, interaction styling, presentation mode, and printed/PDF output.

The manual's marketing imagery guidance is not implemented because the Gap Tool does not contain hero, recruiting, seminar, occupation, lifestyle, or other marketing photography. If marketing imagery is added later, it must be reviewed against the manual before release.

## Official color system

The application design tokens and reusable UI primitives use the manual's named colors:

| Brand color | HEX | Application role |
| --- | --- | --- |
| Sirius | `#188A89` | Primary interaction/accent color |
| Sirius lite | `#1DB8B9` | Secondary/high-contrast interaction accent |
| Nebula | `#148F45` | Positive/success state |
| Nebula lite | `#44B649` | Positive secondary/highlight |
| Pegasi | `#1B75BC` | Informational/comparison state |
| Pegasi lite | `#27AAE1` | Informational secondary/highlight |
| Polaris | `#F15A29` | Warning/gap/destructive emphasis |
| Polaris lite | `#FBB040` | Warning secondary/highlight |
| Header | `#4F4F54` | Primary neutral text in light mode and print |
| Subheader | `#A7A9AC` | Secondary neutral/subheader treatment |

Existing generic Tailwind semantic families are normalized through the central brand stylesheet so that shared components, charts, outputs, and presentation views resolve to the official palette without changing financial calculations or duplicating business logic.

## Typography

- Primary application typeface: **Raleway**.
- Manual-approved substitution: **Montserrat**.
- Disclosure treatment: **Myriad Pro Condensed** when available, with condensed/sans-serif fallbacks where the proprietary font is not installed.
- The repository does not redistribute proprietary font files.
- Screen sizes remain responsive to the application context; the manual explicitly notes that point sizes may vary with document size.
- Print/PDF output follows the manual's Raleway/Montserrat hierarchy and disclosure treatment.

## Logo usage

- The application uses the **North Star Resource Group default logo identity**.
- The header asset is derived from the official logo artwork contained in the supplied Brand Manual rather than an independently recreated wordmark.
- The dark-header treatment uses the manual's dark-background logo convention: colored mark with white wordmark.
- Logo dimensions use `width: auto` so the original aspect ratio is preserved.
- The header provides surrounding whitespace at least equivalent to the mark width in normal desktop presentation and does not place text immediately beside the wordmark.
- The logo is never intentionally stretched, squashed, recolored, rotated, or separated into an improvised lockup.

## Light and dark backgrounds

The manual expressly provides logo treatments for color, dark, and light backgrounds. The Gap Tool therefore retains both light and dark application modes while constraining them to the manual's palette:

- Light mode uses white/light-neutral surfaces, Header gray typography, and Sirius interactions.
- Dark mode uses the manual's middle dark logo-background color, Header gray (`#4F4F54`), for its shell. Darker gray derivatives distinguish panels and raised controls, while white and soft-white text preserve readable contrast.
- The fixed application header uses the exact Header-gray field with the manual's approved dark-background logo treatment.

## Shared UI primitives

The following shared controls are brand-normalized so downstream screens inherit the same treatment:

- Primary/secondary/ghost/destructive buttons
- Cards and surfaced panels
- Text, search, password, and affixed inputs
- Select/combobox controls and option menus
- Focus rings and keyboard focus states
- Theme controls
- Drawers and modal surfaces through global surface rules
- Module cards and presentation surfaces through shared brand selectors

## Presentation and print/PDF

Presentation mode and print output are treated as first-class brand surfaces:

- Presentation input rails use the Header-gray field in dark mode and approved white/Sirius contrast.
- Printed headings use Header gray and Sirius rules/accents.
- Positive, informational, gap, and warning colors map to Nebula, Pegasi, Polaris, and Polaris lite.
- Disclosure blocks use the manual disclosure type treatment.
- Print output no longer uses the former off-brand navy/teal palette.

## Browser metadata

Browser metadata uses the approved neutral field and North Star naming:

- Browser and installed-app theme color: manual Header gray (`#4F4F54`).
- The application does not publish a web-app manifest, installation prompt, service worker, offline cache, or PWA update workflow.

## Financial and workflow integrity

This brand revision is presentation-only. It does **not** change:

- Life Insurance calculations
- Disability Insurance calculations
- Unemployment calculations
- Liability calculations
- Scenario persistence or normalization
- Advisor assumptions
- Formula registry behavior
- Chart values or metric derivation
- Client profile exchange behavior

Existing financial outputs remain authoritative; only their visual treatment is normalized.

## Release review checklist

Before merging a future UI change, verify:

1. New colors come from the official palette or are transparent/tinted derivatives of those colors.
2. New typography uses Raleway, Montserrat fallback, or the disclosure stack as appropriate.
3. Any North Star logo preserves its official lockup, aspect ratio, background treatment, and clear zone.
4. No new navy/purple/unapproved brand accent is introduced for decorative UI state.
5. Light and dark states maintain readable contrast without recoloring the logo incorrectly.
6. Presentation and print versions remain visually aligned with the same design tokens.
7. Marketing imagery, if ever introduced, is separately reviewed against pages 9-11 of the Brand Manual.
8. Styling changes do not alter underlying financial calculations or scenario data.
