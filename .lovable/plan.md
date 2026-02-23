

# Move Integration Diagram Button to TePilot Tool Pages

## Overview
Remove the Integration Diagram button from the marketing pages (Enrichment, SmartRewards, Wealth) and add it to the actual TePilot tool pages instead.

## Page-to-Variant Mapping
- **TePilot main page** (`/tepilot`) -- variant: `enrichment` (this IS the transaction enrichment tool)
- **Advisor Console** (`/tepilot/advisor-console`) -- variant: `wealth` (Wealth Management CoPilot)
- **Rewards Pipeline** (`/tepilot/rewards-pipeline`) -- variant: `rewards` (deal/reward personalization tool)

## Changes

### Remove button from marketing pages
1. **`src/pages/Enrichment.tsx`** -- Remove the `IntegrationDiagramButton` import and usage from the h1 area
2. **`src/pages/SmartRewards.tsx`** -- Same removal
3. **`src/pages/Wealth.tsx`** -- Same removal

### Add button to TePilot tool pages
4. **`src/pages/TePilot.tsx`** -- Add `IntegrationDiagramButton variant="enrichment"` in the header area (near the title/version badge at the top of the authenticated view)
5. **`src/pages/AdvisorConsolePage.tsx`** -- Add `IntegrationDiagramButton variant="wealth"` next to the "Wealth Management Copilot" title in the top nav bar (line 251)
6. **`src/pages/RewardsPipelinePage.tsx`** -- Add `IntegrationDiagramButton variant="rewards"` next to the back button or as a header element

### No changes needed
- `IntegrationArchitectureDialog.tsx` and `IntegrationDiagramButton.tsx` stay as-is
