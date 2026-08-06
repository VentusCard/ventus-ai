# Remove Merrill Growth Desk from /bankdemo

## Goal
Remove the "Merrill Growth Desk" tab from the `/bankdemo` sidebar so it no longer appears as a navigable section inside the bank demo.

## Current state
- `/bankdemo` renders `BankAnalyticsDashboard`, which mounts `AnalyticsContainer`.
- `AnalyticsContainer` sidebar has a "WEALTH & RELATIONSHIP" group containing `{ value: "wealth-growth", label: "Merrill Growth Desk", icon: Briefcase }`.
- Selecting that tab renders `EnterpriseGrowthDemoPage` embedded with `audience="leadership"`.
- `EnterpriseGrowthDemoPage` remains used elsewhere (`/demo/enterprise`, `/internal/growth-desk`, console protected demo), so the page itself is preserved.

## Changes
1. `src/components/tepilot/insights/AnalyticsContainer.tsx`
   - Remove `"wealth-growth"` from the `TabValue` union type.
   - Remove the `{ value: "wealth-growth", label: "Merrill Growth Desk", icon: Briefcase }` nav item from `NAV_GROUPS`.
   - Remove the `case 'wealth-growth':` render branch.
   - Remove the `EnterpriseGrowthDemoPage` import if it becomes unused in this file.

## Out of scope
- `EnterpriseGrowthDemoPage.tsx` is not deleted or modified.
- `/demo/enterprise`, `/internal/growth-desk`, and console demo routes remain unchanged.
- Other "Merrill" references in `BankContextView`, `AdvisorConversationThread`, etc. are unrelated to the `/bankdemo` sidebar tab and are left untouched.

## Verification
- Run TypeScript check to ensure no orphaned `wealth-growth` tab references.
- Open `/bankdemo` and confirm the sidebar no longer shows "Merrill Growth Desk" under "WEALTH & RELATIONSHIP".
