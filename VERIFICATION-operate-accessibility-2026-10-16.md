# Operate/accessibility release — 2026-10-16

## Authority and boundaries

User approved all 30 selected items, the six implementation groups, autonomous completion, GitHub/main and production. Source of scope: CAPABILITY-MAP-operate-accessibility.md and the six linked SPEC documents. The removed reviewed-day checkbox/collapse does not remove date/meal validation, missing-meal confirmation, Undo or authorization.

No new dependency, API/GAS/schema/OAuth change, credential exposure or owner mutation on real data. Apps Script remains v79. Owner writes in tests terminate at synthetic service boundaries; real production smoke is GET-only. No new visible browser/profile. Existing school-specific GAS/index title and unrelated dirty checkout are preserved.

## Implementation and coverage

| Group | Requirements | Evidence |
| --- | --- | --- |
| Responsive foundations | 6, 12, 21, 22, 23 | 320 CSS px / 400%-equivalent layout, 844×390 landscape, text spacing, forced-colors; stable source viewport/logo slot; existing viewer/table/dialog coverage |
| Safe interactions | 3, 7, 8, 10, 13, 14, 18, 24, 30 | Simulated 280px visual viewport; 44px permission labels; Cancel initial focus and exact-record return focus; numeric/click width controls; separated delete group; copyable readonly key/filenames; hover bridge/Escape; pointer drag-out cancellation |
| Field/result feedback | 9, 11, 15, 16, 25, 29 | Shared linked summaries/inline explanations, optional labels and persistent hints, keyboard/Enter hints; concise atomic live counts without moving input focus; noninteractive status appearance |
| OCR workspace | 1, 2, 4, 17, 20, 26, 27 | Desktop source/edit layout, mobile retained DOM/zoom/scroll/text; no reviewed controls; validation/create guard; persistent exact-week creation receipt; named image errors retain prior batch; original-safe short filenames with full disclosure |
| Save/discard | 5 | Dirty-only contextual bars, explicit before/after confirmation, failed/conflicted/malformed-success responses retain drafts; discard confirmation and safe return focus |
| Navigation/context | 19, 28 | Per-entry Back/Forward RAM view snapshots, validated permitted tab/registered week URL, dirty/busy guards; no names/search/tokens in URL/history.state; native archive :visited styling means opened, not checked |

## RED/GREEN and regression repairs

Native tests first failed on missing helpers/named upload errors, filename and actual field/calendar validation. Actual-entrypoint browser tests failed before implementation for missing save bars, inline links, retained OCR panes, explicit safe focus, click width controls and history restoration. Additional failing cases exposed malformed-success draft loss, stale per-entry filters, Escape closing both popover and parent, long-toast overlap and asynchronous delete return-focus timing; fixes retained the same assertions and precise mutation identities.

The first full regression exposed old test selectors for generic confirmation and reviewed-day controls. Migrated them to explicit action/dirty-bar contracts while keeping validation, no-write, revision, Undo and field-restoration assertions. An actual color-draft loss reproduced on desktop→mobile resize: Dashboard-owned tab/week query changes became App viewer dependencies on the next parent render, causing a fresh authentication/loading cycle and remount. App now excludes Dashboard query from viewer data/auth dependencies. Existing saved/draft color and appearance tests passed after the fix. Selecting the current mobile destination also explicitly closes More only when navigation succeeds; cancelled dirty navigation keeps the menu.

One audit-column case timed out once; an isolated traced rerun passed unchanged. The cause of that transient timeout is not proven. Final browser verification runs without concurrent build/token writes; no retry/tolerance or assertion was added to hide this failure.

The 12-capture bounded visual batch was inspected once, then one confirmation pass checked the fixes: system-color button labels no longer disappear behind forced-colors backplates; long failure toast no longer covers the save bar; narrow actions wrap/stack; mobile Photo/Edit controls stay reachable. No unrelated polish pass or new design system.

## Verification and publication

Fresh full actual-entrypoint run: **154/154 passed (4.9m)** with no configured retries and no concurrent builds/token writes. This includes the unchanged audit-column case, explicit notice confirmations, all 22 new functional/responsive cases and retained prior workflows. Both canonical and sharing applications passed all **35 native scripts** and Vite builds; 30 scoped app/test files match canonical source. Preview token/guard tests **5/5**, TypeScript/Vite/Storybook builds and built compatibility **11/11 (13.4s)** passed. Dependency lockfiles, APIs, MealForm.gs and appsscript.json are unchanged. React review checked retained DOM/state, cleanup, action snapshots, no new background service reads, shared focus handling and no dependency additions.

Immutable deployment identity, pinned merge and genuine live smoke results are appended after their completion. Until then this document is not a production-success claim.

## Known limits and rollback

Browser simulation does not certify physical phones/keyboards, OS virtual keyboard behavior, screen-reader speech, non-Chromium engines or a full WCAG audit. 320 CSS px is a 400%-equivalent reflow check, not a physical browser-zoom certification. Native visited-link privacy is preserved; no programmatic browsing-history inference. Cloud Chromatic and Figma comparison are not run. Existing nonfatal chunk-size/Lucide/terminal-color warnings remain.

Rollback baseline: main 21d30c082cce637c314d20625cb2f2663905c208; runtime e675b2c6de632b74278cbb7f455ca709ec87df8b; artifact dpl_9YxsKhpsm6ax7d4bpVfgrLaE8qiq; immutable URL https://menutaythanh-7awqv4i3k-anh-tun.vercel.app; version 6a44fe86-495d-489b-82ee-de1b24ab1b35. Release-folder source/RARs are not rebuilt by updating the website or release README.
