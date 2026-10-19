# Archive workspace

## Objective / success
Authenticated history route on PC (>1100px) shows archive left and selected full viewer right. Reuse the existing viewer controller/GET/read guards, not an iframe or duplicate viewer. Selecting actual links preserves week/month/layout/status URL semantics; browser Back restores list scroll and focus. Mobile selected route hides list and shows normal full viewer; return keeps list filters/position. No selected week shows a compact invitation beside list. Missing current/next remains a compact status within content region, navigation/retry stay reachable; distinguish real errors/login/missing from no responses.
## Commands / structure / style
Reuse SPEC-layout-foundations.md commands/boundaries. App.jsx, HistoryArchive.jsx, ArchiveCalendar.jsx and archive wrapper; native same-tab links work without custom router. Existing week URLs remain authoritative. History entry holds only non-sensitive scroll/focus/UI state, no API payload, record token or personal data. No forced prefetch of week details.
## Verification
Real-entrypoint synthetic services: actual selected week source shown, desktop both panes/mobile only detail, calendar and filters preserved on return, wrong/missing/401 never show prior private data, browser Back position, empty next navigation/retry. Full suite and actual readonly production smoke; no real Form/Sheet/OCR/session mutations. Pinned PR merge and identical-artifact promotion after tests.
