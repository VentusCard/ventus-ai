
# Sleek White-Themed Resizable Handle for Advisor Console

## Problem Identified
The **ResizableHandle** component between the Client Snapshot panel and the main chat section is using dark-themed styling that clashes with the white/light background of the Advisor Console:

| Element | Current Value | Issue |
|---------|--------------|-------|
| Handle background | `bg-border` | Resolves to `hsl(0 0% 15%)` - very dark |
| Grip box | `bg-border` + `border` | Dark gray appearance |
| Handle width | `w-px` (1px) + `after:w-1` | Thin but visible dark line |

## Root Cause
The global CSS variables in `src/styles/base.css` define `--border: 0 0% 15%` for the dark theme, but the Advisor Console uses light backgrounds (`bg-white`, `bg-slate-50`). The ResizableHandle inherits these dark values.

## Solution
Update the `ResizableHandle` component in `src/components/ui/resizable.tsx` to use light-themed colors that work with the Advisor Console's white background:

### Changes Required

**File: `src/components/ui/resizable.tsx`**

1. **Main handle line (line 30)**
   - Change: `bg-border`
   - To: `bg-slate-200` (light gray, subtle)

2. **Grip handle box (line 36)**
   - Change: `border bg-border`
   - To: `border-slate-300 bg-white shadow-sm` (white with subtle border)

3. **Grip icon (line 37)**
   - Change: default color
   - To: `text-slate-400` (light gray icon)

### Technical Details

```tsx
// Current (dark themed)
<ResizablePrimitive.PanelResizeHandle
  className={cn(
    "relative flex w-px items-center justify-center bg-border after:absolute...",
    className
  )}
>
  {withHandle && (
    <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
      <GripVertical className="h-2.5 w-2.5" />
    </div>
  )}
</ResizablePrimitive.PanelResizeHandle>

// Updated (light themed)
<ResizablePrimitive.PanelResizeHandle
  className={cn(
    "relative flex w-px items-center justify-center bg-slate-200 after:absolute...",
    className
  )}
>
  {withHandle && (
    <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border-slate-300 bg-white shadow-sm">
      <GripVertical className="h-2.5 w-2.5 text-slate-400" />
    </div>
  )}
</ResizablePrimitive.PanelResizeHandle>
```

## Visual Result
- The divider line becomes a subtle light gray (`bg-slate-200`)
- The grip handle becomes white with a soft shadow
- The grip icon becomes a subtle slate-400 gray
- Matches the light aesthetic of the Advisor Console panels
- Provides clear visual affordance for resizing without being visually heavy

## Files to Modify
- `src/components/ui/resizable.tsx` - Update handle and grip styling

## Note
This change affects the global ResizableHandle component. If there are other parts of the app using dark backgrounds with resizable panels, we may need to add a prop-based variant system. However, based on the codebase, the Advisor Console is the primary user of this component.
