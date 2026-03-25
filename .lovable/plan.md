

## Make Category Filter Pills Single Line

### Change
In `src/components/tepilot/rewards-pipeline/AvailableDealsGrid.tsx` line 161, change `flex flex-wrap` to `flex overflow-x-auto` and add `whitespace-nowrap` so the pills stay on one horizontal scrollable line instead of wrapping.

**Line 161**: Change:
```
<div className="flex flex-wrap gap-2">
```
to:
```
<div className="flex gap-2 overflow-x-auto pb-1">
```

Also add `shrink-0` to each Button (line 172) so they don't compress.

