

## Fix Content Layout Issues Below TabHeader

### Issues Found

After auditing all 13 tabs, the `TabHeader` component is consistently applied everywhere. However, three views have layout artifacts directly below the header:

1. **`AvailableDealsGrid.tsx`** (line 96-97): Empty `<div></div>` placeholder inside a flex justify-between row, creating unnecessary empty space on the left side. Stats chips float right but the left is blank.

2. **`LocationExperienceManager.tsx`** (line 116-117): Same pattern — empty `<div></div>` placeholder inside a flex justify-between, pushing the "Add Experience" button right but leaving a visible blank gap on the left.

3. **`GamificationManagement.tsx`** (lines 90-100): The entire content below TabHeader is wrapped in a `<Card>` with a `<CardHeader>` that only contains the "Create Achievement" button. This creates an unnecessary card border/padding layer between the header and the KPI cards, making it feel inconsistent with other tabs that flow directly into metrics.

### Fixes

**`src/components/tepilot/rewards-pipeline/AvailableDealsGrid.tsx`**
- Remove the empty `<div></div>` placeholder. Change the flex container to `justify-end` so the stats chips align right without needing a spacer div.

**`src/components/tepilot/insights/LocationExperienceManager.tsx`**  
- Remove the empty `<div></div>` placeholder. Change the flex container to `justify-end` so the "Add Experience" button aligns right cleanly.

**`src/components/tepilot/insights/GamificationManagement.tsx`**
- Remove the outer `<Card>` + `<CardHeader>` wrapper. Move the "Create Achievement" button into a simple `flex justify-end` div (matching the pattern used in LocationExperienceManager and AvailableDealsGrid). Let the KPIs and table render directly in the `space-y-6` flow, consistent with all other tabs.

### Result
All tabs will have a clean, consistent flow: `TabHeader` → optional action buttons (right-aligned) → metrics/content. No empty spacer divs, no unnecessary card wrappers.

