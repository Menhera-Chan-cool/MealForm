---
name: MealForm UI preview
description: Isolated Vietnamese administration preview organized around the active week.
colors:
  primary: "#357185"
  primary-hover: "#2d6071"
  white: "#ffffff"
  light-background: "#f5f8f9"
  light-card: "#ffffff"
  light-muted: "#eff4f6"
  light-foreground: "#172d35"
  light-muted-foreground: "#526a74"
  light-border: "#bacbd1"
  dark-background: "#0d1517"
  dark-card: "#1b2427"
  dark-muted: "#233035"
  dark-foreground: "#e1eaed"
  dark-muted-foreground: "#bbc6c9"
  dark-border: "#788e97"
typography:
  headline:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.4
  record-title:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.55
  body:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
  button:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "20px"
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
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-outline-light:
    backgroundColor: "{colors.light-background}"
    textColor: "{colors.light-foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-ghost:
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  input-light:
    backgroundColor: "{colors.light-card}"
    textColor: "{colors.light-foreground}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  status-light:
    backgroundColor: "{colors.light-muted}"
    textColor: "{colors.light-foreground}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
  week-card-light:
    backgroundColor: "{colors.light-card}"
    textColor: "{colors.light-foreground}"
    rounded: "{rounded.card}"
    padding: "24px"
  navigation-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
---

# Design System: MealForm UI preview

## Overview

This records the approved preview's week-oriented administration structure: a grouped desktop sidebar, four mobile destinations, and a prominent active-week card followed by next-week and archive content. Vietnamese labels and visible task/status separation support school meal administrators.

This is an extracted snapshot of `mealform-preview`, not authority to redesign or deploy production. `../meal-viewer/design/tokens.json` remains the compiler source; `src/generated/variables.css` and `tailwind.css` are generated output. Refresh this document and its sidecar when the implemented preview system changes. The parent `PRODUCT.md`, approved surface brief and local `SPEC.md` define scope, not extra tokens.

**Key Characteristics:**

- Active-week hierarchy and grouped navigation.
- One Settings-derived accent with separate light/dark neutrals.
- Vietnamese Noto Sans typography and touch targets of at least 44px.
- Flat content surfaces with labeled illustrative actions and data.

## Colors

### Primary

Muted teal is the Settings sample recorded as `primary`; its deeper hover partner is `primary-hover`. Primary buttons, selected navigation, icons, text selection and focus treatments use the accent. Preview does not fetch live Settings.

### Neutral

The light roles provide a pale canvas, white cards, a tinted muted surface, dark foreground, secondary text and visible borders. The dark roles provide a dark canvas, lighter card and muted surfaces, pale text, secondary text and lighter borders. `white` is shared primary foreground. Secondary/accent component roles map to the neutral muted surface; they are not separate brand palettes.

Theme classes remap semantic roles through the generated CSS bridge. Change the source brand tokens to explore another accent; neutral themes remain separate source sets.

## Typography

Noto Sans is self-hosted for Vietnamese and Latin text at weights 400, 600 and 700. It is a preview-only substitution for the production system/Segoe UI stack.

The frontmatter captures page headlines, section titles, record titles, body/secondary copy and buttons. Page headlines become 26px on mobile. Week dates use bold tabular numerals at 24px desktop and 20px mobile; timestamps and archived dates also use tabular numerals. Mobile navigation and small preview/account copy use 12px. These narrower roles are implementation details, not additional font families.

## Layout

Desktop uses a sticky, scrollable sidebar (232px) and a flexible content column. The main area caps at 1208px with 24px top and 32px side/bottom padding. The sidebar groups the nine tools into “Thực đơn” and “Quản trị”, with the owner account below.

At 760px and below, the sidebar gives way to fixed four-column navigation: “Tổng quan”, “Tạo tuần”, “Lượt gửi”, “Thêm”. Main padding becomes 20px with 104px reserved below; the bottom bar adds the safe-area inset. Mobile tabs have a 56px minimum height. “Thêm” contains the remaining tools and owner commands, including “Mở trang xem”. It is an in-page destination in the implemented preview; the quick record view uses a separate Sheet.

At 761–1050px, header actions wrap. Week actions stack full-width on mobile; filters become one column, record timestamps move below names, and long meal text can wrap. Shared spacing uses the frontmatter scale; recurring component-specific gaps/padding also use 10px, 12px and 20px as observed.

## Elevation & Depth

Content cards and buttons have no shadow. Canvas/card/muted tones and single-pixel borders separate content; current-week priority comes from composition and type. The appearance dropdown retains the library's medium shadow; the quick-view Sheet retains its large shadow and a 50% black overlay. These temporary layers do not establish a shadow treatment for content cards.

Reduced-motion preference removes animation and transitions. Buttons retain the library transition; Sheet source declares ease-in-out with opening/closing durations of 500/300ms. Animation utility declarations are not evidence of a verified animated trajectory.

## Shapes

Controls use the control radius; content cards use the card radius. Status badges override the library pill to the control radius, while the account badge retains its small pill outline. Archive/tool rows use separators rather than card framing; More tool rows have square corners. The upload icon is circular within a rounded card-shaped drop area.

## Components

- **Buttons:** primary, outline and ghost are the used action variants. Standard padding is in frontmatter; icon-bearing standard buttons use 12px horizontal padding. All buttons have at least 44px height and width. Hover uses the deeper primary or muted surface; dark outline uses the library's translucent input-border treatment. Disabled actions reduce opacity and block pointer interaction. Keyboard focus includes the visible accent outline and library ring.
- **Cards and week hierarchy:** bordered flat surfaces; the week card uses 24px padding on desktop and 20px on mobile. Status precedes the large date range, metadata, primary/outline actions and a separated link row. Record cards retain 16px internal gaps.
- **Fields:** visible Vietnamese labels, card backgrounds, borders and control radius; 44px minimum height, body-size entry text, secondary placeholders and accent focus outline. The sidecar documents the implemented native input, not an uninstalled Input component.
- **Badges:** closed-week status uses the muted surface and body foreground; owner identity uses a neutral outline. These are status/identity text, not navigation or action controls.
- **Navigation:** desktop tool buttons use icons with text, neutral default/hover states and a filled accent active state. Mobile uses the same active treatment with stacked icon/label. `aria-current` identifies the selected destination.
- **Temporary layers:** appearance remains reachable in the header on both widths. Quick view is a read-only, scrollable right Sheet capped at 460px, with a Vietnamese close label and 44px close target.
- **Preview actions:** navigation, synthetic filtering/sorting and quick view work locally. Commands display an illustrative notice; upload only selects a filename. The OCR action remains visibly disabled.

## Do's and Don'ts

### Do:

- Do preserve the active-week hierarchy and access to all nine tools and owner commands.
- Do use source token roles for light/dark surfaces and the Settings-derived sample accent.
- Do retain Vietnamese labels, visible keyboard focus and at least 44px interactive targets.
- Do label synthetic records and actions as illustrative.

### Don't:

- Don't turn this preview snapshot into production implementation or deployment approval.
- Don't add a fixed green brand, invented KPI claims or live student/account data.
- Don't hand-edit generated token CSS or introduce a second compiler source in this document.
- Don't claim pixel agreement with Figma: fresh high-fidelity context was unavailable after the Starter quota was exhausted.
