# Plan: Vibrant Signal-Family Card Borders

## Goal
Make the five signal-family cards on `/bankdemo/intelligence` visually sharper by replacing the muted, grey-ish card borders with saturated, family-matched colored borders.

## Current State
- `SignalFamilyBoard.tsx` renders the five summary cards.
- Border colors come from `SIGNAL_FAMILY_META` in `src/lib/customerDirectoryData.ts` (`cardBorder`/`cardBorderHover`).
- Current borders are 300-level tints (`border-blue-300`, `border-amber-300`, etc.) which read as dull/grey-ish against the white background.
- The active/expanded state uses a generic slate ring (`ring-slate-900/15 border-slate-400`).

## Changes
1. **Saturate family borders in `src/lib/customerDirectoryData.ts`**
   - Bump each `cardBorder` from `-300` to a deeper family color (e.g., `-400` or `-500`) so the border is clearly colored at a glance.
   - Match `cardBorderHover` one shade deeper for hover feedback.
   - Keep `tint` and `chip` values unchanged to preserve the light-theme background harmony.

2. **Make the active state use the family color in `SignalFamilyBoard.tsx`**
   - Replace the generic slate active ring/border with the selected family's own color token.
   - Keep the ring subtle (e.g., `ring-2 ring-<family>-400/40 border-<family>-500`) so it signals selection without clashing.

3. **Tint the expanded panel border in `SignalFamilyPanel.tsx`**
   - Use the active family's `cardBorder` token for the top border of the detail drawer so the expanded section visually belongs to the selected card.

## Outcome
The five signal-family cards will each have a distinct, saturated border color aligned with their family identity (Behavioral blue, Life Events amber/orange, Financial emerald, Demographic violet, Risk rose), making the row more visually prominent and less "grey/boring."
