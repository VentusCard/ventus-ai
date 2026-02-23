

# Spending Overview for WM CoPilot

## What Changes

Replace the current "Transaction Overview" accordion section in the Wealth Management CoPilot's left panel with a new "Spending Overview" section that shows the client's spending against their budget across categories.

Since the WM CoPilot doesn't currently have enriched transaction data or real spending categories (it uses randomly generated client profiles), we'll generate mock spending/budget data tied to the client profile and display it inline.

## Implementation Steps

### 1. Add spending data to the client profile

Update `src/types/clientProfile.ts` to include a `spendingOverview` field with category-level spending and budget data:
- Categories: Housing, Transportation, Food & Dining, Healthcare, Entertainment, Shopping, Travel, Savings
- Each category has: `label`, `monthlySpend`, `monthlyBudget`, `color`

### 2. Generate mock spending data in the profile generator

Update `src/lib/randomProfileGenerator.ts` to generate realistic spending/budget data per persona type (young professional spends more on dining/entertainment, pre-retiree more on healthcare, etc.). Budget values will be set slightly above or below spend to create realistic over/under budget scenarios.

### 3. Replace "Transaction Overview" with "Spending Overview" in ClientSnapshotPanel

In `src/components/tepilot/advisor-console/ClientSnapshotPanel.tsx`:
- Rename the accordion section from "Transaction Overview" to "Spending Overview"
- Remove the dependency on `hasRealData` / `advisorContext` so it always shows (using client profile data)
- Display each spending category with:
  - Category name and color dot
  - Spend amount vs budget amount
  - A small progress bar (green if under budget, yellow if near, red if over)
  - Status indicator using existing `getBudgetStatus` utility
- Show a summary row at top with total spend vs total budget and overall status badge
- Keep the accordion collapsed by default

### 4. Remove the `hasRealData` gate

The current section only shows when `advisorContext` has real transaction data. The new version will always display since it uses data from the client profile, making the panel more useful out of the box.

---

## Technical Details

**New type addition** (`src/types/clientProfile.ts`):
```typescript
spendingOverview?: Array<{
  category: string;
  monthlySpend: number;
  monthlyBudget: number;
  color: string;
}>;
```

**Files to modify:**
1. `src/types/clientProfile.ts` - Add `spendingOverview` field
2. `src/lib/randomProfileGenerator.ts` - Generate spending data per persona
3. `src/components/tepilot/advisor-console/ClientSnapshotPanel.tsx` - Replace Transaction Overview accordion with Spending Overview

**Reused utilities:**
- `getBudgetStatus` from `src/lib/budgetUtils.ts` for status colors/icons
- `formatCurrency` from `src/lib/formatHelper.ts` for consistent formatting
