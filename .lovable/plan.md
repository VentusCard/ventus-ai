
## Goal
When the user switches to the **Next Conversation** tab in the executive demo intel panel, the phone mockup should auto-switch to the **AI** tab.

## Investigation
- `ExecDemoIntelPanel.tsx` owns the tab state for the right panel (`analytics | rewards | product | relationship`).
- `ExecDemoPhoneView.tsx` receives an `activeTab` prop and maps it to a `consumerTab` via `TAB_MAP` (currently `relationship → relationship`). It also has a local `useEffect` that syncs `consumerTab` to the mapped `activeTab` whenever it changes.
- The phone has 4 tabs: `rewards`, `product`, `relationship`, `ai`. So we just need the relationship tab in the intel panel to map to `ai` instead of `relationship` on the phone.

## Change
**`src/components/exec-demo/ExecDemoPhoneView.tsx`**
- Update `TAB_MAP.relationship` from `"relationship"` to `"ai"`. That single change makes the phone jump to the AI tab whenever the user clicks the Next Conversation (relationship) tab in the intel panel, via the existing `useEffect` sync.

That's it — one line change, no other files affected.
