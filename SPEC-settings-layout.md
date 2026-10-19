# Settings layout

## Objective / success
Branding and system groups use explanatory heading/description left and controls right at wide widths, explanation above controls when narrow. Inputs stay in one vertical reading axis, with only related controls paired. Gmail members remain staged edits with one-column fields and separate actions. Contents links on branding/system jump/focus correct visible section without navigating away, changing drafts or triggering writes; narrow view uses “Đến mục” disclosure. No hidden mandatory fields.
## Commands / structure / style
Reuse commands and boundaries in SPEC-layout-foundations.md. Dashboard.jsx, DeviceData, branding form, shared lightweight section/contents JSX and task-layout CSS. Keep field IDs, labels, handlers and save form intact; e.g. <section id="brand-logo" tabIndex={-1}>. Contents use native anchors and no route/hash mutation.
## Verification
Real-entrypoint tests: wide side-by-side / narrow above, field reading order, contents keyboard focus and dirty input surviving jumps; permission toggle is still only a draft until Save. Existing validation, leave-confirmation, restore-field and failed-save suites retained.
