

## Let Pills Section Fill Full Height

### What Changes

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**

The persona card currently has `maxHeight: "45vh"` when tabs are showing, and no constraint otherwise. But it doesn't expand to fill available space — it only sizes to content.

Changes:
1. **Make persona card flex-grow** when tabs are NOT showing — add `flex-1` and `min-h-0` so it fills the entire middle column height, with `overflow-y: auto` for scrolling if content exceeds.
2. **Keep the `maxHeight: 45vh` constraint only when `showTabs` is true** (so tabs still have room below).
3. On the outer container, ensure `h-full` and `flex flex-col` are set (already the case).

This means before synthesis/tab reveal, the pillar-grouped pills take the full vertical space of the panel. Once tabs appear, it shrinks to 45vh to make room.

### Files
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — add conditional `flex-1 min-h-0` class to persona card div (~line 204)

