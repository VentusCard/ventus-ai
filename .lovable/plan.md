# Subtle blue gradient + staggered downward reveal for enriched cells

Apply a subtle blue gradient background and a row-by-row downward reveal animation to the five "Ventus Enriched" columns (Pillar, Category, Subcategories, Tier, Freq) in the executive demo enrichment table. Raw-side cells are unchanged.

## Changes in `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`

### 1. Tag the enriched cells (lines 255, 268, 271, 282, 291)
Add the class `exec-enriched-cell` to each of the 5 enriched `<td>` elements. The class is the animation/gradient hook.

### 2. Per-row stagger (line 211)
On the `<tr>`, set an inline CSS variable `--enrich-row-i` to `Math.min(idx, 24)`. This caps the cumulative stagger so rows far down the list don't have multi-second delays. The `style` already contains conditional `--exec-hl`; merge so both can coexist:
```ts
style={{
  ...(isHighlighted ? ({ ["--exec-hl" as any]: highlightColor } as React.CSSProperties) : {}),
  ["--enrich-row-i" as any]: Math.min(idx, 24),
}}
```

### 3. Extend the existing `<style>` block (after `exec-row-dimmed` rule, before keyframes)
Add:
```css
td.exec-enriched-cell {
  background-image: linear-gradient(180deg, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.02) 100%);
  animation: exec-enriched-row-reveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--enrich-row-i, 0) * 45ms);
}
/* Highlighted/dimmed states should still win visually */
tr.exec-row-highlighted > td.exec-enriched-cell {
  background-image: none;
}
@keyframes exec-enriched-row-reveal {
  0%   { opacity: 0; transform: translateY(-6px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

The gradient is intentionally low-opacity (~6%→2% blue) so it reads as a tinted band that ties visually to the bold blue group header without competing with row content. The reveal cascades downward at 45ms per row, capped at 24 rows so the overall reveal completes in just over 1 second.

No other styling, sticky headers, or column logic changes.
