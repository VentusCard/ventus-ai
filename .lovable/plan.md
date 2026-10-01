# Add a Deposit-Focused Recommendation to Section 7

## Goal
Add a fourth rotating recommendation card to section 7 that turns Ricky’s established annual tropical-travel behavior into a deposit opportunity: saving toward his next trip in a high-yield savings account.

## Changes
- Add a deck-specific fourth product card after Guided Investing:
  - **Product:** Our Bank Travel Savings
  - **Behavior indicator:** Annual tropical vacation
  - **Message:** Build the next trip fund automatically while earning a higher yield.
  - **Benefits:** high-yield savings, automatic recurring transfers, and a dedicated travel goal.
  - **CTA:** Start Saving for Your Next Trip
- Keep the recommendation customer-centered while making the institutional outcome clear: new deposits and a deeper primary relationship.
- Include the new card in section 7’s existing continuous four-second rotation, hover pause, and manual previous/next controls.
- Keep beats 7.1–7.3 unchanged; the fourth product joins the rotating carousel on 7.3 rather than creating a new beat.
- Update the third beat card’s supporting line so it accurately covers both bringing investments home and capturing deposits through a relevant savings goal.

## Technical details
- Add the recommendation only to the frozen `/deckmo` fixture so normal `/bankdemo` recommendations remain unchanged.
- Give the card an explicit display value suitable for a savings goal instead of inheriting an unrelated theme estimate.
- Reuse the existing card structure and section-7 presentation layout; do not add new controls or alter phone proportions.

## Validation
- Verify the carousel rotates through all four cards in order at the existing cadence.
- Confirm the travel savings card fits without clipping at 1376×1011, 1540×855, 1691×1011, and the current 1903×1024 viewport.
- Confirm hover pause, manual arrows, and section navigation still work.
- Confirm the new card appears only in `/deckmo` and the preview remains clean.
