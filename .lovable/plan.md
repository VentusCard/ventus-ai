

## "Synthesize" Button with Merge Animation

### What Changes

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**

1. **Add `synthesisTriggered` state** (boolean, default false) — tracks whether the user has clicked the button
2. **Remove the 3 insight bullet points** — delete the `personaSynthesis.insights` rendering block (lines 215-226)
3. **Show a "✦ Synthesize Persona" button** when `personaSynthesis` is ready but `synthesisTriggered` is false — styled as a glowing pill button with a sparkle icon, placed above the chip cloud
4. **On click**: set `synthesisTriggered = true`, which triggers the merge animation sequence:
   - Individual pills belonging to rolled-up pillars animate inward (scale down + fade + translate toward center) using a staggered `pill-merge` keyframe
   - After a short delay (~600ms), the `PillarRollupChip` components animate in with the existing `rollup-entrance` + glow
   - The headline fades in above the rollups
5. **Animation CSS**: Add `pill-merge` keyframe (scale 1→0.3, opacity 1→0, slight translate) with staggered delays per chip. The `collapsed` prop on `AnimatedChip` only activates after `synthesisTriggered` is true.
6. **Reset**: `synthesisTriggered` resets to false when `phase === "idle"`

### Flow
```text
Pills appear during scroll → Synthesis ready → "✦ Synthesize" button appears
  → User clicks → Pills merge inward → Rollup pills + headline emerge
```

### Files
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — all changes in this one file

