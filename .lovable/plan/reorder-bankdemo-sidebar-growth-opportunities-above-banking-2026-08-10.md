# Reorder /bankdemo sidebar: Growth Opportunities above Banking Personalization

## What will change

In the left sidebar of `/bankdemo`, the **Growth Opportunities** section will appear immediately after **Customer Intelligence** and before **BANKING PERSONALIZATION**.

Current order:
```text
VENTUS AI
Customer Intelligence
BANKING PERSONALIZATION
Growth Opportunities
```

New order:
```text
VENTUS AI
Customer Intelligence
Growth Opportunities
BANKING PERSONALIZATION
```

## Files to update

- `src/components/tepilot/insights/AnalyticsContainer.tsx`
  - Reorder the `NAV_GROUPS` array entries so the `Growth Opportunities` group object precedes the `BANKING PERSONALIZATION` group object.
  - Update the `filteredNavGroups` Analytics fallback (around line 190) to also allow the `"Growth Opportunities"` label, keeping it consistent with the other Analytics-derived sections.

## Validation

- TypeScript typecheck to confirm no broken references.
- Preview `/bankdemo` and confirm the sidebar renders the new section order and active-tab expansion still works.
