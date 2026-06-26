## Add "Bank Product" source to System diagram

In `src/components/tepilot/insights/CapabilitiesView.tsx`:

1. Add a new entry to `SOURCE_GROUPS` titled **"Bank Product"** (provider: "Internal catalog · single source of truth"), with one sub-input listing the product catalog (credit cards, deposits, loans, wealth, insurance) sourced from `bankProductCatalog.ts`.
2. Make this group's card clickable — clicking the header navigates to the **Products** tab (via the same tab-switching mechanism used elsewhere in `AnalyticsContainer`). Add a small "Open Products →" affordance.
3. Pass an `onOpenProducts` callback from `AnalyticsContainer.tsx` into `CapabilitiesView` that sets the active tab to `products`.
4. Update the `NetworkWires` source count so the new group is included in the left-column wiring.

No other tabs or logic affected.