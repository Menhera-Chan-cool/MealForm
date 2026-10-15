# Six reading UI improvements — 2026-10-15

User authorizes implementation, GitHub/main and production. Reuse the current Operate design, semantic branding and native interactions. No new visible browser windows, dependencies, Google scopes or Apps Script deployment.

| Capability | Source and acceptance |
|---|---|
| Empty meal labels | Existing serving slot with empty text: Chưa chọn. Missing/null slot: Chưa đọc được. Only explicit closedDays metadata: Không phục vụ. Apply to Viewer projections and Dashboard/Quick View. Derived labels do not become data, searches or counts. Preserve null in the existing Vercel serializer rather than turn unreadable data into empty text. |
| Closed-day options | Combine actual calendar/serving/closed labels in the existing day dropdown. Closed options show Nghỉ, aria-disabled and are not selectable by pointer/keyboard/typed text. No day strip. Other dropdowns stay unchanged. |
| Branding comparison | Saved and draft samples share surface/device/theme controls, side by side on PC; explicit saved/draft toggle on mobile. Saved image events never overwrite draft feedback. Successful save updates the baseline; errors keep it. |
| Per-field restore | Reset only the selected school-name/logo/color draft field to last successfully saved value. Never save or discard another field. Keep dirty guards and existing save confirmation/revision. |
| Image minimap | Show the actual thumbnail and visible-window rectangle when zoomed. Click/drag/key navigation changes only the corresponding viewport; clamp bounds, handle resize/load/dialog/zoom, release captures and listeners. Preserve source image, OCR/crop and Undo state. |
| Login context | Name current/next/archive week/month or supported Dashboard destination; validate displayed dates. Existing same-URL Google sign-in callback returns to that exact route/query. No new redirect parameter, auth storage or permissions. |

Implementation: shared display/date/map helpers, existing viewer/response presenters and ComboSelect, saved/draft BrandingPreview, existing draft fields, small ImageMinimap component and login-context presenter. Tests exercise actual entrypoint with synthetic HTTP/GSI/image boundaries; no live owner mutations. Verify focused new cases, full incumbent suites/build, one batched light/dark PC/mobile visual pass and at most one repair confirmation. Publish a committed-source-checked production-environment artifact, merge pinned PR, promote that same artifact, then genuine readonly smoke and README/release record.

Commands: `npm test` in meal-viewer; `./node_modules/.bin/playwright.cmd test --config playwright.production.config.ts` and `npm run build && npm run build-storybook` in mealform-preview. Preserve local school-specific root GAS/index differences when syncing code back; no RAR rebuild.
