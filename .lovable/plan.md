

## Plan: Move Gamification to new "Others" section

### Change
In `src/components/tepilot/insights/AnalyticsContainer.tsx`, modify the `NAV_GROUPS` array:

1. **Remove** `{ value: "gamification", label: "Gamification", icon: Gamepad2 }` from the "Rewards" group (line 59)
2. **Add** a new group after "Health":
   ```ts
   {
     label: "Others",
     items: [
       { value: "gamification", label: "Gamification", icon: Gamepad2 },
     ],
   },
   ```

Single file change, no logic affected — just sidebar reorganization.

