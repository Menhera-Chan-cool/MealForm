# Spec: quick-view-navigation
## Objective
Previous/next inside the existing readonly quick dialog visits exactly the currently loaded, filtered and sorted response list. Position says it is the loaded subset, not a global page count.
## Structure and style
Dashboard supplies neighbors by responseId from visibleResponses; ResponseQuickView adds two explicit buttons and a polite position label. Keep the same native dialog and close-focus restoration. No global key bindings or new fetches. If the selected ID disappears, retain the original unverified snapshot but disable list navigation rather than guessing a replacement.
## Commands and tests
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`. RED/GREEN duplicate names, order/query, loaded subset/bounds, fresh data/disappeared record, mobile and no writes.
## Boundaries and success
Always show real serving-day labels and verification status; keep mutation actions outside this dialog. Ask before auto-loading pages. Never identify a response by name or add deletion/restore shortcuts.
