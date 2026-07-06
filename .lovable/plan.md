## Move Deliverables Block Above Capability Cards & Darken Text

### What we're changing
In the Coworker Inbox capabilities panel (`CoworkerInboxView.tsx`), the two-row **Advisor / Leadership deliverables block** currently sits below the 6 capability cards. We will move it above the cards and darken its body text.

### Current layout (expanded capabilities panel)
1. 6 capability cards in a 3-column grid
2. Two-row deliverables block (Advisor pill + text, Leadership pill + text)

### New layout
1. Two-row deliverables block (Advisor pill + text, Leadership pill + text)
2. 6 capability cards in a 3-column grid

### Text darkening
Change the body text color in the deliverables block from `text-slate-600` to a darker shade (`text-slate-700` or `text-slate-800`) for better readability.

### Files touched
- `src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx` — reorder the JSX block and update text color class.