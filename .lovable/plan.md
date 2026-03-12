

# Move Gamification Program Manager to Its Own Analytics Tab

## Changes

### 1. `src/components/tepilot/insights/AnalyticsContainer.tsx`
- Import `GamificationManagement` and `Gamepad2` icon
- Add new tab trigger "Gamification" with `Gamepad2` icon
- Add new `TabsContent` rendering `<GamificationManagement />`
- Update `defaultTab` type to include `'gamification'`

### 2. `src/components/tepilot/insights/BankwideView.tsx`
- Remove `GamificationManagement` import and its usage (lines 9, 60-61)

Two files edited, no new files.

