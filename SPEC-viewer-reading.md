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
