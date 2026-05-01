## Problem
On the **Next-Offer**, **Next-Product**, and **Next-Conversation (relationship)** tabs, the three pill rows (Spending Habits, Life Event Detection, Risk Factors) get flattened into a single wrap-row with no labels. Users lose the context of what each pill represents.

## Root cause
In `src/components/exec-demo/ExecDemoIntelPanel.tsx` (around lines 671–679), when `isCollapsed` is true (i.e. a tab is active and the pills aren't expanded), the code returns one combined `flex flex-wrap` div containing all three pill arrays — dropping the labeled rows entirely.

## Fix
Remove the `isCollapsed` early-return branch and always render the three labeled rows ("Spending Habits:", "Life Event Detection:", "Risk Factors:"). When collapsed, use slightly tighter dimensions so the rows still fit comfortably above the tab content:
- Label width: `w-[140px]` (vs `w-[185px]` expanded)
- Label text size: `text-[11px]` (vs `text-[13px]`)
- Row gap: `mt-1.5` (vs `mt-2.5`)

Each row keeps its existing horizontal scroll for pill overflow.

## Files
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — replace the `if (isCollapsed) { ... }` block with the unified labeled-rows render that adapts label width/text-size based on `isCollapsed`.

## Out of scope
- No changes to pill content, colors, click behavior, or animations.
- No changes to the expanded view layout other than sharing the same render path.