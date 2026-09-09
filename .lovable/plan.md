# Redesign System Tab Signal Cards

## Goal
Make the five Customer Intelligence Core signal-family cards on `/bankdemo` → System tab less visually aggressive while keeping each family recognizable and the section functional.

## Current state
- File: `src/components/tepilot/insights/CapabilitiesView.tsx`
- The five cards (Behavioral, Life Event, Financial, Demographic, Risk) render inside the "Customer Intelligence Core" panel.
- Each card uses a fully saturated background from `SIGNAL_FAMILY_META.fullBg` (e.g. `bg-blue-700`, `bg-amber-600`, `bg-emerald-500`, `bg-violet-500`, `bg-rose-500`) with white text, colored borders, and a bright left bar.
- The surrounding core panel also uses a blue gradient background (`from-sky-50 via-blue-50 to-indigo-50`), adding to the overall color load.

## Proposed changes
1. **Neutralize the card surfaces**
   - Replace saturated `fullBg` backgrounds with white cards and a very light slate tint (`bg-slate-50`) or plain white.
   - Use a thin left accent bar in each family’s color instead of full-bleed color.
   - Keep family color only for the icon badge, the left bar, and a subtle hover ring.

2. **Tone down typography**
   - Change card text from white to `text-slate-900` / `text-slate-600`.
   - Keep the 24h detection count in muted slate, with the number slightly emphasized.
   - Remove the bright white/translucent chip backgrounds; use light family-tinted icon circles instead.

3. **Soften the core panel container**
   - Remove the blue gradient inside the Customer Intelligence Core box; use a clean white/slate-50 background with a light slate border.
   - Keep the section header and workflow controls unchanged.

4. **Preserve function and identity**
   - Keep the rolling detection ticker, hover tooltips, active-selection ring, and click-to-expand detail panel behavior.
   - Risk remains the only family allowed to use red accents per existing project memory.
   - The five families stay visually distinguishable by icon + left-bar color.

## Files to change
- `src/components/tepilot/insights/CapabilitiesView.tsx` — restyle `SignalSection` and the Core panel container.
- No changes to `SIGNAL_FAMILY_META` required; existing `chip`/`dot`/`tint` tokens can be reused.

## Verification
- Run TypeScript/build check.
- Open `/bankdemo` → System tab and confirm the five cards read as neutral cards with subtle color accents, not saturated blocks.
- Confirm card selection, ticker animation, and detail panel still work.
