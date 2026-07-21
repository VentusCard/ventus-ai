## Objective
In the `/bankdemo` customer-selection transaction popup (`ExecDemoSelectionDialog.tsx`), move the **Income** card so it ranks second-to-last — just before the **External Intelligence** card.

## Current order
1. KYC card
2. Income card
3. Source-group transaction cards (Checking, Cards, etc.)
4. External Intelligence card

## Proposed order
1. KYC card
2. Source-group transaction cards
3. **Income card** (second-to-last)
4. External Intelligence card (last)

## Implementation
- Edit `src/components/exec-demo/ExecDemoSelectionDialog.tsx`.
- Move the existing `Income card — counts all inflows regardless of source` block from its current position (lines ~364-429) to immediately before the `External Intelligence` block (lines ~538-582).
- Preserve all existing logic, styling, and state keys (`__income__`).
- No other behavior changes.

## Verification
- Open `/bankdemo` Demo tab and trigger the customer selection popup.
- Confirm the vertical stack order is: KYC → source groups → Income → External Intelligence.
- Confirm the Income card still expands/collapses and shows the correct total.