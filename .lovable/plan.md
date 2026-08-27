# More Saturated Signal Family Main Cards

## Goal
Make the five signal-family summary cards in the Intelligence Database more visually prominent by increasing color saturation on the card surface, badge, dot, and progress bars.

## Current State
- `SignalFamilyBoard.tsx` renders five summary cards using `SIGNAL_FAMILY_META` from `src/lib/customerDirectoryData.ts`.
- The current palette relies on light 50/100/200 tints (`bg-blue-50/60`, `border-blue-200`, etc.), which makes the cards feel washed out against the white page.

## Proposed Changes

### 1. Saturate the card surface
Update `SIGNAL_FAMILY_META` so each family's `tint`, `cardBorder`, `cardBorderHover`, `chip`, and `dot` use richer, more saturated hues:
- Behavioral: deeper blue (`bg-blue-100/70`, `border-blue-300`, `bg-blue-600` dot)
- Life Events: richer amber (`bg-amber-100/70`, `border-amber-300`, `bg-amber-600` dot)
- Financial Signals: deeper emerald (`bg-emerald-100/70`, `border-emerald-300`, `bg-emerald-600` dot)
- Demographic: richer violet (`bg-violet-100/70`, `border-violet-300`, `bg-violet-600` dot)
- Risk: deeper rose (`bg-rose-100/70`, `border-rose-300`, `bg-rose-600` dot)

Keep chip text dark (`text-blue-800`, etc.) for readability and maintain the strict light theme.

### 2. Intensify the progress bars
Update `barStrong`, `barLikely`, and `barEmerging` to use more saturated 500/600/700 stops so the segmented bars inside each card pop against the tinted background.

### 3. Preserve hover and active states
- Keep `rowHover`, `rowHoverBorder`, and `openText` consistent with the new saturated family.
- Keep the active card ring (`ring-2 ring-slate-900/15`) unchanged so selection still reads clearly.

### 4. Verify contrast
After updating tokens, visually verify the Intelligence Database page at desktop viewport to ensure:
- Cards remain distinguishable from the white background.
- Text labels and percentages remain legible.
- The expanded `SignalFamilyPanel` still harmonizes with the new card colors.

## Scope
Only `src/lib/customerDirectoryData.ts` and a quick visual check of `SignalFamilyBoard.tsx` / `SignalFamilyPanel.tsx`. No functional logic changes.
