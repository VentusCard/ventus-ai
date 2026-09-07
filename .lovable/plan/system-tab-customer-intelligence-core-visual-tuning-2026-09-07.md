# System tab — Customer Intelligence Core visual tuning

## Goal
Make the Customer Intelligence Core card on `/bankdemo` System tab feel more contained and less visually aggressive: add a blue border around the whole core, and tone down the five signal-family cards so they are still full-color but not overly bright.

## Changes

1. **Blue border around the Customer Intelligence Core**
   - File: `src/components/tepilot/insights/CapabilitiesView.tsx`
   - Target: the outer wrapper of the Core column (around the gradient `rounded-xl` card at lines 987–1033).
   - Add a visible blue border (`border-blue-300` or `border-blue-400`) and a subtle ring/shadow so the core section reads as one bounded unit within the pipeline board.

2. **Desaturate the five full-color signal-family card backgrounds**
   - File: `src/lib/customerDirectoryData.ts`
   - Target: `SIGNAL_FAMILY_META.fullBg` tokens for the five families.
   - Replace the current bright saturated Tailwind classes (`bg-blue-600`, `bg-amber-500`, `bg-emerald-600`, `bg-violet-600`, `bg-rose-600`) with slightly muted but still family-distinct variants (e.g., `bg-blue-500`, `bg-amber-600/90`, `bg-emerald-600/90`, `bg-violet-600/90`, `bg-rose-600/90`, or equivalent lower-chroma Tailwind classes).
   - Preserve `fullText: "text-white"` and `fullAccent` translucency so white text/icons remain readable and the ticker badges still pop.

## Verification
- Run `bunx tsgo --noEmit` to confirm no type errors.
- Check the production build log for errors.
- Optionally capture a Playwright screenshot of the System tab to confirm the core has a blue border and the five cards are visibly less bright while still full-color.
