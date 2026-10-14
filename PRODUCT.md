# MealForm

## Current authorization — 14/10/2026

The user approved porting both previously approved UIs to the real frontend: all nine Dashboard sections and weekly viewer/archive, preserving every existing function and safety gate. SPEC-production-ui.md is the implementation/release contract. Work may update the feature branch/PR and stage a production-environment Vercel build without assigning domains. User visual approval of staging is required before merge/promotion. Backend/API/Apps Script/OAuth/HMAC and live data mutations remain out of scope. Earlier preview-only paragraphs below describe the historical design phase, not the current frontend implementation authorization.

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing React/Vite frontend and Vercel API, Google Apps Script backend. Approved scope: editable Figma design and a separate local React/Vite/Storybook preview in mealform-preview. Do not modify or deploy the production application.

## Users

School meal administrators using PCs and mobile browsers. Existing roles are owner, manager and viewer; the design must keep their permission boundaries.

## Product Purpose

Manage weekly meal menus, review OCR output from menu photos before creating a Form/Sheet, inspect submissions and safely manage registration state and history.

## Capabilities and Constraints

Preserve the nine existing administrative sections, week scope, authorized actions, confirmation steps, OCR drafts and response identity safeguards. No real data or configuration mutations during design review. Current request: desktop/mobile Figma and isolated Storybook preview, light/dark views, shadcn/ui components, Tokens Studio Free-compatible token sets, Style Dictionary compilation and opt-in Chromatic configuration.

## Brand Commitments

Vietnamese interface; brand primary comes from Settings rather than a fixed green. Existing quick commands and appearance controls remain reachable. No paid plugins, plan upgrades or Pro-only token workflows.

## Evidence on Hand

Dashboard.jsx, shared branding/appearance helpers and the user's attached overview screenshot. Proposed screens use labeled illustrative records, not live student/account data.

## Product Principles

- Make the active week and available task clear.
- Keep frequent tasks immediately reachable on mobile.
- Preserve all authorization and confirmation safeguards.
- Separate status, navigation and destructive actions.

## Open Decisions

Preview approval is not production implementation approval. Noto Sans and preview dependencies remain isolated. Chromatic cloud execution requires a separately configured project/token; Figma fidelity is not pixel-verified while the Starter tool quota is exhausted.
