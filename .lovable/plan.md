

## Remove Frequency from Individual Pills

### What Changes

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**

Remove the frequency display from the `AnimatedChip` render. Delete the block at ~lines 470-474 that conditionally renders `chip.frequency`.

The frequency data can stay in the chip data structure (no harm), just stop displaying it.

### Files
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — remove the frequency `<span>` (~4 lines)

