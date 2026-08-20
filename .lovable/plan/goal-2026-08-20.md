Add soft family tint colors to the Signal Family cards on the /bankdemo Intelligence Dashboard.

## Goal
Make the five collapsed Signal Family cards (Behavioral, Life Events, Financial Signals, Demographic, Risk) visually distinct with soft, family-specific background tints while keeping the existing light enterprise theme. Carry the same palette into the expanded full-width panel.

## What will change
1. **Collapsed Signal Family cards** (`src/components/tepilot/insights/dashboard/SignalFamilyBoard.tsx`)
   - Give each card a very light family-tinted background (`*-50/60`) and matching border.
   - Keep the existing chip/dot colors from `SIGNAL_FAMILY_META`.
   - Color the sparkline stroke to match the family.
   - Recolor the confidence bar so strong/likely/emerging use shades of the family color instead of generic slate.
   - Keep hover state subtle (slightly deeper border/tint).

2. **Expanded Signal Family panel** (`src/components/tepilot/insights/dashboard/SignalFamilyPanel.tsx`)
   - Apply a soft family-tinted background to the panel header.
   - Use the family color for the confidence bar.
   - Update signal-row hover to use the family tint (`hover:bg-<color>-50/50`).
   - Color the "Open segment" arrow on hover with the family color.

3. **Data source** (`src/lib/customerDirectoryData.ts`)
   - Add a `tint` Tailwind class token to each `SIGNAL_FAMILY_META` entry (or derive it from the chip color) so the cards and panel can share one source of truth.

## Out of scope
- No dark-mode utilities.
- No changes to the card layout, click behavior, or segment-export logic.
- No other card types (reports, templates, customer mockups).

## Validation
- Build the project.
- Open `/bankdemo` → Intelligence Dashboard and visually confirm the five collapsed cards each have a distinct soft tint and that the expanded panel carries the same color family.