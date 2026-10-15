# Spec: wait-elapsed
## Objective
Show elapsed client wait next to existing loading states for data reads and long dashboard operations. No fake percentage, ETA or claim that stopping a read cancels the backend.
## Commands
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`.
## Structure and style
Shared ElapsedWait presenter using monotonic time and cleaned-up timers, keyed by the current operation/week/query. Keep read generations, aborts, cached data and mutation handlers unchanged.
## Testing
RED/GREEN controlled pending request plus clock advance, reset on new context, stop/finish/unmount, no ticking live-region spam and retained cached content.
## Boundaries
Always label the visible client phase. Ask before backend instrumentation. Never add retries, writes or cancellation of create/delete/save to implement the timer.
## Success
The displayed seconds follow actual elapsed time while active, reset for a new phase and disappear when the client stops waiting.
