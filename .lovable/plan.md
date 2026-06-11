## Rework the left counter block in Section 3

**File:** `src/components/tepilot/campaigns/sections/MessagePreviewsSection.tsx` (left counter only, lines ~114-180)

**New hierarchy** (top → bottom in the same `w-[160px]` card):

1. **TOTAL CAMPAIGNS** — `text-[10px]` uppercase tracking kicker, slate-500
2. **`548`** — hero number, `text-[44px]` font-semibold tabular-nums slate-900, leading-none (uses `variants.total`)
3. **`view logic`** — small dotted-underline Popover trigger (same FormulaCell popover as today), slate-600
4. **thin divider** (`border-t border-slate-100`, `mt-3 pt-3`)
5. **EXAMPLE** kicker — `text-[9px]` uppercase tracking, slate-400
6. **`02 / 05`** — demoted to `text-[18px]` font-mono tabular-nums slate-700 / slate-400 for the `/ 05`
7. **`shown below`** — `text-[10px]` slate-500 helper line, makes it explicit the 5 deck cards are sampled exemplars, not the full set

**Color accent:** keep the `border-l-4` on the card tinted by the active campaign's family (unchanged behavior).

**Out of scope:** the fanned deck, arrows, family chip, footer line, and all other sections stay exactly as-is. No logic changes — only restructured JSX + Tailwind sizes inside the left block.