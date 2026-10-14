# MealForm interaction motion — 14/10/2026

Extend the current Operate UI, not its visual identity or behavior. No new dependency, backend/OAuth/configuration change, scroll reveal or decorative loop. Stage and obtain visual approval before merge/production promotion.

## Motion thesis

- Focal interaction: the active menu unfolds beside its trigger, making the relationship between control and choices clear. Exit is faster than entry; repeated toggles can interrupt immediately.
- Continuity: a short, already-visible crossfade acknowledges replaced tab/filter content. Mobile secondary fields and selected filter chips get a bounded local reveal, not a whole-page entrance. Cards acknowledge pointer/keyboard focus with their existing brand border, not hover lift.
- Feedback: a short press response for enabled controls and a spinner only while an actual operation is busy. Loading, errors, confirmations and disabled controls retain their current semantics and callbacks.
- Budget: approximately 120ms press, 220ms menu entry, 160ms exit, 180ms content acknowledgment. No stagger across response rows, unbounded blur, layout-driving height animation or permanent will-change. Existing authored Form status animation remains unchanged.
- Full: spatial menu reveal and press feedback. Light: short opacity/color feedback, no spatial movement or decorative sequences. Off: immediate state changes, no animations/transitions. OS reduced motion keeps the existing default/explicit-user-override rules.

## Implementation/acceptance

Use a small shared CSS layer after production UI styles; reuse existing native popovers/dialogs and disclosure state. CSS disclosure timing and the existing close timer must agree. Without the new CSS or modern discrete-transition support, controls still open/close and remain accessible.

Verify actual animations at intermediate times, not just settled screenshots: opening, quick close/reopen, Escape/outside closure, keyboard focus restoration, busy state, all three preferences and OS reduction. Check PC/mobile light/dark layouts, unchanged selected week/filter/sort, no writes on canceled confirmation and no document overflow. Capture time samples of the authored menu/confirmation interaction and run the existing regression suite. Keep consent/session/response identity safeguards unchanged.
