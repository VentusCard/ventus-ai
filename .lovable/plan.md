# Align product card colors with signal families

## Problem

Generated product cards are colored by their lifestyle `theme` (travel = blue, dining = amber, home = green, etc.), which is unrelated to the signal family that produced the card. Meanwhile the rest of /bankdemo colors signal families consistently:

- Behavioral — blue
- Life Events — amber
- Financial Signals — emerald

So a life-event card about a home purchase renders green while the Life Events family everywhere else is amber. The card already carries `type: behavioral | life_event | financial_signal`, so the family is known — it is just not used for color.

## Change

Color every generated product surface by the card's signal family, not its lifestyle theme.

1. Add a family palette in `ProductCardsPhoneView.tsx` keyed by `card.type`, using the exact hues from `SIGNAL_FAMILY_META`:
   - behavioral → accent `#2563eb` (blue), soft blue gradient
   - life_event → accent `#f59e0b` (amber), soft amber gradient
   - financial_signal → accent `#10b981` (emerald), soft emerald gradient
2. Keep the lifestyle theme for the **icon only** (plane, home, dumbbell, etc.), so the card still reads as travel/home/fitness while the color signals the family.
3. Apply the same family accent to the top border, icon tint, check marks, value line, and CTA button.
4. Propagate to the other surfaces that reuse the same styling:
   - `phone-channels/EmailPreviewPhoneView.tsx`
   - `phone-channels/SmsPreviewPhoneView.tsx`
5. Add a small family label chip (Behavioral / Life Event / Financial Signal) on the card header row so the color has an explicit legend.

## Technical notes

- New export `FAMILY_STYLES` in `ProductCardsPhoneView.tsx` mapping `ProductCard["type"]` to `{ accent, gradient, label }`; `THEME_STYLES` stays but is reduced to icon lookup for the color-independent parts.
- Existing `THEME_BENEFITS`, `THEME_VALUE`, `THEME_CTA` keep working off `theme` — copy is unchanged.
- No edge-function or prompt changes; this is presentation only.

## Out of scope

- Deal collections in `GeneratedOffersPhoneView.tsx` (those are lifestyle collections, not family-driven) unless you want them included.
