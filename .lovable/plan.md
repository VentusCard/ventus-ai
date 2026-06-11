## Goal
Make Section 1 minimal: a single search bar by default. No list, no category chips visible until the user types. Once a product is selected, hide search entirely and show only the detail panel.

## Three states
1. **Idle (no query, no selection):** just a search input with placeholder "Search 44 products…". Optional 1-line helper text below ("Cards · Deposits · Lending · Wealth · Insurance"). That's it.
2. **Searching (query typed, no selection):** search input + dropdown-style results list directly under it (max ~8 rows, ~28px each, scrollable). Each row: icon · name · category · audience count. Click to select. Empty query collapses back to idle.
3. **Selected:** hide search and results. Show full-width detail panel with header (icon · name · category · audience · "Change product" ghost button on right) + mechanics tagline/fee + compact rate-card grid + 3-5 feature lines. "Change product" returns to idle.

## File
- `src/components/tepilot/campaigns/sections/ProductPickerSection.tsx` — single edit. Replace current list/grid + sticky detail layout with the three-state conditional above. Keep all data filtering, `fmt()`, and detail-panel content as-is. Remove category chip filter row (search covers it). Drop the 2-column grid wrapper.

No changes to other sections, catalog data, or parent view.
