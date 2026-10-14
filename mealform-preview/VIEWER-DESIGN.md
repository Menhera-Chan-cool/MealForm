---
name: MealForm weekly viewer preview
description: Viewer surface addendum to the incumbent MealForm preview system.
---

# Design System: MealForm weekly viewer surface

## Overview

This addendum records the finished weekly viewer in Operate mode. It extends the incumbent `DESIGN.md` and `.impeccable/design.json`; it does not replace their identity or token system. The viewer prioritizes the selected week, immediate filters, day totals and complete response details. Its horizontal desktop navigation and mobile cards are surface-specific, rather than changes to the administration shell.

Ground truth: `src/ViewerPreview.tsx`, `src/viewer-preview.css`, `src/ViewerPreview.stories.tsx`, shared `src/styles.css`, `../meal-viewer/design/tokens.json`, and the original viewer model/ComboSelect imported by the preview. The approved scope is editable Figma and an isolated local preview, with synthetic records and explicit simulation of service actions.

The editable [viewer Figma file](https://www.figma.com/design/W0eib9OIk99Ia0fweyf09e?node-id=12-2345) has 22 native frames. The saved final readback records 563 component instances, 40 variables in four single-mode collections, Noto Sans only and no image-filled UI nodes. These are saved artifact observations, not a claim of pixel agreement. The administration file `9gbz6BuArX7kyBTlbKMzuR` remains separate.

## Colors

The existing Settings-derived sample accent, primary hover and semantic light/dark roles are retained. `../meal-viewer/design/tokens.json` remains the compiler source; the incumbent DESIGN frontmatter records their values. Light and dark neutrals are explicit independent sets, not automatically generated shades of the accent. Preview does not fetch live Settings.

Primary marks the active week destination, important actions and section icons. Neutral card/muted surfaces carry filters, counts, Form status and table rows. Dropdown chevrons inherit foreground color, including in dark mode.

**The Semantic Theme Rule.** Use the existing semantic color roles for every theme; this viewer adds no brand palette.

## Typography

Noto Sans is self-hosted at the incumbent 400, 600 and 700 weights. Viewer body text is 16px with 1.5 line height. Page headings are 28px/1.3, weight 700 with −0.02em tracking; at 700px and below they become 26px/1.3. This is an intentional responsive specialization of the existing headline role, not a new shared token.

Section headings use 20px/1.4 at weight 700; day and response headings use 16px/1.5 at weight 600. Filter labels, sort labels, supporting copy, counts and the desktop table use 14px; table cells use 1.6 line height. Dates use tabular numerals. The large-text preference raises viewer body, combo, response headings and table text to 18px, with count badges at 16px. Labels remain sentence case and long meal text wraps.

## Layout

The viewer has a centered content container capped at 1440px, with 24px top, 32px side and 48px bottom padding. It has no administration sidebar or fixed bottom navigation. The heading and appearance control precede three week destinations. Name, day and meal filters align horizontally; secondary fields share two equal columns. Toolbar actions wrap as needed. Summary cards use three columns, then two at 1000px and below.

At 700px and below, padding becomes 16px top/sides and 32px bottom. Name search stays visible beside a 100px secondary-filter toggle. Day and meal filters expand inline beneath it and filter immediately, without an Apply step. Active chips wrap below the fields. Summary cards become a single column; response cards replace the desktop table and retain every rendered field with its label. Archive controls/cards stack, and long text wraps within the screen.

The desktop details table aligns header and value columns, retaining horizontal scrolling inside its bordered wrapper when needed. Its first two columns have observed minimum widths of 120px and 140px; the returned model determines their labels. The sort control is 200px desktop and 140px mobile; large-text mobile places it on its own line. Viewer spacing reuses the incumbent rhythm with observed component padding/gaps of 10px, 12px, 20px and 28px where appropriate.

## Elevation & Depth

Cards and buttons remain flat. Borders and canvas/card/muted tones separate regions; alternate table rows use the muted surface. The appearance DropdownMenu and quick-command Sheet retain the existing temporary-layer behavior and shared styles. The combo list sits above content with a border, card surface, maximum height of 280px and internal scrolling.

OS reduced-motion styling remains inherited. The viewer's Light and Off motion preferences both remove CSS animations and transitions. Neither this source observation nor static screenshots certify animation trajectories.

## Shapes

Controls, combo options and chips use the existing control radius (8px); cards and the table wrapper use the existing card radius (14px). Interactive controls retain at least 44px targets. Count and Form-status badges are noninteractive, with observed 32px minimum heights; they do not inherit an interactive target requirement. Icons use SVG components, including the archive back action and theme-aware chevrons.

## Components

- **Week navigation:** filled primary for the selected current/next/archive destination and outline for the others, with `aria-current`. Local hash navigation in this preview is illustrative; production routes and guards remain requirements for a later implementation.
- **Filters:** original FilterControls/ComboSelect behavior, visible labels, searchable name/day/meal fields, selected chips and a shared clear action. ArrowDown reaches options; Escape closes the list and the preview suppresses native search-field clearing. Accent-folded name search affects display only.
- **Summary and details:** an accessible summary disclosure precedes complete detail rows. The original pure model supplies filtering and newest/oldest/name sorting; summary counts use its filtered source rows, and actual serving-day labels come from the model. Mobile response cards use the returned headers and values rather than a shortened record.
- **Toolbar and Form state:** Today, reload, advanced source, clear filters, status and registration remain reachable. Today uses the fixed demonstration date and clears name/meal filters before choosing the matching day. Registration/status combinations are illustrative, not a live Form availability check.
- **Archive:** month filtering follows each sample week's start month, including a week crossing into the next month. Selecting a week opens its local detail view; the SVG back action returns to the archive.
- **Advanced source and states:** URL/ID validation uses the existing parser, followed by an explicit simulated notice. Guest/login, loading/stop-wait, error, empty-next-week, update notice and next registration have distinct sample states. Login, reload, registration and source access do not call real services.
- **Preferences and commands:** the header menu exposes normal/large text, light/dark/system appearance and full/light/off motion. Ctrl/⌘ K opens the existing Sheet primitive for local page commands, with focus/close behavior supplied by the shared components.

## Do's and Don'ts

**The Immediate Filter Rule.** Preserve immediate filtering, existing sort choices and complete response fields at both widths.

**The Preview Boundary Rule.** Keep synthetic data and service simulations explicit; a design review does not validate authentication, permissions or backend mutations.

- Do use incumbent tokens, Vietnamese labels, Noto Sans, visible focus and 44px interactive targets.
- Do preserve the real viewer's routes and conditions in a later implementation, including archive login, source read-only semantics, conditional next registration and valid Form links even when a closed badge is shown.
- Don't edit generated CSS, add another token compiler source, introduce a new visual metaphor, or turn viewer layout choices into global administration rules.
- Don't claim automatic two-way Figma/token sync, an imported official shadcn kit, a Chromatic cloud baseline or pixel-perfect Figma parity. Figma components use local shadcn vocabulary; Tokens Studio Free JSON and native variables were prepared separately.

Historical context: root `PRODUCT.md` and the incumbent `DESIGN.md`/sidecar describe the earlier administration work and Starter quota limitation. Native viewer readback and captures are now available for this separate file, but do not certify the earlier admin file. Those files are preserved; their historical scope/quota language is reported here rather than repaired as a side effect. Details below the supplied screenshots were reviewed in source only, and the finish verdict applies to the supplied design/preview evidence, not production readiness.
