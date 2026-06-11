Rename "Category stack" labels to "Spending Behavior" across the campaign builder UI.

## Scope
Two files, three string changes — no logic, no styling, no data-model changes.

## Changes
1. `src/components/tepilot/campaigns/sections/MessagePreviewsSection.tsx`
   - Line 29: `label: "Category stack"` → `label: "Spending Behavior"`
   - Line 146: `label="Category stacks × plays"` → `label="Spending Behavior × plays"`
2. `src/components/tepilot/campaigns/ProductCampaignBuilderView.tsx`
   - Line 43: `"category stacks × plays"` in the `howItWorks` prop → `"Spending Behavior × plays"`

## Out of scope
- The `STACK` enum key / `anchorFamily` value stays as-is (backend-facing, not user-facing).
- Icons, colors, and the `FormulaCell` component remain unchanged.