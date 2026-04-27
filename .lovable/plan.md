# Bold blue background + smooth reveal for "Ventus Enriched" header

Restyle the right-side group header in the enrichment table (`Ventus Enriched · AI-labeled semantic intelligence`) from a soft `bg-blue-50` band into a richer, branded blue band with a smooth fade-up reveal and a one-time shimmer sweep.

## Change in `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`

### 1. Header `<th>` (lines 141–154)
Replace the existing cell with a deeper blue gradient cell, white text, a positioned shimmer overlay span, and a one-shot reveal animation class. Specifically:
- Background: `linear-gradient(90deg, hsl(217 91% 55%) 0%, hsl(221 83% 48%) 100%)` (vivid Ventus blue → deeper blue).
- Text color: white. Subtitle (`· AI-labeled semantic intelligence`) softens to `text-blue-100/90`.
- The `Enriching…` pill becomes `bg-white/20 text-white` with a white pulse dot for contrast on the blue.
- Cell uses `relative overflow-hidden` and an `animate-[ventus-enriched-reveal_0.7s_ease-out_both]` reveal animation.
- A single absolutely-positioned `<span aria-hidden>` overlays the cell to render a left-to-right shimmer sweep using `ventus-enriched-shimmer` (1.6s, runs once 0.4s after mount).
- Inner content is wrapped in a `relative` span so it sits above the shimmer.

### 2. Extend the existing `<style>` block (lines 294–304)
Append two `@keyframes` so the animations defined above resolve:
- `ventus-enriched-reveal`: from `opacity: 0; transform: translateY(-6px); filter: brightness(1.15);` to `opacity: 1; transform: translateY(0); filter: brightness(1);`.
- `ventus-enriched-shimmer`: from `transform: translateX(-100%);` to `transform: translateX(120%);`.

No other markup, columns, sticky behavior, or row logic changes.
