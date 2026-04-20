
## Goal
On the Next-Conversation tab, remove the top clutter so only the two columns (Regular Client | Wealth Client) show.

## Changes — `src/components/exec-demo/NextConversationRationale.tsx`

Remove three blocks (lines ~425–463) above the two-column grid:
1. **Signal context header** (lines 425–438) — "Signal: …" + "detected from … signal"
2. **In-tab signal switcher chips** (lines 440–463) — the row of signal pills (College Preparation, Home Purchase, Gambling, etc.)

Keep:
- The two-column split (Regular Client | Wealth Client)
- The "ALL SIGNALS" roll-up view (separate branch, untouched)

The container will still need `effectiveSignal` and `playbook` to drive the column content, so only the visual header/chips are deleted — logic stays.

## Out of scope
- No changes to the All-Signals view
- No changes to column content (Automated Flow, Chatbot, Advisor Brief, action pills)
- No prop signature changes
