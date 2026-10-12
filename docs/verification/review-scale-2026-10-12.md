# Review and scale QoL — 12/10/2026

## Delivered scope

Selected-week audit filters, region-only OCR with editable preview/atomic Undo, 50-row response and history batches, verified account/capability header, and an explicit safe web update notice. No new dependencies, OAuth scopes, registry migration or changes to existing Form/Sheet content.

## Verification

- RED/GREEN observed for audit/date/note helpers, region replacement/crop bounds, role/version contracts, authenticated email, invalid batch input, read-call timeout/retry, native paging and cache, decoded audit search, full-week action options and version artifact generation.
- Full `npm test` passed in main workspace, clean sharing checkout and GitHub checkout. Old session/auth, permissions, OCR/draft, calendar/holiday, exact identity, delete/restore, reconciliation, branding, route and UI suites remain green.
- Native VM services: 110 Form responses -> first 50 then next 50; next page reuses the private token-free snapshot without rereading Sheet rows or every Form answer. Query finds id-109 outside the first page; oldest sort covers the full dataset. Same-name duplicates remain non-deletable, accented vs unaccented names remain distinct matching identities, and Sheet-only rows keep explicit partial state.
- Cache eviction safely re-reads unchanged data with stable revision; changed revisions reset the cursor. Snapshot cache is scoped to the execution user, separately from signed-request replay protection. Large snapshots bypass caching; mutation verification remains fresh against both stores.
- An 80-event audit fixture proves filters/action choices cover older events beyond the first 50, decoded visible notes are searchable, Vietnam dates are inclusive, invalid dates fail, and private restore payloads are never returned. Response/history payloads are separately bounded to 50 rows per page.
- Browser fixtures passed at 1280px and 390px in Chrome: account/role header, 50 -> 100 rows, global search/sort, audit criteria/empty-result message, image region dimensions smaller than the original, preview unchanged until explicit acceptance, editable replacement with one Undo, and update preserving the latest OCR draft. Storage denial prevented navigation/reload and retained the current edited title.
- Older browser fixtures also passed: display cache/readonly failure guards, accurate new-response badge, current Sheet location, reasons/history readability, sticky toolbar, grouped Undo/holiday payload, duplicate warning, safe error copy, owner-only controls, branding and row error feedback.

## Deployment proof

- Apps Script live source backed up; four existing active functions updated and seven private helpers added, with 115 other active functions unchanged. Editor cloud-save completion and reload readback matched prepared source.
- Same deployment URL, execution owner/access and manifest retained. Final Apps Script version 76 at 18:35 Vietnam time, 12/10/2026.
- Vercel retry reached READY for `dpl_BYjuy6w5pHzmsAoRvLSpbNDryVAB`, aliased to `https://menutaythanh.vercel.app`. Initial CLI authorization failure was resolved after read-only identity/project checks and retry, without replacing credentials.
- Authenticated Edge production smoke: verified email header, batch metadata with 24 initial rows, zero-result history criteria acknowledged by the matching API response, mobile no page overflow, public version JSON with no-store and only id. Active asset `/assets/index-BeMyIiVj.js`; zero Dashboard mutation requests. The selected real week had fewer than 50 responses, so live load-more was not applicable; 50+ behavior is covered by native and browser fixtures.
- Production checks restored original display cache/preferences and preserved the owner browser. No real response submission/delete/restore or paid OCR during QA.
- Feature/source/README pushed and verified on GitHub main at `0633d3cb535fe6dfec5791981c3567c6e6ca0aa6`; local and remote heads matched. User-owned release checkout retained without resetting unrelated changes.

## Limits

The snapshot may be up to 30 seconds old; explicit reload forces fresh data and every mutation rechecks the record. Native Form APIs still require a full initial response read for global filtering/identity, so large-week cold-read latency is not guaranteed; oversized/evicted caches safely fall back. Drafts/preferences remain local to browser/origin and are not separately encrypted. Unapplied crop previews are not saved, and new regional reads use provider quota/fees. Physical iOS/Android touch devices and real paid regional OCR were not tested. Existing RAR archives are not rebuilt by syncing source.

Implementation references: [Google cache scoping and eviction](https://developers.google.com/apps-script/reference/cache/cache-service), [cache value limits and batched operations](https://developers.google.com/apps-script/reference/cache/cache).
