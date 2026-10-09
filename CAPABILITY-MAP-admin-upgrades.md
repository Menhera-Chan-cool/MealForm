# Capability map: Dashboard administration upgrades

| Module id | Responsibility | Depends on |
|---|---|---|
| action-feedback | Accessible toast messages and per-row delete/restore status | Existing dashboard request/session handling |
| form-control | Owner-only open/close, Vietnam-time deadline, confirmation and audit trail | action-feedback, existing registered-week/lock machinery |
| reconciliation | Read-only comparison of registered Form responses and Sheet rows | action-feedback, existing unique-match helpers |
| branding | Owner settings for school name, HTTPS logo URL and primary color | action-feedback, existing owner authorization |

Build order: action-feedback -> form-control -> reconciliation -> branding.

## Proposed boundaries for approval

- Only the owner changes Form status/deadline or public branding; existing Gmail privileges are not expanded.
- Default Monday 00:00 Vietnam locking remains for weeks without an override.
- Reopening a week whose deadline has passed requires a new future deadline. Scheduling/setup must preserve that override.
- Form controls re-check live registered targets and expected state before changes, invalidate viewer cache and record actor, before/after values and partial failures.
- Reconciliation detects Form-only, Sheet-only and ambiguous records; it never deletes, restores or changes rows/Form responses.
- Toasts show success/failure close to the user, keep errors dismissible, support keyboard/screen readers and do not invent progress percentages.
- Branding starts with school name, an HTTPS image URL and a validated hex color. No image upload/public Drive sharing or new dependencies in this scope. Existing presentation remains when no branding is configured.
- Public branding reads expose only display settings, never keys, account permissions, student data or audit data.
- Tests use isolated fixtures. Deployment does not open/close real weekly Forms or edit real registration deadlines as a smoke test.

Status: approved by the user on 2026-10-09, including implementation of all four modules within these boundaries.
