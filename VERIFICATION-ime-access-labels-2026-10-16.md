# Stable search, Gmail discovery and image labels — 2026-10-16

## Authority and scope

User selected all three capabilities, then explicitly approved GitHub/main and production. Map: CAPABILITY-MAP-ime-access-labels.md; specs SPEC-ime-search.md, SPEC-access-discovery.md and SPEC-image-labels.md.

Shared composition buffering leaves input text/caret live but filters/options/highlights committed until composition ends or blur. IME Enter/Arrow/Escape do not dispatch search or navigation shortcuts. Clear cancels the buffer; native ordinary typing stays immediate. No accent parser or debounce dependency.

Owner Gmail discovery intersects email with one loaded permission predicate and shows loaded X/Y scope. The original member objects and permission mutation callbacks are unchanged. Image labels are optional bounded local metadata below unmodified filenames, retained in existing account-scoped version-1 IndexedDB drafts. Reorder/append/remove retain association, even duplicate filenames; OCR requests still contain only image URLs.

## RED/GREEN evidence

Initial real-entrypoint cases failed on changed viewer rows/options and OCR highlight results during composition, and absent secondary-label inputs. Native draft assertion failed because metadata was discarded. The Gmail fixture initially omitted the real access query and complete mutation response; corrected those boundary fixtures. A filter mutation check then failed with three rendered accounts instead of one, and passed when the display filter was restored. No assertions/retries were removed to turn failures green.

Eight focused functional browser cases passed in 10.1s, plus the separate 360/900/1440 light/dark large-text review batch passed. Nine scoped canonical app/test files were checked against baseline hashes before copying. Both local and sharing app builds and all 33 native scripts passed. Full regression and publication results are recorded below after completion.

The first complete run passed 131/132; one existing pointer-resize test measured a table during its entry scale animation (0.5747px discrepancy). A two-case native probe observed transform matrix(0.998121,...) during measurement versus none after animation.finished; the settled case resized exactly 117.9375→197.9375px. The test now waits for the target dialog's actual animations to finish before measuring, retaining all original numerical, keyboard, reset and mobile assertions; no production resize code or tolerance was changed. Focused case passed (4.4s). Preview token/guard tests 5/5, TypeScript/Vite/Storybook and built compatibility 11/11 (12.8s) passed.

Fresh full actual-entrypoint run: **132/132 passed (3.9m)**, including the retained pointer test and nine new cases. No retry setting or deleted assertion. Bounded visual inspection confirms incumbent semantic branding, 44px fields/controls, wrapping mobile Gmail controls and original image filenames with secondary labels; native field horizontal text scrolling is retained for long editable labels. React review found no new service effects, remount keys, unsafe markup, permission writes or dependencies.

## Boundaries and known limits

No dependency, API, Apps Script, OAuth scope, permission model or live data change. Synthetic API/image boundaries cover owner flows; genuine smoke is GET-only. No new visible browser window/profile; existing signed-in owner tab is untouched. Labels remain local browser drafts, not cross-device sync. Physical Vietnamese keyboards, physical mobile devices, non-Chromium and cloud Chromatic are not certified. Existing nonfatal Lucide directive, terminal-color and >500k chunk warnings remain.

Rollback baseline: PR #15 runtime eb31a6c4143218871a470ab978239a08a414fce4, main 58f08ff75f0e210e07d0fa0066602faf50b216de; artifact dpl_GWDbbs1isW78SJLc7N5BokUJsbSh; version da3b6ab8-84b6-4e70-a922-858025a201fe. Apps Script stays v79.
