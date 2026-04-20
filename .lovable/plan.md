
## Goal
When the user switches between the three "Next-..." tabs (Next-Conversation, Next-Offer, Next-Product), always clear the active pill selection so each tab starts fresh.

## Investigation
The pill selection state lives in `ExecDemoIntelPanel.tsx` (`selectedSignal` / `activeRollup` / trigger state). The active tab state lives in the parent (`ExecDemoPage.tsx` or `ExecDemoIntelPanel.tsx`).

## Plan
1. **`src/components/exec-demo/ExecDemoIntelPanel.tsx`** — add a `useEffect` keyed on the active tab that resets:
   - `selectedSignal` → `null`
   - `activeRollup` → `null` (or default)
   - any active life-event / risk trigger state
   - any pending AI prompt nonce (do NOT bump nonce on reset)
2. Verify the reset does NOT close the AI Assistant phone (assistantOpen stays as-is) and does NOT clear generated offers/cards (those are pre-computed per customer).

## Out of scope
- Customer switching (already resets everything).
- Phone collapsed state.
- Generated offer/card data.
