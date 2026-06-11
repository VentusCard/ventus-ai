## Objective
Remove the "Channel preference" filter and set all chip-based demographic filters to preselected by default in the `/bankdemo` Campaign Builder Step 1.

## Changes

### File: `src/components/tepilot/campaigns/sections/ProductPickerSection.tsx`

1. **Remove `channels` from state**
   - Delete `channels: string[]` from `DemoFilters` interface.
   - Delete `CHANNEL_OPTIONS` constant.
   - Delete `channels: []` from `DEFAULT_FILTERS`.

2. **Preselect all chip-based filters by default**
   - `ageRanges`: default to all `AGE_RANGES` values.
   - `incomeBands`: default to all `INCOME_BANDS` values.
   - `ficoRanges`: default to all `FICO_RANGES` values.
   - `regions`: default to all `REGIONS` values.
   - Leave `accountTenure` as `"all"` and `relationshipDepth` as `"any"`.

3. **Update `activeCount` logic**
   - Remove `filters.channels.length` from the count.
   - Recalculate logic: a chip group is "active" when NOT all options are selected (inverted from current behavior), so the count reflects filters that narrow the audience.

4. **Remove Channel preference UI**
   - Delete the `<ChipGroup label="Channel preference" ... />` block.
   - Remove "Channel" from the collapsed filter hint text.

## Acceptance
- The Filters panel no longer shows "Channel preference".
- On first load / after Reset, Age, Income, FICO, and Region chips are all selected.
- The collapsed Filters button shows 0 active filters when all defaults are applied.
- No other files change.