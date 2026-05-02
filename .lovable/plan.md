## Issue

Both CTA buttons use `h-9` (fixed 36px), so they are technically the same pixel height — but they look shorter than the step cells next to them (which sit at the natural height of label + icon row + `py-2` ≈ ~44px). Visually the buttons feel mismatched against the row.

## Fix

In `src/components/exec-demo/NextConversationRationale.tsx`, let both CTA buttons stretch to the row height so they exactly match the adjacent step cells (and therefore each other):

- **Line 960** (Open AI Assistant): change `h-9 ... px-2.5` → `h-full ... px-2.5 py-2`
- **Line 1037** (Open WM Copilot): change `h-9 ... px-2.5` → `h-full ... px-2.5 py-2`

The parent column already has `flex items-stretch`, so `h-full` will make each button fill the row's height. Since both step rows are now content-sized using identical padding (`py-2`), both buttons will end up the same height as each other and as their neighboring cells.

## Out of scope

- No copy, color, icon, or layout changes elsewhere.
