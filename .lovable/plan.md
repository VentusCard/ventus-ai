# Refine Section 7 Phone Spacing and Proportions

## Goal
Apply the selected “Refined mobile rhythm” direction inside section 7’s Membership phone, making the existing content more balanced and presentation-readable without changing the phone, copy, data, or rotation behavior.

## Changes
- Rebalance the phone interior into three clearly proportioned zones: compact welcome/member header, cleaner financial snapshot, and a dominant recommendation area.
- Reduce excess framing around the four snapshot values and improve label/value alignment so the row reads faster at presentation scale.
- Give “Recommended for You” stronger separation and let the rotating product card use more of the available width and height.
- Refine the product card’s internal rhythm: clearer product title and quote hierarchy, evenly spaced benefit rows, a more deliberate estimated-value line, and a full-width CTA anchored consistently at the bottom.
- Reposition and refine the previous/next controls so they remain accessible without covering card content.
- Keep every card at one stable height so mortgage, rewards, and investing transitions do not shift the layout.

## Scope safeguards
- Section 7 only; section 6 and shared phone views elsewhere remain visually unchanged.
- Keep all current copy, all four financial snapshot values, all three benefits, estimated value, CTA labels, and all three cards.
- Keep the current phone dimensions, light theme, bottom navigation, four-second automatic rotation, hover pause, and manual navigation.
- Do not add the prototype’s decorative card artwork or any new content; use its spacing and hierarchy as the reference.

## Technical details
- Add a section-7 presentation treatment passed explicitly into the relationship and product-card views, following the existing deck-scoping pattern.
- Use stable grid/flex tracks and minimum dimensions for the rotating cards so content length cannot resize the carousel.
- Preserve existing semantic color roles and the project’s Manrope typography.

## Validation
- Verify section 7 at 1376×1011, 1540×855, and 1691×1011.
- Confirm all text and three benefit rows fit on every recommendation card with no clipping or overlap.
- Confirm the snapshot remains fully legible, cards rotate every four seconds, hover pauses, manual arrows work, and slide navigation remains unaffected.
- Confirm section 6 is unchanged and the preview build is clean.
