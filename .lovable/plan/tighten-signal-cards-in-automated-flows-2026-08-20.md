# Tighten signal cards in Automated Flows

## Goal
Make each signal/filter card inside the Automated Flows product rows slightly shorter and reduce the vertical space between cards so the list feels denser.

## What to change
1. `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx`
   - Reduce `SignalRow` and `FilterRow` row padding from `px-4 py-3` to `px-4 py-2.5`.
   - Reduce the expanded container gap from `space-y-2` to `space-y-1.5`.
   - Reduce the detail panel top margin (`mt-3` inside `SignalDetail`) to `mt-2` and its padding from `p-4` to `p-3`.
   - Tighten the filter detail panel similarly (`mt-1`, `p-4` → `p-3`).
   - Keep typography and interaction behavior unchanged.

2. `src/components/tepilot/campaigns/AddSignalPicker.tsx`
   - Reduce the "Add signal" and "Add risk filter" trigger button padding from `py-3` to `py-2.5` so they match the shorter row height.

## Validation
- Open `/bankdemo` → navigate to the Automated Flows tab.
- Expand any product row and confirm signal/filter rows are more compact with less whitespace between them.
- Verify the cards remain readable and clickable, and that the expanded detail panel still renders correctly.
