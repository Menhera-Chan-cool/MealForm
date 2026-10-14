# Production UI migration — approved 14/10/2026

Outcome: both approved preview interfaces run in the real frontend with every existing function intact. Nine Dashboard sections, current/next/archive/selected-week viewer. GitHub source and Vercel production must match after release. User chose shared release, approved previews as visual authority, and local visual tests before optional Chromatic cloud.

## Capability map and order

- ui-foundation: shared tokens, shadcn source primitives, font, runtime branding and appearance bridge.
- weekly-viewer: depends on ui-foundation; real controllers, immediate filters, summary/details, archive and states.
- admin-dashboard: depends on ui-foundation; navigation and all nine real panels, overview classification and existing safety gates.
- release-verification: depends on both surfaces; test, stage, user visual approval, merge GitHub, promote, read-only smoke/rollback.

## Implementation boundary

Keep API/session/schema/backend/Apps Script/OAuth/HMAC/configuration unchanged. Retain existing models, callback arguments, tab ids, verified-read gates, OCR drafts/undo, response identity, confirmations and reasons, pagination, permissions, cancellation and version guards. No test on live Forms/Sheets, real access lists or paid OCR. No release RAR update.

Use existing React/Vite JSX; no framework or TypeScript migration. Reuse preview shadcn source and Noto Sans, token JSON and Style Dictionary. Scope new component styles and disable global Tailwind Preflight. Runtime colors come from the existing branding/appearance functions, including default-brand light mode and portaled surfaces. One token source, generated CSS never edited by hand. Storybook/fixtures remain development-only.

Preview layout is the authority: grouped PC sidebar, mobile primary destinations and More, horizontal PC viewer filters, expandable secondary mobile fields, day summaries and complete detail cards. Actual dates and counts replace every fixed example. Week grouping uses Vietnam calendar and weekKey, retains farther-future/unknown weeks and never replaces current with next. Navigation preserves original role/permission visibility.

## Acceptance and commands

- Baseline and final: `npm test` in meal-viewer; add red/green regression coverage for new UI logic and real UI browser behavior.
- Browser: actual production entrypoint with service interception only, 360/390/768/1440 widths, light/dark/system, large type, multiple accents, long data, every Dashboard panel and guest/login/empty/error/loading states.
- Verify keyboard focus, at least44px action controls, no document overflow, legible theme surfaces/chevrons, complete fields and unchanged safety gates. Safe mutations use synthetic responses only.
- `npm run build` in meal-viewer and `npm run build-storybook` in mealform-preview; ensure no sample data, Storybook, secrets or cross-root imports in production bundle.
- Fresh Impeccable finish review/documentation after bounded batched visual checks.

## Release gate

Snapshot current deployment and source; prepare feature branch/PR and a staged production deployment with `--prod --skip-domain`, not a production alias switch. Show staging to user and await their agreed visual approval before merge/promotion. Preserve existing OAuth origins; authenticated staging screenshots use fixtures, not a new Google configuration. After approval merge source, promote that exact production-environment artifact, verify live read-only flows/logs and record commit/deployment. On critical failure rollback to the previous serving deployment and revert UI commit without touching data. Do not silently stop at a preview and call production complete.
