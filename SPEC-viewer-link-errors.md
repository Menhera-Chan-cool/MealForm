# Spec: viewer-link-errors
## Objective
Explain unknown page, invalid link, explicitly missing/archived-only week, denied access and connectivity distinctly, with appropriate safe return/retry actions. Do not reveal private week existence or replace cached results on refresh failure.
## Commands
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`.
## Structure and style
Pure route/error presentation helpers, ViewerLinkProblem and App callers. Mirror existing API syntax (sheet 1–100, week 1–120 alnum/underscore/hyphen); do not invent stricter Google ID validation. Preserve signed/authenticated readers and existing archive context.
## Testing
RED/GREEN malformed/empty links, unknown path, 400/401/403/404, explicit missing-week 502 vs generic 502/network, next-week empty, retry and retained data.
## Boundaries
Always use actual server evidence for existence/access. Ask before routing/API changes. Never bypass login, print raw credentials/response payloads, fake 0 data or report every network failure as a deleted week.
## Success
Broken links are understandable, valid empty weeks stay friendly, transient refresh errors keep the last view and no new authorization behavior is introduced. SPA HTTP rewrite status is unchanged.
