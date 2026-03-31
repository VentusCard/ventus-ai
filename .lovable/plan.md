

## Plan: Increase deal personalization count from 10 to 11

### Changes

**1. `src/lib/dealSelectionUtils.ts`**
- Change default `maxDeals` from `10` to `11`
- Update slot allocation from `[4, 3, 1]` (8 pillar + 2 discovery = 10) to `[4, 3, 2]` (9 pillar + 2 discovery = 11) — adding one extra slot to the tertiary pillar

**2. `src/hooks/useDemoEnrichment.ts`** (line 312)
- Change `getRelevantDeals(profile, 10)` → `getRelevantDeals(profile, 11)`

**3. `src/components/demo/DemoRewardsView.tsx`** (line 93)
- Change `getRelevantDeals(profile, 10)` → `getRelevantDeals(profile, 11)`

Three files, one-line changes each.

