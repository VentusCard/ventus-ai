

## Fix: Tooltip clipped by scrollable container

The tooltip is absolutely positioned inside a `div` with `overflow-y-auto`, which clips it. The fix is to use `position: fixed` instead of `position: absolute`, calculating the tooltip position from the row's bounding rect on hover.

### Changes in `src/components/exec-demo/ExecDemoLeftPanel.tsx`

1. **Convert `TxRow` tooltip to fixed positioning** — use `onMouseEnter`/`onMouseLeave` + a ref to get the row's `getBoundingClientRect()`, then position the tooltip with `position: fixed; top/left` based on the row's screen coordinates.

2. **Use a React portal** (`ReactDOM.createPortal`) to render the tooltip at `document.body` level, ensuring it floats above everything including the scroll container.

3. **Set `z-index: 9999`** on the tooltip so it renders above all other UI elements.

### Technical detail
- Add `useState` for hover state and coordinates in `TxRow`
- On `mouseEnter`: set `{ x: rect.left, y: rect.top }` and show tooltip
- On `mouseLeave`: hide tooltip
- Render tooltip via `createPortal(tooltipDiv, document.body)` with `position: fixed`
- Position tooltip above the row (`bottom` of tooltip aligns with top of row) to avoid being cut off at container bottom

### Files modified
- `src/components/exec-demo/ExecDemoLeftPanel.tsx`

