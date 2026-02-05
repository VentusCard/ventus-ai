
# Plan: Update Section Headers with Ventus AI Branding

## Overview
Align the Prepare Event dialog section headers with the new "Ventus AI" branding used in the Life Events Alert Dashboard.

## Changes

**File:** `src/components/tepilot/advisor-console/PrepareEventDialog.tsx`

### 1. Update "Ventus Insights" Header (Line 153)

Change from:
```tsx
<h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
  <Sparkles className="h-4 w-4 text-amber-500" />
  Ventus Insights
</h3>
```

To:
```tsx
<h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
  <Sparkles className="h-4 w-4 text-amber-500" />
  Ventus AI Insights
</h3>
```

### 2. Update "Recommended Next Steps" Header (Line 163)

Change from:
```tsx
<h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
  <CheckCircle2 className="h-4 w-4 text-green-500" />
  Recommended Next Steps
</h3>
```

To:
```tsx
<h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
  <CheckCircle2 className="h-4 w-4 text-green-500" />
  Ventus AI Recommended Next Steps
</h3>
```

## Summary

| Section | Before | After |
|---------|--------|-------|
| Insights header | "Ventus Insights" | "Ventus AI Insights" |
| Steps header | "Recommended Next Steps" | "Ventus AI Recommended Next Steps" |
