# access-draft

## Objective / acceptance
Stage each Gmail permission change locally; show exact additions/removals. Only explicit per-member Save calls the existing set-permissions action, with existing owner/server guards. Cancel restores saved values. Failure retains draft; navigation/signout warns. No draft permission persistence. Unknown/malformed permissions stay invalid, never silently escalate.

## Commands
`npm test` in meal-viewer; `npm exec -- playwright test --config .playwright-cli/reading-polish.config.ts --grep dashboard-nine` in mealform-preview; final full UI regression with CI=1 and one worker; preview `npm run build` and `npm run build-storybook`.

## Structure and style
React 19/Vite; reuse meal-viewer/src presenters, native controls and Node assert tests. Example: `setAuditFilters(current=>({...current,[key]:value}));`. No new package or generic state framework.

## Tests
Pure boundary tests before helper changes and actual production-entrypoint browser tests before component changes. Test failures, race cancellation, scoped storage, partial datasets and 390px/PC light-dark/forced-colors layout as applicable. Synthetic services only.

## Boundaries
Always preserve authorization, exact identities, cached-readonly eligibility, IME input and dirty confirmations. Ask before backend/security contract expansion. Never real Gmail permission mutation, real Form/Sheet edits, hidden credentials, broad storage clearing or fake success/percentages.

## Delivery
Sync scoped canonical/share files, verify runtime equivalence, PR + pinned-head merge to main, stage and test immutable production artifact, promote same artifact, genuine GET-only smoke. Record evidence and README. Current release authorization does not authorize unrelated feature work.
