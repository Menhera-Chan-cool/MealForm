# Approved admin upgrades: implementation plan

1. action-feedback: accessible toast, per-row pending state and guarded week loads; verify before dependent controls.
2. form-control: owner-only bridge/GAS operation, audited live-state updates, shared effective-deadline helper, existing scheduler integration; isolate tests.
3. reconciliation: cached matching report and view-only UI; prove zero writes and duplicate handling.
4. branding: validated owner setting and filtered public read, frontend defaults/theme/identity; preserve semantic status colors.
5. Integrate main and clean share template, run full regression and browser QA, then merge only relevant active Apps Script functions with a live-source backup. Deploy backend before frontend. Smoke tests are read-only and invalid-permission tests only. Push verified template and specs to GitHub without secrets.

Risks: reopening a past week must not be immediately auto-closed; an expired token or stale tab must not mutate a newly changed target; theme must not make text unreadable; read-only diagnostics must not become repairs; live duplicate function definitions must be merged by active definition without dropping unrelated safeguards.
