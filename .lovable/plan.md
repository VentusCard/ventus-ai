### Remove Analytics & Targeting, rename Merchant Deals, and reorder teams

1. **Remove "Analytics & Targeting"** from the `TEAMS` array in `CapabilitiesView.tsx` (lines 266-310). Remove unused `BarChart3` import.
2. **Rename "Merchant Deals" → "Deals & Rewards"** and update its description from merchant-sourcing language to rewards-and-offers language (lines 311-360).
3. **Reorder `TEAMS` array** to: Product & Growth → Wealth Management → Deals & Rewards.
4. **Update downstream wiring** (`getTeamDestinations`, `DESTINATIONS`) — "Deals & Rewards" already maps to Rewards Provider + Digital Banking App; no change needed.
5. **Update `howItWorks` copy** (line 731) to reference 3 teams with correct names: Product & Growth, Wealth Management, and Deals & Rewards.
6. **Verify build** passes cleanly with `npx tsc --noEmit`.