# Bigger, consistent phone mockups in /deckmo

## Goal
The three phone slides (Immediate, Mid-term, Long-term value) should show one identical, larger phone mockup. The shared phone's bottom tab bar currently starts with "Budget" — in the deck it should start with the new "Activity" tab, matching the recent-transactions phone.

## Changes

1. **Enlarge the phone mockup**
   - `DeckmoRecentTransactionsTab.tsx` and `ExactPhone` in `DeckmoBankdemoScenes.tsx`: grow from 620×350px to a larger size (target ~680–700px tall, ~380px wide, tuned to fit).
   - `PhoneScene` / `BankdemoImmediate` grid: widen the center phone column (360px → ~400px) so the bigger phone sits comfortably between the headline and the callout rail.
   - Add a compact-height fallback (scale down under ~800px viewport height) so 1024×768 still fits, matching the pattern already used on the segment-campaign slide.

2. **Same tab bar everywhere — "Activity" instead of "Budget"**
   - `ExecDemoPhoneView.tsx`: add an optional prop (e.g. `firstTabLabel` / tab override) so deck usage renders the first tab as **Activity** with the receipt icon, highlighted like the other tabs.
   - `DeckmoBankdemoScenes.tsx` (`ExactPhone`): pass the override so Mid-term and Long-term phones show **Activity / Rewards / Membership / AI**, identical to the Immediate phone.
   - Scope: deck-only. The main `/demo` experience keeps its real Budget tab (it has actual budgeting content behind it).

3. **Verify**
   - Playwright at 1540×855 and 1920×1080: all three phone slides render the larger phone with the Activity tab, no clipping, callouts still reveal per beat.
   - Check 1024×768 compact fit; confirm build/typecheck logs are clean.

## Technical details
- Files touched: `src/components/deckmo/DeckmoRecentTransactionsTab.tsx`, `src/components/deckmo/DeckmoBankdemoScenes.tsx`, `src/components/exec-demo/ExecDemoPhoneView.tsx` (optional prop only — no behavior change for `/demo`).
- No data, copy, or navigation changes; deck click/keyboard advancement stays as-is.
