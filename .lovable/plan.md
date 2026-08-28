# Replace bank icon with an intelligence icon in activation destinations

## Goal
Swap the `Landmark` (bank building) icon used for bank-facing activation destinations in `/bankdemo` → System tab with an icon that signals intelligence.

## Proposed change
- Import `Brain` from `lucide-react` in `src/components/tepilot/insights/CapabilitiesView.tsx`.
- Replace the `Landmark` reference in the `FacingIcon` mapping for bank-facing destinations.
- Keep the existing slate styling so the icon swap is the only visual change.

## Why this works
`Brain` is the most direct visual synonym for intelligence in Lucide, making the bank-facing column feel like an “intelligence output” layer rather than a generic institution.

## Files to edit
- `src/components/tepilot/insights/CapabilitiesView.tsx`
