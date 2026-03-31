

## Fix iPad Frame Height — Fill Available Space

### Problem
The iPad frame (line 127) uses `minHeight: 520px` and `maxHeight: calc(100vh - 80px)` but no `h-full`. It sizes from content rather than filling the available overlay space, making it shorter/inconsistent compared to other overlays.

### Fix — `src/components/demo/DemoDetailOverlay.tsx`

**Line 127**: Add `h-full` and `min-h-0` to make the frame fill its parent flex container instead of sizing from content. Remove the inline `minHeight`/`maxHeight` since the parent already constrains it:

```tsx
// Before
<div className="w-full max-w-[820px] rounded-[20px] border-[12px] border-slate-300 bg-white shadow-2xl overflow-hidden flex flex-col" style={{ minHeight: "520px", maxHeight: "calc(100vh - 80px)" }}>

// After
<div className="w-full max-w-[820px] h-full min-h-0 rounded-[20px] border-[12px] border-slate-300 bg-white shadow-2xl overflow-hidden flex flex-col">
```

The parent wrapper (line 125) already has `flex-1 flex flex-col overflow-hidden`, so the frame will stretch to fill the overlay. The `min-h-0` ensures flex shrinking works correctly.

### Files changed
1. `src/components/demo/DemoDetailOverlay.tsx` — 1 line

