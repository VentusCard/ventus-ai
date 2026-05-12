## Problem

In the Next-Offer / Next-Product / Next-Conversation tab area of `ExecDemoIntelPanel.tsx`, three pill rows render side-by-side:
1. Lifestyle rollup pills (`PillarRollupChip`)
2. Life-event pills (inline)
3. Risk pills (inline)

Their heights drift because the styles aren't consistent:

- **Vertical padding**: life-event and risk pills switch to `py-1` when the panel is collapsed (any tab active), but `PillarRollupChip` is hard-coded to `py-1.5` regardless. So lifestyle pills are visibly taller than the other two rows on the Next-Offer tab.
- **Gap**: lifestyle rollup uses `gap-1`, while life-event and risk pills use `gap-1.5` — minor width drift but contributes to the inconsistent feel.
- **Active scale**: all three pill types apply `transform: scale(1.08)` when active, which makes the active pill noticeably taller than its neighbors and breaks row alignment.
- **Border width swap**: `1.5px → 2px` on active also nudges height by 0.5px per side.

## Fix

Edit only `src/components/exec-demo/ExecDemoIntelPanel.tsx`:

1. **Make `PillarRollupChip` collapse-aware.** Pass an `isCollapsed` prop from the call site (line ~594) and use `py-1` when collapsed, `py-1.5` otherwise — matching the other two pill rows.
2. **Standardize gap to `gap-1.5`** on `PillarRollupChip` so icon/text/meta spacing matches life-event and risk pills.
3. **Replace `scale(1.08)` active state** with a non-height-changing emphasis on all three pill renderers: keep the stronger gradient, the glow box-shadow, and the `2px` border, but drop the scale transform. To keep total height identical between active and inactive, keep border at `1.5px` always and switch only color/shadow/background for the active state (or compensate with `-0.5px` margin — simplest is to keep border width constant).
4. Leave font size, icon, and text content alone — request is purely about height alignment.

## Out of scope

- No content/wording changes.
- No changes to pill click behavior, ordering, or which pills render.
- No changes to other tabs' visuals beyond the row-height normalization (which is the desired effect).

## Files

- `src/components/exec-demo/ExecDemoIntelPanel.tsx` (PillarRollupChip definition ~line 1147, call site ~line 594, life-event pill ~line 625, risk pill ~line 750)