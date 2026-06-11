# Remove the Audience filters sidebar from Section 1

Drop the right-hand filters panel entirely so Section 1 goes back to a single full-width column with just the product search and selected-product detail.

## Change

In `src/components/tepilot/campaigns/sections/ProductPickerSection.tsx`:

- Remove the `grid grid-cols-10` wrapper and the `<aside>` filters block.
- Restore the original single-column layout for the search input, results dropdown, and the selected-product detail card.
- Remove the now-unused state (`age`, `income`, `gender`, `region`, `household`, `resetFilters`, `toggleHousehold`), the `HOUSEHOLD_TYPES` constant, and the unused imports (`Slider`, `Checkbox`, `ToggleGroup`/`ToggleGroupItem`, `Select` family, `SlidersHorizontal`).

No other files touched.
