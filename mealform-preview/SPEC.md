# Isolated MealForm UI preview

Approved: separate preview, no production changes. Operate mode; inherit the approved Figma sidebar/mobile navigation and week-card structure.

| Capability | Acceptance |
| --- | --- |
| Tokens | Import the existing Tokens Studio Free JSON sets; Style Dictionary produces deterministic CSS variables and a Tailwind v4 bridge. Reject unresolved/cyclic aliases. No Pro Themes. |
| Components | Actual shadcn/ui source components; Noto Sans; 44px touch targets; light/dark; brand color from preview tokens. |
| Preview | Vite app and Storybook; desktop sidebar, mobile four-tab navigation, overview, More and submissions; synthetic data only. Other tools clearly marked preview, never pretend to mutate a backend. |
| Visual checks | Stable stories with Figma links; desktop/mobile/light/dark and empty/loading states. Chromatic opt-in with env token; no automatic acceptance or cloud upload during this task. |

Non-goals: change meal-viewer, Apps Script, real records, login/permissions, deployments, GitHub, paid plans. Preview interactions never create/delete Forms or Sheets. The original admin capture had a quota limitation. The new viewer file is editable and screenshots work via native figma_direct MCP; neither preview is a certified pixel-perfect port.

Source design: https://www.figma.com/design/9gbz6BuArX7kyBTlbKMzuR

## Weekly viewer extension (approved 2026-10-13)

New Figma file in bituan25: https://www.figma.com/design/W0eib9OIk99Ia0fweyf09e . Do not mutate the old bi774733 file. Continue in the existing isolated preview; no production source/dependencies, API, Apps Script, GitHub or deployment changes.

Coverage: /newest current week, /next next week, /history archive/month picker, selected archived week; filters/search/chips, summary disclosure, detail sorting/table/mobile cards, advanced source, global preferences, form registration/status, guest/login, empty/loading/error/read-wait/update notice. PC horizontal filters and aligned tables; mobile secondary filters expand inline, day cards, readable detail cards. Keep all current behavior: immediate filtering, accented-name search is display-only, actual serving-day labels, three sort choices, archive login guard, conditional next registration and form links (closed status alone does not disable an existing URL).

Preview imports original pure viewer model and ComboSelect behavior, never production fetch/mutations. Synthetic deterministic records only. Form/source/reload/login actions that require a service are explicitly simulated; preview is not a replacement backend. Use existing shadcn primitives and existing Tokens Studio Free JSON/Style Dictionary pipeline. Figma local components match the code vocabulary and bindings; no claim of official kit import.

Verification: test new UI flows before implementation, then existing/new tests, Vite and Storybook builds, PC/mobile light/dark screenshots with no horizontal overflow, keyboard/focus/44px controls. Chromatic config stays opt-in; cloud run needs user project/token, no auto-baseline approval. Figma visual/read-back gates apply; no flattened UI raster.
