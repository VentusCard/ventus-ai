
# Fix Dialog Backgrounds to White with Dark Text

## Overview
Update all dialog/popup components in the Advisor Console to use white backgrounds with dark text instead of inheriting the site's pure black theme.

## Current State
The site uses a pure black theme (`--background: 0 0% 0%`) which causes dialogs to appear with black backgrounds by default. Currently:
- **PrepareEventDialog.tsx** - Already fixed with `bg-white text-slate-900`
- **LifeEventDetailsDialog.tsx** - Uses default (black background)
- **ClientPsychologyDialog.tsx** - Uses default (black background)
- **TranscriptUploadDialog.tsx** - Uses default (black background)
- **TaxPlanningDialog.tsx** - Uses default (black background)
- **FinancialTimelineTool.tsx** - Uses default (black background)

## Implementation Plan

### Step 1: Update LifeEventDetailsDialog.tsx
Add `bg-white text-slate-900` to DialogContent className (line 50):
```tsx
<DialogContent className="max-w-2xl max-h-[85vh] flex flex-col bg-white text-slate-900">
```

### Step 2: Update ClientPsychologyDialog.tsx
Add `bg-white text-slate-900` to DialogContent className (line 143):
```tsx
<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white text-slate-900">
```

### Step 3: Update TranscriptUploadDialog.tsx
Add `bg-white text-slate-900` to DialogContent className (line 109):
```tsx
<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-slate-900">
```

### Step 4: Update TaxPlanningDialog.tsx
Add `bg-white text-slate-900` to DialogContent className (line 308):
```tsx
<DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white text-slate-900">
```

### Step 5: Update FinancialTimelineTool.tsx
Add `bg-white text-slate-900` to DialogContent className (line 882):
```tsx
<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white text-slate-900">
```

## Technical Details

### Color Classes Applied
- `bg-white` - Sets the dialog background to pure white
- `text-slate-900` - Sets the default text color to near-black for high contrast

### Files to Update
| File | Line | Change |
|------|------|--------|
| LifeEventDetailsDialog.tsx | 50 | Add `bg-white text-slate-900` |
| ClientPsychologyDialog.tsx | 143 | Add `bg-white text-slate-900` |
| TranscriptUploadDialog.tsx | 109 | Add `bg-white text-slate-900` |
| TaxPlanningDialog.tsx | 308 | Add `bg-white text-slate-900` |
| FinancialTimelineTool.tsx | 882 | Add `bg-white text-slate-900` |

### Consistency Note
This matches the existing pattern used in PrepareEventDialog.tsx which already has `bg-white text-slate-900` applied.
