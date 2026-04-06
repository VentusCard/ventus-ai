

## Fix: Show all pillar groups in supporting evidence after synthesis

### Problem
Lines 300-303 skip rendering any pillar group where all chips match a rollup. Since most chips get rolled up, this hides nearly all pillars — only showing 2 out of potentially 5-6.

### Change — `src/components/exec-demo/ExecDemoIntelPanel.tsx`

**Remove the "skip fully rolled-up" filter entirely** (lines 299-303). All pillar groups should always render in the supporting evidence section, regardless of whether their chips were rolled up. The original whitespace issue was caused by `flex-1` stretching, which is already fixed.

```diff
 {Array.from(chipsByPillar.entries()).map(([pillar, pillarChips]) => {
   const c = getColor(pillar);
-  // Skip fully rolled-up pillar groups after synthesis
-  if (synthesisTriggered) {
-    const allRolledUp = pillarChips.every(chip => rollups.some(r => chipMatchesRollup(chip, r, chips.indexOf(chip))));
-    if (allRolledUp) return null;
-  }
   return (
```

