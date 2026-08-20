# Tighten the "Curated for Ricky" card in the phone deals view

## What's off

In the phone mockup's deals page (`GeneratedOffersPhoneView.tsx`), every section uses a small, dense scale — section headers at 10–11px, card body copy at 9–10px, card padding around `px-2.5 py-2`, tags at 8px. The Curated collection card breaks that scale:

- Card headline copy is `text-[13px]` — the largest text on the page, bigger even than the Top Pick merchant (12px) and the welcome bar (11px).
- Card padding is `px-4` vs `px-2.5`/`px-3` everywhere else.
- The hero image is 80px tall and the card carries `min-h-[160px]`, so the card visually dominates the scroll and pushes the carousel dots below the fold.
- Corner radius is `rounded-2xl` while every other card on the page is `rounded-lg` / `rounded-xl`.

## The fix

Bring the Curated card onto the same scale as the rest of the deals page:

- Headline copy: 13px → 10px, keeping `leading-snug` and semibold weight.
- Padding: `px-4` → `px-3`, tighten the vertical padding to match the Top Pick card.
- Hero image: 80px → 60px tall; card `min-h` 160px → 124px.
- Radius: `rounded-2xl` → `rounded-xl` to match Top Pick and the savings bar.
- Merchant pills inside the card stay at 8px (already consistent).

Also normalize the two nearby headers so all section labels on the page read at one size:

- "Curated for {name}" — 11px bold, 3.5px icon (unchanged, becomes the standard).
- "Expiring Soon" — 10px → 11px bold, icon 3 → 3.5px.
- "Welcome to New York" — 11px bold (already matches).

No content, data, or generation changes — this is purely the visual scale of the deals surface.

## Technical notes

- Single file: `src/components/exec-demo/GeneratedOffersPhoneView.tsx`, lines ~496–567 (Expiring Soon header and the Collection Carousel card).
- The card is also the click target for `setExpandedGroup`; the expanded detail view is untouched.
- Carousel slide animation and dot navigation stay as-is.
