# Spec: viewer-reading
## Objective
Ideas 1, 3–4: mobile Summary/Details tabs retain filters/sort; mobile name heading and time remain accurate under all projections; PC name column stays visible during horizontal scroll. User removed idea 2 (the day strip) on 14/10/2026 before staging; preserve the existing Day filter and Today button instead.
## Commands
Shared commands plus pure projection metadata assertions and browser tab/filter/scroll tests.
## Structure
App.jsx, ViewerTabs.jsx, DetailTable.jsx, viewer-model.mjs, UI CSS.
## Code style
Keep a single response table DOM; attach semantic column metadata from the existing projection model instead of guessing by displayed position or name.
## Testing
Full/day/meal filters, two people with identical names but different timestamps, holiday removal, invalid day, tab/viewport changes, keyboard tab navigation and pinned name header/cells.
## Boundaries
Never change filtering or identity logic. Tabs only control presentation on mobile; both sections stay available on PC. No extra backend calls on tab changes. Do not add a second day selector.
## Success criteria
Hidden panels are noninteractive; original data remains complete. No day strip in runtime or Storybook; existing date filter/Today and holiday notices remain. Full names and time are readable without positional fill rules.

## Selected presentation improvements — 15/10/2026 (ideas 2, 3, 7, 10)

- Counts: show matching source submissions and nonempty projected meal choices with separate units. Two submissions with the same name remain two submissions. A meal matching several days creates several choices, not several people. Counts stay visible outside the mobile Summary/Details panels and follow the existing filters. Per-meal badges say “lựa chọn”.
- Registration context: label the viewed week with its own dates/status; when the existing safe next-week target is selected, show a separate next-week date/status/action group. Preserve URL allowlisting, current/next/archive eligibility, missing-data warnings and the existing target selection rules.
- Mobile date labels: shorten actual valid source labels to “T4 · 14/10”, with a touch/keyboard button to expand the full source date. Apply to viewer day headings, full/day/meal detail projections and Dashboard response details/quick view. PC keeps full labels. Unknown or impossible dates stay unchanged. Never derive weekday from a column index or add a day strip.
- “Có gì mới?”: manually expandable short notes inside the existing “…” display popover; closing the menu collapses the notes. No automatic prompt, network request, new storage, new dependency or interference with modal/unsaved-work guards.

### Delivery boundary

Implement and verify locally first. On 15/10/2026 the user first authorized GitHub publication, then explicitly requested merging `main` and releasing production. PR #7 is merged; the exact tested production-environment artifact has been promoted and genuine readonly smoke checks passed. This authorization covers the selected four-item update, not unrelated changes. No API, Apps Script, permissions, secrets or real Form/Sheet data changes.
