## Goal
In `ExecDemoIntelPanel.tsx`, when one of the three tabs (Next-Offer, Next-Product, Next-Conversation) is active — i.e. the pill rows are in their collapsed/compact form — allow the Spending Habits / Life Event Detection / Risk Factors pills to wrap onto a maximum of **two rows** instead of horizontally scrolling. Keep the overall row height unchanged. The default (no active tab) view keeps its current single-row scrolling behavior.

## File
`src/components/exec-demo/ExecDemoIntelPanel.tsx` — the three sibling rows around lines 736–747.

## Changes

1. Define a tab-aware container class string near the existing `labelWidth` / `labelTextSize` / `rowGap` constants (~line 730):
   - When `isCollapsed` (active tab on): `flex flex-wrap gap-x-2 gap-y-1 max-h-[44px] overflow-hidden py-0`
   - Otherwise: keep current `flex flex-nowrap gap-2 overflow-x-auto exec-light-scroll py-0.5`

2. Apply that class to all three pill containers (lines 738, 742, 746) replacing the hard-coded class string.

3. To make sure two rows fit inside `max-h-[44px]` only in collapsed mode, conditionally tighten pill vertical padding:
   - Life-event pill (line 557): `py-1.5` → `py-1` when `isCollapsed`.
   - Risk-factor pills (line 680) and the "No Risk Factors Detected" pill (line 713): same conditional.
   - Rollup pills are produced by `PillarRollupChip`; if they visually overflow we'll pass an `isCollapsed` prop to that component in a follow-up. For now leave it; behavior is OK because rollup pills already use compact sizing.

## Result
- In Next-Offer / Next-Product / Next-Conversation views, pills wrap onto up to two rows; nothing scrolls horizontally; overall row height stays the same as today (the previous single row reserved enough vertical space with `py-0.5` + scrollbar that two compressed pill rows now fit).
- Default enrichment view (no active tab) is untouched.
