
## Goal
On the **Next Offer** tab (executive demo intel panel), gray out all risk-related persona pills in the Behavioral Intelligence section to signal they are not applicable for offer generation.

## Investigation
- `ExecDemoIntelPanel.tsx` renders the persona pills row above the tab body.
- Pills come from multiple sources: rollup signals, life events, **risk flags** (`riskFlags.flags`), and segments.
- Active tab state lives in the same panel (`analytics | rewards | product | relationship`). The "Next Offer" tab = `rewards`.
- Risk pills are rendered with their own styling/handler — I need to confirm which pill block corresponds to risk and add a conditional disabled/grayed style when `activeTab === "rewards"`.

## Change

### `src/components/exec-demo/ExecDemoIntelPanel.tsx`
- Identify the risk pill render block (the one iterating over `riskFlags.flags` / driven by risk kind).
- When `activeTab === "rewards"`:
  - Apply grayed-out styles: `opacity-40`, `grayscale`, `cursor-not-allowed`, neutral slate background/border instead of the risk color.
  - Disable the click handler (no-op or `pointer-events: none`).
  - Add a `title`/tooltip: "Not applicable for offers".
- All other tabs: pills render normally (full color, clickable).

No changes to other tabs, no logic changes to offer generation, no edge function edits.

## Files touched
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — single conditional styling block on the risk pill map.

## Out of scope
- No changes to life event / rollup / segment pills.
- No changes to the offer generation pipeline or filtering logic.
