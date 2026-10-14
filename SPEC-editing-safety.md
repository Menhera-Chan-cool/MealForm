# editing-safety
## Objective
Selected ideas 5/7. Show unsaved state for brand/notice drafts and warn on internal section/week/sign-out/command navigation and actual browser unload. Cancel preserves all edits; explicit discard resets the correct draft. Save failure retains dirty state/text and offers retry. OCR reviewed-day markers are local presentation only: only valid complete/acknowledged days may collapse; edits/Undo/Redo/re-OCR/date fill reopen changed or invalid days and never waive validation.
## Commands / structure
Shared commands. useUnsavedChanges.js, WeekNoticeEditor, Dashboard, ComfortProvider/VersionNotice callback handling, OcrReviewDay.jsx/ui-clarity helpers.
## Style
Reuse native confirmation and beforeunload, no second save store or autosave backend. Markers keyed to each day's full content snapshot, not names or date alone. No key/value leaks into URLs or title.
## Tests
Brand/notice unsaved flag, cancel/discard tab/week change, sign-out, browser beforeunload attachment, command cancel, version refresh cancel, reload notice and save error/retry. OCR invalid day cannot collapse; changed content/validation state reopens; collapsed controls cannot focus; meals, Undo and final create payload untouched.
## Boundaries / success
No new server writes or API contract changes; existing notices optimistic revision/owner guard remain. Avoid duplicate prompts on one navigation. Original OCR local drafts and explicit create confirmation remain independent of presentation review markers. Never clear a failed-save draft or auto-publish a reviewed day.
