

# Fix Input Fields - White Background with Dark Text

## Overview
Update all input fields in the Financial Planning page components to have explicit white backgrounds with dark text, ensuring consistent and readable styling across all form elements.

## Issue Identified
The `Input` component from `src/components/ui/input.tsx` inherits from the theme's `bg-background` which may not consistently render as white. Input fields need explicit white backgrounds and dark text for clarity.

## Files to Update

| File | Input Count | Changes Needed |
|------|-------------|----------------|
| `src/components/tepilot/advisor-console/RetirementPlanningSection.tsx` | 7 inputs | Add `bg-white text-slate-900` |
| `src/components/tepilot/advisor-console/IncomeExpenseEditor.tsx` | 1 input | Add `bg-white text-slate-900` |
| `src/components/tepilot/advisor-console/FinancialGoalsSection.tsx` | 6 inputs | Add `bg-white text-slate-900` |
| `src/components/tepilot/advisor-console/MonteCarloSimulator.tsx` | 4 inputs | Add `bg-white text-slate-900` |
| `src/components/tepilot/advisor-console/TaxAdvantagedAccountsSection.tsx` | 3 inputs (dynamic) | Add `bg-white text-slate-900` |

## Technical Changes

### 1. RetirementPlanningSection.tsx (7 inputs)
Add `className="mt-1 bg-white text-slate-900"` to all Input components:
- Current Age (line 177-181)
- Retirement Age (line 186-190)
- Life Expectancy (line 198-202)
- Desired Annual Income (line 207-211)
- Social Security (line 219-223)
- Pension Income (line 229-233)
- Current Retirement Savings (line 239-244)

### 2. IncomeExpenseEditor.tsx (1 input)
Update the Monthly Income input (line 56-60):
```tsx
<Input
  type="number"
  value={monthlyIncome}
  onChange={(e) => onIncomeChange(parseFloat(e.target.value) || 0)}
  className="text-right font-medium bg-white text-slate-900"
/>
```

### 3. FinancialGoalsSection.tsx (6 inputs in dialog)
Update all inputs in the Add Goal dialog (lines 222-296):
- Goal Name input
- Target Amount input
- Current Amount input
- Target Date input
- Monthly Contribution input

Add `className="bg-white text-slate-900"` to each.

### 4. MonteCarloSimulator.tsx (4 inputs)
Update inputs at lines 170-212:
- Starting Portfolio (add `bg-white text-slate-900`)
- Annual Contribution (add `bg-white text-slate-900`)
- Years to Retirement (add `bg-white text-slate-900`)
- Target Goal (add `bg-white text-slate-900`)

### 5. TaxAdvantagedAccountsSection.tsx (3 dynamic inputs)
Update the Annual Contribution input inside the accounts map (line 72):
```tsx
<Input
  type="number"
  value={account.annualContribution}
  onChange={(e) => handleAccountChange(index, { 
    annualContribution: parseFloat(e.target.value) || 0 
  })}
  className="h-8 mt-1 bg-white text-slate-900"
/>
```

## Summary
This will ensure all 20+ input fields across the Financial Planning page have consistent white backgrounds with dark slate text for maximum readability and visual consistency with the light theme of the financial planning interface.

