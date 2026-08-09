# Reorganize /bankdemo left sidebar

Restructure the sidebar navigation in `/bankdemo` so related items are grouped under two new section labels.

## What will change

1. **New "Customer Intelligence" section**
   - Merges the current **Customers** and **Intelligence** groups.
   - Contains: Customer Insights, Risk Signals, Ventus AI Dashboard, Reports & Query.

2. **New "Personalization Orchestration" section**
   - Merges the current **Deals & Rewards**, **Product & Growth**, and **WEALTH & RELATIONSHIP** groups.
   - Contains, in order: Next-Deal Intelligence, Deals & Perks, Gamification, Automated Flows, Campaign Builder, Next Product, Relationship Intelligence, AI Banking Assistant, WM Coworker.

3. **Unchanged section**
   - Home (System, Bank Context, Demo, Governance)

Result: three sidebar sections total — Home, Customer Intelligence, Personalization Orchestration.

## Files to update

- `src/components/tepilot/insights/AnalyticsContainer.tsx`
  - Rebuild `NAV_GROUPS` with the two new section labels and item order.
  - Update the module-filter fallback logic that hardcodes allowed group labels for the always-on Analytics module.
- `src/types/demo.ts`
  - Update `MODULE_NAV_GROUP_MAP` so Analytics maps to `"Customer Intelligence"`, and Rewards/Relationship map to `"Personalization Orchestration"`.


## Validation

- Run TypeScript typecheck to confirm no broken tab-value references or missing imports.
- Verify in preview that the sidebar renders the new groups and active-tab expansion still works.
