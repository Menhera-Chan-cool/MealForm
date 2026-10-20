# Workspace shell

## Objective / acceptance
Authenticated H1 follows active section (Lượt gửi/Lịch sử follows its active subtab); remove generic description, retain account and role. 701–1100px starts as compact sidebar with focus/pointer labels, manual override until viewport class changes; <=700px keeps bottom navigation. More is two-column authorized task grid, one column below360px or large text. Overview groups short tasks under Chuẩn bị thực đơn / Theo dõi đăng ký / Kiểm tra dữ liệu, retains current/next/archive week information and actual loaded attention. Never manufacture readiness.
## Structure / style
Dashboard.jsx, DashboardLayout.jsx, workspace CSS; reuse Button, existing navigate/week and role guards. Example <h1>{tabTitle}</h1>; no competing state or duplicated sidebar.
## Commands / tests
meal-viewer: npm test; npm run build. mealform-preview: npm exec -- playwright test --config .playwright-cli/reading-polish.config.ts; npm test; npm run build; npm run build-storybook. RED/GREEN actual-entrypoint title/rail/manual override/More roles/navigation/no-write cases; preserve old functional assertions while replacing explicitly retired generic-heading assertions.
## Boundaries
Always semantic theme, keyboard names,44px controls, consent/dirty guards. Ask for dependencies/auth changes. Never change Google scopes/roles or infer checks from mere navigation.
