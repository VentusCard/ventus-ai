

## Plan: Make "Others" group visible in demo module filtering

### Problem
The "Others" nav group is filtered out because it's not in any module's allowed labels. Health is kept visible by a special rule on line 110.

### Change
In `src/components/tepilot/insights/AnalyticsContainer.tsx`, line 110, add `"Others"` alongside `"Health"`:

```ts
if (enabledModules.has("Analytics")) {
  allowedLabels.add("Health");
  allowedLabels.add("Others");
}
```

Single line change — makes "Others" (containing Gamification) always visible when Analytics is enabled, same as Health.

