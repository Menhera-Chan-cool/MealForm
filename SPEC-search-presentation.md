# search-presentation
## Objective
Selected ideas 1/6/9/13. Highlight literal matched text without changing values, including accent-folded Vietnamese name/option search. Translate known technical headers only at display. Clear only the active query/field; committed week selection must survive query clearing. Recognize external Form/Sheet/folder/support links consistently without changing destination, target, security attributes or authorization.
## Commands / structure
Shared commands in CAPABILITY-MAP-ui-clarity.md. New pure display helpers in ui-clarity.mjs, SearchHighlight.jsx, SearchInput.jsx and ExternalLink.jsx; existing ComboSelect, DetailTable, ViewerSummary, Dashboard/ResponseMeals and link callers.
## Style
Example: `return ranges.map(part => part.match ? <mark>{part.text}</mark> : part.text);` React escaping only. Small presenters; no regex interpolation from user text, storage or API transformations.
## Tests
Literal punctuation, accents/composed marks/emoji, repeated matches, empty/ALL query, untouched text round-trip and no HTML execution. Clear names while retaining day/meal; clear week query without changing key. Verify original delete IDs/payloads. External icon has accessible new-tab hint, never an icon-only link.
## Boundaries / success
No changes to filtering rules, source headers or record identity. No fake authorization or URL repair. Existing known labels become readable Vietnamese; unknown custom headers remain intact. All new clear controls are labelled and reachable by keyboard.
