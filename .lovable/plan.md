## Problem

The cascade animation on enriched cells currently starts a 4-second one-shot timer on **component mount**. But on mount the table is showing shimmer placeholders — enrichment hasn't arrived yet. By the time the AI returns results and the cells swap from `<ShimmerCell />` to real content, the CSS keyframe has already played on the same `<td>` DOM nodes (or is mid-stagger), so the user never sees a clean cascade reveal of the actual data.

We want: shimmer/loading state plays normally → AI returns → THEN the cascade animation fires, row by row, on the enriched cells.

## Fix

Edit `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`:

1. **Don't start the reveal timer on mount.** Initialize `animateReveal` to `false`.

2. **Detect the moment enrichment first lands.** Track the previous `enrichedCount` in a ref. When it transitions from `0` to `>0` (first enriched row arrives), start a one-shot reveal session:
   - Bump a `revealKey` counter (state).
   - Set `animateReveal = true`.
   - Schedule a `setTimeout(..., 4000)` to set `animateReveal = false` so subsequent pill clicks don't replay it.

3. **Force the enriched `<td>`s to remount so the CSS keyframe plays from frame 0.** Currently the same `<td>` node persists across the shimmer→real swap, which means re-applying the `.exec-cascade-on` class won't restart the animation. Fix by including `revealKey` in the enriched cell rendering — wrap each enriched cell's content in a fragment keyed by `revealKey-${idx}`, OR simpler: change the row's `key` to include `revealKey` only once per row when that row first becomes enriched. Cleanest implementation: give each enriched `<td>` a unique React `key` via wrapping spans, e.g. render the enriched-side cells as `<td key={\`enr-${idx}-${tx ? revealKey : 'pending'}\`} ...>` — when a row swaps from pending to enriched, the td remounts and the keyframe animation plays fresh with its staggered delay.

4. **Keep the existing `.exec-cascade-on` scoping** so the cascade only applies during the reveal window.

### Pseudocode

```tsx
const [animateReveal, setAnimateReveal] = useState(false);
const [revealKey, setRevealKey] = useState(0);
const prevEnrichedCount = useRef(0);

useEffect(() => {
  if (prevEnrichedCount.current === 0 && enrichedCount > 0) {
    setRevealKey(k => k + 1);
    setAnimateReveal(true);
    const t = setTimeout(() => setAnimateReveal(false), 4000);
    return () => clearTimeout(t);
  }
  prevEnrichedCount.current = enrichedCount;
}, [enrichedCount]);
```

And on each enriched `<td>`:
```tsx
<td key={`enr-${idx}-${isEnriched ? revealKey : 'pending'}`} className="exec-enriched-cell ..." >
```

This ensures the cascade plays exactly once, when the first batch of enriched rows lands, and never again on pill clicks or re-sorts.

## Files changed

- `src/components/exec-demo/ExecDemoEnrichmentTable.tsx` — replace mount-based timer with first-enrichment-arrival trigger; add `revealKey` to enriched `<td>` keys to force remount and restart the CSS keyframe.
