# Visibility beats: profile line on 2.2, drop KYC from 2.2

## Changes

All in `src/components/deckmo/DeckmoDeck.tsx` (Visibility scene).

1. **Hide the profile facts line on 2.1, show it on 2.2.**
   The header row currently always renders `ricky.profileFacts` ("Age 34 · San Francisco, CA 94123 · Est. household income $500K · Preferred tier…").
   - On 2.1 (step 0): render only "Ricky <id>" with the divider — no facts line, no divider.
   - On 2.2 (step 1): show the facts line and divider as today.
   - Implement with the existing `moved` flag; no animation change beyond the current header behavior.

2. **Remove the KYC block from 2.2.**
   `RollingLedgerWithKyc` currently stacks the KYC block above the rolling transaction ledger. Replace it so 2.2 renders only the rolling ledger (same speed as the outside events on the right, unchanged). KYC stays on 2.1 inside `RickyRailAccordion`.

## Unchanged
- 2.1 content (KYC block + Cards/ACH accordion) untouched.
- 2.2 layout, rolling speed, panels, transitions untouched.
- All other slides and deckmo conventions unchanged.

## Verification
- Playwright at 1375×842: 2.1 shows no "Age 34" line and still has KYC + rails; 2.2 shows the "Age 34" line and no KYC block, ledger rolling; arrows/A-D navigation intact; no runtime errors; no horizontal overflow.
- `bun test` (existing deckmo tests) and build check.
