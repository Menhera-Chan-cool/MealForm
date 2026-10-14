# Approved UI bundle — staging checkpoint, 14/10/2026

## Scope and release gate

User approved all four implementation groups and delegated detailed specifications/planning. Before staging, the user removed idea 2 (the week day-strip). The remaining nine are implemented; the original Day dropdown, Today shortcut and holiday notice remain. Production promotion and main-branch merge require a fresh visual approval.

No API, Apps Script, OAuth, schema, environment, dependency or real Form/Sheet changes. Baseline main is `bd3e5691c2d2106645838689ca396da6c1a834d5`; branch `codex/ten-ui-improvements-2026-10-14`.

## Implemented slices

1. Accessible static skeletons for initial viewer/auth/archive/Dashboard reads. Existing data is retained on reload; original verified/cache/cancel gates remain authoritative.
2. Exact-key grouped week choices, duplicate-label disambiguation, malformed-date fallback group; month archive includes valid crossing-month/year weeks and links to the original week route.
3. Mobile Summary/Details tabs retain search/sort and mounted panel state. Name/time metadata comes from the original projection model, never a name lookup; full/day/meal modes retain same-name response timestamps. PC name cells/headers are sticky on horizontal scroll.
4. Truthful OCR image/review/create states, completion only after a successful create response; create errors keep draft/review. Three-image import/crop/draft validation flows are not changed.
5. Native row-action popovers defer Sheet lookup until clicked. Quick View remains primary. Existing delete token/week/response identity, cached-read disables, role conditions, delete confirmation/reason and restore browser confirmation/entry identity are reused unchanged.
6. Read-only illustrative brand context preview across surface/device/theme; local choices and draft colors never update root appearance or save to backend. Only the existing Save action persists. Light preview headings are isolated from the surrounding dark-page palette.

## Verification

- RED/GREEN: initial-only skeletons, grouped/calendar discovery, projection metadata, mobile tabs/pinning, OCR stages, row popover presence and brand context controls.
- Additional reproduced regressions: invalid calendar date was incorrectly classified as a past week; mobile timestamp inherited a second grid column; light preview headings inherited global dark text. Each now has a passing focused assertion.
- User's removal has a failing-then-passing browser assertion for absence of the day-strip and continued operation of the original Day filter/Today button. No strip component, import, markup or CSS remains in runtime/Storybook.
- `meal-viewer/npm test`: build + all 28 native/API scripts passed after removing the strip. Build has existing non-fatal vendor `use client` directive warnings.
- Preview token/Chromatic safety tests: 5 passed. Preview TypeScript/Vite build passed; Storybook build passed after removal (45 stories); existing preview bundle-size/tool timing warnings are not runtime blockers.
- Preview browser suite: 11 passed. Actual-frontend browser suite: **25 passed (51.3s)** after removing the day-strip, including exact synthetic delete/restore payloads and cancellation, OCR create failure/retry/completion, all theme/device brand contexts and no remaining strip.
- Bounded screenshots/interaction review: 360/390/768/1440 widths, light/dark; calendar, mobile tabs/cards, PC pinning, OCR, row menu bounds/keyboard, brand contexts; existing full/light/off motion checks retained. All service mutations in tests are synthetic.

## Limitations

Chrome desktop and responsive emulation, not physical iOS/Android or a cross-browser certification. No paid OCR or live create/delete/restore used in QA. No new Chromatic cloud upload/baseline or Figma sync; local Storybook/token pipeline remains intact. Brand preview is illustrative, not an authenticated app instance or a pixel-match claim. No release archive was regenerated.

## Deployment

Existing project verified: `prj_J0aPrnCB79cyxClYyfCpb02nqSES`, team `team_alPCXVFOOevXpZxlqFldUisB`, `anh-tun/menutaythanh`, Node 24 / Vite / npm ci / npm run build / dist / root `.`.

Before staging the serving main domain returns build `22d5121a-5e27-4223-bbc8-d3ffca680313`, deployment `dpl_4WqD8AxQhaxoTEn6bkUFVQaqe1Rr`. Stage using the existing production environment and `--skip-domain`, test that exact artifact, and do not promote it without approval. No secrets or browser authentication state belong in this record.
