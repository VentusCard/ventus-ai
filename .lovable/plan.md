
# Fix Colors and Text Styling for Financial Planning Page

## Overview
Align the Financial Planning page (`/tepilot/financial-planning`) with the styling patterns established in the Advisor Console page, removing redundant navigation and ensuring consistent color/text treatment.

## Issues to Fix

| Issue | Current State | Fix |
|-------|---------------|-----|
| Duplicate back buttons | Page wrapper has "Back to Advisor Console", component has "Back to Console" | Remove the back button from FinancialPlanner component header |
| Title text color | Uses `text-slate-600` | Change to `text-slate-500` to match AdvisorConsolePage |
| Navigation bar border | Uses `border-slate-200` explicitly | Remove explicit color, use `border-b` only like AdvisorConsolePage |
| Back button styling | Uses plain `variant="ghost"` | Apply blue styling: `text-blue-900 border-blue-200 hover:bg-blue-50 hover:border-blue-300` with `variant="outline"` |

## Technical Changes

### 1. Update FinancialPlanningPage.tsx

**Location:** Lines 88-105

**Changes:**
- Update top navigation bar to match AdvisorConsolePage:
  - Change border from `border-slate-200` to just `border-b`
  - Update button from `variant="ghost"` to `variant="outline"` with blue styling
  - Change title color from `text-slate-600` to `text-slate-500`

```tsx
// Before
<div className="border-b border-slate-200 px-4 py-3 bg-white z-10 shadow-sm flex-shrink-0">
  ...
  <Button variant="ghost" size="sm" onClick={...}>
  ...
  <h2 className="text-sm font-medium text-slate-600">

// After
<div className="border-b px-4 py-3 bg-white z-10 shadow-sm flex-shrink-0">
  ...
  <Button
    variant="outline"
    size="sm"
    onClick={...}
    className="text-blue-900 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
  >
  ...
  <h2 className="text-sm font-medium text-slate-500">
```

### 2. Update FinancialPlanner.tsx

**Location:** Lines 373-393

**Changes:**
- Remove the redundant header row that contains "Back to Console" button and duplicate title
- Keep only the action buttons (Export PDF, Save Plan) in a simpler header

```tsx
// Before (Lines 373-393)
<div className="flex items-center justify-between mb-2">
  <div className="flex items-center gap-3">
    <Button variant="ghost" size="sm" onClick={() => navigate("/tepilot/advisor-console")}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Console
    </Button>
  </div>
  <h1 className="text-2xl font-bold">Long-Term Financial Planning</h1>
  <div className="flex gap-2">
    <Button variant="outline" size="sm" onClick={handleExportPDF}>...</Button>
    <Button size="sm" onClick={handleSavePlan}>...</Button>
  </div>
</div>

// After
<div className="flex items-center justify-between mb-4">
  <h1 className="text-2xl font-bold text-slate-900">Long-Term Financial Planning</h1>
  <div className="flex gap-2">
    <Button variant="outline" size="sm" onClick={handleExportPDF}>...</Button>
    <Button size="sm" onClick={handleSavePlan}>...</Button>
  </div>
</div>
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/FinancialPlanningPage.tsx` | Update top nav bar styling and colors |
| `src/components/tepilot/advisor-console/FinancialPlanner.tsx` | Remove redundant back button and simplify header |

## Visual Result

After changes:
- Single "Back to Advisor Console" button in page wrapper (blue styled, matching AdvisorConsolePage)
- Consistent title text color (`text-slate-500`)
- Clean header in FinancialPlanner with just title and action buttons
- No duplicate navigation elements
