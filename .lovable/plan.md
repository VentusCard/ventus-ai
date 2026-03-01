

## Restyle Trips View as Cards (Matching Subcategory Cards)

### What Changes

When the "Trips" toggle is active in the Travel & Exploration detail breakdown, the trips currently render as collapsible list items (`TripSection` components). Instead, they should render as a grid of cards matching the same visual style as the subcategory cards (like "Hotels & Lodging", "Flights", etc.).

Each trip card will show:
- Trip destination name (like the subcategory name)
- Total spend (bold, large)
- Date range and duration
- Transaction count and a percentage-of-pillar bar

Clicking a trip card will expand it inline or open a detail view showing the day-by-day transactions (reusing existing `TripSection` expand logic).

### Technical Changes

**File: `src/components/tepilot/insights/PillarExplorer.tsx`** (lines ~271-293)

Replace the current trips view that renders `<TripSection>` in a vertical `space-y-3` list with a grid layout matching the subcategories grid:

1. Change the container from `<div className="space-y-3">` to `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">`
2. Replace each `<TripSection>` with a card-style `<div>` that mirrors the subcategory card structure:
   - `p-4 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors`
   - Destination as title (`font-medium text-sm mb-2`)
   - Total spend (`text-xl font-bold mb-1`)
   - Date range and transaction count as small text
   - A progress bar showing percentage of total travel spend
3. Clicking a trip card will set a selected trip state, which expands the `TripSection` collapsible below the grid (similar to how subcategory click opens a modal)
4. Add a `selectedTrip` state variable to track which trip is expanded
5. Below the grid, conditionally render the expanded `TripSection` for the selected trip

### No other files affected

All changes are contained within `PillarExplorer.tsx`. The existing `TripSection` component is reused for the expanded detail view.

