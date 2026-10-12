# Capability Map: Import and appearance QoL

Full scope approved by user on 12/10/2026; continuous implementation, test and deployment authorized.

| Module id | Responsibility | Depends on |
|---|---|---|
| reload-changes | Dashboard successful manual reload of the same week compares a verified whole-week Form-id/content baseline; counts added, missing and changed independently of paging/search. Never infer identity from names or mutate records. First load/legacy cache/failed or cancelled reload is not a verified comparison. | — |
| image-ingest | One validated ingestion path for file selection, paste and drop in the authorized OCR tab; previews/removal, PNG/JPEG/WEBP, up to five images and 2.8 MB combined. Bad inputs or cancelled selection retain the existing draft. Do not intercept text paste in editable fields or read unrelated clipboard content. | — |
| multi-image-ocr | Read image fragments, preserve provenance, review a five-day merge with explicit duplicate/conflict choices, editable dates/meals and missing-day warnings. Never guess/overwrite conflicting slots silently; apply only after review as one Undo operation. Keep existing one-image and region OCR, draft restoration and holidays compatible. | image-ingest |
| color-scheme | Shared Light/Dark/System setting across viewer/archive/dashboard/setup and dialogs. Default System, browser-local preference, live system changes only in System mode; preserve school primary color and readable foreground/borders/focus. | — |
| motion-level | Shared Full/Light/Off setting for CSS and JavaScript animations. Default follows reduced-motion preference until an explicit selection; migrate the existing Full override. Light drops decorative sequences but keeps short interaction feedback; Off has immediate state changes with readable final labels and no stranded menus/dialogs. | — |

Build order: reload-changes -> image-ingest -> multi-image-ocr -> color-scheme -> motion-level -> integration/full regression/PC-mobile QA -> backend-before-web deployment -> clean release/README/GitHub synchronization.

Boundaries: no dependencies/services/OAuth scopes added without approval; no actual response deletion, Form creation or real OCR calls during QA. Use native/helper/API/browser fixtures for mutations and OCR, readonly production checks. No cross-device preference/draft sync. Plain UI preferences never replace fresh authorization or concrete-record identity checks. Total upload cap avoids the existing base64/API request-body limit; additional images may increase provider usage and processing time. Cloud drafts, automatic content corrections and bulk mutations are out of scope.
