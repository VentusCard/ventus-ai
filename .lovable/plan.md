

## Plan: Multi-Select Sample Data for Comparison Mode

### Concept
Replace the separate "Compare Two Customers" toggle and `ComparisonSetup` component with a simpler flow: the existing "Load Sample Data" dropdown gets **checkboxes for multi-select**. When exactly two datasets are selected, comparison mode auto-activates and enrichment auto-triggers.

### Flow
1. User clicks "Load Sample Data" dropdown
2. Each item has a checkbox — user can select up to 2
3. Selecting 1 → works like today (single customer, loads into paste input)
4. Selecting 2 → automatically enters comparison mode, parses both, and kicks off parallel enrichment
5. Deselecting back to 1 or 0 → exits comparison mode

### Changes

**1. `src/components/tepilot/UploadOrPasteContainer.tsx`**
- Add `selectedSamples` state tracking (array of selected dataset indices)
- Replace `DropdownMenuItem` click behavior with checkbox-based multi-select
- Show checkmarks next to selected items, allow up to 2
- Add new prop: `onLoadComparisonSamples(dataA, dataB)` called when 2 are selected
- Keep dropdown open on selection (don't auto-close)
- Show a small badge like "2 selected" on the button when in comparison mode

**2. `src/pages/TePilot.tsx`**
- Remove the "Compare Two Customers" Switch toggle from the Setup tab
- Remove `ComparisonSetup` rendering — no longer needed
- Add a new handler `handleLoadComparisonSamples(dataA, dataB)` that:
  - Sets `comparisonMode = true`
  - Sets demographics, zips, parses both CSVs
  - Auto-triggers `handleEnrichBoth` logic (switches to results tab, starts parallel enrichment)
- When a single sample is selected (existing `onLoadSample`), ensure `comparisonMode` is set to `false` and comparison state is reset

**3. `src/components/tepilot/ComparisonSetup.tsx`**
- Can be deleted or left unused — no longer rendered

### UX Details
- Dropdown items show: `☐ Sarah Mitchell (1 mo)` → `☑ Sarah Mitchell (1 mo)` when selected
- When 2nd item is checked, dropdown closes and enrichment begins immediately
- A small indicator on the "Load Sample Data" button shows selected count
- Selecting a 3rd item is blocked (max 2) with a toast hint

