
## Goal
Keep the existing **Regular | Wealth** two-column split in the Next-Conversation tab, but: (a) make it use the full panel width better, (b) treat every customer as wealth-eligible (drop greying-out), (c) add a "Open WM Copilot" button in the Wealth column, and (d) drive the tab response off the top signal pills, including pulling concierge/standard action pills from `generate-product-actions`.

## Changes

### 1. `NextConversationRationale.tsx` — refine, don't rewrite
Keep the 2-column grid (Regular left / Wealth right). Within each column, expand content to fill width:

```text
┌─────────────────────────────────────────────────────────┐
│ Signal context bar (kind tag · label · evidence)        │
│ [in-tab signal switcher chips: swap signal w/o scroll]  │
├──────────────────────────┬──────────────────────────────┤
│ REGULAR CLIENT           │ WEALTH CLIENT                │
│ • Automated flow card    │ • Advisor brief card         │
│   - channel, subject     │   - recipient, outreach SLA  │
│   - 3-step sequence      │   - 3 talking points         │
│ • AI Chatbot context     │ • Concierge Touch pills      │
│   - knows / can answer   │   (tone='wow' from actions)  │
│                          │ • Standard Response pills    │
│                          │   (tone='standard')          │
│                          │ ┌──────────────────────────┐ │
│                          │ │ ▶ Open WM Copilot        │ │
│                          │ └──────────────────────────┘ │
└──────────────────────────┴──────────────────────────────┘
```

- Remove `isWealthClient` gating + the "Not active — regular client" footnote. Wealth column always fully active.
- Add new props: `productActions`, `actionsLoading`, `productCards`, `onOpenWMCopilot`.
- Match each `selectedSignal.label` to a `productCards[i].signal_label` (substring, case-insensitive) → render `productActions[i].actions` as Concierge (`tone==='wow'`) and Standard (`tone==='standard'`) pill rows in the Wealth card. Reuse icon/color maps from `NextProductRationale.tsx` (duplicate locally, ~30 lines).
- Add "Open WM Copilot" button at the bottom of the Wealth column → calls `onOpenWMCopilot(customerFirstName, selectedSignal)`.

### 2. `ExecDemoIntelPanel.tsx` — wire pills + actions + WM handoff
- Pass `productActions`, `actionsLoading`, `productCards`, `onOpenWMCopilot` through to `<NextConversationRationale />`.
- When the **relationship** tab is active, top pill clicks (rollup, life event, risk, segment) should also `setSelectedSignal(...)` so the tab body re-renders for that signal. Today the handlers only update other tabs' state.
- `onOpenWMCopilot`: navigate to existing WM Copilot route (reuse the same flow as the analytics dashboard launch — see `mem://features/wealth/copilot-launch-workflow`). Pass selected customer + signal in router state so the copilot opens scoped to that client/signal.

### 3. No edge function changes
Reuses `generate-product-actions` response already loaded at page level.

## Files touched
- `src/components/exec-demo/NextConversationRationale.tsx` — refactor render body, add 4 new props, drop `isWealthClient` gating, add WM Copilot button + dynamic action pills.
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — pass new props, wire pill clicks → `selectedSignal` when relationship tab is active, implement `onOpenWMCopilot` handler.

## Out of scope
- No backend/edge function edits.
- No changes to Next-Offer / Next-Product tabs or the persona pill row above the tab bar.
- No new WM Copilot screens — reuses the existing route and sign-in mock.
