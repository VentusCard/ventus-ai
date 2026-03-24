

## Add "..." Ellipsis Indicators to Beat 3 Icon Grid

**File**: `src/components/demo/DemoPasswordGate.tsx`

### What

Add large, visible "…" indicators on the left and right sides of the 6-icon row to visually signal there are countless more possibilities beyond the six shown.

### How

Wrap the existing grid (line 363) in a flex container with ellipsis elements on each side:

```tsx
<div className="flex items-center justify-center gap-3 w-full max-w-3xl mx-auto mt-2">
  {/* Left ellipsis */}
  <span className="text-3xl font-bold tracking-widest text-amber-400 select-none">…</span>
  
  {/* Existing 6-icon grid */}
  <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 flex-1 max-w-2xl">
    {/* existing 6 icons unchanged */}
  </div>
  
  {/* Right ellipsis */}
  <span className="text-3xl font-bold tracking-widest text-amber-400 select-none">…</span>
</div>
```

- Styled in `text-amber-400` to match the existing yellow/amber connector lines
- `text-3xl font-bold` for high visibility
- Vertically centered with the icon row via `items-center`

