# Full-color signal pills — "One Customer, Five Signal Families"

## Goal
Make Ricky's signal pills always render in their family's full, saturated color (instead of the current outline/white pills that only tint when selected), keeping legibility, the External marker, and all interaction behavior.

## Current state
- `SignalFamilyCard` in `src/components/deckmo/DeckmoDeck.tsx` renders pills with `TONES[tone]`: unselected pills are white with a light family border; selected pills get `bg-{color}-50` + dark family text + ring.
- `TONES` (lines 11–17) holds `dot`, `border`, `bg` (pastel), `text` per family: blue, amber, emerald, violet, rose.
- External pills currently get a violet border and a violet "External" chip; selection uses `bg-violet-50`.

## Changes
1. **Add full-color tokens to `TONES`** — a `fullBg` and `fullText` per family, matching the saturated palette used elsewhere in the deck:
   - blue → `bg-blue-600` / white text
   - amber → `bg-amber-500` / white text
   - emerald → `bg-emerald-600` / white text
   - violet → `bg-violet-600` / white text
   - rose → `bg-rose-600` / white text

2. **Restyle every pill to full color by default**
   - All pills use `fullBg` + white text, with hover slightly darkening (e.g. `hover:brightness-95`).
   - Selected state: keep a clear differentiator — `ring-2 ring-slate-900 ring-offset-1` plus a subtle shadow (no pastel swap).
   - Family header label and dot above the pills stay as-is.

3. **External pills**
   - Keep each external pill in its own family color (blue for pet expenditure, emerald for car loan) instead of overriding to violet.
   - The "External" chip becomes light-on-dark: `bg-white/20 text-white` with the Sparkles icon, so it reads on the saturated background.

4. **Preserve behavior**
   - Click-to-filter supporting transactions, toggle-off to all 76 rows, external evidence panel, `aria-pressed`, and no deck navigation on pill clicks all unchanged.
   - Strict light theme and 1560px canvas unchanged (only the pills themselves get saturated).

## Verification
- `bunx tsgo --noEmit` and build check.
- Playwright at 1024×768, 1540×855, 1920×1080: every pill shows its family's full color with readable white text, External chip visible, selected ring distinct, internal/external pill clicks still filter correctly, no overflow or clipped text.
