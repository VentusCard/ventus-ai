
## Show Subcategories When a Trip is Selected

### What Changes

When a trip card is clicked in the Trips view, in addition to the `TripSection` detail, also render the subcategory cards grid below it. This lets the user see both the selected trip's day-by-day breakdown and the standard subcategory breakdown (Hotels & Lodging, Flights, etc.) simultaneously.

### Technical Changes

**File: `src/components/tepilot/insights/PillarExplorer.tsx`** (~lines 317-321)

After the `TripSection` render block for the selected trip, add the subcategories grid. Specifically:

1. Inside the `selectedTripIdx !== null` conditional block (after the `TripSection`), render a "Subcategories" section header and reuse the same subcategory card grid that already exists in the "categories" view (lines ~207-271).
2. The subcategory data will come from `getSubcategoriesForPillar(selectedPillar, transactions)` -- the same call used in the categories view -- so it shows all Travel subcategories, not filtered by trip.
3. Extract the subcategory card rendering into a reusable block (or simply duplicate the grid JSX) to avoid complex refactoring.

### Result

When a user clicks a trip card:
- The trip's `TripSection` expands below the grid (as before)
- Below that, a "Subcategories" section appears showing Hotels & Lodging, Flights, etc. as cards
- Clicking a subcategory card still opens the `SubcategoryTransactionsModal`
