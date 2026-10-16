# Draft tools and contextual UI

Approved 2026-10-16: all ten selected capabilities, five groups, autonomous specs/plan/tasks/implementation/testing, merge main and production. No extra preview approval gate.

| Module id | Responsibility (user item order) | Depends on |
| --- | --- | --- |
| draft-inspection | Original/current cell diff, simulated registration (1,4) | — |
| draft-transfer | Mapped TSV paste, confirmed day meal copy, grouped Undo (5,9) | draft-inspection |
| focused-workspaces | Focused editor and PC side/mobile full quick view (2,6) | — |
| context-status | Week option metadata, RAM session messages, honest offline readonly state (3,7,10) | — |
| on-demand-guide | Explicit 3–4-step contextual walkthrough (8) | all above |

Order: draft-inspection → draft-transfer → focused-workspaces → context-status → on-demand-guide. Retain existing semantic branding, APIs/GAS v79, permissions, exact destructive identities, CAS, confirmations, draft/Undo and prior responsive accessibility. No dependency, cloud draft sync, live test mutations or offline mutation queue. Existing PRODUCT.md preview/staging paragraphs are historical; current explicit approval governs this bundle.
