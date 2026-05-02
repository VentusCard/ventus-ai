## Goal

Give the **"Open AI Assistant"** (Regular card) and **"Open WM Copilot"** (Wealth card) buttons their own dedicated, non-overlapping space inside the Orchestrate stage. Currently the 3-bullet workflow list can crowd or overlap these CTAs.

## File

`src/components/exec-demo/NextConversationRationale.tsx`

## Changes

Apply the same pattern to **both** Orchestrate stages:

### Regular card — Orchestrate (~lines 922–943, "Open AI Assistant")

1. Constrain the bullet `<ul>` so it shrinks instead of pushing the button:
   - Add `min-h-0 overflow-hidden` to the `<ul>` classes.
2. Wrap the button in a dedicated footer block pinned to the bottom:
   - `<div className="mt-auto pt-2 border-t border-blue-200/70 shrink-0">`
   - Make the button `w-full` (remove `mt-auto` from the button itself since the wrapper now owns positioning).
   - Keep all blue colors, label "Open AI Assistant", and `ArrowUpRight` icon unchanged.

### Wealth card — Orchestrate (~lines ~1000+, "Open WM Copilot")

Mirror the same change with the purple palette:
1. Add `min-h-0 overflow-hidden` to the bullet `<ul>`.
2. Wrap the "Open WM Copilot" button in:
   - `<div className="mt-auto pt-2 border-t border-purple-200/70 shrink-0">`
   - Button becomes `w-full`; keep purple styling, label, and icon unchanged.

## Result

- Bullets occupy the flexible middle region of the Orchestrate stage and clip cleanly if vertical space is tight.
- A subtle horizontal divider visually reserves the bottom strip for the CTA.
- The "Open AI Assistant" and "Open WM Copilot" buttons always render in their own dedicated footer — no overlap with the workflow bullets above.

## Out of scope

- No changes to the Signal→Intent or Personalize stages.
- No changes to button labels, click handlers, colors, or icons.
- No changes to card grid templates or chevrons.

Approve to apply.