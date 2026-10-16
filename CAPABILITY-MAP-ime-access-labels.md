# Capability map: stable search, permission discovery, image labels

User selected all three capabilities and approved GitHub/main + production on 2026-10-16.

| Module | Responsibility | Depends on |
| --- | --- | --- |
| ime-search | Buffer search during composition; keep caret and keyboard actions safe | Existing search inputs/comboboxes |
| access-discovery | Filter loaded members by email and one permission; never mutate on filter | ime-search |
| image-labels | Optional local secondary label follows exact image through draft/order | Existing image draft/order |

Build order: ime-search → access-discovery → image-labels. No backend, permissions, identity, service or dependency changes.
