# Replace Investing with a Deposit-Focused Recommendation in Section 7

## Goal
Replace the Guided Investing recommendation in section 7 with a standard high-yield savings account tied to Ricky’s established annual tropical-travel behavior. Keep three rotating cards while shifting the third recommendation toward deposit growth.

## Changes
- Replace the existing Guided Investing card with a deck-specific recommendation:
  - **Product:** Our Bank High-Yield Savings
  - **Behavior indicator:** Annual tropical vacation
  - **Message:** Save for the next trip in a standard high-yield savings account while earning more on the balance.
  - **Benefits:** competitive APY, automatic recurring transfers, and no monthly service fee.
  - **CTA:** Start Saving for Your Next Trip
- Keep the recommendation customer-centered while making the institutional outcome clear: new deposits and a deeper primary relationship.
- Keep the existing three-card continuous four-second rotation, hover pause, and manual previous/next controls.
- Keep beats 7.1–7.3 unchanged; beat 7.3 now presents the HYSA recommendation instead of Guided Investing.
- Update the third beat card to explain that a recurring tropical-travel behavior becomes a relevant deposit-building recommendation.

## Technical details
- Replace the recommendation only in the frozen `/deckmo` fixture so normal `/bankdemo` recommendations remain unchanged.
- Give the card an explicit display value suitable for a savings goal instead of inheriting an unrelated theme estimate.
- Reuse the existing card structure and section-7 presentation layout; do not add new controls or alter phone proportions.

## Validation
- Verify the carousel rotates through the three cards in order at the existing cadence, with HYSA replacing Guided Investing.
- Confirm the travel savings card fits without clipping at 1376×1011, 1540×855, 1691×1011, and the current 1903×1024 viewport.
- Confirm hover pause, manual arrows, and section navigation still work.
- Confirm the new card appears only in `/deckmo` and the preview remains clean.
