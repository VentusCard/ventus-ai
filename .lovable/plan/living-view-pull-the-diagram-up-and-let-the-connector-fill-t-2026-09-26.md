# Living View: pull the diagram up and let the connector fill the page

## Goal

On beats 3.2/3.3 there is a large blank gap between the subtitle and the diagram (biggest at 1080p), while the space between the circle and the bottom insight card is short. Move the whole diagram up so it starts right below the subtitle and use the freed vertical space for the connecting arrow.

## Change

`src/components/deckmo/DeckmoDeck.tsx` — LivingView layout:

1. The card row (Inside the Walls / customer circle / Outside the Walls) currently sits vertically centered inside a stretched grid, which pushes it far down. Make the grid take its natural height (`items-start`, drop `flex-1`) so the cards sit just below the subtitle with a small margin.
2. The bottom block (connector line + insight card) becomes `flex-1` with the connector line stretching (`flex-1`, fixed 1px width, centered) to fill whatever gap remains between the circle and the insight card. The card stays anchored at the bottom of the slide, so the arrow simply gets longer on taller screens — the space is used by the animated line instead of blank area.
3. The line keeps its current behavior: hidden behind the customer circle via the mask circle + z-index from the previous change, emerging below the ring, glowing dot traveling down, scale-in when synthesized. The line's fixed per-viewport height tiers are replaced by this stretching layout, with a fixed top overlap (-110px) that stays safely behind the circle (the circle is at least 224px tall) at every presentation height.

`src/styles/base.css` — remove the old `.deck-living-link` fixed-height/media-tier rules and keep only the overlap margin.

## Verification

- Playwright screenshots at 1540×855 and 1920×1080: cards start just below the subtitle, connector spans down to the insight card, no clipping of the circle or the card, no gap at the footer.
- Check a short viewport (~800px) so the layout still fits.
- Dot animation still runs on the stretched line; build clean.
