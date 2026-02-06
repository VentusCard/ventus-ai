

# Fix Text Colors in RMD Calculator and Asset Allocation Cards

## Overview
Update text colors in both components to ensure all text is dark enough for optimal readability, following the established pattern of using `text-slate-700` or `text-slate-900` for important content.

## Files to Update

### 1. RMDCalculator.tsx

| Line | Element | Current | New |
|------|---------|---------|-----|
| 121 | Info icon | `text-slate-500` | `text-slate-600` |
| 187 | "Estimated Tax" row | `text-sm text-slate-600` | `text-sm text-slate-700` |
| 191 | "Monthly Distribution" row | `text-sm text-slate-600` | `text-sm text-slate-700` |
| 203 | Deadline reminder text | `text-slate-600` | `text-slate-700` |

### 2. AssetAllocationEditor.tsx

| Line | Element | Current | New |
|------|---------|---------|-----|
| 140 | Legend item wrapper | `text-xs` (no color) | `text-xs text-slate-900` |
| 201 | Percentage display | `text-sm font-medium` (no color) | `text-sm font-medium text-slate-900` |

## Technical Changes

### RMDCalculator.tsx

**Line 121** - Info icon:
```tsx
// Before
<Info className="w-4 h-4 text-slate-500" />

// After
<Info className="w-4 h-4 text-slate-600" />
```

**Lines 187 and 191** - Summary section text:
```tsx
// Before
<div className="flex justify-between items-center text-sm text-slate-600">

// After
<div className="flex justify-between items-center text-sm text-slate-700">
```

**Line 203** - Deadline reminder:
```tsx
// Before
<p className="text-slate-600 mt-1">

// After
<p className="text-slate-700 mt-1">
```

### AssetAllocationEditor.tsx

**Line 140** - Legend items:
```tsx
// Before
<div key={entry.name} className="flex items-center gap-1 text-xs">

// After
<div key={entry.name} className="flex items-center gap-1 text-xs text-slate-900">
```

**Line 201** - Percentage value:
```tsx
// Before
<span className="text-sm font-medium">{targetAllocation[key]}%</span>

// After
<span className="text-sm font-medium text-slate-900">{targetAllocation[key]}%</span>
```

## Summary
- 4 changes in RMDCalculator.tsx
- 2 changes in AssetAllocationEditor.tsx
- All changes darken text for better readability while maintaining visual hierarchy

