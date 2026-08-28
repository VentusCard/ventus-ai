# Activation Destinations: Trim List & Match Menu Tab Names

## Goal
In `/bankdemo` → System tab → "Activation destinations" column: remove two cards and rename the rest so each destination name exactly matches the left-nav tab it links to.

## Changes (`src/components/tepilot/insights/CapabilitiesView.tsx`)

1. **Remove** from `DESTINATIONS`:
   - "Local Merchant Deals"
   - "Loyalty & Retention"

2. **Rename** remaining destinations to match nav labels (nav labels from `AnalyticsContainer.tsx`):
   ```text
   Intelligence Database        (unchanged)            → ventus-ai-dashboard
   Ventus AI Coworker           → AI Coworker           → wm-copilot
   Personalized Relationship    (unchanged)             → personalized-relationship
   Automations Campaign         → Automated Flows       → targeting-automated-flows
   Custom Product Builder       → Campaign Builder      → targeting-campaign-builder
   Personalized Product Offer   → Personalized Product  → targeting
   Personalized Reward Program  → Personalized Deals    → personalized-deals
   ```
   (`tab` and `tabLabel` fields stay as-is; only `name` changes.)

3. Column header meta (if it shows a count) updates automatically from the array length — verify it reads 7 if a count is displayed.

## Out of scope
- No changes to nav structure, routing, or the walkthrough flow.
- No style changes.

## Verification
- `/bankdemo` System tab shows 7 destination cards, each named exactly like its target left-nav tab, and each arrow button still navigates correctly. Build passes.
