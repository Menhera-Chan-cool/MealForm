# App, sessions and attention

Approved all four modules, autonomous specification/planning/testing and main/production on 2026-10-18. Preserve current Google identity, roles, HMAC, confirmation, data and draft isolation. No paid service or new dependency.

| Module | Responsibility | Depends on |
|---|---|---|
| session-control | Durable own-session registry and enforced revocation | existing GAS private signed bridge |
| install-app | Manifests, icons, platform install UI and notification-only worker | existing frontend |
| ocr-notification | Opt-in, generic hidden-page completion notice | install-app, session-control account scope |
| app-badge | Honest window-scoped unread flag and fallback | ocr-notification, existing fresh response detection |

Order: session-control -> install-app -> ocr-notification -> app-badge -> full integration -> stage exact web artifact -> deploy guarded GAS session dispatcher -> immediately promote tested web artifact -> readonly smoke/docs. Old private web deployments must not bypass revocation through the shared GAS dispatcher. A short auth cutover and one-time login are expected; public current/next/branding remain available. No actual user sessions or Form/Sheet records changed in QA.
