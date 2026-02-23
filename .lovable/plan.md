

# Fix Spending Overview vs Top Spending Categories Conflict

## Problem

The panel now has two overlapping sections:
1. **Spending Overview** (lines 182-240) -- uses randomly generated mock data from the profile generator
2. **Top Spending Categories** (lines 421-457) -- uses real enriched transaction data from prior TePilot steps

When real data exists from the enrichment pipeline, it should take priority. The two sections show conflicting numbers for the same concept.

## Solution

Merge them into a single "Spending Overview" section that:
- **When real data exists** (from `advisorContext.topPillars`): Shows the real spending categories with budget comparison bars (using enriched data as spend values, with generated budgets as targets)
- **When no real data exists**: Falls back to the profile-generated mock spending data as it does now

Remove the separate "Top Spending Categories" accordion entirely since the Spending Overview will absorb its functionality.

## Changes

### `src/components/tepilot/advisor-console/ClientSnapshotPanel.tsx`

1. **Update the Spending Overview section** (lines 182-240): Add a check for `lifestyleSignals` (real data). When `lifestyleSignals.length > 0`, render those categories instead of `displayData.spendingOverview`, mapping each signal's spend value into the same progress-bar layout and keeping the "Ask Ventus" click behavior.

2. **Remove the "Top Spending Categories" accordion** (lines 421-457): This section becomes redundant since its data is now displayed within the Spending Overview when available.

3. **Budget values for real data**: When using real spending data, generate reasonable budget values (e.g., 110-130% of actual spend) so the progress bars remain meaningful, or show spend-only mode without budget comparison if no budget data is available.

