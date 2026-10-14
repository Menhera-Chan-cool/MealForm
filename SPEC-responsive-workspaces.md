# responsive-workspaces
## Objective
Selected ideas 3/11/12. Mobile auxiliary filters open in a native bottom dialog sheet with visible close, focus return, Escape/backdrop close, keyboard-safe scrolling. Same filter values survive close/reopen and viewport changes. PC table expands in place to a fixed large workspace, retains the very same controls/table DOM and scroll; close/Escape returns focus/position. Existing action confirmations keep Cancel/Confirm visible when content/keyboard reduces usable height.
## Commands / structure
Shared commands. FilterControls, TableWorkspace.jsx, ActionConfirmation, scoped clarity CSS; App/Dashboard table callers. No dependency.
## Style
Use the existing native dialog pattern, visualViewport height where available, and brand tokens. Do not move a CSS-sticky toolbar into a nested transformed scroll surface. Accessible dialogs have names and exit controls; 44px targets.
## Tests
Mobile open/close/clear and preserved filters, outside click/Escape, resize to desktop and back; large text, dark/light, small viewport/keyboard-height simulation. Expansion preserves selected filters/query/sort and exact DOM/scroll on close; unavailable on mobile; Escape does not steal an active child confirmation. Long confirmation text/reason scrolls while actions stay visible; original confirmation payload and cancel remain unchanged.
## Boundaries / success
No API reads/writes caused by expanding/closing. No duplicate interactive table or alternate mutable snapshot. Do not request fullscreen permissions. Preserve native Form controls, validation, row IDs and cache verification gates.
