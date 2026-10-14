---
name: MealForm production frontend
description: The approved week-oriented MealForm interface, bound to live school branding.
colors:
  primary: "var(--meal-ui-primary)"
  primary-foreground: "var(--meal-ui-primary-foreground)"
  primary-hover: "var(--meal-ui-hover)"
  background: "var(--meal-ui-background)"
  card: "var(--meal-ui-card)"
  muted: "var(--meal-ui-muted)"
  field: "var(--meal-ui-field)"
  foreground: "var(--meal-ui-foreground)"
  muted-foreground: "var(--meal-ui-muted-foreground)"
  border: "var(--meal-ui-border)"
typography:
  headline:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
  record:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  control: "8px"
  card: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  badge:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "4px 10px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.card}"
    padding: "24px"
  navigation-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
---

# Design System: MealForm production frontend

## Overview

**Creative North Star: "MealForm"**

This is the production-source continuation of the approved MealForm administration and weekly viewer previews in Operate mode. The inherited world uses clear week hierarchy, grouped tools, flat surfaces and Vietnamese labels to help school staff work through menus and registrations. No new visual metaphor or imagery system is introduced.

The system describes the implemented frontend, not a deployment certificate. Source evidence is `src/production-ui.css`, the three `src/components/ui` primitives, `DashboardLayout.jsx`, `ViewerSummary.jsx`, `WeekNavigation.jsx`, `App.jsx`, `Dashboard.jsx`, and the branding, appearance and comfort providers. The current migration authority is `../SPEC-production-ui.md`; preview-only passages in root `PRODUCT.md` describe the earlier design phase.

**Key Characteristics:**

- Actual current, next and archived weeks remain distinct.
- Runtime school branding supplies semantic light/dark colors.
- Self-hosted Vietnamese typography, visible focus and touch-sized primary controls.
- Complete response fields and the original permission and confirmation flows.

## Colors

### Primary

The school accent, its contrast-selected foreground and deeper hover partner are runtime roles in the frontmatter. `BrandingProvider` loads the existing branding endpoint, normalizes Settings and exports `--meal-ui-*` through `uiThemeVariables` and the existing `brandingTheme`. The fallback accent remains `DEFAULT_BRANDING.primaryColor` in `branding.mjs`. The sampled teal in the shared token JSON is a preview fixture, not the production default.

### Neutral

Canvas, card, muted surface, field, text, supporting text and border are semantic runtime roles. Light mode combines existing brand-derived ink/surface/border with the bridge's neutral canvas, card, field and supporting-text fallbacks. Dark mode derives its surfaces and text from the active accent using the existing branding function. Do not replace either scheme with the static sampled preview palette. Primary foreground can be black or white according to the existing luminance calculation.

Legacy semantic success, warning, error, closed and unknown statuses remain supplied by the existing application styles. Their meaning is independent of the selected navigation accent; this document does not redefine that status palette.

**The Runtime Branding Rule.** Bind interface colors to the existing semantic runtime variables, including default-brand light mode and portaled surfaces.

The only compiler input is `design/tokens.json`; `scripts/build-tokens.mjs` owns generated CSS, and the preview wrapper reuses that compiler. Frontmatter records bindings and the observed shared scale; it is documentation, not a second compiler input. Runtime bindings deliberately remain CSS values rather than a frozen school palette.

## Typography

Noto Sans is self-hosted for Vietnamese and Latin at weights 400, 600 and 700. The frontmatter records the reused heading, section, record, body and label roles. At normal root size these are 28, 20, 16 and 14px; page headings become 1.625rem at the mobile breakpoint. Week-card date headings use 1.125rem and tabular numerals. Table cells use 0.875rem with 1.6 line height, and supporting text generally uses regular weight.

The original comfort provider owns normal/large text persistence. Large text changes the root scale to 18px, or 21px on mobile; component rem values follow the existing cascade. Keep long school names, email addresses, dates and meal values wrapping. Do not copy preview-only font-size preferences into a second state store.

## Layout

The Dashboard uses a sticky scrollable sidebar (232px), a flexible main column and an outer cap of 1680px. Its main area has a 1440px cap and 32px padding. The nine existing section identifiers and role checks remain authoritative. The sidebar groups meal tasks and administration; account context sits below.

Current/next cards and week lists use two columns, becoming one at 1100px and below. This intermediate-width behavior preserves readable cards beside the sidebar. Viewer summaries use three columns, two at the same breakpoint and one on mobile. The viewer itself is centered with a 1440px cap and 32px padding, without a Dashboard sidebar.

At 700px and below the Dashboard sidebar becomes fixed bottom navigation for overview, creation when permitted, responses, and More. More exposes the remaining authorized tools and account commands in a native popover. Dashboard padding becomes 20px top, 16px sides and 100px plus safe-area inset below; viewer padding becomes 20px top, 16px sides and 32px bottom.

Desktop viewer filters place name search beside two equal day/meal fields. Mobile keeps name search beside a 100px secondary-filter toggle and expands those fields inline. Filtering remains immediate. The desktop detail table retains real headers and native sorting; mobile presents every rendered header/value as a labeled block. Summary and detail order stays unchanged. Recovery actions stack full width for mobile large text.

Shared spacing is recorded in frontmatter; observed local gaps and padding also use 10, 12, 20 and 28px. Keep scrolling inside the intended table/menu region and avoid document overflow.

## Elevation & Depth

Content cards, controls and combo lists are flat. Single-pixel borders, canvas/card/muted tones, spacing and type establish separation. The appearance popover retains its existing soft shadow (`0 12px 36px #0003`) and 12px corners; the native quick-command dialog retains its 16px corners and modal backdrop. These temporary layers do not establish an elevated content-card style.

Controls use short color transitions (0.16s). The existing appearance provider still owns full/light/off motion and OS preferences; Off disables animations and transitions, while Light reduces selected transitions and suppresses selected animations. Static captures do not certify animation trajectories.

**The Flat Content Rule.** Use tonal surfaces and borders for ordinary content; reserve temporary-layer depth for the existing popovers and dialogs.

## Shapes

Controls and muted status badges use the control radius; cards, mobile response blocks, archive entries and the table wrapper use the card radius. Primary action controls and fields have at least 44px height. Noninteractive count/status badges have an observed minimum height of 32px and do not inherit the interactive target requirement. Icons remain SVG; optional school logos follow the existing validated branding path.

## Components

- **Buttons:** source primitives adapted from the approved shadcn source use namespaced utilities without global Preflight. Primary actions use accent/contrast text; outline and secondary controls use neutral surfaces and borders. Navigation and link rows provide the used ghost treatment. Disabled actions reduce opacity and preserve the existing busy/permission conditions. Focus-visible uses a 2px outline with 3px offset in the production interface. State styling remains the actual source cascade, not a new generic hover animation.
- **Cards:** flat bordered containers with the frontmatter radius and desktop padding; mobile containers use 16px padding. Day summary cards also use 16px padding and 12px gaps. Week status, real date/title, count, actions and link row preserve their hierarchy.
- **Fields and filters:** visible Vietnamese labels, field surfaces, borders, primary caret and 44px minimum heights. Existing ComboSelect keeps keyboard interaction, searchable options, selected chips and clear behavior. Options remain theme-aware, including their SVG chevrons.
- **Badges and statuses:** neutral count/status badges supplement text rather than becoming actions. Existing status-specific Form, error and warning controls retain their semantic styles and labels.
- **Navigation:** preserve `/dashboard`, `/newest`, `/next`, `/history`, archived selection `/history?week=…` and separate read-only Spreadsheet sources at `/?view=…`. `/old` is a compatibility redirect and has no new UI button. Selected navigation uses the primary fill and `aria-current`; tool visibility follows original permissions. `/setup` remains an existing account destination.
- **Summary and details:** actual day labels and filtered source rows supply meal counts; all model-supplied response fields remain present. Existing summary disclosure, response sorting, source read-only semantics and fresh response identity checks remain owned by the original controllers.
- **Preferences and temporary layers:** existing appearance/text/motion state is portaled into the new headers. Ctrl/Command K still opens the native quick-command dialog. More, account actions, confirmations, drafts, OCR review, deletion reason and verified-cache warnings retain their original callbacks and guards.

## Do's and Don'ts

### Do:

- Do keep runtime branding, Vietnamese labels, visible focus and touch-sized primary controls.
- Do preserve week identity, complete response fields and existing role, confirmation and verified-read guards.
- Do update the canonical token JSON and compile generated CSS through the shared compiler.
- Do verify both surfaces at desktop, intermediate and mobile widths, including large text and dark mode.

### Don't:

- Don't promote sampled preview colors into production defaults or introduce a new visual world.
- Don't duplicate preference state, shorten response fields or bypass existing callbacks and permission gates.
- Don't claim an imported official Figma kit, automatic two-way token sync, pixel-perfect Figma parity or a cloud Chromatic baseline.
- Don't treat local visual approval as user staging approval or evidence that production has been merged or promoted.
