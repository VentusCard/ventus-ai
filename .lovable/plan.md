Make the "Our Bank" brand header in the /bankdemo left sidebar larger and more prominent.

## Current state
The top of the sidebar currently shows a compact `h-14` brand row (`src/components/tepilot/insights/AnalyticsContainer.tsx`, lines 437-456). It contains a small indigo icon square, "Our Bank" title in `text-sm`, and a "Customer Intelligence Platform" subtitle in `text-[10px]`, plus the collapse toggle.

## Plan
1. Increase the brand row height and padding to give it more visual presence.
2. Enlarge the icon and its container so it matches the bigger brand row.
3. Increase the "Our Bank" title size and weight, and slightly enlarge the subtitle.
4. Keep the collapse toggle proportionally sized and aligned.
5. Preserve the dark indigo gradient theme and the collapsed mini-state behavior.

## Implementation
Edit only `src/components/tepilot/insights/AnalyticsContainer.tsx` in the brand header block (lines 437-456). No other files, tabs, or business logic change.

## Validation
After the change, visually inspect the local /bankdemo preview to confirm the brand header is taller, the icon/text are larger, and the sidebar remains fully usable.
