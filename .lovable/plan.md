

## Fix: Misaligned Connection Lines

### Root cause

On line 155, the grid top is calculated as:
```ts
const gridTopY = midY - totalGridHeight / 2 + 20;
```

But the bank→consumer lines (line 253) and consumer→impact lines (line 279) both recalculate it without the `+ 20`:
```ts
const gTopY = midY - totalGridH / 2;  // missing + 20
```

This causes the SVG lines to target the wrong Y positions.

### Fix — `src/components/demo/DemoNetworkDiagram.tsx`

**Lines 252-253** — Replace local `gTopY` with `gridTopY`:
```ts
const rCenterY = gridTopY + ROW_HEIGHT * pi + ROW_HEIGHT / 2;
```
Remove the `totalGridH` and `gTopY` local variables.

**Lines 278-280** — Same fix:
```ts
const rCenterY = gridTopY + ROW_HEIGHT * pi + ROW_HEIGHT / 2;
```

Two small edits, no structural changes.

