When a team is clicked in the Systems tab, the workflow strip currently renders at a fixed compact height below the network diagram. The user wants it to be visibly larger and consume the remaining viewport height so the step cards feel more substantial.

Changes in `src/components/tepilot/insights/CapabilitiesView.tsx`:

1. Make the detail panel a flex column (`flex flex-col`) so its children can grow.
2. Give the workflow container `flex-1` and a `min-h` (e.g. `min-h-[280px]`) so it stretches to fill available vertical space.
3. Make each workflow step card stretch vertically (`h-full`) and increase internal vertical padding (`py-5` instead of `py-3`) so the cards feel roomier.
4. Ensure the workflow text and chips stay vertically centered within the taller cards.

No data model or navigation changes. Build verification via `npx tsc --noEmit` after edits.