

# Fix Visibility of Action Buttons in Advisor Console

## Problem Identified

Looking at your screenshot, the bottom action buttons (Call, Email, Schedule) in the right panel are being cut off or not fully visible. This is happening because:

1. The `ActionWorkspacePanel` uses a flex layout with a scrollable content area
2. The bottom action buttons are positioned **outside** the scrollable area but the container height constraints are causing them to be pushed below the visible viewport

## Root Cause

In `ActionWorkspacePanel.tsx`:
- The "Next Steps" section uses `flex-1 min-h-0 overflow-hidden` (line 165)
- The action buttons section (lines 286-304) has `space-y-2` but no `flex-shrink-0` protection
- This means when content expands, the buttons can get squeezed out of view

## Solution

Add `flex-shrink-0` to the bottom action buttons container to prevent them from being compressed, ensuring they always remain visible at the bottom of the panel.

### Changes Required

**File: `src/components/tepilot/advisor-console/ActionWorkspacePanel.tsx`**

Update line 286 from:
```tsx
<div className="space-y-2">
```

To:
```tsx
<div className="space-y-2 flex-shrink-0">
```

This single CSS class addition ensures the button container maintains its natural height and doesn't get compressed when the scrollable content area expands.

## Technical Details

| Aspect | Before | After |
|--------|--------|-------|
| Button container | `space-y-2` | `space-y-2 flex-shrink-0` |
| Behavior | Can be squeezed by flex layout | Always maintains full height |
| Visibility | Gets cut off when content is large | Always visible at bottom |

## Expected Result

After this fix:
- The Call, Email, and Schedule buttons will always be visible at the bottom of the right panel
- The "Next Steps" content area will scroll independently while keeping the buttons fixed
- No layout shifts or overflow issues

