# Fix Personalized Product Card Truncation

## Goal
Make every Personalized Product recommendation read as a complete thought while preserving the established requirements: **90 characters maximum, three benefit bullets, larger readable copy, and an always-visible CTA**.

## Changes

1. **Fix the copy at its source**
   - Align every `generate-product-cards` instruction and schema description to the same hard limit: one complete sentence, **90 characters or fewer**.
   - Add response normalization so an over-limit model response cannot reach the UI unchanged.
   - Require a complete sentence rather than allowing frontend-created ellipses.

2. **Remove destructive display truncation**
   - Replace the current `fitQuote` behavior, which cuts at 90 characters and appends `…`, with complete-sentence handling.
   - Ensure existing cached/demo snapshots also resolve to concise, behaviorally relevant finished sentences.
   - Correct the known external-transfer example so it communicates the portfolio benefit within 90 characters without trailing off.

3. **Give the recommendation section guaranteed vertical space**
   - Rebalance the phone’s Personalized Product layout so the “Recommended for You” area receives more of the available height.
   - Reduce nonessential space above the recommendation card rather than shrinking the quote or bullets.
   - Give the card a stable minimum height and use a predictable internal grid for: product name, quote, three bullets, value, and CTA.

4. **Make overflow impossible by construction**
   - Keep all three bullets, but constrain each generated/fallback benefit to a compact complete line or controlled two-line wrap.
   - Keep CTA labels complete and inside the button using the existing stepped font sizing.
   - Avoid nested scrolling inside the product card; the full card content should remain visible in the phone viewport.

## Validation

- Verify the external-transfer card displays a complete sentence with no ellipsis.
- Check all three generated cards and all saved customer snapshots at the actual `/bankdemo` phone dimensions.
- Confirm each card shows the product name, complete quote, three bullets, estimated value, and full CTA simultaneously.
- Confirm no text clipping, card-internal scrollbar, or CTA cutoff at the supported desktop viewport.
- Run the focused quote/layout tests and confirm the preview build is clean.

## Technical Notes

The current behavior has three confirmed contributors:
- the saved external-transfer quote is substantially longer than 90 characters;
- backend prompt/schema text still specifies 140 characters;
- frontend `fitQuote` intentionally creates an ellipsis when no sentence boundary fits, while the surrounding recommendation section has no guaranteed card height.
