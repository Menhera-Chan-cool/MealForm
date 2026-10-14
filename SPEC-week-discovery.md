# Spec: week-discovery
## Objective
Ideas 5–6: group all searchable choices into current/next/past/other without dropping duplicates/unknown records. Archive offers List/Calendar with the same authenticated registered weeks.
## Commands
Shared commands; add pure date/group/calendar assertions and real picker/archive browser checks.
## Structure
ui-model.mjs, DashboardWeekPicker.jsx, ComboSelect grouping extension, HistoryArchive.jsx and ArchiveCalendar.jsx.
## Code style
Display-only pure functions; calendar arithmetic uses validated ISO dates/UTC, current-week groups reuse Vietnam calendar logic.
## Testing
Monday rollover, cross-month/year week, malformed dates, multiple weeks in a calendar row, duplicate names and exact weekKey navigation.
## Boundaries
No route/API/auth change. Groups are labels, not selectable options. Unknown dates remain accessible in List. Never fabricate serving-day information from an archive range.
## Success criteria
Chosen complete week still appears in the input; search remains accent-folded and callbacks use exact keys. Calendar month includes overlapping archived weeks, with links to existing selected-week URLs and a list fallback.
