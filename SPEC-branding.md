# Spec: branding

## Objective / approved criteria
Owner-only settings: school name, HTTPS logo image URL and primary hex color. Preserve current presentation if unset. All pages show the configured identity; public read returns only display settings. Validate length, URL and color; use React text and CSS variables, never HTML injection. Choose readable foreground color. Semantic open/closed/error colors remain meaningful.
## Commands
`node meal-viewer/admin-upgrades.test.mjs`; `node meal-viewer/branding.test.mjs`; `npm --prefix meal-viewer test`; `npm --prefix meal-viewer run build`.
## Structure and style
One `MEAL_BRANDING` Script Property plus short script-cache entry; public signed branding API; frontend branding hook/model and CSS. Reuse owner permission checks. Example: `if (!/^#[0-9a-f]{6}$/i.test(primaryColor)) throw new Error('Màu không hợp lệ.');`.
## Verification
Reject script/data/insecure/userinfo URLs, oversized values and malformed colors; reject manager write; verify public response excludes private fields; test white/black text contrast, logo fallback and responsive header. Defaults and setup guide stay available when branding API fails.
## Boundaries
No image upload, public Drive sharing, arbitrary server-side URL fetching or new dependencies. Ask before configuring real school branding in a smoke test. Keep current content unless owner explicitly saves changes.
