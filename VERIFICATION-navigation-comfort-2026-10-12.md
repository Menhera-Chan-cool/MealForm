# Navigation and comfort delivery — 12/10/2026

## Verified scope

- Ctrl/⌘ K and mobile quick commands: authorized tabs/registered weeks, public navigation only, arrows/Enter/Escape and focus return. Draft flush failure blocks navigation; successful navigation preserves the draft. No private owner/create commands for readonly managers or public visitors; no mutations from commands or behind another modal.
- Normal/Large local text preference, denied storage fallback and no page overflow at 1280/390/320px, including cards/dialogs. Existing branding and motion remain in place.
- Owner notices: <=500 plain-text characters, registered live week, required Vietnam end-of-day expiration, stale-version refusal, monotonic clear tombstone, pending/completed/review audit and partial-write errors. Public response strips private notice fields; backend/gateway/client/cache expiry checks hide expired text. No new service or OAuth scope.
- Client-only stop for Dashboard/viewer/history reads, including unabortable delayed replies, cancelled 401, cold data state and restored readonly snapshots. Manual verified reload re-enables existing safe operations. Writes do not receive a read-cancel signal; palette/stop cannot interrupt mutations. Stop also clears scheduled tab reads. This timer race was reproduced failing, then fixed and rerun against production.

## Verification

- Full `npm test` in main source and both clean sharing checkouts: build plus 24 Node/native/API test scripts passed.
- Browser fixtures: navigation-comfort at 1280/390/320px; review-scale, interaction-qol, dashboard-qol, editor-qol and admin-upgrades at PC/mobile passed. Public expiry, OCR draft retention/storage denial, stale replies and write guards use fake data only.
- Viewed mobile editor screenshot; no real notices or responses were changed during QA.
- Production owner: authorized notice read returned empty content, large text at 1280/390/320px without overflow; 24 rows displayed, stop kept the view readonly and fresh reload verified it. Restored browser view/cache/font preferences afterward; zero data writes.
- Public production viewer: HTTP 200, five serving days, notice/server-clock fields, email headers filtered and zero private notice commands.

## Deployments

- Apps Script 77, 12/10/2026 20:44 Vietnam time. Saved and reloaded source matched before deploy; four active functions updated, four added, 122 unrelated active functions preserved. Existing execute-as-owner, public deployment URL/access and manifest retained. Private source backup is outside the clean package/repository.
- Final Vercel deployment: `dpl_7uppiUTf4RwkAoWmTC9RmZqDN63M`, READY, production alias <https://menutaythanh.vercel.app>, asset `/assets/index-CUUf9vme.js`, version `1ab7732f-cbcb-41bd-bf92-9bab99560cf0`.
- Clean release source/README synchronized to GitHub, feature commit `995fc0fdb012b47db36bbb1cdf9eaf163ffbb21c` verified on remote main; configuration getters remain Script Properties based. RAR files were not rebuilt.

## Limits

Mobile verification uses Chromium viewport emulation, not physical Android/iOS devices. Notice writes/expiry/audit failures were verified with native/service mocks, not by publishing a real notice. The stop button does not cancel Apps Script or server work. Browser-local data/preferences are not cross-device or separately encrypted; sign out on shared devices.
