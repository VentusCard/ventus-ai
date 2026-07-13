
# Plan: Reorder /bankdemo System tab destinations

## Context
The `/bankdemo` → **System** tab (`CapabilitiesView.tsx`) renders a network diagram with:
- Left column: data sources (KYC, Transactions, etc.)
- Center: Ventus AI Behavioral Intelligence Core
- Right column: activation destinations defined in the `DESTINATIONS` array

The right-hand destination nodes currently appear in this order:
1. CRM
2. Rewards Provider
3. Digital Banking App
4. Marketing Automation
5. Advisor Console
6. AI Banking Assistant

## Change
Reorder the `DESTINATIONS` array in `src/components/tepilot/insights/CapabilitiesView.tsx` to:
1. **Digital Banking App** (label shown as "Digital Banking")
2. **Marketing Automation** (label shown as "Automation")
3. **CRM**
4. **Rewards Provider** (label shown as "Rewards")
5. **AI Banking Assistant** (label shown as "Banking Assistant")
6. **Advisor Console** (label shown as "Advisor")

This only changes the display order of the existing nodes; no labels, icons, or wiring logic are modified. The `getTeamDestinations` helper already filters by label, so team-specific destination highlighting continues to work.

## Verification
- Open `/bankdemo` → **System** tab.
- Confirm the right-hand column reads top-to-bottom: Digital Banking, Automation, CRM, Rewards, Banking Assistant, Advisor.
- Click each team node in the core (Product & Growth, Wealth & Relationship, Deals & Rewards) and confirm the highlighted destinations still match the team's workflow.
