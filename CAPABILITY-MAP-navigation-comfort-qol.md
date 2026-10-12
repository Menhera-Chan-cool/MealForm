# Capability Map: Navigation and comfort QoL

User approved the full scope on 12/10/2026; continuous implementation/test/deployment authorized.

| Module id | Responsibility | Depends on |
|---|---|---|
| command-palette | Ctrl/Cmd K plus visible mobile button; searchable safe week/tab/page navigation, keyboard selection and Escape/focus return; only authorized commands/metadata | — |
| text-size | Normal/Large setting across PC/mobile and dialogs, browser-local persistence, readable buttons/meals without horizontal page overflow | — |
| week-notice | Owner-only plain-text notice for one registered week, explicit Vietnam expiration date, edit/clear and audit; public viewer display, no expired notice through cached data | — |
| stop-wait | Cancel frontend waiting for read-only viewer/dashboard/response/history loads; generation/abort guards, correct-week display cache stays readonly until verified reload | — |

Build order: text-size -> command-palette -> week-notice -> stop-wait -> integration/regression/browser QA and backend-before-web deployment, clean-template/README/GitHub delivery.

Assumptions for approval:
- Palette never performs delete, restore, OCR, Form creation, Form controls, grants or notice publication. Respect permissions, do not probe private Dashboard week metadata from public pages, and do not open behind another modal or while a mutation is pending. Preserve draft/view state before navigation.
- Normal/Large preferences are local to this browser/origin, not cross-device; existing browser zoom and reduced-motion behavior stay intact. Mobile has a visible quick-command button without requiring a keyboard.
- Notice is public on the appropriate week viewer, plain text <=500 characters, one current notice per week. Expiration day is inclusive through 23:59:59 Vietnam time. Only owner edits/clears, with confirmation and audit; no Form/Sheet answer changes and no new OAuth scopes. Concurrent edits must not overwrite silently. Do not place secrets or student personal data in the notice.
- Stop-wait only affects reads. Never advertise backend cancellation: Apps Script/server may continue. Do not cancel or retry writes/OCR using this control; no cached data means a clear empty/unverified state, not a fabricated successful result. Stale replies cannot overwrite another week or regain action eligibility.
