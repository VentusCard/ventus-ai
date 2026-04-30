## Goal
Make the recommended product card taller and visually prominent with a **light theme-tinted gradient covering the entire card** (not a dark gradient hero header).

## Changes

**`src/components/exec-demo/ProductCardsPhoneView.tsx`**

1. Extend `THEME_STYLES` with a `gradient` field — a soft, light, three-stop diagonal gradient per theme (e.g. travel: `#eff6ff → #dbeafe → #e0f2fe`; dining: cream → light amber; fitness: pale mint, etc.). All stops in the 50–100 Tailwind weight range so text stays readable in slate/dark.

2. Update the card container (around line 134):
   - Replace `bg-white` with `style.gradient` as inline `background`.
   - Keep the thin top accent border (`borderTop: 3px solid style.accent`) for theme cue.
   - Bump shadow from `shadow-sm` to `shadow-md`, slightly larger rounded corners.
   - Add a subtle white inner panel only behind the CTA region is NOT needed — text already reads on the light tint.

3. Make the card taller in compact mode:
   - Add `min-h-[260px]` to the inner card div (currently ~200px).
   - Increase compact inner padding from `p-2.5` to `p-3.5`.
   - Bump `product_name` from `text-[12px]` to `text-[13px]` and add a small theme icon chip next to it for prominence.

4. CTA button: keep flat `style.accent` background (high contrast against the light tinted card).

No changes to `RelationshipPhoneView.tsx` — it already passes `compact`.

## Notes
- Strict light theme respected: gradients use only very light pastel tones; all text remains slate-600/800.
- Non-compact branch inherits the same styling automatically.
