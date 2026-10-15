# Spec: notice-preview
## Objective
Owner can manually preview the current unsaved weekly notice for phone/PC and light/dark before saving. Reuse WeekNotice, live branding and Vietnamese expiry rules.
## Commands
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`; `npm run build-storybook` in preview.
## Structure
WeekNoticeEditor with NoticePreview.jsx, pure noticePreview helper in ui-clarity.mjs, existing theme functions; native/browser tests.
## Style
Inline disclosure, clearly marked draft illustration, local semantic theme variables and existing notice component. No synthetic student data or new modal.
## Testing
RED/GREEN literal draft text, newline/long expansion, invalid/expired/leap dates and Vietnam midnight, viewport/theme independence, zero writes, unchanged dirty/409/save-confirmation behavior.
## Boundaries
Always preserve draft values/revision. Ask before publishing or new services. Never treat preview as save, execute markup, auto-save, or offer this owner editor to other roles.
## Success
Device/theme preview does not alter the real website, publication state or dirty baseline; only original confirmed Save publishes.
