## Goal

The cascading reveal animation on enriched cells should only fire on the **initial reveal** (when the AI enrichment first lands), not when the user clicks a persona/lifestyle pill that reorders or re-highlights rows.

## Root cause

The `td.exec-enriched-cell` class always carries the keyframe animation. When a pill is clicked, the row order changes (matched rows are sorted to the top) and React's reconciler ends up moving DOM nodes; combined with the `--enrich-row-i` delay variable, the cascade visually replays.

## Fix

Gate the animation behind a one-shot CSS class that is only applied on the first render of the table. After the initial reveal, the class is removed so any subsequent re-renders (pill clicks, sort changes, highlight toggles) don't re-trigger the cascade.

### Change

**File:** `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`

1. Add a `useState` + `useEffect` near the top of the component:
   ```tsx
   const [animateReveal, setAnimateReveal] = useState(true);
   useEffect(() => {
     // Allow the cascade to play once on mount, then disable so pill clicks
     // and re-sorts don't replay the animation.
     const t = setTimeout(() => setAnimateReveal(false), 4000);
     return () => clearTimeout(t);
   }, []);
   ```
   (4000ms covers the 24 × 110ms stagger + 700ms duration with margin.)

2. In the wrapper `<div>`, conditionally add a scoping class:
   ```tsx
   <div className={`${wrapperCls} ${animateReveal ? "exec-cascade-on" : ""}`} ...>
   ```

3. In the `<style>` block, scope the cascade animation under that class so it ONLY runs while present:
   ```css
   .exec-cascade-on td.exec-enriched-cell {
     animation: exec-enriched-row-reveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
     animation-delay: calc(var(--enrich-row-i, 0) * 110ms);
     transform-origin: top center;
   }
   /* Resting gradient applies to every enriched cell, always. */
   td.exec-enriched-cell {
     background-image: linear-gradient(180deg, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.02) 100%);
   }
   ```

The keyframe definition itself (`@keyframes exec-enriched-row-reveal`) and the highlighted/dimmed rules stay unchanged.

Add the `useState`/`useEffect` imports at the top of the file if not already present.

No JSX structural changes beyond the wrapper className addition.