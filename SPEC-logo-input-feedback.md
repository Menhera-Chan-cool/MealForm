# Spec: logo-input-feedback
## Objective
At the existing optional logo input, distinguish invalid HTTPS syntax from a browser image-load failure, show loading/success and allow explicit retry of the same URL. Do not infer that a remote file is nonexistent/private merely from an image error.
## Structure and style
Reuse normalizeBranding syntax rules and BrandingPreview's existing image request (no additional probe or backend fetch). Key image by URL/attempt; callback results must match the current draft URL/attempt before updating field status. Accessible inline feedback associated with the existing input. Retry remounts that same URL, does not append cache-busters or alter signed URLs.
## Commands and tests
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`. RED/GREEN invalid syntax, controlled image failure/success/retry, stale URL/attempt completion, blank optional value, dirty/cancel/save guards and no writes from checks.
## Boundaries and success
Always keep the original server validation/save confirmation. Image availability is advisory and must not silently rewrite the URL or block saving a syntactically valid URL. Ask before adding uploads. Never expose secrets, fetch via the backend, or auto-save branding.
