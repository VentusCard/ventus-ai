# Align product card colors with signal families

## Problem

Generated product cards are colored by their lifestyle `theme` (travel = blue, dining = amber, home = green, etc.), which is unrelated to the signal family that produced the card. Meanwhile the rest of /bankdemo colors all five signal families consistently in `SIGNAL_FAMILY_META`:

- Behavioral — blue (`#2563eb`)
- Life Events — amber (`#f59e0b`)
- Financial Signals — emerald (`#10b981`)
- Demographic — violet (`#8b5cf6`)
- Risk — rose (`#f43f5e`, reserved for risk only)

So a life-event card about a home purchase renders green while the Life Events family everywhere else is amber. The card already carries `type: behavioral | life_event | financial_signal`, so the family is known — it is just not used for color.

## Change

Color every generated product surface by the card's signal family, not its lifestyle theme.

1. Add a family palette in `ProductCardsPhoneView.tsx` covering all five families with the exact hues above, so the palette stays a complete mirror of `SIGNAL_FAMILY_META`:
   - behavioral → blue, soft blue gradient
   - life_event → amber, soft amber gradient
   - financial_signal → emerald, soft emerald gradient
   - demographic → violet, soft violet gradient
   - risk → rose, soft rose gradient
   Product cards today only emit the first three types; demographic and risk entries exist so any future/derived card resolves to the right family hue instead of falling back to grey. Risk stays display-only — the generator still never emits a risk product card.
2. Keep the lifestyle theme for the **icon only** (plane, home, dumbbell, etc.), so the card still reads as travel/home/fitness while the color signals the family.
3. Apply the same family accent to the top border, icon tint, check marks, value line, and CTA button.
4. Propagate to the other surfaces that reuse the same styling:
   - `phone-channels/EmailPreviewPhoneView.tsx`
   - `phone-channels/SmsPreviewPhoneView.tsx`
5. Add a small family label chip (Behavioral / Life Event / Financial Signal / Demographic) on the card header row so the color has an explicit legend.


## Technical notes

- New export `FAMILY_STYLES` in `ProductCardsPhoneView.tsx` keyed by all five family keys (`behavioral`, `life_event`, `financial_signal`, `demographic`, `risk`) to `{ accent, gradient, label }`, hues sourced from `SIGNAL_FAMILY_META` so the two palettes stay in sync; `THEME_STYLES` stays but is reduced to icon lookup.
- Existing `THEME_BENEFITS`, `THEME_VALUE`, `THEME_CTA` keep working off `theme` — copy is unchanged.
- No edge-function or prompt changes; this is presentation only.

## Out of scope

- Deal collections in `GeneratedOffersPhoneView.tsx` (those are lifestyle collections, not family-driven) unless you want them included.
