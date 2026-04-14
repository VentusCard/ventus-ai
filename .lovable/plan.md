

## Plan: Pillar headers as a left column with dividers

### What changes

Restructure the pills section from a stacked layout (pillar header on top, chips below) into a **two-column layout**: pillar names in a narrow left column with subtle horizontal dividers between rows, and the category + subcategory pills flowing in the right column.

```text
┌──────────────┬──────────────────────────────────────────┐
│ Travel &     │ Hotels: [Boutique] [Resorts]  Flights:   │
│ Exploration  │ [Airlines] [Budget]                      │
├──────────────┼──────────────────────────────────────────┤
│ Food &       │ Restaurants: [Fine Dining] [Cafes]       │
│ Dining       │ Delivery: [Apps]                         │
└──────────────┴──────────────────────────────────────────┘
```

### Changes in `src/components/exec-demo/ExecDemoIntelPanel.tsx`

**Lines ~316–347** — Replace the current pillar rendering with a table-like layout:

1. Each pillar row becomes a `flex` row with two children:
   - **Left column** (~80px, `shrink-0`): Pillar name with colored dot, vertically centered
   - **Right column** (`flex-1`): The existing inline category labels + subcategory pills

2. Add a subtle bottom border (`border-b border-slate-200/40`) on each row except the last, acting as a divider between pillars.

3. Remove the current `mb-2` spacing on pillar containers and use `py-1.5` padding instead for consistent row height.

4. Remove the separate pillar header `<div>` — the pillar name moves into the left column cell.

### Files modified
- `src/components/exec-demo/ExecDemoIntelPanel.tsx`

