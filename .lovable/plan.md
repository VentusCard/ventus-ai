

# Fix Beat 3: Alignment and MCC Label

## Issues
1. **Visual misalignment** — The three icons, connecting lines SVG, and MCC badge use separate elements with hardcoded SVG widths that don't align with the flex-positioned icons above
2. **MCC label** — Currently shows "MCC 7922", should show the category name "Sports and Entertainment"

## Changes

**File**: `src/components/demo/DemoPasswordGate.tsx`

### 1. Fix alignment
- Remove the separate `<svg width="200">` for connecting lines — it doesn't match the icon positions
- Instead, use a simpler approach: wrap icons + badge in a single flex column with the connecting lines drawn relative to a shared container width, or just use simple CSS dashed borders/pseudo-elements
- Give the three icon columns equal `w-28` widths so they're evenly spaced and centered

### 2. Update MCC badge text
- Change `"MCC 7922"` to `"MCC 7922 · Sports and Entertainment"` (or two lines: code on top, category name below)
- Update the subtitle from "Same code for all three" to keep it or adjust

### 3. Update paragraph text
- Change `"Entertainment"` reference to `"Sports and Entertainment"` to match

### Implementation detail
- Replace the hardcoded `<svg width="200">` with a wider SVG (`width="100%" viewBox="0 0 300 40"`) that uses percentage-based x positions matching the 3-column layout
- Or simplify to three individual vertical dashed lines from each icon down to the badge area, then converging — using a container-relative SVG

