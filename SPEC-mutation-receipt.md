# Spec: mutation-receipt

## Objective / success criteria
GAS emits additive structured per-store result with actual post-mutation verification, including partial/already-deleted/unknown/duplicate/read-failure. Preserve lock/HMAC/permission/fingerprint/exact identity/audit safeguards and no retries of writes. API propagates safe allowlisted receipt on success or business failure. UI shows Form and Sheet separately; legacy/malformed/no receipt stays unverified. Receipt account/week/operation scoped; never infer from raw error text or cache. Test destructive behavior only with service doubles, genuine QA GET-only.

## Commands / tests
App build/native/API/GAS: npm test in meal-viewer. Browser: node_modules/.bin/playwright.cmd test --config playwright.production.config.ts in mealform-preview (CI=1, headless, serial). Preview: npm test, npm run build, npm run build-storybook. Native tests in meal-viewer/*.test.mjs and MealForm.test.js; actual-entrypoint tests in mealform-preview/tests/ui/production-ui.spec.ts. Meaningful RED before implementation; preserve all regressions. Desktop/mobile/light/dark/narrow/forced-colors visual batch, at most one repair/confirmation round. No real record mutations during QA.

## Structure / style
Existing React19/Vite UI, existing helpers/components/CSS tokens, existing native test scripts and API/GAS contracts. Reuse reducers and shared TableWorkspace/FilterEmptyState/branding modules; small native JS functions. Example: dispatchMenu({type:'edit',value:current=>next}) retains existing undo/validation rather than a second state store.

## Boundaries
Always preserve roles, account/week scope, exact record matching, error handling, confirmations, safe focus, IME input, storage limits and backward compatibility. Ask before new dependencies, auth/secrets/schema or unrelated backend changes. Never queue writes, mutate real records in QA, silently save branding/reorder published data, persist destructive credentials, edit vendor files or expose student data in logs. User approved scoped GAS mutation verification and production deployment; do not rebuild old sharing RARs.
