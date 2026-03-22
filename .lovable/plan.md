

## Remove confetti from Financial Achievements card

**File:** `src/components/tepilot/insights/FinancialAchievements.tsx`

1. Remove the `import confetti from "canvas-confetti"` import
2. Remove the `confettiFired` ref
3. Remove the `useEffect` that fires confetti (lines 94–100)

