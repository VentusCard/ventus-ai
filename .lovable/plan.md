Change the third KPI card from "Human reply rate" to "Avg Conv. Depth".

1. Add `avgConvDepth: number` to the `WeeklyStats` interface in `coworkerInboxData.ts`.
2. Add `avgConvDepth: 1.77` to the `WEEKLY_STATS` object.
3. In `CoworkerInboxView.tsx`, replace the "Human reply rate" `KpiCard`:
   - Label: "Avg Conv. Depth"
   - Value: `{WEEKLY_STATS.avgConvDepth}`
   - Delta: "turns per conversation on average"
   - Swap `TrendingUp` icon for `ArrowLeftRight` (add import if needed) or another appropriate back-and-forth icon.
4. Update the header strip copy that currently reads "{repliesCount} replies" to reference the new metric instead, or adjust to maintain consistency.
5. Verify TypeScript compiles cleanly.