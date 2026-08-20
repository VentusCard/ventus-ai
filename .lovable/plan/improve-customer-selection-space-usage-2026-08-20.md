# Improve Customer Selection Space Usage

## Goal
Make the **Customer Selection** panel in `/bankdemo` personalization feel less cramped and use its allotted space more effectively, without breaking the three-column workspace layout.

## Current State
- `CustomerMockupPanel.tsx` renders a 3-column grid (`lg:grid-cols-3`) with equal-width columns.
- The left **Customer Selection** card contains:
  1. A card header with icon + "Customer Selection" title.
  2. `ExampleCustomerBar` in compact mode (small search input + session pill).
  3. `CustomerSignalPanel` showing selected customer metadata and 5 signal families as small pills.
- Font sizes are very small (`text-[9.5px]` labels, `text-[11px]` pills, `text-[10.5px]` metadata), and the panel has multiple nested headers/borders consuming vertical space.
- The signal pills wrap tightly with short line heights and small hit targets.

## Proposed Changes

### 1. Widen the selection column
- Change `CustomerMockupPanel.tsx` grid to give the left column more room, e.g. `lg:grid-cols-[1.15fr_1fr_1fr]` or similar, so text and pills can breathe while keeping the phone mockup and feature/economics columns usable.

### 2. Reorganize the selection card header
- Merge the card title and `ExampleCustomerBar` into a single, taller header area so the search bar is the obvious first action.
- Remove the redundant icon-only title row or combine it with the search bar label.

### 3. Scale up typography and hit targets in `CustomerSignalPanel.tsx`
- Bump signal-family labels from `text-[9.5px]` to `text-[11px]`.
- Bump signal pills from `text-[11.5px]` to `text-[13px]` with increased vertical padding (`py-2`).
- Increase confidence/source badges to `text-[10px]`.
- Increase customer name from `text-[12px]` to `text-[14px]` and metadata from `text-[10.5px]` to `text-[12px]`.
- Expand the expanded evidence block to `text-[12px]` with slightly more padding.

### 4. Reduce non-content spacing
- Trim excessive internal padding (`px-3 py-2.5`) where it competes with the signal list.
- Keep scroll behavior but ensure the signal list occupies the maximum available vertical space.

### 5. Improve the empty state
- Keep the placeholder but make its text larger (`text-[13px]`) and center it in the available area.

### 6. Optional: persistent customer mini-profile
- If vertical space allows, surface a compact customer profile strip (segment, city, lifestyle) as a distinct block above the signal list rather than squeezing it into the header row.

## Files to Modify
- `src/components/tepilot/insights/CustomerMockupPanel.tsx`
- `src/components/tepilot/insights/personalization/CustomerSignalPanel.tsx`
- `src/components/tepilot/insights/personalization/ExampleCustomerBar.tsx` (if search sizing adjustments are needed)

## Out of Scope
- No changes to the phone mockup content or the Key Features / Unit Economics panels beyond layout width adjustments.
- No changes to signal data model or generation logic.
- No dark-mode or color-theme changes.

## Acceptance Criteria
- [ ] Customer Selection column is visibly wider than the other two columns on desktop.
- [ ] Search bar and selected customer metadata are larger and easier to read.
- [ ] Signal pills are at least `text-[13px]` with comfortable padding.
- [ ] No layout breakage on the current viewport (`1375x842`).
- [ ] Light theme and existing animations remain intact.
