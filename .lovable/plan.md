

## Fix: Show Full Persona Rollup Labels in Next-Purchase Tab

### Problem
The rollup labels (e.g., "Style-Conscious Shopper") are truncated because the label column is fixed at `w-[66px]` with `truncate` applied.

### Changes

**`src/components/exec-demo/PurchaseCycleTimeline.tsx`**

1. **Heatmap row labels (line ~410-413)**: Widen the label column from `w-[66px]` to `w-[130px]` and remove the `truncate` class so full persona names wrap naturally. Use `text-right` and allow multi-line with `leading-tight`.

2. **Probability card labels**: Search for any other instances where the rollup label is displayed with truncation and apply the same fix — wider container, no truncation.

### What stays the same
- All calculation logic, colors, animations, and layout structure remain unchanged. Only the label column width and text overflow behavior change.

