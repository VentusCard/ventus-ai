

## Prevent Persona Section Shrink Before Synthesis

### Problem
When the "Synthesize Persona" button appears (phase enters "hold"), the tab content area below simultaneously gains `flex-1`, competing for vertical space and shrinking the persona/pills section.

### Fix
In `src/components/exec-demo/ExecDemoIntelPanel.tsx`, the tab content container (line 376) should only take `flex-1` when `synthesisTriggered` is true. Before synthesis, it should remain minimal height so the persona section keeps its full space.

### Changes

**File: `src/components/exec-demo/ExecDemoIntelPanel.tsx`**

Line 376 — change the tab content wrapper from always being `flex-1` to conditionally:
```tsx
// Before:
<div className="flex-1 flex flex-col min-h-0 overflow-hidden">

// After:
<div className={`flex flex-col min-h-0 overflow-hidden ${synthesisTriggered ? "flex-1" : ""}`}>
```

This way the persona section retains full height when the button first appears. Once the user clicks "Synthesize Persona", the tab content area expands and the persona section shrinks to its constrained `45vh` as intended.

One file, one line changed.

