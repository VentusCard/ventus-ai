

## Merge Trip Cards Into Subcategory Grid (Trips View)

### What Changes

When the "Trips" toggle is active in Travel & Exploration, instead of showing trip cards in a separate section, the trip cards will appear as the **first cards** in the same subcategory grid (before "Hotels & Lodging", "Flights", etc.). This gives users a unified view of both trips and subcategories, letting them see the full spending picture and adjust budget numbers in one place.

### Technical Changes

**File: `src/components/tepilot/insights/PillarExplorer.tsx`**

1. **Remove the separate trips block** (lines ~274-324) that currently renders a standalone "Detected Trips" section with its own grid.

2. **Modify the categories view condition** (line 210) so subcategories always render when Travel & Exploration is selected (remove the `travelViewMode === "categories"` gate).

3. **Insert trip cards at the top of the subcategory grid** when `travelViewMode === "trips"`: Before mapping over `subcategories`, render each detected trip as a card with the same styling (`p-4 rounded-lg bg-slate-50 border...`) but with a subtle purple accent to distinguish trips from subcategories. Each trip card shows destination, total spend, date range, duration, transaction count, and percentage bar.

4. **Keep trip expand behavior**: Clicking a trip card sets `selectedTripIdx`, which renders the `TripSection` detail below the grid (before "Recent Transactions").

5. **Keep subcategory click behavior**: Clicking a subcategory card still opens the `SubcategoryTransactionsModal` as before.

### Result

Toggling "Trips" shows: `[Trip: Tokyo] [Trip: Paris] [Hotels & Lodging] [Flights] [Car Rentals] ...` all in one grid. Users see both trip-level and category-level spending together, with budget editing available on all cards.

