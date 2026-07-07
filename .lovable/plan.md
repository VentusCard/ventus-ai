## Goal
Restrict the FCRA / non-FCRA labels so they only appear in the **External Intelligence** source group detail panel. Remove them from Signal families, Team workflows, and all other source groups (KYC, Transactions, Product Holdings, Digital Banking, Bank Context).

## Current Behavior
In `CapabilitiesView.tsx`, the detail-item renderer (lines ~1102–1139) shows an FCRA or non-FCRA badge for **every** item when a non-team detail is active (`!activeTeam`). This incorrectly applies the label to:
- Signal families (Life Event, Behavioral, Financial, Demographic, Risk)
- All source groups other than External Intelligence

## Proposed Change

1. **Render logic** — In the item-mapper inside the `!activeTeam` block, wrap the FCRA/non-FCRA badge in a condition:
   ```tsx
   {activeSourceLabel === "External Intelligence" && (
     <span …>{itemFcra ? "FCRA" : "non-FCRA"}</span>
   )}
   ```
   When the active detail is a signal family or any other source group, no badge is rendered.

2. **Data clarity** — Add `fcra: false` explicitly to all External Intelligence inputs that are not already marked `fcra: true`, so the fallback logic is unambiguous.

## Files Modified
- `src/components/tepilot/insights/CapabilitiesView.tsx`

## Verification
- Open System tab → click **External Intelligence** → confirm each input shows either FCRA or non-FCRA.
- Click **KYC**, **Transactions**, **Product Holdings**, **Digital Banking**, **Bank Context** → confirm no FCRA/non-FCRA badges appear.
- Click any **Signal family** (e.g., Life Event) → confirm no badges appear.