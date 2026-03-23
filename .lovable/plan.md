

## Add Deal Management Tab to Rewards Section

### What
Add a "Deal Management" nav item to the Rewards section in the Bank-wide Analytics sidebar. This will embed the existing `AvailableDealsGrid` component (currently only on the standalone `/rewards-pipeline` page) directly inside the analytics container.

### Changes

**File: `src/components/tepilot/insights/AnalyticsContainer.tsx`**

1. **Import** `AvailableDealsGrid` from `@/components/tepilot/rewards-pipeline/AvailableDealsGrid` and add `Package` icon from lucide-react.
2. **Add `'deal-management'` to `TabValue` union type.**
3. **Add nav item** to the Rewards group:
   ```
   { value: "deal-management", label: "Deal Management", icon: Package }
   ```
4. **Add switch case** in `renderContent`:
   ```
   case 'deal-management': return <AvailableDealsGrid />;
   ```

Single file change — the grid component and all its deal data already exist.

