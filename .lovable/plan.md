

## Plan: Sync EngagementPreview with VentusEngagementDemo

The `EngagementPreview` in `PlatformTabs.tsx` is missing data that exists in the full demo. Two changes needed:

### `src/components/PlatformTabs.tsx` — EngagementPreview (lines 197-229)

**Right panel updates:**
1. **Add Sweetgreen offer** — currently only shows REI + Equinox, but the demo has 3 offers (REI, Sweetgreen, Equinox)
2. **Replace single Wellness budget row with a 2x2 budgeting grid** showing all 4 pillars with progress bars and color-coded status badges:
   - Travel $1,240/$1,500 (Near Limit, amber)
   - Dining $480/$500 (Near Limit, amber)
   - Wellness $320/$250 (Over Budget, red)
   - Shopping $180/$400 (Under Budget, green)

This matches the full demo's "Your Lifestyle Spending" section layout.

