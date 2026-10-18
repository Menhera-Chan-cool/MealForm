# OCR attention popover — 2026-10-18

User requested notification/badge controls behind ! beside OCR ?, opening like mobile More; explicitly authorized GitHub/main and production. Presentation-only: same parent attention hook, preferences, permission requests, pending events and all private/server contracts. No dependency, API, GAS, auth or live data changes.

Three production files: AppAttentionControls renders the native auto-popover using the existing More menu class and anchored helper; Dashboard places it immediately left of help in one fixed-width button group; app-session-attention.css sets PC anchoring, mobile bottom placement, short-screen viewport, wrapping and sticky Close. Same Settings theme and Full/Light/Off motion. No default open, auto permission request, new poll, data loss or new gesture action. Outside/Escape/Close dismiss; native focus return and stored preference survive reopening; mobile More is mutually exclusive. Core hook remains outside the popover lifecycle.

Three tests observed RED on missing alert button and insufficient short viewport, then GREEN. Existing attention tests now explicitly open the panel before interacting, without weakening notification/privacy/identity expectations. Focused 12/12 passed, including genuine OCR success/failure with synthetic services, denied permission, badges, session revoke/cancel/dirty guard and install fallback. Eight paired captures inspected across 1440 light, 390 dark, 320x256 and 844x390 forced colors; one short-height correction and one confirmation. No further visual polish loop.

## Verification

Final fixed-source **218/218 UI passed (6.4m)**, one worker/CI/no retries. All **41 native/API/GAS scripts plus Vite build passed in both canonical and sharing copies**. Preview five token/guard, TypeScript/Vite/Storybook builds and 11 built compatibility passed. React review: shared parent state, existing helper listener cleanup, no new dependency/network effect, native keyboard/focus/inert behavior; no API/auth/data logic touched. Canonical baseline guards preserved unrelated local task history and school-specific files. Known nonfatal build chunk/Lucide warnings remain; no Chromatic cloud upload.

## Publication

Pending immutable artifact validation, pinned merge and same-artifact promotion. Apps Script must remain v81. Rollback baseline: main10e22ca3032a33087db2d4ac713d1dae9edce522, production dpl_C7czC1EZ5Mq1JjaLfvcktCnt6UQj / 7bb88481-d1d7-4f6d-a818-dfc6aa641f7a. Web-only rollback is compatible because no server contract changes. No real session/Form/Sheet/OCR QA mutation or physical-device certification; old RAR/source not rebuilt.
