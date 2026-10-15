# Capability map: selected 4, 5, 8, 9, 10 — 15/10/2026

The user approved these five capabilities and directly authorized main/production delivery. Prior project instructions delegate detailed planning; boundaries below follow that exact selection, not additional product features.

| Module | Responsibility | Depends on |
|---|---|---|
| save-diff | Review old/new deadline, branding and weekly notice before the original save | — |
| column-resize | Pointer/keyboard PC widths in the same three table workspaces | — |
| shortcut-reference | Manual reference to supported, context-specific keys | column-resize |
| wait-elapsed | Actual client wait duration without progress/ETA/cancel fiction | — |
| viewer-link-errors | Honest invalid/missing/forbidden/connection viewer states | — |

Build order: save-diff → column-resize → shortcut-reference → wait-elapsed → viewer-link-errors → regression → exact-artifact release.

Assumptions: widths are transient, do not modify Sheet or persist across devices, and never affect mobile fields. Existing native save confirmation becomes a shared custom review dialog; discard/unload/restore prompts remain unchanged. Elapsed time measures the current visible client operation, not server CPU time. Link syntax mirrors current API limits, not assumed Google ID length; missing weeks are inferred only from explicit server status/message. A valid newest/next route without a menu remains a normal empty week, not a broken link. No API, Apps Script, permission, secret, dependency or CI changes.

Specs: SPEC-save-diff.md, SPEC-column-resize.md, SPEC-shortcut-reference.md, SPEC-wait-elapsed.md, SPEC-viewer-link-errors.md. Plan and checklist: tasks/plan.md, tasks/todo.md. The incumbent branding, theme, motion and identity safeguards remain authoritative.
