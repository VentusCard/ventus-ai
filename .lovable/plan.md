# Show Key Features content after customer selection

In `/bankdemo` → Personalized Deals, ensure the content inside the **Key features** section remains visible after a customer is selected.

## Plan

1. Audit `src/components/tepilot/insights/CustomerMockupPanel.tsx` and `src/components/tepilot/insights/personalization/SurfaceFeaturePanel.tsx` for any customer-selection conditionals that could suppress the Key Features list or Unit Economics card.
2. Make the `FEATURES[surface]` items and `UnitEconomicsCard` render independently of whether a customer is selected.
3. Keep the existing three-column layout and heights unchanged so the workspace does not shift when a customer is picked.
4. Verify via preview that the middle column still shows the Key Features content after selecting a customer (e.g., Ricky Alvarez).
