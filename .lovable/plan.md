### Objective
On the Reports page, make "Templates" the first (default) sub-tab instead of "Reports".

### What changes
1. **Default state in `ReportsLibrary.tsx`**  
   Change `subTab` initial value from `hasInteractive ? "reports" : "templates"` to always `"templates"`. When the page loads, the Templates tab is active.

2. **Preserve conditional rendering**  
   The "Reports" tab button stays hidden when there are no interactive reports (`!hasInteractive`). The Templates tab button is always visible. Switching between tabs continues to work the same.

### What does not change
- Tab labels, counts, styling, search/filter behavior on Templates.
- Interactive report cards or registry.
- Routing / deep-linking logic in `AnalyticsContainer`.

### Verification
Load the Reports page and confirm Templates is active by default, with Reports available as the second tab when interactive reports exist.