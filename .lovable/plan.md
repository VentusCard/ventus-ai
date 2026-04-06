

## Make Customer Cards Bigger and Animate Selection

### What changes

**1. Bigger customer cards (`ExecDemoLeftPanel.tsx`)**

- Increase card padding from `px-3 py-2` to `px-4 py-3`
- Increase avatar from `w-6 h-6` to `w-8 h-8` with larger icon (`w-4 h-4`)
- Increase name text from `text-[11px]` to `text-[13px]`
- Increase subtitle from `text-[9px]` to `text-[11px]`
- Add the `lifestyleType` as a third line on each card (e.g. "Wellness Explorer")

**2. Animate selection: hide others, show transaction preview**

Currently, non-selected customers only hide when `phase !== "idle"` (after clicking "Behavioral Enrichment"). Change this so selecting a customer immediately:

- Animates the non-selected cards out (fade + collapse height over ~300ms)
- Shows only the selected card with a "Change" button
- Below the selected card, renders a static transaction preview (the first ~15 rows at 60% opacity, same as the current custom-mode idle preview)
- This gives immediate visual feedback that the customer is loaded

The "Change" button resets `selectedIdx` to `-1` (or a sentinel), which re-expands all cards with a fade-in animation.

**3. Fire edge functions on selection (already happens)**

`handleSelectCustomer` already calls `fireClassification(getCsvForCustomer(idx))` which fires the classify-transactions edge function in the background. No additional wiring needed — classification preloads as soon as a customer is picked.

### Files to edit

- `src/components/exec-demo/ExecDemoLeftPanel.tsx` — bigger cards, animated collapse/expand, transaction preview in idle state

### Technical details

- Use CSS `max-height` + `opacity` transitions (300ms) for the collapse animation instead of conditional rendering, so the exit is smooth
- Track a `confirmedIdx` local state: `null` = show all cards expanded, `number` = show only that card + preview
- On initial mount, `confirmedIdx` is `null` so all 7 cards display large
- When user clicks a card, set `confirmedIdx` → others animate out, preview appears
- "Change" resets `confirmedIdx` to `null` → all cards animate back in
- The `onSelectCustomer` callback fires immediately on click (which triggers `fireClassification`)

