# Spec: loading-states
## Objective
Idea 10: neutral card/table-shaped initial skeletons only when no usable content exists. They never replace cached/verified rows during background/manual refresh, hide errors or remain after cancellation.
## Commands
Use the shared commands in CAPABILITY-MAP-ui-ten.md; native SSR semantics plus browser delayed-GET tests.
## Structure
ContentSkeleton.jsx, App.jsx, HistoryArchive.jsx, Dashboard.jsx, shared UI CSS.
## Code style
Small presentational component: ContentSkeleton({label,kind='cards'}). No timers, requests or fabricated counts.
## Testing
Hold/release synthetic initial reads; assert skeleton then real content; reload retains existing rows and guarded actions; failure/stop clears skeleton.
## Boundaries
Shared map boundaries apply. Keep login/permission states authoritative. No simulated percentages.
## Success criteria
Viewer, archive and Dashboard initial reads have a readable busy label and aria-hidden placeholder shapes; cached content is never obscured.
