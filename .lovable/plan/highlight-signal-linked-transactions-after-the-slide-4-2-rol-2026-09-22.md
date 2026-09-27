# Highlight signal-linked transactions after the slide 4.2 roll

## Goal
After the transaction ledger finishes rolling on slide 4.2, highlight every visible transaction associated with an internal signal. Each highlighted row will use the same signal-family color as its corresponding pill on the right, making the relationship immediately visible.

## Experience
- Keep the existing 2.2-second rolling animation unchanged.
- While the ledger is rolling, rows retain their current neutral treatment.
- When the roll finishes, all linked rows highlight together.
- Use a restrained family-colored background, left accent, and matching text emphasis so the ledger remains readable:
  - Spending Habits: blue
  - Life Events: amber
  - Financial Signals: emerald
  - Demographic: violet
  - Risk: rose
- Transactions without a linked signal remain neutral.
- Existing signal-pill clicks continue to filter the ledger to supporting transactions; filtered rows retain the matching family treatment.
- External-only signals do not highlight transaction rows because they have no transaction evidence in the ledger.

## Implementation
- In `src/components/deckmo/DeckmoDeck.tsx`, derive each transaction row’s family tone from its existing `signals` labels and `DECKMO.ricky.signals` metadata.
- Track completion of the slide 4.2 ledger animation, resetting whenever the slide is left or re-entered.
- Apply semantic family-tone classes only when slide 4.2 is active and the roll has completed.
- Keep all colors within the deck’s existing signal-family palette and light-theme styling.
- In `src/styles/base.css`, add the short post-roll highlight entrance and a reduced-motion fallback. With reduced motion enabled, show the highlights immediately without rolling or flashing.

## Verification
- Enter slide 4.2 and confirm the ledger rolls neutrally, then every linked visible row highlights together after the roll ends.
- Confirm unlinked rows remain neutral and each highlighted row matches its signal pill’s family color.
- Click internal signal pills and confirm filtering and matching row colors still work.
- Confirm external signal pills still show their evidence card without transaction highlighting.
- Re-enter 4.2 to verify the roll and post-roll highlight replay cleanly; check 1024×768, 1540×855, and 1920×1080 with no clipping or errors.
