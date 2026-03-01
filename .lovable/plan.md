

# Toggle Between Trip View and Subcategory View for Travel & Exploration

## Design

When the "Travel & Exploration" pillar is expanded, add a **ToggleGroup** (already available via `@radix-ui/react-toggle-group`) in the card header area, right next to the pillar title. This toggle offers two modes:

- **Categories** (default) -- shows the standard subcategory grid (Flights, Hotels, Dining, etc.)
- **Trips** -- shows the detected trips timeline (grouped by destination with collapsible day-by-day details)

The toggle only appears for "Travel & Exploration"; all other pillars render normally without it.

### Visual Layout

```text
+---------------------------------------------------------------+
| [blue dot] Travel & Exploration - Detailed Breakdown           |
|                                                                |
|   [ Categories | Trips (3) ]  <-- toggle, right-aligned        |
+---------------------------------------------------------------+
|                                                                |
|   (content switches based on active toggle)                    |
|                                                                |
|   Recent Transactions (always shown below both views)          |
+---------------------------------------------------------------+
```

- The toggle uses the existing `ToggleGroup` / `ToggleGroupItem` components with `type="single"` and `outline` variant
- "Trips" label includes the trip count for quick context
- Both views share the same "Recent Transactions" section at the bottom

## Technical Changes

### File: `src/components/tepilot/insights/PillarExplorer.tsx`

1. **Add state**: `travelViewMode` -- `"categories" | "trips"`, defaults to `"categories"`
2. **Import** `ToggleGroup` and `ToggleGroupItem` from `@/components/ui/toggle-group`, plus `Map` and `LayoutGrid` icons from `lucide-react`
3. **In the expanded card header** (only when `selectedPillar === "Travel & Exploration"`): render a `ToggleGroup` with two items:
   - `LayoutGrid` icon + "Categories"
   - `Map` icon + "Trips (N)"
4. **Conditionally render content**:
   - When `travelViewMode === "categories"`: show the existing subcategories grid (lines 151-212)
   - When `travelViewMode === "trips"`: show the existing detected trips section (lines 214-234)
5. **Recent Transactions** section (lines 237-256) stays visible in both modes
6. **Reset** `travelViewMode` to `"categories"` when `selectedPillar` changes (to avoid stale state)

No new files needed. No new dependencies. Uses existing `ToggleGroup` component already in the project.

