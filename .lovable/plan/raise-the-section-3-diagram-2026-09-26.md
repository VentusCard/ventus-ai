# Raise the Section 3 Diagram

## Change
- Move the complete section 3 diagram upward slightly on beats 3.1–3.3: the source cards, customer circles, animated connectors, and lower signal-family card.
- Keep the section heading in place.
- Apply the same upward offset to both diagram blocks so the downward line remains connected and hidden behind the customer circles.
- Preserve all current animations, copy, sizing, and behavior.

## Technical detail
- Update the two diagram containers in `src/components/deckmo/DeckmoDeck.tsx` with the same small upward positional offset (about 16px), avoiding changes to the calibrated connector heights in `src/styles/base.css`.
- Verify beats 3.2 and 3.3 at the current presentation viewport and a 1920×1080 viewport.
