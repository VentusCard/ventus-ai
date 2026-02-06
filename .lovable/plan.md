

# Fix Text Colors on Financial Planning Page

## Overview
Multiple text elements throughout the Financial Planning page use `text-slate-500`, `text-muted-foreground`, or `text-xs text-slate-500` which render as light gray and are difficult to read. These need to be updated to darker colors for better readability.

## Color Mapping Strategy

| Current Color | New Color | Use Case |
|---------------|-----------|----------|
| `text-slate-500` | `text-slate-700` | Primary descriptive labels |
| `text-muted-foreground` | `text-slate-700` | Supporting text |
| `text-xs text-slate-500` | `text-xs text-slate-600` | Small helper text |
| `text-slate-400` | `text-slate-600` | Very light text |

## Files to Update

### 1. FinancialPlanningPage.tsx
- Line 102: `text-slate-500` on page title -> `text-slate-700`

### 2. FinancialPlanner.tsx
- Line 405: `text-sm text-muted-foreground` (Client Name label) -> `text-sm text-slate-700`
- Line 409: `text-sm text-muted-foreground` (Age label) -> `text-sm text-slate-700`
- Line 413: `text-sm text-muted-foreground` (Current Net Worth label) -> `text-sm text-slate-700`
- Line 417: `text-sm text-muted-foreground` (Years to Retirement label) -> `text-sm text-slate-700`
- Line 421: `text-sm text-muted-foreground` (Risk Profile label) -> `text-sm text-slate-700`
- Lines 547-550: `text-muted-foreground` in empty state -> `text-slate-600`
- Line 596-597: `text-sm text-muted-foreground` on expand/collapse hints -> `text-sm text-slate-600`

### 3. RetirementPlanningSection.tsx
- Line 111: `text-xs text-slate-500` (Readiness label) -> `text-xs text-slate-600`
- Line 116: `text-sm text-slate-500` (Years to Retirement) -> `text-sm text-slate-700`
- Line 120: `text-sm text-slate-500` (Target Retirement) -> `text-sm text-slate-700`
- Lines 134, 138, 144, 148: `text-slate-500` on income labels -> `text-slate-700`
- Line 245: `text-xs text-slate-500` (Required at retirement hint) -> `text-xs text-slate-600`

### 4. FinancialGoalsSection.tsx
- Line 148: `text-sm text-slate-500` (Target date) -> `text-sm text-slate-700`
- Line 185: `text-xs text-slate-500` (Progress %) -> `text-xs text-slate-600`
- Lines 211, 233: `text-slate-500` empty state text -> `text-slate-600`

### 5. TaxAdvantagedAccountsSection.tsx
- Line 96: `text-xs text-slate-500` (Balance label) -> `text-xs text-slate-600`
- Line 103: `text-slate-500` (max contribution) -> `text-slate-600`
- Lines 141, 145, 149, 153: `text-sm text-slate-500` (summary labels) -> `text-sm text-slate-700`
- Line 164: `text-slate-500` (optimization opportunities) -> `text-slate-600`

### 6. MonteCarloSimulator.tsx
- Line 159: `text-sm text-slate-500` (simulator description) -> `text-sm text-slate-700`
- Lines 169, 181, 204: `text-slate-500 text-sm` ($ prefix) -> `text-slate-600 text-sm`
- Lines 231, 245: `text-xs text-slate-500` (historical references) -> `text-xs text-slate-600`
- Lines 268, 276, 280, 284: `text-xs text-slate-500` (percentile labels) -> `text-xs text-slate-600`
- Line 356: `text-xs text-slate-500` (chart description) -> `text-xs text-slate-600`
- Line 368: `text-sm text-slate-500` (suggestions list) -> `text-sm text-slate-600`

### 7. IncomeExpenseEditor.tsx
- Line 90: `text-slate-500 text-xs` (percentage) -> `text-slate-600 text-xs`
- Line 133: `text-xs text-slate-500` (breakdown labels) -> `text-xs text-slate-600`

### 8. GlidePathVisualization.tsx
- Line 101: `text-xs text-slate-500` (You are here) -> `text-xs text-slate-600`
- Lines 237, 241: `text-slate-500` (Current/Target labels) -> `text-slate-700`

### 9. AssetAllocationEditor.tsx
- No significant changes needed - uses proper contrast

### 10. NetWorthProjectionChart.tsx
- Lines 314, 318, 324: `text-slate-500 text-xs` (Starting/At Retirement labels) -> `text-slate-600 text-xs`

### 11. RMDCalculator.tsx
- Line 102: `text-sm text-slate-500` (no accounts message) -> `text-sm text-slate-600`
- Line 157: `text-xs text-slate-500` (synced label) -> `text-xs text-slate-600`
- Line 163: `text-xs text-slate-500` (Balance label) -> `text-xs text-slate-600`
- Line 169: `text-xs text-slate-500` (Annual RMD) -> `text-xs text-slate-600`
- Lines 187, 191: `text-sm text-slate-500` (tax/monthly labels) -> `text-sm text-slate-600`
- Line 204: `text-slate-500` (deadline reminder) -> `text-slate-600`
- Line 213: `text-xs text-slate-500` (projection note) -> `text-xs text-slate-600`

## Summary of Changes
- Replace all `text-slate-500` with `text-slate-700` for larger/important labels
- Replace all `text-xs text-slate-500` with `text-xs text-slate-600` for small helper text
- Replace all `text-muted-foreground` with `text-slate-700` or `text-slate-600`
- This affects 11 files with approximately 50+ text color changes

## Technical Notes
- The changes are purely CSS class replacements
- No functional changes to the components
- All changes follow the pattern of increasing contrast by using darker slate variants (600/700 instead of 400/500)

