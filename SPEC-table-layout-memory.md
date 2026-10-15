# Spec: table-layout-memory
## Objective
Remember optional columns and committed PC widths in the browser across reopen/reload. Share presentation-only preferences on this device/browser, not across devices or as account data. Required columns always remain; mobile always shows full cards.
## Structure and style
Shared TableWorkspace plus a small pure storage helper. Explicit keys for viewer/submission/history; schema fingerprint strips calendar date text but includes remaining column structure/required indexes, so changed holiday/projection schemas do not apply widths to different columns. Store only version/count/numeric hidden indexes/widths, never headers, names, responses or credentials. Bound schemas per table to eight; validate untrusted localStorage and degrade to transient controls when denied/corrupt.
## Commands and tests
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`. RED/GREEN pointer commit vs cancel, keyboard, reload, required-column tampering, schema/three-table isolation, full reset, denied storage and full mobile data.
## Boundaries and success
Always preserve original column visibility/drag/expansion behavior. Persist only explicit user commits, not intermediate drag frames. Existing size reset clears widths only; ColumnChooser gets a full layout reset. Ask before server sync. Never persist record content, hidden mandatory columns or infer authorization from stored preferences.
