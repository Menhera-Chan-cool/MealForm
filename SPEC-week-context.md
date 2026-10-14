# week-context
## Objective
Selected ideas 2/4/8/10. Breadcrumbs for archive/month/selected week; return links preserve month/view across crossing-month weeks. Native tab title reflects active viewer week or Dashboard section without student names. Long notices offer show-more/less, preserve full content, expiry and safe text. Archive list/calendar show finite nonnegative numeric count/status when available, otherwise explicit unknown labels.
## Commands / structure
Shared map commands. ui-clarity.mjs, WeekContext.jsx/usePageTitle.js, WeekNotice, HistoryArchive/ArchiveCalendar, BrandingProvider, App and Dashboard.
## Style
Use semantic nav/ordered list/time/text and existing Badge tokens. Date parsing reuses validated weekRange/weekMonths; malformed input never produces a fabricated date/count.
## Tests
Cross-month return URLs and normal archive login guards; zero vs missing/null/NaN count; known vs unknown Form status; long/short/expired notices; changed notice resets expansion. Titles update after load/tab/brand change and never include response names. Source headers and API unchanged.
## Boundaries / success
No archive-wide Form/Sheet scan or new backend read. Preserve raw exact week keys and authenticated archive behavior. Notice expansion cannot extend expiry. Browser titles and breadcrumb dates use actual loaded week, not positional inferred weekdays.
