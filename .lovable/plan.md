# Remove First-Name Pills from Customer Selection

## Goal
In the `/bankdemo` personalization tabs, remove the row of circular first-name pills ("Ricky", "Dana", etc.) from the **Customer Selection** card while keeping the search input and the live-session pill when a demo session exists.

## Files to change
- `src/components/tepilot/insights/personalization/ExampleCustomerBar.tsx`

## Changes
1. Delete the mapped `EXAMPLE_CUSTOMERS` pill buttons that render `c.name.split(" ")[0]`.
2. Keep the search input, clear button, suggestion dropdown, and the live-session pill (`sessionName`).
3. Remove the now-unused `compact` layout branching for the pill list; the search input remains usable in `compact` mode.
4. Run a build/typecheck to confirm no references break.

## Verification
- Open `/bankdemo` → any personalization sub-tab.
- Confirm the **Customer Selection** card shows only the search bar and (if applicable) the live-session pill.
- Confirm searching still filters and selects customers correctly.
