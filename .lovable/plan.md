

## Fix iPad Mockup: Lighter Frame + Content Fit

### Problems
1. **Too dark** — `border-slate-800` and `bg-slate-800` bezels make the frame look black/heavy against the light overlay
2. **Content doesn't fit** — `max-h-[600px]` on the content area is too restrictive; life event cards + snapshot get cut off

### Changes — `src/components/demo/DemoWealthView.tsx`

1. **Lighten the iPad frame** to match the light-theme policy:
   - Bezel: `border-slate-300` (light silver) instead of `border-slate-800`
   - Camera dot: `bg-slate-200 border-slate-300` instead of dark
   - Bottom home indicator bar: `bg-slate-300` on a light background
   - Shadow: softer, lighter shadow

2. **Fix content fitting**:
   - Remove the `max-h-[600px]` constraint so the content flows naturally within the overlay's own scroll
   - Remove `overflow-y-auto` from the content div (the overlay already handles scrolling)
   - Reduce padding from `p-6` to `p-4` to use space more efficiently
   - Reduce `space-y-5` to `space-y-4` for tighter spacing

Result: a clean silver/light iPad frame that fits the light-theme overlay, with all content visible without double-scrolling.

