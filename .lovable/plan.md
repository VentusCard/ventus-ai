

## Remove Row Headers in Collapsed State — Compile All Pills Together

### What changes
When the card is collapsed (`synthesisTriggered && !pillsExpanded && activeTab`), remove the section headers ("Spending Patterns", "Life Event Detection", "Risk Factors") and render all pills (rollup pills, life event pills, risk pills) in a single `flex-wrap` container.

### Changes — `src/components/exec-demo/ExecDemoIntelPanel.tsx`

In the block starting at line ~286 (the `synthesisTriggered && rollupStats.length > 0` branch):

1. **Detect collapsed state**: Use `const isCollapsed = !pillsExpanded && !!activeTab`

2. **When collapsed** — replace the three separate sections (Spending Patterns div at lines 293-300, Life Event Detection div at lines 302-352, Risk Factors div at lines 354-421) with a single `<div className="flex flex-wrap gap-2">` that renders:
   - All `PillarRollupChip` components (from `rollupStats`)
   - All life event pills (from `detectedLifeEvents`)
   - The risk factor pills or the "No Risk Factors Detected" pill
   - No `<p>` headers at all

3. **When expanded** — keep the current layout with section headers exactly as-is (no change)

This is purely a conditional render split inside the existing `synthesisTriggered` block. No new components or state needed.

