# Make "User selected" Card More Space Efficient

## Goal
Compress the selected-customer header in the Customer Selection panel so it consumes less vertical space and leaves more room for the signal list below.

## Current State
- `CustomerSignalPanel.tsx` renders a two-row header block:
  - Top: `User selected` label on the left, `Ready` badge on the right.
  - Bottom: customer name + customer ID.
- The header uses `pb-2.5 border-b`, `mt-0.5` spacers, and a relatively tall emerald `Ready` pill.
- This header is duplicated in `CustomerSignalSkeleton` with a greyed-out placeholder.

## Proposed Changes

### 1. Collapse to a single visual row
- Put `User selected` and the `Ready` state on the same baseline as the customer name.
- Use a small status dot + short label instead of the full emerald pill, e.g.:
  ```
  [User selected]  Ricky J · 4829103                        [● Ready]
  ```
- Keep the name at `text-[14px]` for readability but tighten surrounding whitespace.

### 2. Reduce non-content spacing
- Drop `pb-2.5 border-b` to `pb-2 border-b` or remove the bottom border if the contrast is still clear.
- Remove `mt-0.5` spacers; rely on flex alignment.
- Reduce the `Ready` badge padding from `px-2.5 py-1` to `px-2 py-0.5` and font from `text-[10px]` to `text-[9.5px]`.

### 3. Keep the skeleton consistent
- Apply the same compact layout to `CustomerSignalSkeleton` so the empty state does not jump when a customer is selected.

### 4. Optional: hide the static label
- If the selected name + status is self-evident, replace `User selected` with a subtle prefix inside the name line (e.g. `Selected: Ricky J · 4829103`) to save an entire text row.

## Files to Modify
- `src/components/tepilot/insights/personalization/CustomerSignalPanel.tsx`

## Out of Scope
- No changes to signal pills, search bar, mockup panels, or data model.
- No dark-mode or color-theme changes.

## Acceptance Criteria
- [ ] The selected-customer header is visually more compact than the current two-row block.
- [ ] Customer name and ID remain clearly readable.
- [ ] The `Ready` status is still visible but uses less space.
- [ ] The skeleton empty state matches the new compact layout.
- [ ] No layout breakage on the current viewport (`1375x842`).
