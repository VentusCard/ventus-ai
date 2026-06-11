## Problem
Right now "Change product" sets `productId = ""`, which hides sections 2 (Exclusion Funnel) and 3 (Message Previews) since the parent gates them on `product` existing. User wants the full workflow visible at all times.

## Fix
Keep a product always selected (parent already defaults to `category-cashback-card`). Restructure Section 1 so the search bar is **always visible** above the detail panel, not toggled by selection state.

### Section 1 layout (always)
- Header row: step badge, "Pick a product", count badge.
- Search input (always visible, full width, compact h-8).
- When the user types → dropdown results appear directly below the input; clicking a result swaps the selected product and clears the query.
- Detail panel of the currently selected product always rendered below (icon, name, category, eligible count, positioning, mechanics tagline + fee, rate card 2-col, key features 2-col).
- Remove the "Change product" button (no longer needed — search is always there).

### Sections 2 + 3
Unchanged. They always render against the current `product`.

## File
- `src/components/tepilot/campaigns/sections/ProductPickerSection.tsx` — single edit. Remove the `selected ? detail : search` branch. Render search input + (optional results dropdown) + detail panel sequentially. Drop the `onSelect("")` clear button and the `X` import.

No changes to `ProductCampaignBuilderView`, catalog data, or sections 2/3.
