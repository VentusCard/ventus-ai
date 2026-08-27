# Regroup /bankdemo System tab data sources into Internal and External signals

## Problem
In `/bankdemo` → **System** tab, the **Data sources** column currently lists five source cards:
- Banking Core
- Digital Banking
- External Intelligence 1
- External Intelligence 2
- Bank Context

The user wants to remove the **Bank Context** card and organize the remaining four cards under two labeled groups: **Internal signals** and **External signals**.

## Proposed change

Update `src/components/tepilot/insights/CapabilitiesView.tsx`:

1. **Remove the "Bank Context" source group** from `sourceGroups` (lines ~842-880), including its `onOpen`/`openLabel` product-catalog link.
2. **Introduce a two-section data-source layout** in the left column:
   - **Internal signals**
     - Banking Core
     - Digital Banking
   - **External signals**
     - External Intelligence 1
     - External Intelligence 2
3. **Render each section with a small mono uppercase eyebrow** (e.g., "Internal signals · 2") above its cards, matching the existing slate-600 / 11.5px caption style.
4. **Update the column meta** from `{sourceGroups.length} groups · {totalSourceInputs} sources` to `2 groups · {totalSourceInputs} sources` (or keep the count derived from the top-level sections).
5. **Preserve existing card styling and interactions**: source cards keep their sky/amber tint logic, click-to-select detail panel, and the active-source ring state.
6. **Remove any detail-panel rendering path** that depended on the deleted Bank Context group, ensuring the panel still works for the four remaining sources.

## Style rules

- Strict light theme; no `dark:` utilities.
- Section eyebrows use the same `font-mono text-[11.5px] uppercase tracking-wider text-slate-600` treatment already in the column header.
- Maintain the current 10% taller pipeline board proportions and card spacing.

## Files changed

- `src/components/tepilot/insights/CapabilitiesView.tsx`

## Verification

Load `/bankdemo` → **System** tab and confirm:
- The Data sources column shows only four cards.
- "Internal signals" and "External signals" section labels appear above the correct cards.
- The header count and group label are accurate.
- Clicking each source still opens the detail panel with the right inputs.
