## Goal
In the Location Experience Manager, move the "Add Experience" button from its own row onto the same horizontal row as the search bar and filter dropdowns.

## Change
**File:** `src/components/tepilot/insights/LocationExperienceManager.tsx`

- Remove the separate `<div className="flex items-start justify-end">` wrapper (lines 116-121) that currently holds the "Add Experience" button.
- Place the `<Button>` inside the existing filters `<div className="flex items-center gap-3">` (lines 124-143), positioned at the far right of the row.
- Keep all existing styling and behavior of the button, search input, city select, and category select unchanged.

## Result
The "Add Experience" button shares the same line as the search bar and filter dropdowns, matching the space-efficient layout pattern already applied to the Deals & Perks tab.

## Verification
- `tsgo --noEmit` passes cleanly.
- The button remains clickable and opens the Create Experience dialog.