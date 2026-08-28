# Replace bank-facing destination icon with Signal

## Goal
Swap the bank-facing icon in `/bankdemo` → System tab → Activation destinations from `Brain` to `Signal` so it reads as "signal/information" intelligence.

## Files to change
- `src/components/tepilot/insights/CapabilitiesView.tsx`
  - Import `Signal` from `lucide-react`.
  - Update the `FacingIcon` mapping so `facing === "bank"` renders `<Signal ... />` instead of `<Brain ... />`.
  - Keep all existing styling, sizing, and navigation behavior unchanged.

## Verification
- Run a build/typecheck to confirm the import and JSX are valid.
- Optionally capture a preview screenshot of the System tab activation destinations to confirm the icon renders correctly.

## Scope boundary
- No other icons, copy, or layout changes.
