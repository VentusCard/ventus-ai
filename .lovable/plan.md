## Goal
On the Next-Conversation tab, change the Regular Client / Wealth Client layout from a side-by-side 2-column grid into a vertically stacked layout (Regular on top, Wealth below).

## File
`src/components/exec-demo/NextConversationRationale.tsx`

## Changes

1. **Outer container (line 772)** — replace the 2-column grid with a vertical flex stack:
   - From: `<div className="grid grid-cols-2 gap-0 flex-1 min-h-0">`
   - To: `<div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto exec-light-scroll">`

2. **Regular Client column wrapper (line 774)** — drop right padding, remove forced full height:
   - From: `<div className="pr-3 flex flex-col h-full">`
   - To: `<div className="flex flex-col">`

3. **Wealth Client column wrapper (line 864)** — replace left padding/border with a top border separator:
   - From: `<div className="pl-3 border-l border-slate-200 flex flex-col h-full">`
   - To: `<div className="pt-4 border-t border-slate-200 flex flex-col">`

4. **Inner Wealth content height handling** — the existing Wealth column uses `flex-1 basis-0 min-h-0 overflow-hidden` blocks designed for a fixed-height side column. With vertical stacking and outer scroll, change those inner sections so they render their natural height instead of competing for vertical space:
   - Replace the `flex-1 basis-0 min-h-0 overflow-hidden` wrappers (3 occurrences in the Wealth section, around lines 877, 907, 946) with `min-h-0` so they expand to fit content.
   - Inside each, change inner `overflow-y-auto h-[calc(100%-1.25rem)]` / `flex-1 min-h-0 overflow-y-auto` lists to drop the height constraints (let content flow naturally) since the outer wrapper now scrolls.

5. **Bottom button (Open WM Copilot, ~line 978)** stays where it is at the end of the Wealth block.

## Result
On the Next-Conversation tab, you'll see the full Regular Client card first (automated flow + chatbot context + Open AI Banking Assistant), then a divider, then the full Wealth Client card below. The whole stack scrolls within the existing tab area.

## Notes
- No copy changes, no color changes.
- No changes to other tabs (Next-Offer, Next-Product) or to ExecDemoIntelPanel.
