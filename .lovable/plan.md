## Goal

Slightly enlarge the Behavioral Intelligence section header labels and slightly increase the pill height so the row reads with a bit more presence — without disrupting layout balance.

## Changes

**File:** `src/components/exec-demo/ExecDemoIntelPanel.tsx`

1. **Header labels** (lines 676, 680, 684 — Spending Habits / Life Event Detection / Risk Factors):
   - Font size: `text-[12px]` → `text-[13px]`
   - Reserved label width: `w-[170px]` → `w-[180px]` (to accommodate the slightly larger text without wrapping)

2. **Pill height** — increase vertical padding from `py-1.5` to `py-2` on all pill spans in the expanded Behavioral Intelligence row:
   - Life event pill (line 493)
   - Risk rollup pill (line 616)
   - "No Risk Factors Detected" fallback pill (line 649)
   - Lifestyle rollup chip definitions (lines 911 and 946 — `PillarRollupChip` internal styles)

   Text size stays `text-[12px]` so only the chip silhouette grows a hair.

No other changes (colors, animations, behavior, ordering, content all unchanged).
