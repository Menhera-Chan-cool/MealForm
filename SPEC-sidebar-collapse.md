# Spec: sidebar-collapse
## Objective
PC Dashboard sidebar can become an icon rail, yielding real width to the main workspace; labels remain accessible and shown on focus/hover. Mobile navigation is unchanged.
## Commands
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`.
## Structure
DashboardLayout.jsx, shared UI CSS and existing browser suite.
## Style
Retain the existing section ids and house Button. Use PanelLeftOpen/Close and a native top-layer hint, never clipped absolute tooltips.
## Testing
RED/GREEN actual main width change, permitted navigation, keyboard labels, current section, dirty-cancel, expansion and mobile bounds.
## Boundaries
Always retain account context and sign-out access. Ask before changing routes/roles. Never bypass existing navigation/unsaved-work callbacks.
## Success
One toggle collapses/expands on PC; all original authorized tools remain reachable. State is local to this page visit, not a new preference store.
