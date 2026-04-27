## Goal

Make the row-by-row reveal of the enriched cells in the transaction table much more obvious — clearly cascading top-to-bottom one row at a time, with a visible "highlight pulse" so a viewer can follow the wave of enrichment.

## Change

**File:** `src/components/exec-demo/ExecDemoEnrichmentTable.tsx` (style block, lines 319–333)

Update the `td.exec-enriched-cell` animation by:

1. **Slowing the per-row stagger** from `45ms` to `110ms` so consecutive rows clearly fire one after another.
2. **Lengthening the duration** from `0.55s` to `0.7s`.
3. **Beefing up the keyframes** — start with a larger vertical drop (`translateY(-14px)`) and a vertical squash (`scaleY(0.85)`), plus a strong blue background flash (`rgba(59,130,246,0.28)`), an underline glow, and a brightness lift, then settle back to the resting blue gradient by 100%.
4. Keep the existing rules that strip the gradient on highlighted/dimmed rows.

```css
td.exec-enriched-cell {
  background-image: linear-gradient(180deg, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.02) 100%);
  animation: exec-enriched-row-reveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--enrich-row-i, 0) * 110ms);
  transform-origin: top center;
}
@keyframes exec-enriched-row-reveal {
  0% {
    opacity: 0;
    transform: translateY(-14px) scaleY(0.85);
    background-color: rgba(59, 130, 246, 0.28);
    box-shadow: inset 0 -1px 0 0 rgba(59, 130, 246, 0.55);
    filter: brightness(1.12);
  }
  55% {
    opacity: 1;
    transform: translateY(0) scaleY(1);
    background-color: rgba(59, 130, 246, 0.16);
    box-shadow: inset 0 -1px 0 0 rgba(59, 130, 246, 0.35);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scaleY(1);
    background-color: transparent;
    box-shadow: inset 0 0 0 0 transparent;
    filter: brightness(1);
  }
}
```

The existing per-row CSS variable `--enrich-row-i` (clamped at 24) drives the cascade, so up to ~25 rows participate, and rows beyond that animate together at the tail.

No JSX changes.