

## Fix: Proportional Deal Selection (10 deals)

**File: `src/lib/dealSelectionUtils.ts`** — Rewrite `getRelevantDeals()`:

- Default `maxDeals` from 8 → 10
- Allocate slots by pillar rank: Pillar 1 gets 4, Pillar 2 gets 3, Pillar 3 gets 1
- Add 2 discovery deals from outside top pillars
- Within each pillar bucket, sort by popularity and pick top N
- Update callers in `DemoRewardsView.tsx` to request 10 instead of 6

