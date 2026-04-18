

## Goal
Two adjustments to the redesigned Next Conversation tab:
1. Remove the duplicate pill selector inside `NextConversationRationale` — the user already clicks the persona rollup pills above the panel
2. Change layout from stacked (Regular block on top, Wealth block below) to a vertical split (Regular on left, Wealth on right)

## Changes

### 1. `NextConversationRationale.tsx`
- Remove the `SelectorBar` component and its rendering (both in "All Signals" view and the detailed view)
- Keep the `selectedSignal` prop — selection is still driven externally by the pills in `ExecDemoIntelPanel`
- Remove `availableSignals` and `onSelectSignal` props (no longer needed for rendering)
  - Keep `availableSignals` only for the "All Signals" roll-up list
- Restructure the detailed view from two stacked sections to a 2-column vertical split:

```text
┌──────────────────────────────────────────────────────────┐
│ Signal: Home Buyer · detected from escrow + title fees   │
├────────────────────────────┬─────────────────────────────┤
│ REGULAR CLIENT             │ WEALTH CLIENT (+)           │
│ ──────────────             │ ──────────────              │
│ ┌─ Automated Flow ───────┐ │ ┌─ Advisor Notification ─┐ │
│ │ 📧 Email subject       │ │ │ 🔔 Sent to: advisor    │ │
│ │ Trigger logic          │ │ │ Prep brief bullets:    │ │
│ │ Sequence steps         │ │ │  • Estate plan         │ │
│ └────────────────────────┘ │ │  • Mortgage analysis   │ │
│ ┌─ AI Chatbot Context ───┐ │ │  • Liquidity timing    │ │
│ │ 💬 Knows / Can answer  │ │ │ Outreach: 48h          │ │
│ └────────────────────────┘ │ └────────────────────────┘ │
└────────────────────────────┴─────────────────────────────┘
```

- Vertical divider: `border-l border-slate-200` on the right column
- Headers stay color-coded (blue for Regular, purple for Wealth)
- Wealth column keeps the dimmed/dashed treatment when `!isWealthClient`

### 2. `ExecDemoIntelPanel.tsx`
- Stop passing `onSelectSignal` and `availableSignals` (or pass `availableSignals` only for the All-Signals roll-up case)
- Persona pills above the tab content remain the single selection control (already implemented)

## Out of scope
- No changes to playbook content / mappings
- No changes to pill behavior in the parent panel
- No changes to other tabs

## Expected result
- One set of clickable pills (above the tab), no duplicate selector inside the panel
- Regular orchestration on the left, Wealth orchestration on the right, separated by a clean vertical divider
- "All Signals" view becomes a clean stacked roll-up without its own selector bar

