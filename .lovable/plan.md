

# Proportional Scaling for the Animation on Tablet/Phone

## Approach
Instead of hiding columns or changing the layout, wrap the entire animation in a container that uses CSS `transform: scale()` to shrink it proportionally on smaller screens. This keeps the exact same desktop layout (6-column grid, all fields visible) but scales the whole thing down to fit the viewport width.

## How It Works
Add a wrapper `div` around the `.vte-root` element with responsive CSS that applies a scale transform at tablet and mobile breakpoints. The `transform-origin` is set to `top center` so it shrinks from the top. A negative bottom margin compensates for the empty space left by scaling.

## Breakpoints
- **Desktop (above 1024px)**: No scaling, renders at full size
- **Tablet (768px - 1024px)**: Scale to ~70% (`transform: scale(0.7)`)
- **Mobile (below 768px)**: Scale to ~50% (`transform: scale(0.5)`)

## CSS Addition
```css
.vte-scale-wrapper {
  transform-origin: top center;
}
@media (max-width: 1024px) {
  .vte-scale-wrapper {
    transform: scale(0.7);
    margin-bottom: -30%;
  }
}
@media (max-width: 767px) {
  .vte-scale-wrapper {
    transform: scale(0.5);
    margin-bottom: -50%;
  }
}
```

## What Changes
The existing `@media (max-width: 980px)` block that switches to a stacked card layout will be removed entirely, since the animation now stays in its desktop grid form and just scales down.

## File Changed
- **Modified**: `src/components/technology/demos/VentusTransactionEnrichment.tsx`
  - Add a wrapper div with class `vte-scale-wrapper` around the `.vte-root` div
  - Add the scale CSS rules above to the existing `<style>` block
  - Remove the `@media (max-width: 980px)` responsive block that restructures the layout

